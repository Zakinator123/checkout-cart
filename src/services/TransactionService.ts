import {
    CheckoutTransactionMetadata,
    TransactionData,
    TransactionMetadata,
    transactionTypes
} from "../types/TransactionTypes";
import {Field, FieldType, Record, Table} from "@airtable/blocks/models";
import {RecordId} from "@airtable/blocks/types";
import {allSettled} from "../utils/RandomUtils";
import {ValidatedTablesAndFieldsConfiguration} from "../types/ConfigurationTypes";

export class TransactionService {
    private readonly checkoutsTable: Table;
    private readonly linkedInventoryTableField: Field;
    private readonly linkedUserTableField: Field;
    private readonly checkedInField: Field;
    private readonly dateCheckedInField?: Field;
    private readonly dateCheckedOutField?: Field;
    private readonly dateDueField?: Field;
    private readonly cartGroupField?: Field;

    constructor({
                    checkoutsTable,
                    checkedInField,
                    dateCheckedInField,
                    dateCheckedOutField,
                    dateDueField,
                    linkedInventoryTableField,
                    linkedUserTableField,
                    cartGroupField
                }: ValidatedTablesAndFieldsConfiguration) {
        this.checkoutsTable = checkoutsTable;
        this.checkedInField = checkedInField;
        this.dateCheckedInField = dateCheckedInField;
        this.dateCheckedOutField = dateCheckedOutField;
        this.dateDueField = dateDueField;
        this.linkedInventoryTableField = linkedInventoryTableField;
        this.linkedUserTableField = linkedUserTableField;
        this.cartGroupField = cartGroupField;
    }


    validateTransaction: (transactionData: TransactionData) => Array<string> = ({
                                                                                    cartRecords,
                                                                                    transactionType,
                                                                                    transactionUser
                                                                                }) => {
        let errorMessages: Array<string> = [];
        if (cartRecords.length === 0) errorMessages.push("Please populate the cart with items to execute a transaction.");
        if (transactionType === transactionTypes.checkout.value) {
            if (transactionUser === null) errorMessages.push("Please select a member to associate with the transaction.");
            // TODO: Make this configurable or remove altogether?
            // if ((transactionDueDate) < convertUTCDateToLocalDate(new Date())) errorMessages.push("Please change the due date to be in the future.")
        }
        return errorMessages;
    }

    async getOpenCheckoutsAssociatedWithCartRecord(cartRecord: Record) {
        // TODO: If there are performance issues with lots of old checkout records,
        //  this could be optimized further if there was already a pre-configured linked record column in the inventory table that used an "open checkout" view filter.
        //  However - if the open checkout view itself is modified to not do it's original job anymore, then the code relying on it would break..
        const config = this.linkedInventoryTableField.config;
        let reverseLinkedField = undefined;
        if (config.type === FieldType.MULTIPLE_RECORD_LINKS) {
            reverseLinkedField = config.options.inverseLinkFieldId
        }
        const reverseLinkedFieldDefined = reverseLinkedField ?? this.checkoutsTable.name;
        return (await cartRecord.selectLinkedRecordsFromCellAsync(reverseLinkedFieldDefined)).records
            .filter(record => record.getCellValue(this.checkedInField) === null)
            .map(record => record.id);
    }

    getCheckoutRecordToBeCreated(cartRecord: Record, transactionData: CheckoutTransactionMetadata, cartGroupNumber: number) {
        let optionalFields = {};
        optionalFields = this.dateCheckedOutField ? {
            ...optionalFields,
            [this.dateCheckedOutField.id]: new Date()
        } : optionalFields;
        optionalFields = this.dateDueField ? {
            ...optionalFields,
            [this.dateDueField.id]: transactionData.transactionDueDate
        } : optionalFields;
        optionalFields = this.cartGroupField ? {
            ...optionalFields,
            [this.cartGroupField.id]: cartGroupNumber
        } : optionalFields;

        return {
            [this.linkedInventoryTableField.id]: [{id: cartRecord.id}],
            [this.linkedUserTableField.id]: [{id: transactionData.transactionUser.id}],
            [this.checkedInField.id]: false,
            ...optionalFields
        };
    }

    formatCheckoutRecordsToBeCheckedIn(openCheckoutsAssociatedWithCartRecord: Array<RecordId>) {
        const dateCheckedIn = this.dateCheckedInField ? {[this.dateCheckedInField.id]: new Date()} : {}
        return openCheckoutsAssociatedWithCartRecord.map(checkoutRecordId => ({
            id: checkoutRecordId,
            fields: {
                [this.checkedInField.id]: true,
                ...dateCheckedIn
            }
        }))
    }

    async handleOpenCheckoutsAssociatedWithCartRecord(cartRecord: Record, openCheckoutsShouldBeDeleted: boolean) {
        const openCheckoutsAssociatedWithCartRecord = await this.getOpenCheckoutsAssociatedWithCartRecord(cartRecord);
        if (openCheckoutsAssociatedWithCartRecord.length !== 0)
            await (openCheckoutsShouldBeDeleted
                ? this.checkoutsTable.deleteRecordsAsync(openCheckoutsAssociatedWithCartRecord)
                : this.checkoutsTable.updateRecordsAsync(this.formatCheckoutRecordsToBeCheckedIn(openCheckoutsAssociatedWithCartRecord)));
    }

    async executeCheckInsAndCheckOutsForCartRecord(cartRecord: Record, transactionMetadata: TransactionMetadata, cartGroupNumber: number) {
        await this.handleOpenCheckoutsAssociatedWithCartRecord(cartRecord, transactionMetadata.openCheckoutsShouldBeDeleted);
        if (transactionMetadata.transactionType == 'checkout') {
            // TODO: See if the type assertion can be removed below with some other strategy.
            await this.checkoutsTable.createRecordAsync(this.getCheckoutRecordToBeCreated(cartRecord, <CheckoutTransactionMetadata>transactionMetadata, cartGroupNumber));
        }
        return cartRecord;
    }

    async executeTransaction(transactionData: TransactionData, removeRecordFromCart: (recordId: RecordId) => void) {
        const cartGroupNumber = Math.floor(Math.random() * 1000000);

        await allSettled(
            transactionData.cartRecords.map(cartRecord =>
                this.executeCheckInsAndCheckOutsForCartRecord(cartRecord, transactionData, cartGroupNumber)
                    .then(cartRecord => {
                        removeRecordFromCart(cartRecord.id)
                        return cartRecord;
                    })))
    }
}
