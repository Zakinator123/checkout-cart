import {useBase, useGlobalConfig, useRecords, useSettingsButton} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import CheckoutWithCart from "./CheckoutWithCart";
import {Field} from "@airtable/blocks/models";
import {getTableFields} from "../utils/RandomUtils";
import {AirtableData, ExtensionTables} from "../types/types";
import {Settings} from "./Settings";


export function ExtensionWithSettings() {

    const [isShowingSettings, setIsShowingSettings] = useState(true);
    useSettingsButton(() => setIsShowingSettings(!isShowingSettings));

    // Load data from Airtable
    const globalConfig = useGlobalConfig();

    const base = useBase();

    const inventoryTableId = globalConfig.get(ExtensionTables.inventoryTable);
    const userTableId = globalConfig.get(ExtensionTables.userTable);
    const checkoutsTableId = globalConfig.get(ExtensionTables.checkoutsTable);

    // TODO: Remove these type assertions
    const inventoryTable = base.getTableById(inventoryTableId as string);
    const userTable = base.getTableById(userTableId as string);
    const checkoutsTable = base.getTableById(checkoutsTableId as string);

    if (inventoryTable === undefined) throw new Error();
    if (userTable === undefined) throw new Error();
    if (checkoutsTable === undefined) throw new Error();

    const relevantInventoryTableFields: Array<Field> = getTableFields(inventoryTable, ['Item/Gear Number', 'Item Type', 'Description', 'Checkout Status', 'Notes', 'Currently Checked Out To']);
    const relevantUserTableFields: Array<Field> = getTableFields(userTable, ['Full Name', 'Current Check Outs', 'Email', 'Current Check Outs Item Types'])

    const userRecords = useRecords(userTable, {fields: relevantUserTableFields});
    const inventoryTableRecords = useRecords(inventoryTable, {fields: relevantInventoryTableFields});

    const airtableData: AirtableData = {userRecords, checkoutsTable, inventoryTableRecords, relevantInventoryTableFields, relevantUserTableFields}

    return isShowingSettings
        ? <Settings globalConfig={globalConfig} base={base}/>
        : <CheckoutWithCart airtableData={airtableData}/>;
}