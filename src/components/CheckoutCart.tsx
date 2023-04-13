import React, {useState} from 'react';
import TransactionTypeSelector from "./OptionSelector";
import {
    Box,
    Button,
    expandRecordPickerAsync,
    FormField,
    Input,
    loadCSSFromString,
    Loader,
    Text,
    useRecords,
    useViewport
} from "@airtable/blocks/ui";

import Cart from "./Cart";
import {Record} from "@airtable/blocks/models";
import UserSelector from "./UserSelector";
import {TransactionData, TransactionType, transactionTypes,} from "../types/TransactionTypes";
import {TransactionService} from "../services/TransactionService";
import {
    convertLocalDateTimeStringToDate,
    getDateTimeVariableNumberOfDaysFromToday,
    getIsoDateString
} from "../utils/DateUtils";
import {RecordId} from "@airtable/blocks/types";
import {OtherExtensionConfiguration, ValidatedTablesAndFieldsConfiguration} from "../types/ConfigurationTypes";
import {maxNumberOfCartRecordsForFreeUsers} from "../utils/Constants";
import {asyncAirtableOperationWrapper} from "../utils/RandomUtils";
import {toast} from "react-toastify";
import {Toast} from "./Toast";
import {OfflineToastMessage} from "./OfflineToastMessage";

loadCSSFromString(`
.checkout-cart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 1rem;
    gap: 0.5rem;
    height: 100%;
    width: 100%;
}`);

function CheckoutCart({
                          transactionService,
                          tablesAndFields: {
                              inventoryTable,
                              userTable,
                              dateDueField,
                          },
                          otherConfiguration,
                          isPremiumUser,
                          transactionIsProcessing,
                          setTransactionIsProcessing
                      }:
                          {
                              transactionService: TransactionService,
                              tablesAndFields: ValidatedTablesAndFieldsConfiguration,
                              otherConfiguration: OtherExtensionConfiguration,
                              isPremiumUser: boolean,
                              transactionIsProcessing: boolean,
                              setTransactionIsProcessing: (transactionIsProcessing: boolean) => void
                          }) {

    // Viewport Data
    const viewport = useViewport();
    const viewportWidth = viewport.size.width;
    if (viewport.maxFullscreenSize.width == null) viewport.addMaxFullscreenSize({width: 800});

    const userRecords = useRecords(userTable);
    const inventoryTableRecords = useRecords(inventoryTable);

    // Transaction State
    const [transactionType, setTransactionType] = useState<TransactionType>(transactionTypes.checkout.value);
    const [cartRecords, setCartRecords] = useState<Array<Record>>([]);
    const [transactionUser, setTransactionUser] = useState<Record | undefined>(undefined);
    const [transactionDueDate, setTransactionDueDate] = useState<Date>(getDateTimeVariableNumberOfDaysFromToday(otherConfiguration.defaultNumberOfDaysFromTodayForDueDate));

    const [transactionSubmissionToastId, cartErrorToastId] = [{containerId: 'transactionSubmissionToast'}, {containerId: 'cartErrorToast'}];

    const transactionData: TransactionData = {
        transactionType: transactionType,
        cartRecords: cartRecords,
        transactionUser: transactionUser,
        transactionDueDate: transactionDueDate,
    };

    // Transaction State Mutators
    const selectUserForTransaction = () => expandRecordPickerAsync(userRecords).then(user => setTransactionUser(user ?? undefined));
    const removeRecordFromCart = (recordId: RecordId) => setCartRecords(cartRecords => cartRecords.filter(record => record.id !== recordId));
    const addRecordToCart = () => {
        if (!isPremiumUser && cartRecords.length >= maxNumberOfCartRecordsForFreeUsers) {
            toast.error(`Upgrade to premium to add more records to the cart!`, cartErrorToastId)
        } else {
            if (inventoryTableRecords.length === 0) {
                toast.error(`There are no records in the inventory table to add.`, cartErrorToastId);
                return;
            }
            const recordsNotAlreadyInCart = inventoryTableRecords.filter(record => !cartRecords.includes(record));
            if (recordsNotAlreadyInCart.length !== 0) {
                return expandRecordPickerAsync(recordsNotAlreadyInCart)
                    .then(record => {
                        if (record !== null) setCartRecords(cartRecords => [...cartRecords, record])
                    });
            }

            toast.error(`All records from the inventory table are already in the cart.`, cartErrorToastId);
        }
    };
    const clearTransactionData = () => {
        setTransactionDueDate(getDateTimeVariableNumberOfDaysFromToday(otherConfiguration.defaultNumberOfDaysFromTodayForDueDate))
        setTransactionUser(undefined);
    }

    const attemptToExecuteTransaction = () => {
        const errorMessages = transactionService.validateTransaction(transactionData);
        if (errorMessages.length === 0) {
            setTransactionIsProcessing(true);

            const transactionPromise = asyncAirtableOperationWrapper(() => transactionService.executeTransaction({...transactionData}, removeRecordFromCart),
                () => toast.loading(
                    <OfflineToastMessage/>, {autoClose: false, ...transactionSubmissionToastId}), transactionData.cartRecords.length < 50 ? 30000 : 100000)
                .then((errorRecords) => {
                    if (errorRecords.length === 0) {
                        clearTransactionData()
                    } else {
                        throw errorRecords;
                    }
                })
                .finally(() => setTimeout(() => setTransactionIsProcessing(false), 1000))

            toast.promise(transactionPromise, {
                pending: 'Attempting to execute transaction. This may take a while...',
                success: {
                    render: `${transactionTypes[transactionData.transactionType].label} successful!`,
                    autoClose: 3000
                },
                error: {
                    autoClose: false,
                    render({data}) {
                        const errorRecords = data as Array<Record>;
                        return <>
                            Errors occurred during the transaction. The following records were not processed
                            correctly: <br/>
                            <ul>{errorRecords.map((errorRecord, index) => <li key={index}>{errorRecord.name}</li>)}</ul>
                        </>;
                    }
                },
            }, transactionSubmissionToastId);
        } else {
            toast.error(<><Text
                    textColor='white'>{errorMessages.length > 1 ? 'Errors occurred:' : 'An error occurred:'}</Text>
                    <ul>{errorMessages.map((error, index) => <li key={index}>{error}</li>)}</ul>
                </>,
                transactionSubmissionToastId);
        }
    }

    return <><Box className="checkout-cart-container">
        <TransactionTypeSelector currentOption={transactionType}
                                 options={Object.values(transactionTypes)}
                                 setOption={setTransactionType}
                                 transactionIsProcessing={transactionIsProcessing}/>

        <Cart viewportWidth={viewportWidth}
              cartRecords={cartRecords}
              transactionIsProcessing={transactionIsProcessing}
              addRecordToCart={addRecordToCart}
              removeRecordFromCart={removeRecordFromCart}
              isPremiumUser={isPremiumUser}/>

        <Toast {...cartErrorToastId}/>

        {transactionType === transactionTypes.checkout.value && <>
            <UserSelector viewportWidth={viewportWidth}
                          currentTransactionUser={transactionUser}
                          selectUser={selectUserForTransaction}
                          transactionIsProcessing={transactionIsProcessing}
            />

            {dateDueField !== undefined &&
                <Box maxWidth='1000px' width='100%'>
                    <FormField
                        label={`Due Date (The configured default is ${otherConfiguration.defaultNumberOfDaysFromTodayForDueDate} days from today):`}>
                        <Input type='date'
                               value={getIsoDateString(transactionDueDate)}
                               onChange={e => setTransactionDueDate(convertLocalDateTimeStringToDate(e.target.value))}
                               disabled={transactionIsProcessing}/>
                    </FormField>
                </Box>
            }
        </>
        }

        <Button
            type='submit'
            variant='primary'
            disabled={transactionIsProcessing}
            onClick={attemptToExecuteTransaction}
        >
            {transactionIsProcessing
                ? <Loader scale={0.2} fillColor='white'/>
                : <Text textColor='white'>{transactionTypes[transactionType].label} Items</Text>
            }
        </Button>
        <Toast {...transactionSubmissionToastId}/>

    </Box>
    </>
}

export default CheckoutCart;