import {FieldType} from "@airtable/blocks/models";
import {
    TablesAndFieldsConfigurationIds,
    CheckoutTableOptionalFieldName,
    CheckoutTableRequiredFieldName,
    ExtensionConfigurationFormSchema,
    TableName, TablesAndFieldsConfigurationErrors
} from "../types/ConfigurationTypes";

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
                        fieldPrompt: `(Optional) Enable to record the date items are checked out.
                                  Select the date field representing when a checkout is created.`,
                    },
                    {
                        fieldName: CheckoutTableOptionalFieldName.dateDueField,
                        fieldPrompt: `(Optional) Enable to record the date items are due.
                                  Select the date field representing when items are due for return.`,
                    },
                    {
                        fieldName: CheckoutTableOptionalFieldName.dateCheckedInField,
                        fieldPrompt: `(Optional) Enable to record date when items are checked in. 
                                  Select the date field representing when items are checked in.`,
                    },
                    {
                        fieldName: CheckoutTableOptionalFieldName.cartGroupField,
                        fieldPrompt: `(Optional) Enable to have cart group numbers generated for every checkout transaction. 
                                  Select the number field representing cart group numbers.`,
                    }
                ],
            }
        ]
}