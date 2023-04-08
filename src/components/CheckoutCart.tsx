import React, {useEffect, useState} from 'react';
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
import toast from "react-hot-toast";
import {maxNumberOfCartRecordsForFreeUsers} from "../utils/Constants";
import {asyncAirtableOperationWrapper} from "../utils/RandomUtils";
import {Toast} from "./Toaster";

loadCSSFromString(`
.checkout-cart-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 1rem;
    overflow: auto;
    gap: 1.5rem;
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

    useEffect(() => {
        toast.remove();
        return () => toast.remove();
    }, [])

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

    // Transaction State Mutators
    const selectUserForTransaction = () => expandRecordPickerAsync(userRecords).then(user => setTransactionUser(user));
    const removeRecordFromCart = (recordId: RecordId) => setCartRecords(cartRecords => cartRecords.filter(record => record.id !== recordId));
    const addRecordToCart = () => {
        if (!isPremiumUser && cartRecords.length >= maxNumberOfCartRecordsForFreeUsers) {
            toast.error(`Please upgrade to premium to add more records to the cart.`, {duration: 6000, style: {top: '-18rem'}});
        } else {
            // TODO: Instead of filtering here, just show an error if the user tries to add a record that is already in the cart.
            const recordsNotAlreadyInCart = inventoryTableRecords.filter(record => !cartRecords.includes(record));
            if (recordsNotAlreadyInCart.length !== 0) return expandRecordPickerAsync(recordsNotAlreadyInCart)
                .then(record => {
                    if (record !== null) setCartRecords(cartRecords => [...cartRecords, record])
                });

            toast.error(`There are no records in the inventory table that are not already in the cart.`);
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
            const transactionPromise = asyncAirtableOperationWrapper(() => transactionService.executeTransaction({...transactionData}, removeRecordFromCart))
                .then(() => clearTransactionData())
                .finally(() => setTimeout(() => setTransactionIsProcessing(false), 1000))

            toast.promise(transactionPromise, {
                loading: 'Attempting to execute transaction.',
                success: `${transactionTypes[transactionData.transactionType].label} successful!`,
                error: 'An error occurred with the transaction.',
            });
        } else {
            const errors = errorMessages.map(message => `- ${message}\n`);
            toast.error(`${errorMessages.length > 1 ? 'Errors occurred' : 'An error occurred'}: \n ${errors.join('')}`, {
                style: {
                    top: `${viewportWidth > 590 ? errorMessages.length.toString() : (errorMessages.length * 2).toString()}rem`,
                    minWidth: '270px'
                }
            });
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

        {transactionType === transactionTypes.checkout.value && <>
            <UserSelector viewportWidth={viewportWidth}
                          currentTransactionUser={transactionUser}
                          selectUser={selectUserForTransaction}
                          transactionIsProcessing={transactionIsProcessing}
            />

            {dateDueField !== undefined &&
                <FormField
                    label={`Due Date (The configured default is ${otherConfiguration.defaultNumberOfDaysFromTodayForDueDate} days from today):`}>
                    <Input type='date'
                           value={getIsoDateString(transactionDueDate)}
                           onChange={e => setTransactionDueDate(convertLocalDateTimeStringToDate(e.target.value))}
                           disabled={transactionIsProcessing}/>
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
    </Box>
        <Toast top='2rem'/>
    </>
}

export default CheckoutCart;