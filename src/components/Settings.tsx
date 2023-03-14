import React from "react";
import {
    Box,
    FormField,
    Heading,
    Label,
    loadCSSFromString,
    TablePickerSynced
} from "@airtable/blocks/ui";
import {GlobalConfig} from "@airtable/blocks/types";
import {Base} from "@airtable/blocks/models";

import {ConfigurationInstructions} from "./ConfigurationInstructions";
import {TableName} from "../types/types";
import {FieldSelectorGroup} from "./FieldSelectorGroup";
import {initialAppConfiguration} from "../utils/Constants";

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

export const Settings = ({base, globalConfig}: { globalConfig: GlobalConfig, base: Base}) => {

    return <Box className='container' border='thick'>
        <Heading>🚀 Check Out with Cart 🚀</Heading>
        <Heading as='h4'>Settings/Setup</Heading>
        <ConfigurationInstructions/>

        <div>
            <Label>Extension Configuration</Label>
            <Box padding='2rem' maxWidth={800} border='thick'>
                {initialAppConfiguration.schemaConfiguration.map(({
                                                      tableName,
                                                      tablePickerPrompt,
                                                      requiredFields,
                                                      optionalFields
                                                  }, index) => {
                        const tablePicker = (
                            <FormField key={index} label={tablePickerPrompt}>
                                <TablePickerSynced globalConfigKey={tableName}/>
                            </FormField>);

                        if (requiredFields.length !== 0 || optionalFields.length !== 0) {
                            return (
                                <Box border='thick' padding='1rem'>
                                    {tablePicker}
                                    <br/>
                                    <FieldSelectorGroup
                                        required={true}
                                        table={base.getTableById(globalConfig.get(TableName.checkoutsTable) as string)}
                                        globalConfig={globalConfig}
                                        fields={requiredFields}
                                    />

                                    <FieldSelectorGroup
                                        required={false}
                                        table={base.getTableById(globalConfig.get(TableName.checkoutsTable) as string)}
                                        globalConfig={globalConfig}
                                        fields={optionalFields}
                                    />
                                </Box>)
                        }

                        return tablePicker;
                    }
                )}
            </Box>
        </div>
    </Box>;
}