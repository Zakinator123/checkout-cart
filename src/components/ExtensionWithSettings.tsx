import {useBase, useGlobalConfig, useSettingsButton} from '@airtable/blocks/ui';
import React, {useState} from 'react';
import {Settings} from "./Settings";
import CheckoutWithCart from "./CheckoutWithCart";
import {validateConfig} from "../services/ConfigurationService";
import {AppConfigIds, CheckoutTableRequiredFieldName, TableName} from "../types/ConfigurationTypes";
import * as Yup from "yup";
import {mixed, string, TestContext} from "yup";
import {Base, Field, FieldType, Table} from "@airtable/blocks/models";
import {FieldId, TableId} from "@airtable/blocks/types";
import {ExpectedAppConfigFieldTypeMapping, fieldTypeLinks} from "../utils/Constants";

const airtableIdIsDistinctFromOtherIdsInForm = (airtableId: string, context: TestContext) => {
    const currentSchemaKey = context.path;
    let idsAreUnique: boolean = true;
    for (const schemaKey of Object.keys(context.parent)) {
        if (schemaKey !== currentSchemaKey && context.parent[schemaKey] !== '' && context.parent[schemaKey] === airtableId) {
            idsAreUnique = false;
        }
    }
    return idsAreUnique;
}

const uniqueTableValidationTest: [string, string, typeof airtableIdIsDistinctFromOtherIdsInForm] = ['UniqueTable', 'Configured tables must be distinct.', airtableIdIsDistinctFromOtherIdsInForm];
const uniqueFieldValidationTest: [string, string, typeof airtableIdIsDistinctFromOtherIdsInForm] = ['UniqueField', 'Configured fields must be distinct.', airtableIdIsDistinctFromOtherIdsInForm];

const getTableByIdFromBase: (base: Base, tableId: TableId) => Table | undefined = (base, tableId) => base.getTableByIdIfExists(tableId) ?? undefined
const getFieldByIdFromTable: (table: Table, fieldId: FieldId) => Field | undefined = (table, fieldId) => table.getFieldByIdIfExists(fieldId) ?? undefined

export function ExtensionWithSettings(this: any) {
    const base = useBase();
    const [isShowingSettings, setIsShowingSettings] = useState(true);

    useSettingsButton(() => setIsShowingSettings(!isShowingSettings));

    const tableKeyIsPresentAndUnique = string()
        .required()
        .test(...uniqueTableValidationTest)

    const checkoutTableRequiredFieldIsPresentAndUnique = string()
        .required()
        .test(...uniqueFieldValidationTest)

    const tableExists = mixed((input): input is Table => input instanceof Table)
        .transform(tableId => getTableByIdFromBase(base, tableId))
        .required()

    const fieldExistsAndIsValid = mixed()
        .when(TableName.checkoutsTable, ([checkoutsTable], fieldSchema) =>
            fieldSchema
                .strict(true)
                .transform((fieldId: FieldId): Field | undefined => getFieldByIdFromTable(checkoutsTable, fieldId))
                .required()
                .test('Correct Field Type',
                    'The selected field type is incorrect.',
                    (field: any, context) => {
                        const assertedField = field as Field;
                        const requiredFieldName = context.path as CheckoutTableRequiredFieldName;
                        return assertedField.type === ExpectedAppConfigFieldTypeMapping[requiredFieldName];
                    })
                .test('Proper Field Type Link',
                    'The selected linked record field links to the wrong table.',
                    (field: any, context) => {
                        const assertedField = field as Field;
                        if (assertedField.config.type !== FieldType.MULTIPLE_RECORD_LINKS) return true;
                        const requiredFieldName = context.path as CheckoutTableRequiredFieldName;
                        const mustLinkTo: TableName | undefined = fieldTypeLinks[requiredFieldName];
                        if (mustLinkTo === undefined) return false;
                        console.log(`${requiredFieldName} must link to ${mustLinkTo} with id ${context.parent[mustLinkTo].id}`);
                        const currentlyLinkedTo: TableId = assertedField.config.options.linkedTableId
                        console.log(`It currently links to ${currentlyLinkedTo}`)
                        return assertedField.config.options.linkedTableId === context.parent[mustLinkTo].id;
                    }
                )
        )


    const configurationIdsSchema = Yup.object({
        [TableName.inventoryTable]: tableKeyIsPresentAndUnique,
        [TableName.userTable]: tableKeyIsPresentAndUnique,
        [TableName.checkoutsTable]: tableKeyIsPresentAndUnique,
        [CheckoutTableRequiredFieldName.linkedInventoryTableField]: checkoutTableRequiredFieldIsPresentAndUnique,
        [CheckoutTableRequiredFieldName.linkedUserTableField]: checkoutTableRequiredFieldIsPresentAndUnique,
        [CheckoutTableRequiredFieldName.checkedInField]: checkoutTableRequiredFieldIsPresentAndUnique,
        // [CheckoutTableOptionalFieldName.dateCheckedOutField]: string().optional(),
        // [CheckoutTableOptionalFieldName.dateDueField]: string().optional(),
        // [CheckoutTableOptionalFieldName.dateCheckedInField]: string().optional(),
        // deleteCheckoutsUponCheckIn: boolean().required()
    })

    const configurationTablesAndFieldsSchema = Yup.object({
        [TableName.inventoryTable]: tableExists,
        [TableName.userTable]: tableExists,
        [TableName.checkoutsTable]: tableExists,
        [CheckoutTableRequiredFieldName.linkedInventoryTableField]: fieldExistsAndIsValid,
        [CheckoutTableRequiredFieldName.linkedUserTableField]: fieldExistsAndIsValid,
        [CheckoutTableRequiredFieldName.checkedInField]: fieldExistsAndIsValid,
    });


    const globalConfig = useGlobalConfig();
    const extensionConfig = globalConfig.get('extensionConfiguration') as AppConfigIds | undefined;

    let validConfig = undefined;
    if (extensionConfig) {
        validConfig = validateConfig(extensionConfig, base);
    }

    return isShowingSettings || !validConfig
        ? <Settings configurationIdsSchema={configurationIdsSchema}
                    configurationTablesAndFieldsSchema={configurationTablesAndFieldsSchema}
                    base={base}/>
        : <CheckoutWithCart config={validConfig}/>;
}