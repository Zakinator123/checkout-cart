import {FieldType} from "@airtable/blocks/models";
import {FieldNames, ExtensionTables, ExtensionConfiguration, AppConfig} from "../types/types";

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

export const InitialAppConfig: AppConfig = {
    tables: {
        [AppConfigKeys.inventoryTable]: {tableId: undefined, fieldIds: {required: {}, optional: {}}},
        [AppConfigKeys.userTable]: {tableId: undefined, fieldIds: {required: {}, optional: {}}},
        [AppConfigKeys.checkoutsTable]: {
            tableId: undefined, fieldIds: {
                required: {
                    [AppConfigKeys.linkedInventoryTableField]: undefined,
                    [AppConfigKeys.linkedUserTableField]: undefined,
                    [AppConfigKeys.checkedInField]: undefined,
                },
                optional: {
                    [AppConfigKeys.dateCheckedOutField]: undefined,
                    [AppConfigKeys.dateDueField]: undefined,
                    [AppConfigKeys.dateCheckedInField]: undefined,
                }
            }
        },
    },
    deleteCheckoutsUponCheckInBoolean: false
}

export const ExpectedAppConfigFieldTypeMapping = {
    [FieldNames.linkedInventoryTableField]: FieldType.MULTIPLE_RECORD_LINKS,
    [FieldNames.linkedUserTableField]: FieldType.MULTIPLE_RECORD_LINKS,
    [FieldNames.checkedInField]: FieldType.CHECKBOX,
    [FieldNames.dateCheckedOutField]: FieldType.DATE,
    [FieldNames.dateDueField]: FieldType.DATE,
    [FieldNames.dateCheckedInField]: FieldType.DATE,
}

export const initialAppConfiguration: ExtensionConfiguration = {
    hasErrors: false,
    deleteCheckoutsUponCheckin: false,
    schemaConfiguration:
        [
            {
                tableName: ExtensionTables.inventoryTable,
                tablePickerPrompt: 'Select your inventory table:',
                requiredFields: [],
                optionalFields: [],
                tableId: null,
                errors: []
            },
            {
                tableName: ExtensionTables.userTable,
                tablePickerPrompt: 'Select your user table:',
                requiredFields: [],
                optionalFields: [],
                tableId: null,
                errors: []
            },
            {
                tableName: ExtensionTables.checkoutsTable,
                tablePickerPrompt: 'Select your checkouts table:',
                requiredFields: [
                    {
                        fieldName: FieldNames.linkedInventoryTableField,
                        expectedFieldType: FieldType.MULTIPLE_RECORD_LINKS,
                        fieldPrompt: 'Select the linked record field linking this table to the inventory table.',
                        mustLinkTo: ExtensionTables.inventoryTable,
                        fieldId: null,
                        errors: []
                    },
                    {
                        fieldName: FieldNames.linkedUserTableField,
                        expectedFieldType: FieldType.MULTIPLE_RECORD_LINKS,
                        fieldPrompt: 'Select the linked record field linking this table to the users table.',
                        mustLinkTo: ExtensionTables.userTable,
                        fieldId: null,
                        errors: []
                    },
                    {
                        fieldName: FieldNames.checkedInField,
                        expectedFieldType: FieldType.CHECKBOX,
                        fieldPrompt:
                            'Select the checkbox field representing whether or not a checkout is still checked out or checked in.',
                        mustLinkTo:
                            null,
                        fieldId:
                            null,
                        errors: []
                    },
                ],
                optionalFields: [
                    {
                        fieldName: FieldNames.dateCheckedOutField,
                        expectedFieldType: FieldType.DATE,
                        fieldPrompt: `(Optional) Enable if you want to track when items are checked out.
                                  Select the date field representing when a checkout is created.`,
                        mustLinkTo: null,
                        fieldId: null,
                        errors: []
                    },
                    {
                        fieldName: FieldNames.dateDueField,
                        expectedFieldType: FieldType.DATE,
                        fieldPrompt: `(Optional) Enable if you want to track when checkouts are due.
                                  Select the date field representing when items are due for return.`,
                        mustLinkTo: null,
                        fieldId: null,
                        errors: []
                    },
                    {
                        fieldName: FieldNames.dateCheckedInField,
                        expectedFieldType: FieldType.DATE,
                        fieldPrompt: `(Optional) Enable if you want to track when items are checked in. 
                                  Select the date field representing when items are checked in.`,
                        mustLinkTo: null,
                        fieldId: null,
                        errors: []
                    }
                ],
                tableId: null,
                errors: []
            }
        ]
}