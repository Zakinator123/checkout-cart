import {FieldType} from "@airtable/blocks/models";
import {CheckoutsTableFieldNames, ExtensionTables, SchemaConfiguration} from "../types/types";

export const requiredSchemaConfiguration : SchemaConfiguration = [
    {
        tableName: ExtensionTables.inventoryTable,
        tablePickerPrompt: 'Select your inventory table:',
        requiredFields: [],
        optionalFields: [],
    },
    {
        tableName: ExtensionTables.userTable,
        tablePickerPrompt: 'Select your user table:',
        requiredFields: [],
        optionalFields: []
    },
    {
        tableName: ExtensionTables.checkoutsTable,
        tablePickerPrompt: 'Select your checkouts table:',
        requiredFields: [
            {
                fieldName: CheckoutsTableFieldNames.linkedInventoryTableField,
                expectedFieldType: FieldType.MULTIPLE_RECORD_LINKS,
                fieldPrompt: 'Select the linked record field linking this table to the inventory table.',
                mustLinkTo: ExtensionTables.inventoryTable
            },
            {
                fieldName: CheckoutsTableFieldNames.linkedUserTableField,
                expectedFieldType: FieldType.MULTIPLE_RECORD_LINKS,
                fieldPrompt: 'Select the linked record field linking this table to the users table.',
                mustLinkTo: ExtensionTables.userTable
            },
            {
                fieldName: CheckoutsTableFieldNames.checkedInField,
                expectedFieldType: FieldType.CHECKBOX,
                fieldPrompt: 'Select the checkbox field representing whether or not a checkout is still checked out or checked in.',
                mustLinkTo: null
            },
        ],
        optionalFields: [
            {
                fieldName: CheckoutsTableFieldNames.dateCheckedOutField,
                expectedFieldType: FieldType.DATE,
                fieldPrompt: `(Optional) Enable if you want to track when items are checked out.
                                  Select the date field representing when a checkout is created.`,
                mustLinkTo: null,
            },
            {
                fieldName: CheckoutsTableFieldNames.dateDueField,
                expectedFieldType: FieldType.DATE,
                fieldPrompt: `(Optional) Enable if you want to track when checkouts are due.
                                  Select the date field representing when items are due for return.`,
                mustLinkTo: null,
            },
            {
                fieldName: CheckoutsTableFieldNames.dateCheckedInField,
                expectedFieldType: FieldType.DATE,
                fieldPrompt: `(Optional) Enable if you want to track when items are checked in. 
                                  Select the date field representing when items are checked in.`,
                mustLinkTo: null,
            }
        ]
    }
]