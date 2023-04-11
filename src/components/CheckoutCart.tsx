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
    overflow: auto;
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
    const [transactionUser, setTransactionUser] = useState<Record | null>(null);
    const [transactionDueDate, setTransactionDueDate] = useState<Date>(getDateTimeVariableNumberOfDaysFromToday(otherConfiguration.defaultNumberOfDaysFromTodayForDueDate));

    const [transactionSubmissionToastId, cartErrorToastId] = [{containerId: 'transactionSubmissionToast'}, {containerId: 'cartErrorToast'}];

    const transactionData: TransactionData = {
        transactionType: transactionType,
        cartRecords: cartRecords,
        transactionUser: transactionUser,
        transactionDueDate: transactionDueDate,
    };

    // Transaction State Mutators
    const selectUserForTransaction = () => expandRecordPickerAsync(userRecords).then(user => setTransactionUser(user));
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
        // TODO: Leave cart records when there are errors associated with their transaction?
        setTransactionDueDate(getDateTimeVariableNumberOfDaysFromToday(otherConfiguration.defaultNumberOfDaysFromTodayForDueDate))
        // TODO: If there are errors associated with the transaction, then perhaps the user should not be cleared?
        setTransactionUser(null);
    }

    const attemptToExecuteTransaction = () => {
        const errorMessages = transactionService.validateTransaction(transactionData);
        if (errorMessages.length === 0) {
            setTransactionIsProcessing(true);

            // Show user notifications for settled Promises.
            const transactionPromise = asyncAirtableOperationWrapper(() => transactionService.executeTransaction({...transactionData}, removeRecordFromCart),
                () => toast.loading(<OfflineToastMessage/>, {
                    autoClose: false,
                    containerId: transactionSubmissionToastId.containerId
                })).then(() => clearTransactionData())
                .finally(() => setTimeout(() => setTransactionIsProcessing(false), 1000))

            toast.promise(transactionPromise, {
                pending: 'Attempting to execute transaction.',
                success: {render: `${transactionTypes[transactionData.transactionType].label} successful!`, autoClose: 2000},
                error: 'An error occurred with the transaction.',
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