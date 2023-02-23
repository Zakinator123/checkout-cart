import React, {useState} from 'react';
import TransactionTypeSelector from "./components/OptionSelector";
import {Box, expandRecordPickerAsync, Heading, Input, useBase, useRecords} from "@airtable/blocks/ui";
import {loadCSSFromString} from '@airtable/blocks/ui';

import Cart from "./components/Cart";
import {Record} from "@airtable/blocks/models";
import UserSelector from "./components/UserSelector";

loadCSSFromString(`
.outer-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 2rem;
    overflow: hidden;
    gap: 2rem;
}`);

function nextweek() {
    var today = new Date();
    var nextweek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    return nextweek;
}

function CheckoutWithCart() {
    const [transactionType, setTransactionType] = useState(transactionTypes[0].value);
    const [cartRecords, setCartRecords] = useState([]);
    const [transactionUser, setTransactionUser] = useState<Record | null>(null);
    const [transactionDueDate, setTransactionDueDate] = useState(nextweek().toISOString());

    ////////// Get data from Airtable
    const base = useBase();
    const userTable = base.tables.find(table => table.name === 'Members');
    const userRecords = useRecords(userTable);

    const checkoutsTable = base.tables.find(table => table.name === 'Checkouts');
    const checkoutRecords = useRecords(checkoutsTable);

    const inventoryTable = base.tables.find(table => table.name === 'Gear Inventory');
    const inventoryTableRecords = useRecords(inventoryTable);
    ///////////


    const addRecordToCart = () =>
        expandRecordPickerAsync(inventoryTableRecords.filter(record => !cartRecords.includes(record)))
            .then(record => {
                if (record !== null) {
                    setCartRecords(cartRecords => [...cartRecords, record])
                }
            });

    const removeRecordFromCart = (recordId) => setCartRecords(cartRecords => cartRecords.filter(record => record.id !== recordId));

    const selectUserForTransaction = () =>
        expandRecordPickerAsync(userRecords)
            .then(user => {
                if (user !== null) {
                    setTransactionUser(() => user);
                }
            });

    return (
        <div>
            <Box className="outer-box" border="default">
                <Heading>🚀 Check Out with Cart 🚀</Heading>
                <TransactionTypeSelector currentOption={transactionType} options={transactionTypes} setOption={setTransactionType}/>
                <UserSelector currentTransactionUser={transactionUser} selectUser={selectUserForTransaction}/>
                <Cart cartRecords={cartRecords} addRecordToCart={addRecordToCart} removeRecordFromCart={removeRecordFromCart}/>
                {/*<Input type='datetime-local' value={transactionDueDate.toString()} onChange={e => {*/}
                {/*    console.log(e.target.value);*/}
                {/*    console.log(new Date(e.target.value));*/}
                {/*    setTransactionDueDate((new Date(e.target.value)).toISOString())*/}
                {/*}} />*/}
            </Box>
        </div>
    );
}

const transactionTypes = [
    {value: "checkout", label: "Check Out"},
    {value: "checkin", label: "Check In"},
];

export default CheckoutWithCart;