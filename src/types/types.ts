import {Field, FieldType, Record, Table} from "@airtable/blocks/models";
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
    tables: { [tableName in TableName]: TableOrTableId },
    checkoutTableFields: {
        required: { [requiredFieldName in CheckoutTableRequiredFieldName]: FieldOrFieldId},
        optional: { [optionalFieldName in CheckoutTableOptionalFieldName]?: FieldOrFieldId }
    },
    deleteCheckoutsUponCheckInBoolean: boolean,
}

export type AppConfigIds = AppConfig<TableId, FieldId>;
export type ValidatedAppConfig = AppConfig<Table, Field>;

export type AirtableData = {
    userRecords: Record[],
    inventoryTableRecords: Record[]
    checkoutsTable: Table,
    relevantInventoryTableFields: Field[],
    relevantUserTableFields: Field[],
    viewportWidth: number
}

export type AirtableDataProps = {
    airtableData: AirtableData
}

export type CheckoutTransactionMetadata = {
    transactionType: TransactionType,
    transactionUser: Record,
    transactionDueDate: Date,
    openCheckoutsShouldBeDeleted: boolean
}

export type TransactionCart = { cartRecords: Array<Record> }
export type TransactionMetadata =
    Omit<CheckoutTransactionMetadata, "transactionUser">
    & { transactionUser: Record | null };
export type TransactionData = TransactionMetadata & TransactionCart;

export type TransactionType = 'checkout' | 'checkin';

export type TransactionTypeWithLabel = { value: TransactionType, label: string }

export type TransactionTypes = {
    checkout: TransactionTypeWithLabel,
    checkin: TransactionTypeWithLabel
}

export type FieldConfiguration = {
    fieldName: CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName,
    expectedFieldType: FieldType,
    fieldPrompt: string,
    mustLinkTo?: TableName,
    fieldId?: FieldId,
    errors: Array<string>
}

export type TableConfiguration = {
    tableName: TableName,
    tablePickerPrompt: string,
    requiredFields: Array<FieldConfiguration>,
    optionalFields: Array<FieldConfiguration>,
    tableId?: TableId,
    errors: Array<string>
}

export type SchemaConfiguration = Array<TableConfiguration>;

export type ExtensionConfiguration = {
    hasErrors: boolean,
    schemaConfiguration: SchemaConfiguration,
    deleteCheckoutsUponCheckin: boolean,
}


export const transactionTypes: TransactionTypes = {
    checkout: {value: "checkout", label: "Check Out"},
    checkin: {value: "checkin", label: "Check In"}
}