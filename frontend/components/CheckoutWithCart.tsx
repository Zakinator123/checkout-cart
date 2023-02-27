import React, {useState} from 'react';
import TransactionTypeSelector from "./OptionSelector";
import {
    Box,
    Button,
    expandRecordPickerAsync,
    Heading,
    Input,
    Loader,
    useBase,
    useRecords,
    useViewport,
    Text, FormField
} from "@airtable/blocks/ui";
import {loadCSSFromString} from '@airtable/blocks/ui';

import Cart from "./Cart";
import {Field, Record} from "@airtable/blocks/models";
import UserSelector from "./UserSelector";
import {TransactionData, TransactionType, transactionTypes} from "../types";
import {computeAirtableChangeSets, validateTransaction} from "../services/TransactionService";
import {convertLocalDateTimeStringToDate, getDateTimeOneWeekFromToday, getIsoDateString} from "../utils/DateUtils";
import {ErrorDialog} from "./ErrorDialog";
import {getTableFields} from "../utils/RandomUtils";

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


function CheckoutWithCart() {

    // Viewport Data
    const viewport = useViewport();
    const viewportWidth = viewport.size.width;
    if (viewport.maxFullscreenSize.width == null) viewport.addMaxFullscreenSize({height: 800, width: 800});

    // Transaction State
    const [transactionType, setTransactionType] = useState<TransactionType>(transactionTypes.checkout.value);
    const [cartRecords, setCartRecords] = useState([]);
    const [transactionUser, setTransactionUser] = useState<Record | null>(null);
    const [transactionDueDate, setTransactionDueDate] = useState(getDateTimeOneWeekFromToday());

    const transactionData: TransactionData = {
        transactionType: transactionType,
        cartRecords: cartRecords,
        transactionUser: transactionUser,
        transactionDueDate: transactionDueDate
    };

    // Other State
    const [errorDialogMessages, setErrorDialogMessages] = useState<Array<string>>([]);
    const [transactionIsProcessing, setTransactionIsProcessing] = useState<boolean>(false);

    // Load data from Airtable
    const base = useBase();
    const userTable = base.tables.find(table => table.name === 'Members');
    const relevantUserTableFields: Array<Field> = getTableFields(userTable, ['Full Name', 'Current Check Outs', 'Email', 'Current Check Outs Item Types'])
    const userRecords = useRecords(userTable, {fields: relevantUserTableFields});

    const checkoutsTable = base.tables.find(table => table.name === 'Checkouts');
    const checkoutRecords = useRecords(checkoutsTable);

    const inventoryTable = base.tables.find(table => table.name === 'Gear Inventory');
    const relevantInventoryTableFields: Array<Field> = getTableFields(inventoryTable, ['Item/Gear Number', 'Item Type', 'Description', 'Checkout Status', 'Notes', 'Currently Checked Out To']);
    const inventoryTableRecords = useRecords(inventoryTable, {fields: relevantInventoryTableFields});

    // Transaction State Mutators
    const selectUserForTransaction = () => expandRecordPickerAsync(userRecords).then(user => setTransactionUser(user));
    const removeRecordFromCart = (recordId) => setCartRecords(cartRecords => cartRecords.filter(record => record.id !== recordId));
    const addRecordToCart = () => expandRecordPickerAsync(inventoryTableRecords.filter(record => !cartRecords.includes(record)))
        .then(record => {
            if (record !== null) setCartRecords(cartRecords => [...cartRecords, record])
        });
    const clearTransactionData = () => {
        setCartRecords([]);
        setTransactionDueDate(getDateTimeOneWeekFromToday())
        setTransactionUser(null);
    }

    const executeTransaction = () => {
        const errorMessages = validateTransaction(transactionData);
        if (errorMessages.length === 0) {
            setTransactionIsProcessing(true);
            computeAirtableChangeSets(transactionData, checkoutRecords).then(changeSets =>
                changeSets.forEach(async changeSet => {
                    await checkoutsTable.updateRecordsAsync(changeSet.recordsToUpdate);
                    if (changeSet.recordsToCreate.length !== 0) await checkoutsTable.createRecordAsync(changeSet.recordsToCreate[0])
                }))
                .then(() => clearTransactionData())
                .then(() => setTimeout(() => setTransactionIsProcessing(false), 1000));
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
            onClick={executeTransaction}
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