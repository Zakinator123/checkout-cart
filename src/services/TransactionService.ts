import {
    CheckoutTransactionMetadata,
    TransactionData,
    TransactionMetadata,
    transactionTypes
} from "../types/TransactionTypes";
import {Field, FieldType, Record, Table} from "@airtable/blocks/models";
import {RecordId} from "@airtable/blocks/types";
import {ValidatedTablesAndFieldsConfiguration} from "../types/ConfigurationTypes";
import {AirtableMutationService} from "./AirtableMutationService";

export class TransactionService {
    private readonly airtableMutationService: AirtableMutationService;
    private readonly checkoutsTable: Table;
    private readonly linkedInventoryTableField: Field;
    private readonly linkedUserTableField: Field;
    private readonly checkedInField: Field;
    private readonly dateCheckedInField?: Field;
    private readonly dateCheckedOutField?: Field;
    private readonly dateDueField?: Field;
    private readonly cartGroupField?: Field;
    private readonly deleteOpenCheckoutsUponCheckIn: boolean;

    constructor(airtableMutationService: AirtableMutationService,
                {
                    checkoutsTable,
                    checkedInField,
                    dateCheckedInField,
                    dateCheckedOutField,
                    dateDueField,
                    linkedInventoryTableField,
                    linkedUserTableField,
                    cartGroupField
                }: ValidatedTablesAndFieldsConfiguration,
                deleteOpenCheckoutsUponCheckIn: boolean) {
        this.airtableMutationService = airtableMutationService;
        this.checkoutsTable = checkoutsTable;
        this.checkedInField = checkedInField;
        this.dateCheckedInField = dateCheckedInField;
        this.dateCheckedOutField = dateCheckedOutField;
        this.dateDueField = dateDueField;
        this.linkedInventoryTableField = linkedInventoryTableField;
        this.linkedUserTableField = linkedUserTableField;
        this.cartGroupField = cartGroupField;
        this.deleteOpenCheckoutsUponCheckIn = deleteOpenCheckoutsUponCheckIn;
    }


    validateTransaction: (transactionData: TransactionData) => ReadonlyArray<string> = ({
                                                                                            cartRecords,
                                                                                            transactionType,
                                                                                            transactionUser
                                                                                        }) => {
        let errorMessages: Array<string> = [];
        if (cartRecords.length === 0) errorMessages.push("The cart must have at least one record.");
        if (transactionType === transactionTypes.checkout.value) {
            if (transactionUser === undefined) errorMessages.push("A user must be associated with the cart.");
            const hasPermissionToCreateCheckouts = this.checkoutsTable.hasPermissionToCreateRecord();
            if (!hasPermissionToCreateCheckouts) errorMessages.push("You do not have permission to create new checkout records.");
        }

        const hasUpdateOrDeletePermission: boolean = this.deleteOpenCheckoutsUponCheckIn ? this.checkoutsTable.hasPermissionToDeleteRecords() : this.checkoutsTable.hasPermissionToUpdateRecords();
        if (!hasUpdateOrDeletePermission) errorMessages.push("You do not have permission to update records in the checkouts table to check them in.");
        return errorMessages;
    }

    async getRecordIdsOfOpenCheckoutsAssociatedWithCartRecord(cartRecord: Record): Promise<RecordId[]> {
        // TODO: If there are performance issues with lots of old checkout records,
        //  this could be optimized further if there was already a pre-configured linked record column in the inventory table that used an "open checkout" view filter.
        //  However - if the open checkout view itself is modified to not do it's original job anymore, then the code relying on it would break.. This could be a future configuration setting?
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

    getCheckoutRecordToBeCreated = (cartRecord: Record, transactionData: CheckoutTransactionMetadata, cartGroupNumber: number) => ({
        [this.linkedInventoryTableField.id]: [{id: cartRecord.id}],
        [this.linkedUserTableField.id]: [{id: transactionData.transactionUser.id}],
        [this.checkedInField.id]: false,
        ...(this.dateCheckedOutField ? {[this.dateCheckedOutField.id]: new Date()} : {}),
        ...(this.dateDueField ? {[this.dateDueField.id]: transactionData.transactionDueDate} : {}),
        ...(this.cartGroupField ? {[this.cartGroupField.id]: cartGroupNumber} : {})
    });

    formatCheckoutRecordsToBeCheckedIn = (openCheckoutsAssociatedWithCartRecord: Array<RecordId>) => openCheckoutsAssociatedWithCartRecord.map(checkoutRecordId => ({
        id: checkoutRecordId,
        fields: {
            [this.checkedInField.id]: true,
            ...(this.dateCheckedInField ? {[this.dateCheckedInField.id]: new Date()} : {})
        }
    }));

    async handleOpenCheckoutsAssociatedWithCartRecord(cartRecord: Record) {
        const openCheckoutsAssociatedWithCartRecord: RecordId[] = await this.getRecordIdsOfOpenCheckoutsAssociatedWithCartRecord(cartRecord);
        if (openCheckoutsAssociatedWithCartRecord.length !== 0)
            await (this.deleteOpenCheckoutsUponCheckIn
                ? this.airtableMutationService.deleteRecordsInTableAsync(this.checkoutsTable, openCheckoutsAssociatedWithCartRecord)
                : this.airtableMutationService.updateRecordsInTableAsync(this.checkoutsTable, this.formatCheckoutRecordsToBeCheckedIn(openCheckoutsAssociatedWithCartRecord)));
    }

    executeCheckInsAndCheckOutsForCartRecord: (cartRecord: Record, transactionMetadata: TransactionMetadata, cartGroupNumber: number) => Promise<Record> = async (cartRecord: Record, transactionMetadata: TransactionMetadata, cartGroupNumber: number) => {
        await this.handleOpenCheckoutsAssociatedWithCartRecord(cartRecord);
        if (transactionMetadata.transactionType == 'checkout')
            await this.airtableMutationService.createRecordInTableAsync(this.checkoutsTable, this.getCheckoutRecordToBeCreated(cartRecord, <CheckoutTransactionMetadata>transactionMetadata, cartGroupNumber));
        return cartRecord;
    };

    executeTransaction = async (transactionData: TransactionData, removeRecordFromCart: (recordId: RecordId) => void): Promise<Record[]> => {
        const cartGroupNumber = Math.floor(Math.random() * 1000000000);
        const recordsWithErrors: Record[] = [];
        await Promise.all(
            transactionData.cartRecords.slice().reverse().map(cartRecord =>
                this.executeCheckInsAndCheckOutsForCartRecord(cartRecord, transactionData, cartGroupNumber)
                    .then(() => removeRecordFromCart(cartRecord.id))
                    .catch(() => recordsWithErrors.push(cartRecord))))

        return recordsWithErrors;
    };
}
