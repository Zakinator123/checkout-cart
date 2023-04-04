import {FieldType} from "@airtable/blocks/models";
import {
    TablesAndFieldsConfigurationIds,
    CheckoutTableOptionalFieldName,
    CheckoutTableRequiredFieldName,
    ExtensionConfigurationFormSchema,
    TableName, TablesAndFieldsConfigurationErrors, OtherExtensionConfiguration, OtherConfigurationKey
} from "../types/ConfigurationTypes";

export const maxNumberOfCartRecordsForFreeUsers: number = 3;

export const blankConfigurationState: Readonly<TablesAndFieldsConfigurationIds> = {
    [TableName.inventoryTable]: '',
    [TableName.userTable]: '',
    [TableName.checkoutsTable]: '',
    [CheckoutTableRequiredFieldName.linkedInventoryTableField]: '',
    [CheckoutTableRequiredFieldName.linkedUserTableField]: '',
    [CheckoutTableRequiredFieldName.checkedInField]: '',
    [CheckoutTableOptionalFieldName.dateCheckedOutField]: '',
    [CheckoutTableOptionalFieldName.dateDueField]: '',
    [CheckoutTableOptionalFieldName.dateCheckedInField]: '',
    [CheckoutTableOptionalFieldName.cartGroupField]: '',
};

export const defaultOtherConfigurationState: Readonly<OtherExtensionConfiguration> = {
    [OtherConfigurationKey.deleteOpenCheckoutsUponCheckIn]: false,
    [OtherConfigurationKey.defaultNumberOfDaysFromTodayForDueDate]: 7,
}

export const combinedCheckoutsTableFields = {...CheckoutTableRequiredFieldName, ...CheckoutTableOptionalFieldName};
export const combinedRequiredConfigKeys = {...TableName, ...CheckoutTableRequiredFieldName};
export const combinedConfigKeys = {...combinedRequiredConfigKeys, ...CheckoutTableOptionalFieldName}
export const blankErrorState: Readonly<TablesAndFieldsConfigurationErrors> = blankConfigurationState;

export const ExpectedAppConfigFieldTypeMapping: Readonly<Record<CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName, FieldType>> = {
    [CheckoutTableRequiredFieldName.linkedInventoryTableField]: FieldType.MULTIPLE_RECORD_LINKS,
    [CheckoutTableRequiredFieldName.linkedUserTableField]: FieldType.MULTIPLE_RECORD_LINKS,
    [CheckoutTableRequiredFieldName.checkedInField]: FieldType.CHECKBOX,
    [CheckoutTableOptionalFieldName.dateCheckedOutField]: FieldType.DATE,
    [CheckoutTableOptionalFieldName.dateDueField]: FieldType.DATE,
    [CheckoutTableOptionalFieldName.dateCheckedInField]: FieldType.DATE,
    [CheckoutTableOptionalFieldName.cartGroupField]: FieldType.NUMBER,
}

export const fieldTypeLinks: Readonly<Record<CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName, TableName | undefined>> = {
    [CheckoutTableRequiredFieldName.linkedInventoryTableField]: TableName.inventoryTable,
    [CheckoutTableRequiredFieldName.linkedUserTableField]: TableName.userTable,
    [CheckoutTableRequiredFieldName.checkedInField]: undefined,
    [CheckoutTableOptionalFieldName.dateCheckedOutField]: undefined,
    [CheckoutTableOptionalFieldName.dateDueField]: undefined,
    [CheckoutTableOptionalFieldName.dateCheckedInField]: undefined,
    [CheckoutTableOptionalFieldName.cartGroupField]: undefined
}

export const settingsFormSchema: ExtensionConfigurationFormSchema = {
    deleteCheckoutsUponCheckin: false,
    schemaConfiguration:
        [
            {
                tableName: TableName.inventoryTable,
                tablePickerLabel: 'Inventory Table:',
                tablePickerTooltip: 'This table contains the items to be checked out.',
            },
            {
                tableName: TableName.userTable,
                tablePickerLabel: 'User Table:',
                tablePickerTooltip: 'This table contains the users that items will be checked out to.',
            },
            {
                tableName: TableName.checkoutsTable,
                tablePickerLabel: 'Checkouts Table:',
                tablePickerTooltip: 'This table contains the checkout records.',
                requiredFields: [
                    {
                        fieldName: CheckoutTableRequiredFieldName.linkedInventoryTableField,
                        fieldPickerLabel: 'Linked Record Field to Inventory Table:',
                        fieldPickerTooltip: 'This field must link to the inventory table configured above.'
                    },
                    {
                        fieldName: CheckoutTableRequiredFieldName.linkedUserTableField,
                        fieldPickerLabel: 'Linked Record Field to Users Table:',
                        fieldPickerTooltip: 'This field must link to the users table configured above.'
                    },
                    {
                        fieldName: CheckoutTableRequiredFieldName.checkedInField,
                        fieldPickerLabel:
                            'Checked In Field:',
                        fieldPickerTooltip: `This is a checkbox field where
                         a checked checkbox means that the checkout is "Checked In".`
                    },
                ],
                optionalFields: [
                    {
                        fieldName: CheckoutTableOptionalFieldName.dateCheckedOutField,
                        fieldPickerLabel: `Date Checked Out Field:`,
                        fieldPickerTooltip: `(Optional) Enable this to have the extension record the date a checkout is created.
                        Must be a date field.`
                    },
                    {
                        fieldName: CheckoutTableOptionalFieldName.dateDueField,
                        fieldPickerLabel: `Date Due Field:`,
                        fieldPickerTooltip: `(Optional) Enable this to have the extension record the date a checkout is due.
                         Must be a date field`
                    },
                    {
                        fieldName: CheckoutTableOptionalFieldName.dateCheckedInField,
                        fieldPickerLabel: `Date Checked In Field:`,
                        fieldPickerTooltip: `(Optional) Enable this to have the extension record the date a checkout is checked in.
                        Must be a date field.`
                    },
                    {
                        fieldName: CheckoutTableOptionalFieldName.cartGroupField,
                        fieldPickerLabel: `Cart Id Field:`,
                        fieldPickerTooltip: `(Optional) Enable this to have the extension record the cart id of a checkout.
                        Must be a number field.`
                    }
                ],
            }
        ]
}