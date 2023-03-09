import {Field, FieldType, Record, Table} from "@airtable/blocks/models";
import {FieldId, TableId} from "@airtable/blocks/types";
import {AppConfigKeys} from "../utils/Constants";

export enum ExtensionTables {
    inventoryTable = 'inventoryTable',
    userTable = 'userTable',
    checkoutsTable = 'checkoutsTable'
}

export enum FieldNames {
    linkedInventoryTableField = 'linkedInventoryTableField',
    linkedUserTableField = 'linkedUserTableField',
    checkedInField = 'checkedInField',
    dateCheckedOutField = 'dateCheckedOutField',
    dateDueField = 'dateDueField',
    dateCheckedInField = 'dateCheckedInField'
}

export type AppConfig = {
    tables: {
        [AppConfigKeys.inventoryTable]: { tableId: TableId | undefined, fieldIds: { required: {}, optional: {} } },
        [AppConfigKeys.userTable]: { tableId: TableId | undefined, fieldIds: { required: {}, optional: {} } },
        [AppConfigKeys.checkoutsTable]: {
            tableId: TableId | undefined, fieldIds: {
                required: {
                    [AppConfigKeys.linkedInventoryTableField]: FieldId | undefined
                    [AppConfigKeys.linkedUserTableField]: FieldId | undefined,
                    [AppConfigKeys.checkedInField]: FieldId | undefined
                },
                optional: {
                    [AppConfigKeys.dateCheckedOutField]: FieldId | undefined,
                    [AppConfigKeys.dateDueField]: FieldId | undefined,
                    [AppConfigKeys.dateCheckedInField]: FieldId | undefined,
                }
            }
        },
    },
    [AppConfigKeys.deleteCheckoutsUponCheckInBoolean]: boolean,
}

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
    fieldName: FieldNames,
    expectedFieldType: FieldType,
    fieldPrompt: string,
    mustLinkTo: ExtensionTables | null,
    fieldId: FieldId | null,
    errors: Array<string>
}

export type TableConfiguration = {
    tableName: ExtensionTables,
    tablePickerPrompt: string,
    requiredFields: Array<FieldConfiguration>,
    optionalFields: Array<FieldConfiguration>,
    tableId: TableId | null,
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