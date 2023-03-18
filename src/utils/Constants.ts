import {FieldType} from "@airtable/blocks/models";
import {
    ExtensionConfigurationIds,
    CheckoutTableOptionalFieldName,
    CheckoutTableRequiredFieldName,
    ExtensionConfigurationFormSchema,
    TableName
} from "../types/ConfigurationTypes";

export const blankConfigurationState: ExtensionConfigurationIds = {
    [TableName.inventoryTable]: '',
    [TableName.userTable]: '',
    [TableName.checkoutsTable]: '',
    [CheckoutTableRequiredFieldName.linkedInventoryTableField]: '',
    [CheckoutTableRequiredFieldName.linkedUserTableField]: '',
    [CheckoutTableRequiredFieldName.checkedInField]: '',
};

export const ExpectedAppConfigFieldTypeMapping = {
    [CheckoutTableRequiredFieldName.linkedInventoryTableField]: FieldType.MULTIPLE_RECORD_LINKS,
    [CheckoutTableRequiredFieldName.linkedUserTableField]: FieldType.MULTIPLE_RECORD_LINKS,
    [CheckoutTableRequiredFieldName.checkedInField]: FieldType.CHECKBOX,
    [CheckoutTableOptionalFieldName.dateCheckedOutField]: FieldType.DATE,
    [CheckoutTableOptionalFieldName.dateDueField]: FieldType.DATE,
    [CheckoutTableOptionalFieldName.dateCheckedInField]: FieldType.DATE,
}

export const fieldTypeLinks = {
    [CheckoutTableRequiredFieldName.linkedInventoryTableField]: TableName.inventoryTable,
    [CheckoutTableRequiredFieldName.linkedUserTableField]: TableName.userTable,
    [CheckoutTableRequiredFieldName.checkedInField]: undefined,
    [CheckoutTableOptionalFieldName.dateCheckedOutField]: undefined,
    [CheckoutTableOptionalFieldName.dateDueField]: undefined,
    [CheckoutTableOptionalFieldName.dateCheckedInField]: undefined,
}

export const configurationFormData: ExtensionConfigurationFormSchema = {
    deleteCheckoutsUponCheckin: false,
    schemaConfiguration:
        [
            {
                tableName: TableName.inventoryTable,
                tablePickerPrompt: 'Select your inventory table:',
            },
            {
                tableName: TableName.userTable,
                tablePickerPrompt: 'Select your user table:',
            },
            {
                tableName: TableName.checkoutsTable,
                tablePickerPrompt: 'Select your checkouts table:',
                requiredFields: [
                    {
                        fieldName: CheckoutTableRequiredFieldName.linkedInventoryTableField,
                        fieldPrompt: 'Select the linked record field linking this table to the inventory table.',
                    },
                    {
                        fieldName: CheckoutTableRequiredFieldName.linkedUserTableField,
                        fieldPrompt: 'Select the linked record field linking this table to the users table.',
                    },
                    {
                        fieldName: CheckoutTableRequiredFieldName.checkedInField,
                        fieldPrompt:
                            'Select the checkbox field representing whether or not a checkout is still checked out or checked in.',
                    },
                ],
                optionalFields: [
                    {
                        fieldName: CheckoutTableOptionalFieldName.dateCheckedOutField,
                        fieldPrompt: `(Optional) Enable if you want to track when items are checked out.
                                  Select the date field representing when a checkout is created.`,
                    },
                    {
                        fieldName: CheckoutTableOptionalFieldName.dateDueField,
                        fieldPrompt: `(Optional) Enable if you want to track when checkouts are due.
                                  Select the date field representing when items are due for return.`,
                    },
                    {
                        fieldName: CheckoutTableOptionalFieldName.dateCheckedInField,
                        fieldPrompt: `(Optional) Enable if you want to track when items are checked in. 
                                  Select the date field representing when items are checked in.`,
                    }
                ],
            }
        ]
}