import {
    CheckoutTransactionMetadata,
    TransactionData,
    TransactionMetadata,
    transactionTypes
} from "../types/TransactionTypes";
import {Record, Table} from "@airtable/blocks/models";
import {convertUTCDateToLocalDate} from "../utils/DateUtils";
import {RecordId} from "@airtable/blocks/types";
import {allSettled} from "../utils/RandomUtils";

export const validateTransaction: (transactionData: TransactionData) => Array<string> = ({
                                                                                             cartRecords,
                                                                                             transactionDueDate,
                                                                                             transactionType,
                                                                                             transactionUser
                                                                                         }) => {
    let errorMessages: Array<string> = [];
    if (cartRecords.length === 0) errorMessages.push("Please populate the cart with items to execute a transaction.");
    if (transactionType === transactionTypes.checkout.value) {
        if (transactionUser === null) errorMessages.push("Please select a member to associate with the transaction.");
        if ((transactionDueDate) < convertUTCDateToLocalDate(new Date())) errorMessages.push("Please change the due date to be in the future.")
    }
    return errorMessages;
}

const getOpenCheckoutsAssociatedWithCartRecord: (cartRecord: Record) => Promise<RecordId[]> = async cartRecord => {
    // TODO: If there are performance issues with lots of old checkout records,
    //  this could be optimized further if there was already a pre-configured linked record column in the inventory table that used an "open checkout" view filter.
    //  However - if the open checkout view itself is modified to not do it's original job anymore, then the code relying on it would break..
    return (await cartRecord.selectLinkedRecordsFromCellAsync('Checkouts')).records
        .filter(record => record.getCellValue('Checked In') === null)
        .map(record => record.id);
}

const getCheckoutRecordToBeCreated = (cartRecord: Record, transactionData: CheckoutTransactionMetadata) => {
    return {
        'Gear Item': [{id: cartRecord.id}],
        'Checked Out To': [{id: transactionData.transactionUser.id}],
        'Date Checked Out': new Date(),
        'Date Due': transactionData.transactionDueDate,
        'Checked In': false
    };
};

const formatCheckoutRecordsToBeCheckedIn = (openCheckoutsAssociatedWithCartRecord: Array<RecordId>) =>
    openCheckoutsAssociatedWithCartRecord.map(checkoutRecordId => ({
        id: checkoutRecordId,
        fields: {
            'Checked In': true,
            'Date Checked In': new Date()
        }
    }))

async function handleOpenCheckoutsAssociatedWithCartRecord(cartRecord: Record, checkoutsTable: Table, openCheckoutsShouldBeDeleted: boolean) {
    const openCheckoutsAssociatedWithCartRecord = await getOpenCheckoutsAssociatedWithCartRecord(cartRecord);
    if (openCheckoutsAssociatedWithCartRecord.length !== 0)
        await (openCheckoutsShouldBeDeleted
            ? checkoutsTable.deleteRecordsAsync(openCheckoutsAssociatedWithCartRecord)
            : checkoutsTable.updateRecordsAsync(formatCheckoutRecordsToBeCheckedIn(openCheckoutsAssociatedWithCartRecord)));
}

const executeCheckInsAndCheckOutsForCartRecord = async (cartRecord: Record, transactionMetadata: TransactionMetadata, checkoutsTable: Table) => {
    await handleOpenCheckoutsAssociatedWithCartRecord(cartRecord, checkoutsTable, transactionMetadata.openCheckoutsShouldBeDeleted);
    if (transactionMetadata.transactionType == 'checkout') {
        // TODO: See if the type assertion can be removed below with some other strategy.
        await checkoutsTable.createRecordAsync(getCheckoutRecordToBeCreated(cartRecord, <CheckoutTransactionMetadata>transactionMetadata));
    }
    return cartRecord;
}

export const executeTransaction = async (transactionData: TransactionData, checkoutsTable: Table, removeRecordFromCart: (recordId: RecordId) => void) =>
    await allSettled(
        transactionData.cartRecords.map(cartRecord =>
            executeCheckInsAndCheckOutsForCartRecord(cartRecord, transactionData, checkoutsTable)
                .then(cartRecord => {
                    removeRecordFromCart(cartRecord.id)
                    return cartRecord;
                })))
