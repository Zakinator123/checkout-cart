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
import {convertLocalDateTimeStringToDate, getDateTimeOneWeekFromToday, getIsoDateString} from "../utils/DateUtils";
import {ErrorDialog} from "./ErrorDialog";
import {RecordId} from "@airtable/blocks/types";
import {ValidatedTablesAndFieldsConfiguration} from "../types/ConfigurationTypes";
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

function CheckoutWithCart({
                              transactionService,
                              config: {
                                  inventoryTable,
                                  userTable,
                                  dateDueField,
                              }
                          }: { transactionService: TransactionService, config: ValidatedTablesAndFieldsConfiguration }) {

    // Viewport Data
    const viewport = useViewport();
    const viewportWidth = viewport.size.width;
    if (viewport.maxFullscreenSize.width == null) viewport.addMaxFullscreenSize({width: 800});
    console.log(viewportWidth);
    // TODO: Filter out unwanted fields (e.g. reverse linked fields?)
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

    return <Box className="container">
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

            {dateDueField !== undefined &&
                <FormField label="Due Date (Default is 1 week from today):">
                    <Input type='datetime-local' value={getIsoDateString(transactionDueDate)}
                           onChange={e => setTransactionDueDate(convertLocalDateTimeStringToDate(e.target.value))}/>
                </FormField>
            }
        </>
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