import {Field, Table} from "@airtable/blocks/models";
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

type ExtensionConfiguration<TableOrTableId, FieldOrFieldId> = {
    [TableName.inventoryTable]: TableOrTableId,
    [TableName.userTable]: TableOrTableId,
    [TableName.checkoutsTable]: TableOrTableId,
    [CheckoutTableRequiredFieldName.linkedInventoryTableField]: FieldOrFieldId,
    [CheckoutTableRequiredFieldName.linkedUserTableField]: FieldOrFieldId,
    [CheckoutTableRequiredFieldName.checkedInField]: FieldOrFieldId,
    [CheckoutTableOptionalFieldName.dateCheckedOutField]?: FieldOrFieldId,
    [CheckoutTableOptionalFieldName.dateDueField]?: FieldOrFieldId,
    [CheckoutTableOptionalFieldName.dateCheckedInField]?: FieldOrFieldId,
}

export type ExtensionConfigurationIds = ExtensionConfiguration<TableId, FieldId>;
export type ValidatedExtensionConfiguration = ExtensionConfiguration<Table, Field>;

export type FieldConfiguration = {
    fieldName: CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName,
    fieldPrompt: string,
}

export type TableConfiguration = {
    tableName: TableName,
    tablePickerPrompt: string,
    requiredFields?: Array<FieldConfiguration>,
    optionalFields?: Array<FieldConfiguration>,
}

export type SchemaConfiguration = Array<TableConfiguration>;

export type ExtensionConfigurationFormSchema = {
    schemaConfiguration: SchemaConfiguration,
    deleteCheckoutsUponCheckin: boolean,
}