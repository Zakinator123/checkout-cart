import {AirtableChangeSet, RecordToUpdate, TransactionData, transactionTypes} from "../types";
import {Record} from "@airtable/blocks/models";
import {convertUTCDateToLocalDate} from "../utils/DateUtils";

export const validateTransaction: (TransactionData) => Array<string> = (transactionData) => {
    let errorMessages = [];

    if (transactionData.cartRecords.length === 0) {
        errorMessages.push("Please populate the cart with items to execute a transaction.");
    }

    if (transactionData.transactionType === transactionTypes.checkout.value) {
        if (transactionData.transactionUser === null) {
            errorMessages.push("Please select a member to associate with the transaction.");
        }

        if ((transactionData.transactionDueDate) < convertUTCDateToLocalDate(new Date())) {
            errorMessages.push("Please change the due date to be in the future.")
        }
    }

    return errorMessages;
}

const checkoutIsLinkedToItem: (checkoutRecord: Record, itemRecord: Record, linkedFieldName: string) => Promise<boolean> = async (checkoutRecord, itemRecord, linkedFieldName) => (
    checkoutRecord.selectLinkedRecordsFromCellAsync(linkedFieldName)
        .then(linkedRecords => linkedRecords.hasRecord(itemRecord.id))
);


const getCheckoutRecordsToBeCheckedIn: (allCheckoutRecords: Record[], cartRecord: Record) => Promise<Array<RecordToUpdate>> = async (allCheckoutRecords, cartRecord) => {
    const promises = allCheckoutRecords.map(async (checkoutRecord) => (
        {
            value: checkoutRecord,
            include: await checkoutIsLinkedToItem(checkoutRecord, cartRecord, 'Gear Item')
        }
    ));

    const openCheckouts = (await Promise.all(promises)).filter(resolvedPromise => resolvedPromise.include).map(data => data.value);

    return openCheckouts.map(openCheckout => ({
        id: openCheckout.id,
        fields: {'Checked In': true}
    }));
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

export const computeAirtableChangeSets: (transactionData: TransactionData, allCheckoutRecords: Record[]) => Promise<Array<AirtableChangeSet>> | null = async (transactionData, allCheckoutRecords) => {
    const checkedOutRecords = allCheckoutRecords.filter(checkoutRecord => checkoutRecord.getCellValue('Checked In') === null);
    return Promise.all(transactionData.cartRecords.map(async (cartRecord) => {
        const recordsToUpdate = await getCheckoutRecordsToBeCheckedIn(checkedOutRecords, cartRecord);
        let newCheckoutRecord;

        if (transactionData.transactionType === 'checkout') {
            newCheckoutRecord = [getCheckoutRecordToBeCreated(cartRecord, transactionData)];
        } else if (transactionData.transactionType === 'checkin') {
            newCheckoutRecord = [];
        }

        return {
            recordsToUpdate: recordsToUpdate,
            recordsToCreate: newCheckoutRecord
        }
    }))};
