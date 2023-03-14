import {useBase, useGlobalConfig, useSettingsButton} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import {Field, FieldType, Table} from "@airtable/blocks/models";
import {
    AppConfigIds,
    TableName,
    ValidatedAppConfig
} from "../types/types";
import {Settings} from "./Settings";
import {ExpectedAppConfigFieldTypeMapping, fieldTypeLinks} from "../utils/Constants";
import {FieldId, TableId} from "@airtable/blocks/types";
import {getEntries, mapValues} from "../utils/RandomUtils";
import CheckoutWithCart from "./CheckoutWithCart";


export function ExtensionWithSettings() {

    const base = useBase();
    const [isShowingSettings, setIsShowingSettings] = useState(true);
    useSettingsButton(() => setIsShowingSettings(!isShowingSettings));



    const globalConfig = useGlobalConfig();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const extensionConfig = globalConfig.get('extensionConfiguration') as AppConfigIds | undefined;

    /*
        Get AppConfig from GlobalConfig
            if empty take user to settings page and hydrate form state with reducer state initializer
            if present, validate. If valid take user to

            // Form validation scenarios:
                - If no tables exist in base, show error message
                - If one table is already used for X table, cannot also use that table as the Y table.
                - If checkouts table does not have any valid linked records, or date records, or checkbox records, show error on that field
     */


    const validateConfig: ((extensionConfig: AppConfigIds) => ValidatedAppConfig) = (extensionConfig) => {
        try {

            const tables: ValidatedAppConfig['tables'] = mapValues(extensionConfig.tables, (tableId: TableId): Table => base.getTableById(tableId));
            const checkoutsTable: Table = tables.checkoutsTable;
            const checkoutTableRequiredFields: ValidatedAppConfig['checkoutTableFields']['required'] =
                mapValues(
                    extensionConfig.checkoutTableFields.required,
                    (fieldId: FieldId): Field => checkoutsTable.getFieldById(fieldId)
                );

            const checkoutTableOptionalFields: ValidatedAppConfig['checkoutTableFields']['optional'] =
                mapValues(
                    extensionConfig.checkoutTableFields.optional,
                    (fieldId?: FieldId): Field | undefined => (fieldId != null) ? checkoutsTable.getFieldByIdIfExists(fieldId) ?? undefined : undefined
                );

            // const fields = {...checkoutTableRequiredFields, ...checkoutTableOptionalFields}
            getEntries(checkoutTableRequiredFields).forEach(([fieldName, field]) => {
                if (field.type !== ExpectedAppConfigFieldTypeMapping[fieldName]) throw new Error();
                if (field.config.type === FieldType.MULTIPLE_RECORD_LINKS) {
                    const tableName = fieldTypeLinks[fieldName] as TableName;
                    if (field.config.options.linkedTableId !== tables[tableName].id) throw new Error();
                }
            });

            // TODO: Figure out how to simplify this
            getEntries(checkoutTableOptionalFields).forEach(optionalField => {
                if (optionalField === undefined) return;
                const [fieldName, field] = optionalField;
                if (field === undefined || fieldName === undefined) return;
                if (field.type !== ExpectedAppConfigFieldTypeMapping[fieldName]) throw new Error();
            });

            return {
                tables: tables,
                checkoutTableFields: {required: checkoutTableRequiredFields, optional: checkoutTableOptionalFields},
                deleteCheckoutsUponCheckInBoolean: extensionConfig.deleteCheckoutsUponCheckInBoolean
            }
        } catch {
            throw new Error();
        }
    }


    let validConfig = undefined;
    if (extensionConfig) {
        validConfig = validateConfig(extensionConfig);
    }

    return isShowingSettings || !validConfig
        ? <Settings globalConfig={globalConfig} base={base}/>
        : <CheckoutWithCart config={validConfig}/>;
}