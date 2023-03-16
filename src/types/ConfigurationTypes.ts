import {Field, FieldType, Table} from "@airtable/blocks/models";
import {FieldId, TableId} from "@airtable/blocks/types";

export enum TableName {
    inventoryTable = 'inventoryTable',
    userTable = 'userTable',
    checkoutsTable = 'checkoutsTable'
}

export enum CheckoutTableRequiredFieldName {
    linkedInventoryTableField = 'linkedInventoryTableField',
    linkedUserTableField = 'linkedUserTableField',
    checkedInField = 'checkedInField',
}

export enum CheckoutTableOptionalFieldName {
    dateCheckedOutField = 'dateCheckedOutField',
    dateDueField = 'dateDueField',
    dateCheckedInField = 'dateCheckedInField'
}

type AppConfig<TableOrTableId, FieldOrFieldId> = {
    tables: Record<TableName, TableOrTableId>
    checkoutTableFields: {
        required: { [requiredFieldName in CheckoutTableRequiredFieldName]: FieldOrFieldId},
        optional: { [optionalFieldName in CheckoutTableOptionalFieldName]?: FieldOrFieldId }
    },
    deleteCheckoutsUponCheckInBoolean: boolean,
}

export type AppConfigIds = AppConfig<TableId, FieldId>;
export type ValidatedAppConfig = AppConfig<Table, Field>;

export type FieldConfigurationV2 = {
    fieldName: CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName,
    expectedFieldType: FieldType,
    fieldPrompt: string,
    mustLinkTo?: TableName,
    fieldId?: FieldId,
    errors: Array<string>
}

export type FieldConfigurationV3 = {
    fieldName: CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName,
    fieldPrompt: string,
}

export type TableConfiguration = {
    tableName: TableName,
    tablePickerPrompt: string,
    requiredFields?: Array<FieldConfigurationV3>,
    optionalFields?: Array<FieldConfigurationV3>,
}

export type SchemaConfiguration = Array<TableConfiguration>;

export type ExtensionConfiguration = {
    schemaConfiguration: SchemaConfiguration,
    deleteCheckoutsUponCheckin: boolean,
}