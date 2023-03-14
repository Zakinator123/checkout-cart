import {FieldType} from "@airtable/blocks/models";
import {
    TableName,
    ExtensionConfiguration,
    CheckoutTableRequiredFieldName, CheckoutTableOptionalFieldName
} from "../types/types";

export enum AppConfigKeys {
    inventoryTable = 'inventoryTable',
    userTable = 'userTable',
    checkoutsTable = 'checkoutsTable',
    linkedInventoryTableField = 'linkedInventoryTableField',
    linkedUserTableField = 'linkedUserTableField',
    checkedInField = 'checkedInField',
    dateCheckedOutField = 'dateCheckedOutField',
    dateDueField = 'dateDueField',
    dateCheckedInField = 'dateCheckedInField',
    deleteCheckoutsUponCheckInBoolean = 'deleteCheckoutsUponCheckInBoolean'
}

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



export const initialAppConfiguration: ExtensionConfiguration = {
    hasErrors: false,
    deleteCheckoutsUponCheckin: false,
    schemaConfiguration:
        [
            {
                tableName: TableName.inventoryTable,
                tablePickerPrompt: 'Select your inventory table:',
                requiredFields: [],
                optionalFields: [],
                tableId: undefined,
                errors: []
            },
            {
                tableName: TableName.userTable,
                tablePickerPrompt: 'Select your user table:',
                requiredFields: [],
                optionalFields: [],
                tableId: undefined,
                errors: []
            },
            {
                tableName: TableName.checkoutsTable,
                tablePickerPrompt: 'Select your checkouts table:',
                requiredFields: [
                    {
                        fieldName: CheckoutTableRequiredFieldName.linkedInventoryTableField,
                        expectedFieldType: FieldType.MULTIPLE_RECORD_LINKS,
                        fieldPrompt: 'Select the linked record field linking this table to the inventory table.',
                        mustLinkTo: TableName.inventoryTable,
                        fieldId: undefined,
                        errors: []
                    },
                    {
                        fieldName: CheckoutTableRequiredFieldName.linkedUserTableField,
                        expectedFieldType: FieldType.MULTIPLE_RECORD_LINKS,
                        fieldPrompt: 'Select the linked record field linking this table to the users table.',
                        mustLinkTo: TableName.userTable,
                        fieldId: undefined,
                        errors: []
                    },
                    {
                        fieldName: CheckoutTableRequiredFieldName.checkedInField,
                        expectedFieldType: FieldType.CHECKBOX,
                        fieldPrompt:
                            'Select the checkbox field representing whether or not a checkout is still checked out or checked in.',
                        mustLinkTo: undefined,
                        fieldId: undefined,
                        errors: []
                    },
                ],
                optionalFields: [
                    {
                        fieldName: CheckoutTableOptionalFieldName.dateCheckedOutField,
                        expectedFieldType: FieldType.DATE,
                        fieldPrompt: `(Optional) Enable if you want to track when items are checked out.
                                  Select the date field representing when a checkout is created.`,
                        mustLinkTo: undefined,
                        fieldId: undefined,
                        errors: []
                    },
                    {
                        fieldName: CheckoutTableOptionalFieldName.dateDueField,
                        expectedFieldType: FieldType.DATE,
                        fieldPrompt: `(Optional) Enable if you want to track when checkouts are due.
                                  Select the date field representing when items are due for return.`,
                        mustLinkTo: undefined,
                        fieldId: undefined,
                        errors: []
                    },
                    {
                        fieldName: CheckoutTableOptionalFieldName.dateCheckedInField,
                        expectedFieldType: FieldType.DATE,
                        fieldPrompt: `(Optional) Enable if you want to track when items are checked in. 
                                  Select the date field representing when items are checked in.`,
                        mustLinkTo: undefined,
                        fieldId: undefined,
                        errors: []
                    }
                ],
                tableId: undefined,
                errors: []
            }
        ]
}