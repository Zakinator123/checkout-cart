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
import {ErrorDialog} from "./ErrorDialog";
import {RecordId} from "@airtable/blocks/types";
import {OtherExtensionConfiguration, ValidatedTablesAndFieldsConfiguration} from "../types/ConfigurationTypes";
import toast from "react-hot-toast";
import {maxNumberOfCartRecordsForFreeUsers} from "../utils/Constants";

loadCSSFromString(`
.checkout-cart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 1rem;
    overflow: auto;
    gap: 2rem;
    height: 100%;
    width: 100%;
}`);

function CheckoutWithCart({
                              transactionService,
                              tablesAndFields: {
                                  inventoryTable,
                                  userTable,
                                  dateDueField,
                              },
                              otherConfiguration,
                              isPremiumUser,
                          }:
                              {
                                  transactionService: TransactionService,
                                  tablesAndFields: ValidatedTablesAndFieldsConfiguration,
                                  otherConfiguration: OtherExtensionConfiguration,
                                  isPremiumUser: boolean
                              }) {

    // Viewport Data
    const viewport = useViewport();
    const viewportWidth = viewport.size.width;
    if (viewport.maxFullscreenSize.width == null) viewport.addMaxFullscreenSize({width: 800});

    // TODO: Filter out unwanted fields (e.g. reverse linked fields?)
    const userRecords = useRecords(userTable);
    const inventoryTableRecords = useRecords(inventoryTable);

    // Transaction State
    const [transactionType, setTransactionType] = useState<TransactionType>(transactionTypes.checkout.value);
    const [cartRecords, setCartRecords] = useState<Array<Record>>([]);
    const [transactionUser, setTransactionUser] = useState<Record | null>(null);
    const [transactionDueDate, setTransactionDueDate] = useState<Date>(getDateTimeVariableNumberOfDaysFromToday(otherConfiguration.defaultNumberOfDaysFromTodayForDueDate));


    const transactionData: TransactionData = {
        transactionType: transactionType,
        cartRecords: cartRecords,
        transactionUser: transactionUser,
        transactionDueDate: transactionDueDate,
    };

    // Other State
    const [errorDialogMessages, setErrorDialogMessages] = useState<Array<string>>([]);
    const [transactionIsProcessing, setTransactionIsProcessing] = useState<boolean>(false);

    // Transaction State Mutators
    const selectUserForTransaction = () => expandRecordPickerAsync(userRecords).then(user => setTransactionUser(user));
    const removeRecordFromCart = (recordId: RecordId) => setCartRecords(cartRecords => cartRecords.filter(record => record.id !== recordId));
    const addRecordToCart = () => {
        if (!isPremiumUser && cartRecords.length >= maxNumberOfCartRecordsForFreeUsers) {
            toast.error(`You have reached the maximum number of records that you can add to the cart as a free user.
            
             Please upgrade to a premium account to add more records to the cart.`);
        } else {
            const recordsNotAlreadyInCart = inventoryTableRecords.filter(record => !cartRecords.includes(record));
            if (recordsNotAlreadyInCart.length === 0) {
                toast.error(`There are no records in the inventory table that are not already in the cart.`);
            } else {
                return expandRecordPickerAsync(recordsNotAlreadyInCart)
                    .then(record => {
                        if (record !== null) setCartRecords(cartRecords => [...cartRecords, record])
                    });
            }
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
            const transactionPromise = transactionService.executeTransaction(transactionData, removeRecordFromCart)
                .then(() => clearTransactionData())
                .finally(() => setTimeout(() => setTransactionIsProcessing(false), 1000))

            toast.promise(transactionPromise, {
                loading: 'Attempting to execute transaction.',
                success: () => `${transactionTypes[transactionData.transactionType].label} successful!`,
                error: 'An error occurred with the transaction.',
            });
        } else setErrorDialogMessages(errorMessages)
    }

    return <Box className="checkout-cart-container">
        <TransactionTypeSelector currentOption={transactionType}
                                 options={Object.values(transactionTypes)}
                                 setOption={setTransactionType}/>

        <Cart viewportWidth={viewportWidth}
              cartRecords={cartRecords}
              addRecordToCart={addRecordToCart}
              removeRecordFromCart={removeRecordFromCart}/>

        {transactionType === transactionTypes.checkout.value && <>
            <UserSelector viewportWidth={viewportWidth}
                          currentTransactionUser={transactionUser}
                          selectUser={selectUserForTransaction}
            />

            {dateDueField !== undefined &&
                <FormField
                    label={`Due Date (The configured default is ${otherConfiguration.defaultNumberOfDaysFromTodayForDueDate} days from today):`}>
                    <Input type='date'
                           value={getIsoDateString(transactionDueDate)}
                           onChange={e => setTransactionDueDate(convertLocalDateTimeStringToDate(e.target.value))}/>
                </FormField>
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

        <ErrorDialog errors={errorDialogMessages} clearErrorMessages={() => setErrorDialogMessages([])}/>
    </Box>;
}

export default CheckoutWithCart;