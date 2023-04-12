import {Record as AirtableRecord} from "@airtable/blocks/models";
import {ObjectMap} from "@airtable/blocks/dist/types/src/private_utils";
import {FieldId} from "@airtable/blocks/dist/types/src/types/field";
import {RecordId} from "@airtable/blocks/types";

export type TransactionMetadata = {
    transactionType: TransactionType,
    transactionUser?: AirtableRecord,
    transactionDueDate: Date
}

export type TransactionCart = { cartRecords: Array<AirtableRecord> }
export type CheckoutTransactionMetadata = Required<TransactionMetadata>
export type TransactionData = TransactionMetadata & TransactionCart;

export type TransactionType = 'checkout' | 'checkin';

export type TransactionTypeWithLabel = { value: TransactionType, label: string }

export type TransactionTypes = {
    checkout: TransactionTypeWithLabel,
    checkin: TransactionTypeWithLabel
}

export const transactionTypes: TransactionTypes = {
    checkout: {value: "checkout", label: "Check Out"},
    checkin: {value: "checkin", label: "Check In"}
}

export type RecordToUpdate = {
    readonly id: RecordId;
    readonly fields: ObjectMap<FieldId | string, unknown>;
}