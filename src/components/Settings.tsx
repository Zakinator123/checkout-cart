import React, {useState} from "react";
import {Box, Button, FormField, Heading, Label, loadCSSFromString, Select, Text} from "@airtable/blocks/ui";
import {Base} from "@airtable/blocks/models";
import {Schema, ValidationError} from 'yup';

import {ConfigurationInstructions} from "./ConfigurationInstructions";
import {configurationFormData} from "../utils/Constants";
import {CheckoutTableOptionalFieldName, CheckoutTableRequiredFieldName, TableName} from "../types/ConfigurationTypes";
import {FieldSelectorGroup} from "./FieldSelectorGroup";
import {SelectOptionValue} from "@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers";

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


export const Settings = ({
                             configurationIdsSchema,
                             configurationTablesAndFieldsSchema,
                             base
                         }: { configurationIdsSchema: Schema, configurationTablesAndFieldsSchema: Schema, base: Base}) => {

    const initialFormState = {
        [TableName.inventoryTable]: '',
        [TableName.userTable]: '',
        [TableName.checkoutsTable]: '',
        [CheckoutTableRequiredFieldName.linkedInventoryTableField]: '',
        [CheckoutTableRequiredFieldName.linkedUserTableField]: '',
        [CheckoutTableRequiredFieldName.checkedInField]: '',
    };

    const [formState, setFormState] = useState(initialFormState);
    const [formErrorState, setFormErrorState] = useState(initialFormState);

    const submitForm = () => configurationIdsSchema.validate(formState, {abortEarly: false})
        .then(() => setFormErrorState(initialFormState))
        .catch(errors => {
            const formattedErrors = errors.inner.reduce((currentFormErrorState: Object, error: ValidationError) =>
                error.path
                    ? {...currentFormErrorState, [error.path]: error.message}
                    : {...currentFormErrorState}, {});
            setFormErrorState(formattedErrors);
        })

    const selectorChangeHandler = async (fieldOrTableName: TableName | CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName, selectedOption: SelectOptionValue) => {
        const newFormState = {...formState, [fieldOrTableName]: selectedOption};
        setFormState(newFormState)

        try {
            await configurationIdsSchema.validate(newFormState, {abortEarly: false})
            await configurationTablesAndFieldsSchema.validate(newFormState, {abortEarly: false})
            setFormErrorState(initialFormState);
        } catch (e) {
            let topLevelValidationError = e as ValidationError;
            let innerValidationErrors = topLevelValidationError.inner ?? [];
            let allValidationErrors = [topLevelValidationError, ...innerValidationErrors]
            const fieldErrors = allValidationErrors.find((error: ValidationError) => error.path === fieldOrTableName) ?? {message: ''}
            // TODO: Make this more readable.
            const fieldKeysWithErrorsThatAreNowEmpty = Object.keys(initialFormState).filter(key => ![...new Set(allValidationErrors.map(error => error.path))].includes(key));
            const fieldsWithNoErrors = fieldKeysWithErrorsThatAreNowEmpty.reduce((currentKeys: Object, key: string) => ({
                ...currentKeys,
                [key]: ""
            }), {});
            setFormErrorState({
                    ...formErrorState,
                    ...fieldsWithNoErrors,
                    [fieldOrTableName]: fieldErrors.message
                }
            );
        }
    }


    return <Box className='container' border='thick'>
        <Heading>🚀 Check Out with Cart 🚀</Heading>
        <Heading as='h4'>Settings/Setup</Heading>
        <ConfigurationInstructions/>

        <div>
            <Label>Extension Configuration</Label>
            <Box padding='2rem' maxWidth={800} border='thick'>
                {configurationFormData.schemaConfiguration.map(({
                                                                    tableName,
                                                                    tablePickerPrompt,
                                                                    requiredFields = [],
                                                                    optionalFields = []
                                                                }, index) => {
                        const jsx = (
                            <FormField key={index} label={tablePickerPrompt}>
                                <Select
                                    options={base.tables.map(table => ({
                                        value: table.id,
                                        label: table.name
                                    }))}
                                    name={tableName}
                                    id={tableName}
                                    onChange={selectedOption => selectorChangeHandler(tableName, selectedOption)}
                                    value={formState[tableName]}
                                />
                                <Text textColor='red'>{formErrorState[tableName]}</Text>
                            </FormField>
                        )

                        if ((requiredFields.length !== 0 || optionalFields.length !== 0) && formState[tableName] !== '') {
                            return (
                                <Box border='thick' padding='1rem'>
                                    {jsx}
                                    <br/>
                                    <FieldSelectorGroup
                                        required={true}
                                        table={base.getTable(formState[tableName])}
                                        fields={requiredFields}
                                        formState={formState}
                                        formErrorState={formErrorState}
                                        selectorChangeHandler={selectorChangeHandler}
                                    />

                                    {/*<FieldSelectorGroup*/}
                                    {/*    required={false}*/}
                                    {/*    table={base.getTable(formState[tableName])}*/}
                                    {/*    fields={optionalFields}*/}
                                    {/*    currentFormState={formState}*/}
                                    {/*/>*/}
                                </Box>
                            )
                        } else {
                            return jsx;
                        }

                    }
                )}
                <Button onClick={submitForm}>Submit Config</Button>
            </Box>
        </div>
    </Box>;
}