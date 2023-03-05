import {useBase, useGlobalConfig, useRecords, useSettingsButton} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import CheckoutWithCart from "./CheckoutWithCart";
import {Field} from "@airtable/blocks/models";
import {getTableFields} from "../utils/RandomUtils";
import {AirtableData} from "../types";
import {ExtensionSettings} from "./ExtensionSettings";


export function ExtensionWithSettings() {

    const [isShowingSettings, setIsShowingSettings] = useState(false);
    useSettingsButton(() => setIsShowingSettings(!isShowingSettings));

    // Load data from Airtable
    const globalConfig = useGlobalConfig();

    const base = useBase();
    const userTable = base.tables.find(table => table.name === 'Members');
    if (userTable === undefined) throw new Error();
    const relevantUserTableFields: Array<Field> = getTableFields(userTable, ['Full Name', 'Current Check Outs', 'Email', 'Current Check Outs Item Types'])
    const userRecords = useRecords(userTable, {fields: relevantUserTableFields});
    const checkoutsTable = base.tables.find(table => table.name === 'Checkouts');
    if (checkoutsTable === undefined) throw new Error();
    const inventoryTable = base.tables.find(table => table.name === 'Gear Inventory');
    if (inventoryTable === undefined) throw new Error();
    const relevantInventoryTableFields: Array<Field> = getTableFields(inventoryTable, ['Item/Gear Number', 'Item Type', 'Description', 'Checkout Status', 'Notes', 'Currently Checked Out To']);
    const inventoryTableRecords = useRecords(inventoryTable, {fields: relevantInventoryTableFields});
    //

    const airtableData: AirtableData = {userRecords, checkoutsTable, inventoryTableRecords, relevantInventoryTableFields, relevantUserTableFields}

    return isShowingSettings
        ? <ExtensionSettings globalConfig={globalConfig} base={base}/>
        : <CheckoutWithCart airtableData={airtableData}/>;
}