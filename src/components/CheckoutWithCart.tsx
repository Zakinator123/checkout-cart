import React, {useState} from 'react';
import TransactionTypeSelector from "./OptionSelector";
import {
    Box,
    Button,
    expandRecordPickerAsync,
    FormField,
    Heading,
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
import {convertLocalDateTimeStringToDate, getDateTimeOneWeekFromToday, getIsoDateString} from "../utils/DateUtils";
import {ErrorDialog} from "./ErrorDialog";
import {RecordId} from "@airtable/blocks/types";
import {ValidatedExtensionConfiguration} from "../types/ConfigurationTypes";
import toast from "react-hot-toast";

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
    background-color: teal;
    color: white;
}`);

/*
    TODO:
    In Extension:
        1. Restructure logic of executing transactions to allow for showing failures/successes per record
        3. Add settings option for deleting checkouts instead of marking them as checked in (with warning).
        8. Send users a receipt of checked out gear at the end of the transaction?
        9. When selecting a member - show how many outstanding checkouts/overdue gear items they have
        10. Create a cart group for every transaction
        11. Make "delete checkouts upon checkin" configurable.
        12. What happens when records limit is reached and a checkouts is created?
        13. For user of the extension that don't have permission to write to the table - need to have a permissions check w/ error message

    Not in Extension:
        4. Add computed field for checkouts being overdue.
        7. Finish overdue email automation
        5. Add views for grouping checkouts by user, by cart group, filtering only overdue
 */

function CheckoutWithCart({
                              transactionService,
                              config: {
                                  inventoryTable,
                                  userTable
                              }
                          }: { transactionService: TransactionService, config: ValidatedExtensionConfiguration }) {

    // Viewport Data
    const viewport = useViewport();
    const viewportWidth = viewport.size.width;
    if (viewport.maxFullscreenSize.width == null) viewport.addMaxFullscreenSize({width: 800});

    // TODO: Filter out unwanted fields (e.g. linked fields)
    const userRecords = useRecords(userTable);
    const inventoryTableRecords = useRecords(inventoryTable);

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
        setTransactionDueDate(getDateTimeOneWeekFromToday())
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

    return <Box className="container" border="thick">
        <Heading>🚀 Check Out with Cart 🚀</Heading>
        <TransactionTypeSelector currentOption={transactionType} options={Object.values(transactionTypes)}
                                 setOption={setTransactionType}/>

        <Cart viewportWidth={viewportWidth}
              cartRecords={cartRecords} addRecordToCart={addRecordToCart}
              removeRecordFromCart={removeRecordFromCart}/>

        {transactionType === transactionTypes.checkout.value && <>
            <UserSelector viewportWidth={viewportWidth}
                          currentTransactionUser={transactionUser}
                          selectUser={selectUserForTransaction}
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