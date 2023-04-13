import {Base, FieldType} from "@airtable/blocks/models";
import {
    CheckoutTableOptionalFieldName,
    CheckoutTableRequiredFieldName,
    ExtensionConfiguration,
    OtherConfigurationKey,
    TableName
} from "../types/ConfigurationTypes";

export async function createSchema(base: Base, randomSchemaId: number) {
    const inventoryTable = await base.createTableAsync(`Inventory Example #${randomSchemaId}`, [{
        name: 'Item Name',
        type: FieldType.SINGLE_LINE_TEXT,
        description: 'This is the primary field'
    }])

    const userTable = await base.createTableAsync(`Users Example #${randomSchemaId}`, [{
        name: 'User Name',
        type: FieldType.SINGLE_LINE_TEXT,
        description: 'This is the primary field'
    }])

    const checkoutsTable = await base.createTableAsync(`Checkouts Example #${randomSchemaId}`, [
        {
            name: 'Checkout Id',
            type: FieldType.NUMBER,
            options: {precision: 0},
            description: 'This is the primary field - this can be changed to an autonumber field type or some other field type.'
        }])

    const linkedInventoryTableField = checkoutsTable.createFieldAsync('Checked Out Item', FieldType.MULTIPLE_RECORD_LINKS, {linkedTableId: inventoryTable.id});
    const linkedUserTableField = checkoutsTable.createFieldAsync('Checked Out To', FieldType.MULTIPLE_RECORD_LINKS, {linkedTableId: userTable.id});
    const checkedInField = checkoutsTable.createFieldAsync('Checked In', FieldType.CHECKBOX, {
        icon: 'check',
        color: 'greenBright'
    }, 'This field indicates whether the item has been checked in or not. A checked checkbox means that the item has been checked in.');
    const checkedOutDateField = checkoutsTable.createFieldAsync('Checked Out Date', FieldType.DATE, {dateFormat: {name: 'local'}}, 'This field indicates the date the item was checked out');
    const dateDueField = checkoutsTable.createFieldAsync('Date Due', FieldType.DATE, {dateFormat: {name: 'local'}}, 'This field indicates the date the item is due to be checked in');
    const checkedInDateField = checkoutsTable.createFieldAsync('Checked In Date', FieldType.DATE, {dateFormat: {name: 'local'}}, 'This field indicates the date the item was checked in');
    const cartIdField = checkoutsTable.createFieldAsync('Cart Id', FieldType.NUMBER, {precision: 0}, 'This field is used to store the cart id for the checkout.');

    const extensionConfiguration: ExtensionConfiguration = {
        tableAndFieldIds: {
            [TableName.inventoryTable]: inventoryTable.id,
            [TableName.recipientTable]: userTable.id,
            [TableName.checkoutsTable]: checkoutsTable.id,
            [CheckoutTableRequiredFieldName.linkedInventoryTableField]: (await linkedInventoryTableField).id,
            [CheckoutTableRequiredFieldName.linkedRecipientTableField]: (await linkedUserTableField).id,
            [CheckoutTableRequiredFieldName.checkedInField]: (await checkedInField).id,
            [CheckoutTableOptionalFieldName.dateCheckedOutField]: (await checkedOutDateField).id,
            [CheckoutTableOptionalFieldName.dateDueField]: (await dateDueField).id,
            [CheckoutTableOptionalFieldName.dateCheckedInField]: (await checkedInDateField).id,
            [CheckoutTableOptionalFieldName.cartGroupField]: (await cartIdField).id
        },
        otherConfiguration: {
            [OtherConfigurationKey.defaultNumberOfDaysFromTodayForDueDate]: 7,
            [OtherConfigurationKey.deleteOpenCheckoutsUponCheckIn]: false
        }
    }

    await inventoryTable.createRecordsAsync([1,2,3].map(number => ({fields: {[inventoryTable.primaryField.id]: `Example Item ${number}`}})));
    await userTable.createRecordsAsync([1,2,3].map(number => ({fields: {[userTable.primaryField.id]: `Example User ${number}`}})));

    return extensionConfiguration;
}