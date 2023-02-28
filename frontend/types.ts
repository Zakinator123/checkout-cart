import {Record} from "@airtable/blocks/models";

export type TransactionData = {
    transactionType: TransactionType,
    cartRecords: Array<Record>,
    transactionUser: Record | null,
    transactionDueDate: Date,
    deleteCheckoutsUponCheckIn: boolean
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