import {Box, FormField, Select, Text} from "@airtable/blocks/ui";
import {Field, FieldType, Table} from "@airtable/blocks/models";
import React from "react";
import {TableId} from "@airtable/blocks/types";
import {FieldConfiguration, TableName, TablesAndFieldsConfigurationIds} from "../types/ConfigurationTypes";
import {ExpectedAppConfigFieldTypeMapping, fieldTypeLinks} from "../utils/Constants";
import {SelectorLabelWithTooltip} from "./SelectorLabelWithTooltip";

const getValidFieldOptionsForFieldSelector = (table: Table,
                                              expectedFieldType: FieldType,
                                              mustLinkTo: TableName | undefined,
                                              formState: TablesAndFieldsConfigurationIds,
                                              fieldIsRequired: boolean) => {
    let atLeastOneFieldIsEnabled = false;

    const options = table.fields.map((field: Field) => {
        let fieldOptionDisabled: boolean;
        if (field.type !== expectedFieldType) fieldOptionDisabled = true;
        else if (mustLinkTo !== undefined && field.config.type === FieldType.MULTIPLE_RECORD_LINKS) {
            const mustLinkToTableId: TableId = formState[mustLinkTo] as TableId;
            fieldOptionDisabled = field.config.options.linkedTableId !== mustLinkToTableId;
        } else fieldOptionDisabled = false;

        if (fieldOptionDisabled === false) atLeastOneFieldIsEnabled = true;
        return {
            disabled: fieldOptionDisabled,
            label: field.name,
            value: field.id
        };
    });

    const disabledOption = {
        disabled: false,
        label: 'DISABLED - Extension Will Not Use This Field',
        value: ''
    };

    if (!atLeastOneFieldIsEnabled) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const message = (mustLinkTo ?? false)
            ? `ERROR: No fields exist that link to the configured ${mustLinkTo} table`
            : `ERROR: No fields exist of type ${expectedFieldType}`;
        const errorOption = {
            disabled: true,
            label: message,
            value: undefined
        };

        return fieldIsRequired ? [errorOption] : [disabledOption, errorOption];
    }

    return !fieldIsRequired
        ? [{
            disabled: false,
            label: 'DISABLED - Extension Will Not Use This Field',
            value: ''
        }, ...options]
        : options;
}

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
}) => {

    return <>
        <Text textDecoration='underline' as='strong' fontWeight='600'
              paddingLeft='1rem'>{required ? 'Required' : 'Optional'} Fields</Text>
        <Box padding='1rem' paddingLeft='1rem'>
            {fields.map(({fieldName, fieldPickerLabel, fieldPickerTooltip}) =>
                (<FormField key={fieldName} paddingLeft='1.5rem' label={<SelectorLabelWithTooltip selectorLabel={fieldPickerLabel}
                                                                                                  selectorLabelTooltip={fieldPickerTooltip}/>}>
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
}