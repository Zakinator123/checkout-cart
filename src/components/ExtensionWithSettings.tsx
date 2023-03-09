import {useBase, useGlobalConfig, useSettingsButton, useViewport} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import {Field, Table} from "@airtable/blocks/models";
import {AppConfig, FieldNames} from "../types/types";
import {Settings} from "./Settings";
import {AppConfigKeys, ExpectedAppConfigFieldTypeMapping} from "../utils/Constants";


export function ExtensionWithSettings() {

    const base = useBase();
    const [isShowingSettings, setIsShowingSettings] = useState(true);
    useSettingsButton(() => setIsShowingSettings(!isShowingSettings));

    // Viewport Data
    const viewport = useViewport();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const viewportWidth = viewport.size.width;
    if (viewport.maxFullscreenSize.width == null) viewport.addMaxFullscreenSize({width: 800});

    const globalConfig = useGlobalConfig();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const extensionConfig = globalConfig.get('extensionConfiguration') as AppConfig | undefined;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    type ValidatedExtensionConfig = {
        tables: {
            [AppConfigKeys.inventoryTable]: { table: Table, fields: { required: {}, optional: {} } },
            [AppConfigKeys.userTable]: { table: Table, fields: { required: {}, optional: {} } },
            [AppConfigKeys.checkoutsTable]: {
                table: Table, fields: {
                    required: {
                        [AppConfigKeys.linkedInventoryTableField]: Field,
                        [AppConfigKeys.linkedUserTableField]: Field,
                        [AppConfigKeys.checkedInField]: Field,
                    },
                    optional: {
                        [AppConfigKeys.dateCheckedOutField]: Field | undefined,
                        [AppConfigKeys.dateDueField]: Field | undefined,
                        [AppConfigKeys.dateCheckedInField]: Field | undefined,
                    }
                },
            },
        },
        deleteCheckoutsUponCheckInBoolean: false
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validateConfig: (extensionConfig: AppConfig) => any = (extensionConfig) => {
        try {
            const tables = Object.fromEntries(
                Object.entries(extensionConfig.tables)
                    .map(([tableName, {tableId, fieldIds}]) => {
                        if (tableId === undefined) throw new Error();
                        const table = base.getTableById(tableId);

                        const requiredFields = Object.fromEntries(Object.entries(fieldIds.required).map(([fieldName, fieldId]) => {
                            if (fieldId === undefined) throw new Error();
                            const field = table.getField(fieldId);
                            // TODO: Remove type assertion here.
                            if (field.type !== ExpectedAppConfigFieldTypeMapping[fieldName as FieldNames]) throw new Error();
                            return [fieldName, field];
                        }));

                        const optionalFields = Object.fromEntries(Object.entries(fieldIds.required).map(([fieldName, fieldId]) => {
                            if (fieldId === undefined) return [fieldName, undefined]
                            const field = table.getField(fieldId);
                            return [fieldName, field];
                        }));

                        return [tableName, {
                            table: table, fields: {
                                required: requiredFields,
                                optional: optionalFields
                            }
                        }];
                    }));

            return {
                tables: tables,
                deleteCheckoutsUponCheckInBoolean: extensionConfig.deleteCheckoutsUponCheckInBoolean
            }
        } catch {
            throw new Error();
        }
    }


    // if (extensionConfig) {
    //     const validConfig = validateConfig(extensionConfig);
    // }


    // const userRecords = useRecords(userTable, {fields: relevantUserTableFields});
    // const inventoryTableRecords = useRecords(inventoryTable, {fields: relevantInventoryTableFields});
    // const airtableData: AirtableData = {userRecords, checkoutsTable, inventoryTableRecords, relevantInventoryTableFields, relevantUserTableFields, viewportWidth}

    return isShowingSettings
        ? <Settings globalConfig={globalConfig} base={base}/>
        : null
// :
//     <CheckoutWithCart airtableData={airtableData}/>;
}