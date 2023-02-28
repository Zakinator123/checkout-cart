import {
    TransactionData,
    transactionTypes
} from "../types";
import {Record, Table} from "@airtable/blocks/models";
import {convertUTCDateToLocalDate} from "../utils/DateUtils";
import {RecordId} from "@airtable/blocks/types";

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

const getCheckoutRecordsToBeCheckedIn: (allCheckoutRecords: Record[], cartRecord: Record) => Promise<Array<RecordId>> = async (allCheckoutRecords, cartRecord) => {
    return (await Promise.all(allCheckoutRecords
        .map(async (checkoutRecord) => (
            {
                value: checkoutRecord,
                include: await checkoutIsLinkedToItem(checkoutRecord, cartRecord, 'Gear Item')
            }))))
        .filter(resolvedPromise => resolvedPromise.include)
        .map(data => data.value.id);
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

export const executeTransaction = async (transactionData: TransactionData, checkoutsTable: Table) => {
    const openCheckouts = await checkoutsTable.selectRecordsAsync()
        .then(queryResult => queryResult.records)
        .then(allCheckouts => allCheckouts.filter(checkoutRecord => checkoutRecord.getCellValue('Checked In') === null))

    await Promise.all(transactionData.cartRecords.map(async cartRecord => {
        const checkoutRecordsToBeCheckedIn = await getCheckoutRecordsToBeCheckedIn(openCheckouts, cartRecord);
        transactionData.deleteCheckoutsUponCheckIn
            ? await checkoutsTable.deleteRecordsAsync(checkoutRecordsToBeCheckedIn)
            : await checkoutsTable.updateRecordsAsync(checkoutRecordsToBeCheckedIn.map(checkoutRecordId => ({
                id: checkoutRecordId,
                fields: {'Checked In': true}
            })));

        if (transactionData.transactionType == 'checkout') await checkoutsTable.createRecordAsync(getCheckoutRecordToBeCreated(cartRecord, transactionData));
    }));
}
