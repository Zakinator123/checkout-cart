import {Box, FormField, Label, SelectSynced, SwitchSynced} from "@airtable/blocks/ui";
import {FieldConfiguration} from "../types/types";
import {Field, FieldType, Table} from "@airtable/blocks/models";
import React from "react";
import {GlobalConfig, TableId} from "@airtable/blocks/types";

export const FieldSelectorGroup = ({
                                       required,
                                       table,
                                       globalConfig,
                                       fields
                                   }: { required: boolean, table: Table, globalConfig: GlobalConfig, fields: Array<FieldConfiguration> }) => {

    const fieldIsDisabled: (fieldIsRequired: boolean, fieldName: string) => boolean = (fieldIsRequired, fieldName) => {
        if (fieldIsRequired) return false;
        const fieldSwitchIsEnabled = globalConfig.get(fieldName + 'Enabled') as boolean;
        return !fieldSwitchIsEnabled
    }

    const getFieldOptionsForFieldSelector = (table: Table, expectedFieldType: FieldType, mustLinkTo: string | null) =>
        table.fields.map((field: Field) => {
            let fieldOptionDisabled: boolean;
            if (field.type !== expectedFieldType) fieldOptionDisabled = true;
            else if (mustLinkTo !== null && field.config.type === FieldType.MULTIPLE_RECORD_LINKS) {
                const mustLinkToTableId: TableId = globalConfig.get(mustLinkTo) as TableId;
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
        <Box padding='1rem' paddingLeft='3rem'>
            {fields.map(({fieldName, expectedFieldType, fieldPrompt, mustLinkTo}) =>
                <FormField key={fieldName} label={fieldPrompt}>
                    <div style={{display: 'flex', gap: '2rem'}}>
                        <SelectSynced
                            disabled={fieldIsDisabled(required, fieldName)}
                            globalConfigKey={fieldName}
                            options={getFieldOptionsForFieldSelector(table, expectedFieldType, mustLinkTo)}
                            width="220px"
                        />
                        {!required && <SwitchSynced
                            label="Enable/Disable this Field"
                            globalConfigKey={fieldName + 'Enabled'}
                            key={fieldName + 'Enabled'}
                        />}
                    </div>
                    <br/>
                </FormField>)}
        </Box>
    </>
}