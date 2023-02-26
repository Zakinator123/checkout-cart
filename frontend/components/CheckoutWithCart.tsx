import React, {useState} from 'react';
import TransactionTypeSelector from "./OptionSelector";
import {
    Box,
    Button,
    expandRecordPickerAsync,
    Heading,
    Input,
    Label,
    useBase,
    useRecords,
    useViewport
} from "@airtable/blocks/ui";
import {loadCSSFromString} from '@airtable/blocks/ui';

import Cart from "./Cart";
import {Field, Record, Table} from "@airtable/blocks/models";
import UserSelector from "./UserSelector";
import {TransactionData, TransactionType, transactionTypes} from "../types";
import {computeAirtableChangeSets, validateTransaction} from "../services/TransactionService";
import {convertLocalDateTimeStringToDate, getDateTimeOneWeekFromToday, getIsoDateString} from "../utils/DateUtils";

loadCSSFromString(`
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 1rem;
    overflow: hidden;
    gap: 2rem;
}

.submit-button {
    background-color: green;
    color: white;
}`);

const getTableFields = (table: Table, fieldNames: string[]) => fieldNames.map(fieldName => table.getField(fieldName));

function CheckoutWithCart() {

    const viewport = useViewport();
    const viewportWidth = viewport.size.width;
    if (viewport.maxFullscreenSize.width == null) {
        viewport.addMaxFullscreenSize({width: 800})
    }
    // Transaction Data
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

    const [errorDialogMessages, setErrorDialogMessages] = useState<Array<string>>([]);

    ////////// Get data from Airtable
    // TODO: Similarly filter out fields and records that are not needed

    const base = useBase();
    const userTable = base.tables.find(table => table.name === 'Members');
    const userRecords = useRecords(userTable);

    const checkoutsTable = base.tables.find(table => table.name === 'Checkouts');
    const checkoutRecords = useRecords(checkoutsTable);

    const inventoryTable = base.tables.find(table => table.name === 'Gear Inventory');
    const relevantInventoryTableFields : Array<Field> = getTableFields(inventoryTable,  ['Item/Gear Number', 'Item Type', 'Description', 'Checkout Status', 'Notes', 'Currently Checked Out To']);
    const inventoryTableRecords = useRecords(inventoryTable, {fields: relevantInventoryTableFields});
    ///////////

    const addRecordToCart = () =>
        expandRecordPickerAsync(inventoryTableRecords.filter(record => !cartRecords.includes(record)))
            .then(record => {
                if (record !== null) {
                    setCartRecords(cartRecords => [...cartRecords, record])
                }
            });

    const selectUserForTransaction = () => expandRecordPickerAsync(userRecords).then(user => setTransactionUser(user));
    const removeRecordFromCart = (recordId) => setCartRecords(cartRecords => cartRecords.filter(record => record.id !== recordId));

    const executeTransaction = () => {
        const errorMessages = validateTransaction(transactionData);
        if (errorMessages.length !== 0) {
            setErrorDialogMessages(errorDialogMessages)
            return;
        }

        const airtableChangeSets = computeAirtableChangeSets(transactionData, checkoutRecords);

        airtableChangeSets.forEach(changeSet => {
            checkoutsTable.updateRecordsAsync(changeSet.recordsToUpdate)
                .then(() => {
                    console.log('All previous checkouts marked as checked in.');
                    checkoutsTable.createRecordAsync(changeSet.recordsToCreate[0])
                        .then(recordId => console.log(recordId));
                })
        });
    }

    // TODO: When selecting a member - show how many outstanding checkouts/overdue gear items they have

    return (
        <div>
            <Box className="container" border="thick">
                <Heading>🚀 Check Out with Cart 🚀</Heading>
                <TransactionTypeSelector currentOption={transactionType} options={Object.values(transactionTypes)}
                                         setOption={setTransactionType}/>

                <Cart viewportWidth={viewportWidth}
                      fieldsToShow={relevantInventoryTableFields}
                      cartRecords={cartRecords} addRecordToCart={addRecordToCart}
                      removeRecordFromCart={removeRecordFromCart}/>

                {transactionType === transactionTypes.checkout.value &&
                    <React.Fragment>
                        <UserSelector viewportWidth={viewportWidth} currentTransactionUser={transactionUser}
                                      selectUser={selectUserForTransaction}/>

                        <div>
                            <Label>Due Date (Default is 1 week from today):</Label>
                            <Input type='datetime-local' value={getIsoDateString(transactionDueDate)}
                                   onChange={e => setTransactionDueDate(convertLocalDateTimeStringToDate(e.target.value))}/>
                        </div>
                    </React.Fragment>
                }

                <Button
                    type='submit'
                    className='submit-button'
                    onClick={executeTransaction}
                >
                    {transactionTypes[transactionType].label} Items
                </Button>
            </Box>
        </div>
    );
}

export default CheckoutWithCart;