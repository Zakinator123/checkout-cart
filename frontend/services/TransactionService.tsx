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

const checkoutIsLinkedToItem: (checkoutRecord: Record, itemRecord: Record, linkedFieldName: string) => Promise<boolean> = async (checkoutRecord, itemRecord, linkedFieldName) => (
    checkoutRecord.selectLinkedRecordsFromCellAsync(linkedFieldName)
        .then(linkedRecords => linkedRecords.hasRecord(itemRecord.id))
);


const getCheckoutRecordsToBeUpdated: (allCheckoutRecords: Record[], cartRecord: Record) => Promise<Array<RecordToUpdate>> = async (allCheckoutRecords, cartRecord) => {
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

    if (transactionData.transactionType === 'checkout') {
        const airtableChangeSets: Promise<Array<AirtableChangeSet>> = Promise.all(transactionData.cartRecords.map(async (cartRecord) => {
            const newCheckoutRecord = getCheckoutRecordToBeCreated(cartRecord, transactionData);
            return {
                recordsToUpdate: await getCheckoutRecordsToBeUpdated(checkedOutRecords, cartRecord),
                recordsToCreate: [newCheckoutRecord]
            }
        }));

        return airtableChangeSets;
    }

    // TODO: Implement Check-In
    return null;
};
