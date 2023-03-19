import {Box, FormField, Label, Select, Text} from "@airtable/blocks/ui";
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
    const getFieldOptionsForFieldSelector = (table: Table, expectedFieldType: FieldType, mustLinkTo: string | undefined) => {
        const options = table.fields.map((field: Field) => {
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
        });

        return !required
            ? [{
                disabled: false,
                label: 'DISABLED - Extension Will Not Use This Field',
                value: ''
            }, ...options]
            : options;
    }

    return <>
        <Label paddingLeft='1rem'>{required ? 'Required' : 'Optional'} Fields</Label>
        <Box padding='1rem' paddingLeft='1rem'>
            {fields.map(({fieldName, fieldPrompt}) => (
                <FormField key={fieldName} paddingLeft='1.5rem' label={fieldPrompt}>
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <Box border='default' borderColor={formErrorState[fieldName] !== '' ? 'red' : ''}>
                            <Select
                                disabled={false}
                                options={getFieldOptionsForFieldSelector(table, ExpectedAppConfigFieldTypeMapping[fieldName], fieldTypeLinks[fieldName])}
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
}