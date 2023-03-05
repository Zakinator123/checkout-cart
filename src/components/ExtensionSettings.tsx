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
import {Base} from "@airtable/blocks/models";

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

export const ExtensionSettings = (props: {globalConfig: GlobalConfig, base: Base}) => {


    return <Box className='container' border='thick'>
        <Heading>🚀 Check Out with Cart 🚀</Heading>
        <Heading as='h4'>Settings/Setup</Heading>

        <FormField label="Select your inventory table that contains the items to be checked in/out:">
            <TablePickerSynced globalConfigKey="inventoryTable" width="320px"/>
        </FormField>

        <FieldPickerSynced globalConfigKey='testField' table={props.base.getTable(props.globalConfig.get('inventoryTable') as string)} />

        <FormField label="Select your user table that contains the users the items will be checked out to:">
            <TablePickerSynced globalConfigKey="userTable" width="320px"/>
        </FormField>

        <FormField label="Select your 'checkouts' table.">
            <TablePickerSynced globalConfigKey="checkoutsTable" width="320px"/>
        </FormField>
    </Box>;
}