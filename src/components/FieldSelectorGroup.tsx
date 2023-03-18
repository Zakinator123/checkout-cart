import {Box, FormField, Label, Select, Switch, Text} from "@airtable/blocks/ui";
import {Field, FieldType, Table} from "@airtable/blocks/models";
import React from "react";
import {TableId} from "@airtable/blocks/types";
import {FieldConfiguration} from "../types/ConfigurationTypes";
import {ExpectedAppConfigFieldTypeMapping, fieldTypeLinks} from "../utils/Constants";

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
    fields: Array<FieldConfiguration>,
    formState: any,
    formErrorState: any,
    selectorChangeHandler: any
}) => {
    const getFieldOptionsForFieldSelector = (table: Table, expectedFieldType: FieldType, mustLinkTo: string | undefined) =>
        table.fields.map((field: Field) => {
            let fieldOptionDisabled: boolean;
            if (field.type !== expectedFieldType) fieldOptionDisabled = true;
            else if (mustLinkTo !== undefined && field.config.type === FieldType.MULTIPLE_RECORD_LINKS) {
                const mustLinkToTableId: TableId = formState[mustLinkTo] as TableId;
                fieldOptionDisabled = field.config.options.linkedTableId !== mustLinkToTableId;
            } else fieldOptionDisabled = false;
            return {
                disabled: fieldOptionDisabled,
                label: field.name,
                value: field.id
            };
        })

    return <>
        <Label paddingLeft='1.5rem'>{required ? 'Required' : 'Optional'} Fields</Label>
        <Box padding='1rem' paddingLeft='1rem'>
            {fields.map(({fieldName, fieldPrompt}) =>
                <FormField key={fieldName} label={fieldPrompt}>
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <Box border='default'>
                            <Select
                                disabled={false}
                                options={getFieldOptionsForFieldSelector(table, ExpectedAppConfigFieldTypeMapping[fieldName], fieldTypeLinks[fieldName])}
                                onChange={selectedOption => selectorChangeHandler(fieldName, selectedOption)}
                                value={formState[fieldName]}
                            />
                            <Text textColor='red'>{formErrorState[fieldName]}</Text>

                        </Box>

                        {!required && <Switch
                            value={true}
                            label="Enable/Disable"
                            key={fieldName + 'Enabled'}
                        />}
                    </div>
                    <br/>
                </FormField>)}
        </Box>
    </>
}