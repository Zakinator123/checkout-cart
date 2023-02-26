import {Record} from "@airtable/blocks/models";
import {FieldId, RecordId} from "@airtable/blocks/types";
import {ObjectMap} from "@airtable/blocks/unstable_private_utils";

export type TransactionData = {
    transactionType: TransactionType,
    cartRecords: Array<Record>,
    transactionUser: Record | null,
    transactionDueDate: Date
}

export type RecordData = ObjectMap<FieldId | string, unknown>

export type RecordToUpdate = {
    id: RecordId,
    fields: RecordData
}

export type AirtableChangeSet = {
    recordsToUpdate: Array<RecordToUpdate>
    recordsToCreate: Array<RecordData>
}

export type TransactionType = 'checkout' | 'checkin';

export type TransactionTypeWithLabel = {
    value: TransactionType, label: string
}

export type TransactionTypes = {
    checkout: TransactionTypeWithLabel,
    checkin: TransactionTypeWithLabel
}

export const transactionTypes : TransactionTypes = {
    checkout: {value: "checkout", label: "Check Out"},
    checkin: {value: "checkin", label: "Check In"}
}