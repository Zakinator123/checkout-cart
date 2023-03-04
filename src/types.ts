import {Record} from "@airtable/blocks/models";

export type CheckoutTransactionMetadata = {
    transactionType: TransactionType,
    transactionUser: Record,
    transactionDueDate: Date,
    openCheckoutsShouldBeDeleted: boolean
}

export type TransactionCart = { cartRecords: Array<Record> }
export type TransactionMetadata = Omit<CheckoutTransactionMetadata, "transactionUser"> & { transactionUser: Record | null };
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