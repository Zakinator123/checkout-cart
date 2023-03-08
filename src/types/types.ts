import {Field, FieldType, Record, Table} from "@airtable/blocks/models";

export enum ExtensionTables {
    inventoryTable = 'inventoryTable',
    userTable = 'userTable',
    checkoutsTable = 'checkoutsTable'
}
export enum CheckoutsTableFieldNames {
    linkedInventoryTableField = 'linkedInventoryTableField',
    linkedUserTableField = 'linkedUserTableField',
    checkedInField = 'checkedInField',
    dateCheckedOutField = 'dateCheckedOutField',
    dateDueField = 'dateDueField',
    dateCheckedInField = 'dateCheckedInField'
}

export type AirtableData = {
    userRecords: Record[],
    inventoryTableRecords: Record[]
    checkoutsTable: Table,
    relevantInventoryTableFields: Field[],
    relevantUserTableFields: Field[]
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
    fieldName: string,
    expectedFieldType: FieldType,
    fieldPrompt: string,
    mustLinkTo: ExtensionTables | null
}

export type TableConfiguration = {
    tableName: ExtensionTables,
    tablePickerPrompt: string,
    requiredFields: Array<FieldConfiguration>,
    optionalFields: Array<FieldConfiguration>
}

export type SchemaConfiguration = Array<TableConfiguration>;

export const transactionTypes: TransactionTypes = {
    checkout: {value: "checkout", label: "Check Out"},
    checkin: {value: "checkin", label: "Check In"}
}