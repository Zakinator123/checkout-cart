import React from "react";
import {
    Box,
    FieldPickerSynced,
    FormField,
    Heading,
    loadCSSFromString,
    TablePickerSynced
} from "@airtable/blocks/ui";
import {GlobalConfig} from "@airtable/blocks/types";
import {Base, FieldType} from "@airtable/blocks/models";

loadCSSFromString(`
.container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 1rem;
    overflow: auto;
    gap: 2rem;
    height: 100%
}`)

export const Settings = (props: { globalConfig: GlobalConfig, base: Base }) => {

    const requiredConfiguration = {
        checkoutsTable: {
            tablePickerPrompt: "Select your checkouts table:",
            requiredFields: {
                linkedInventoryTableField: {
                    fieldPrompt: "Select the field linking this table to the inventory table.",
                    expectedFieldType: FieldType.MULTIPLE_RECORD_LINKS,
                },
                linkedUserTableField: {
                    fieldPrompt: "Select the field linking this table to the users table.",
                    expectedFieldType: FieldType.MULTIPLE_RECORD_LINKS
                },
                checkedInField: {
                    fieldPrompt: "Select the field representing whether or not a checkout is still outstanding or checked in.",
                    expectedFieldType: FieldType.CHECKBOX
                }
            },
            optionalFields: {
                dateCheckedOutField: {
                    optionalFieldEnablementPrompt: "Enable this field if you would like this extension to record when items are checked out.",
                    fieldPrompt: "Select the field that will contain the date items are checked out.",
                    expectedFieldType: FieldType.DATE
                },
                dateDueField: {
                    optionalFieldEnablementPrompt: "Enable this field if you would like this extension to record when checkouts are due.",
                    fieldPrompt: "Select the field that will contain the date indicating when items are due for return.",
                    expectedFieldType: FieldType.DATE
                },
                dateCheckedInField: {
                    optionalFieldEnablementPrompt: "Enable this field if you would like this extension to record when items are checked in.",
                    fieldPrompt: "Select the field that will contain the date indicating when items are checked in.",
                    expectedFieldType: FieldType.DATE
                }
            }
        },
    };

    return <Box className='container' border='thick'>
        <Heading>🚀 Check Out with Cart 🚀</Heading>
        <Heading as='h4'>Settings/Setup</Heading>

        <FormField label={requiredConfiguration.checkoutsTable.tablePickerPrompt}>
            <TablePickerSynced globalConfigKey="checkoutsTable" width="320px"/>
        </FormField>

        {
            Object.entries(requiredConfiguration.checkoutsTable.requiredFields).map(([key, value], index) =>
                <FormField key={index} label={value.fieldPrompt}>
                    <FieldPickerSynced
                        globalConfigKey={key}
                        table={props.base.getTable(props.globalConfig.get('checkoutsTable') as string)}
                        allowedTypes={[value.expectedFieldType]}
                    />
                </FormField>)
        }


        {/*<FormField label="Select your inventory table that contains the items to be checked in/out:">*/}
        {/*    <TablePickerSynced globalConfigKey="inventoryTable" width="320px"/>*/}
        {/*</FormField>*/}


        {/*<FormField label="Select your user table that contains the users the items will be checked out to:">*/}
        {/*    <TablePickerSynced globalConfigKey="userTable" width="320px"/>*/}
        {/*</FormField>*/}

    </Box>;
}