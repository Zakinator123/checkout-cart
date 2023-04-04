import {Box, FormField, Select, Text} from "@airtable/blocks/ui";
import {Table} from "@airtable/blocks/models";
import React from "react";
import {FieldConfiguration} from "../types/ConfigurationTypes";
import {ExpectedAppConfigFieldTypeMapping, fieldTypeLinks} from "../utils/Constants";
import {FormFieldLabelWithTooltip} from "./FormFieldLabelWithTooltip";
import {getValidFieldOptionsForFieldSelector} from "../utils/SettingsFormUtils";

export const FieldSelectorGroup = ({
                                       required,
                                       table,
                                       fields,
                                       formState,
                                       formErrorState,
                                       selectorChangeHandler
                                   }: {
    required: boolean,
    table: Table,
    fields: ReadonlyArray<FieldConfiguration>,
    formState: any,
    formErrorState: any,
    selectorChangeHandler: any
}) =>
    <>
        <Text textDecoration='underline' as='strong' fontWeight='600'
              paddingLeft='1rem'>{required ? 'Required' : 'Optional'} Fields</Text>
        <Box padding='1rem' paddingLeft='1rem'>
            {fields.map(({fieldName, fieldPickerLabel, fieldPickerTooltip}) =>
                (<FormField key={fieldName} paddingLeft='1.5rem'
                            label={<FormFieldLabelWithTooltip fieldLabel={fieldPickerLabel}
                                                              fieldLabelTooltip={fieldPickerTooltip}/>}>
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <Box border='default' borderColor={formErrorState[fieldName] !== '' ? 'red' : ''}>
                            <Select
                                disabled={false}
                                options={getValidFieldOptionsForFieldSelector(table, ExpectedAppConfigFieldTypeMapping[fieldName], fieldTypeLinks[fieldName], formState, required)}
                                onChange={selectedOption => selectorChangeHandler(fieldName, selectedOption)}
                                value={formState[fieldName]}
                            />
                        </Box>
                        <Text textColor='red'>{formErrorState[fieldName]}</Text>
                    </div>
                    <br/>
                </FormField>))
            }
        </Box>
    </>