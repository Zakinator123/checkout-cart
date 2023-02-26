import {AirtableChangeSet, RecordToUpdate, TransactionData, transactionTypes} from "../types";
import {Record} from "@airtable/blocks/models";

export const validateTransaction: (TransactionData) => Array<string> = (transactionData) => {
    let errorMessages = [];

    if (transactionData.cartRecords.length === 0) {
        errorMessages.push("Please populate the cart to execute a transaction.");
    }

    if (transactionData.transactionType === transactionTypes.checkout.value) {
        if (transactionData.transactionUser === null) {
            errorMessages.push("Please select a member to associate with the checkout transaction.");
        }

        if (new Date(transactionData.transactionDueDate) < new Date()) {
            errorMessages.push("Please change the due date to be in the future.")
        }
    }

    return errorMessages;
}

const getCheckoutRecordsToBeUpdated = (allCheckoutRecords: Record[], cartRecord: Record) => {
    const openCheckouts = allCheckoutRecords.filter(checkoutRecord =>
        checkoutRecord.selectLinkedRecordsFromCellAsync('Gear Item').then(linkedRecords => linkedRecords.hasRecord(cartRecord.id)));

    const checkoutRecordsToUpdate: Array<RecordToUpdate> = openCheckouts.map(openCheckout => ({
        id: openCheckout.id,
        fields: {'Checked In': true}
    }));
    return checkoutRecordsToUpdate;
};

const getCheckoutRecordToBeCreated = (cartRecord: Record, transactionData: TransactionData) => {
    return {
        'Gear Item': [{id: cartRecord.id}],
        'Checked Out To': [{id: transactionData.transactionUser.id}],
        'Date Checked Out': new Date(),
        'Date Due': transactionData.transactionDueDate,
        'Checked In': false
    };
};

export const computeAirtableChangeSets: (transactionData: TransactionData, allCheckoutRecords: Record[]) => Array<AirtableChangeSet> | null = (transactionData, allCheckoutRecords) => {

    //TODO: Make sure there there isn't any reason I can't do this:
    const checkedOutRecords = allCheckoutRecords.filter(checkoutRecord => checkoutRecord.getCellValueAsString('Checked In') === '')

    if (transactionData.transactionType === 'checkout') {
        return transactionData.cartRecords.map((cartRecord) => {
            const checkoutRecordsToUpdate = getCheckoutRecordsToBeUpdated(checkedOutRecords, cartRecord);
            const newCheckoutRecord = getCheckoutRecordToBeCreated(cartRecord, transactionData);

            return {
                recordsToUpdate: checkoutRecordsToUpdate,
                recordsToCreate: [newCheckoutRecord]
            }
        })
    }

    // TODO: Implement Check-In
    return null;
};
