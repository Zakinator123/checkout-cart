import React, {useState} from 'react';
import TransactionTypeSelector from "./OptionSelector";
import {
    Box,
    Button,
    expandRecordPickerAsync,
    Heading,
    Input,
    Loader,
    useViewport,
    Text, FormField
} from "@airtable/blocks/ui";
import {loadCSSFromString} from '@airtable/blocks/ui';

import Cart from "./Cart";
import {Record} from "@airtable/blocks/models";
import UserSelector from "./UserSelector";
import {AirtableDataProps, TransactionData, TransactionType, transactionTypes} from "../types";
import {executeTransaction, validateTransaction} from "../services/TransactionService";
import {convertLocalDateTimeStringToDate, getDateTimeOneWeekFromToday, getIsoDateString} from "../utils/DateUtils";
import {ErrorDialog} from "./ErrorDialog";
import {RecordId} from "@airtable/blocks/types";

loadCSSFromString(`
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 1rem;
    overflow: auto;
    gap: 2rem;
    height: 100%
}

.submit-button {
    background-color: green;
    color: white;
}`);

/*
    TODO:
    In Extension:
        1. Restructure logic of executing transactions to allow for showing failures/successes per record
        2. Create snackbar or some other notification mechanism to show results of transaction
        3. Add settings option for deleting checkouts instead of marking them as checked in (with warning).
        8. Send users a receipt of checked out gear at the end of the transaction?
        9. When selecting a member - show how many outstanding checkouts/overdue gear items they have
        10. Create a cart group for every transaction
        11. Make "delete checkouts upon checkin" configurable.
        12. What happens when records limit is reached and a checkouts is created?
        13. For user of the extension that don't have permission to write to the table - need to have a permissions check w/ error message

    Not in Extension:
        6. Add computed field for users to show how much value of gear they have checked out.
        4. Add computed field for checkouts being overdue.
        7. Finish overdue email automation
        5. Add views for grouping checkouts by user, by cart group, filtering only overdue
 */

function CheckoutWithCart({airtableData: {checkoutsTable, inventoryTableRecords, relevantInventoryTableFields, relevantUserTableFields, userRecords}}: AirtableDataProps) {

    // Viewport Data
    const viewport = useViewport();
    const viewportWidth = viewport.size.width;
    if (viewport.maxFullscreenSize.width == null) viewport.addMaxFullscreenSize({height: 800, width: 800});

    // Transaction State
    const [transactionType, setTransactionType] = useState<TransactionType>(transactionTypes.checkout.value);
    const [cartRecords, setCartRecords] = useState<Array<Record>>([]);
    const [transactionUser, setTransactionUser] = useState<Record | null>(null);
    const [transactionDueDate, setTransactionDueDate] = useState<Date>(getDateTimeOneWeekFromToday());

    const deleteCheckoutsUponCheckIn: boolean = false;

    const transactionData: TransactionData = {
        transactionType: transactionType,
        cartRecords: cartRecords,
        transactionUser: transactionUser,
        transactionDueDate: transactionDueDate,
        openCheckoutsShouldBeDeleted: deleteCheckoutsUponCheckIn
    };

    // Other State
    const [errorDialogMessages, setErrorDialogMessages] = useState<Array<string>>([]);
    const [transactionIsProcessing, setTransactionIsProcessing] = useState<boolean>(false);

    // Transaction State Mutators
    const selectUserForTransaction = () => expandRecordPickerAsync(userRecords).then(user => setTransactionUser(user));
    const removeRecordFromCart = (recordId: RecordId) => setCartRecords(cartRecords => cartRecords.filter(record => record.id !== recordId));
    const addRecordToCart = () => expandRecordPickerAsync(inventoryTableRecords.filter(record => !cartRecords.includes(record)))
        .then(record => {
            if (record !== null) setCartRecords(cartRecords => [...cartRecords, record])
        });
    const clearTransactionData = () => {
        // TODO: Leave cart records when there are errors associated with their transaction?
        // setCartRecords([]);
        setTransactionDueDate(getDateTimeOneWeekFromToday())
        // TODO: If there are errors associated with the transaction, then perhaps the user should not be cleared?
        setTransactionUser(null);
    }

    const attemptToExecuteTransaction = () => {
        const errorMessages = validateTransaction(transactionData);
        if (errorMessages.length === 0) {
            setTransactionIsProcessing(true);
            executeTransaction(transactionData, checkoutsTable, removeRecordFromCart)
                .then((settledPromises) => {
                    // Show user notifications for settled Promises.
                    console.log(settledPromises);
                    clearTransactionData();
                })
                .finally(() => setTimeout(() => setTransactionIsProcessing(false), 1000))
        } else setErrorDialogMessages(errorMessages)
    }

    return <Box className="container" border="thick">
        <Heading>🚀 Check Out with Cart 🚀</Heading>
        <TransactionTypeSelector currentOption={transactionType} options={Object.values(transactionTypes)}
                                 setOption={setTransactionType}/>

        <Cart viewportWidth={viewportWidth}
              fieldsToShow={relevantInventoryTableFields}
              cartRecords={cartRecords} addRecordToCart={addRecordToCart}
              removeRecordFromCart={removeRecordFromCart}/>

        {transactionType === transactionTypes.checkout.value && <>
            <UserSelector viewportWidth={viewportWidth}
                          currentTransactionUser={transactionUser}
                          selectUser={selectUserForTransaction}
                          fieldsToShow={relevantUserTableFields}
            />

            <FormField label="Due Date (Default is 1 week from today):">
                <Input type='datetime-local' value={getIsoDateString(transactionDueDate)}
                       onChange={e => setTransactionDueDate(convertLocalDateTimeStringToDate(e.target.value))}/>
            </FormField></>
        }

        <Button
            type='submit'
            disabled={transactionIsProcessing}
            className='submit-button'
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