import React, {useState} from "react";
import {Box, Button, FormField, Heading, Label, loadCSSFromString, Select, Text} from "@airtable/blocks/ui";
import {Base} from "@airtable/blocks/models";
import {ValidationError} from 'yup';

import {ConfigurationInstructions} from "./ConfigurationInstructions";
import {blankConfigurationState, configurationFormData} from "../utils/Constants";
import {
    ExtensionConfigurationIds,
    CheckoutTableOptionalFieldName,
    CheckoutTableRequiredFieldName,
    TableName, ValidatedExtensionConfiguration
} from "../types/ConfigurationTypes";
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

const entireFormSubmissionErrorStateGenerator = (validationErrors: ValidationError[]) =>
    (validationErrors.reduce((currentFormErrorState: Object, error: ValidationError) => {
        return error.path
            ? {...currentFormErrorState, [error.path]: error.message}
            : {...currentFormErrorState};
    }, blankConfigurationState) as ExtensionConfigurationIds)

const validateConfigAndGetValidationErrors = (configurationValidator: (appConfigIds: ExtensionConfigurationIds) => ValidatedExtensionConfiguration, configurationData: ExtensionConfigurationIds, formErrorStateGenerator: ((validationErrors: ValidationError[]) => ExtensionConfigurationIds)) => {
    try {
        configurationValidator(configurationData);
        return blankConfigurationState
    } catch (e) {
        let topLevelValidationError = e as ValidationError;
        let innerValidationErrors = topLevelValidationError.inner ?? [];
        let allValidationErrors = [topLevelValidationError, ...innerValidationErrors]
        return formErrorStateGenerator(allValidationErrors);
    }
}

const selectorChangeFormErrorStateGenerator = (formErrorState: ExtensionConfigurationIds, fieldOrTableName: TableName | CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName) =>
    (validationErrors: ValidationError[]) => {
        console.log(validationErrors);
        const fieldErrors = validationErrors.find((error: ValidationError) => error.path === fieldOrTableName) ?? {message: ''}
        // TODO: Make this more readable.
        const fieldKeysWithErrorsThatAreNowEmpty = Object.keys(blankConfigurationState).filter(key => ![...new Set(validationErrors.map(error => error.path))].includes(key));
        const fieldsWithNoErrors = fieldKeysWithErrorsThatAreNowEmpty.reduce((currentKeys: Object, key: string) => ({
            ...currentKeys,
            [key]: ""
        }), {});

        return {
            ...formErrorState,
            ...fieldsWithNoErrors,
            [fieldOrTableName]: fieldErrors.message
        }
    }

export const Settings = ({
                             currentConfiguration,
                             base,
                             configurationValidator,
                         }:
                             {
                                 currentConfiguration: ExtensionConfigurationIds,
                                 base: Base,
                                 configurationValidator: (configurationData: ExtensionConfigurationIds) => ValidatedExtensionConfiguration
                             }) => {
    const [formState, setFormState] = useState(currentConfiguration);
    const [formErrorState, setFormErrorState] = useState(
        currentConfiguration === blankConfigurationState
            ? blankConfigurationState
            : validateConfigAndGetValidationErrors(configurationValidator, currentConfiguration, entireFormSubmissionErrorStateGenerator)
    );

    const submitForm = () => setFormErrorState(validateConfigAndGetValidationErrors(configurationValidator, formState, entireFormSubmissionErrorStateGenerator))
    const selectorChangeHandler = (fieldOrTableName: TableName | CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName, selectedOption: SelectOptionValue) => {
        const newFormState = {...formState, [fieldOrTableName]: selectedOption}
        setFormState(newFormState)
        setFormErrorState(validateConfigAndGetValidationErrors(configurationValidator, newFormState, selectorChangeFormErrorStateGenerator(formErrorState, fieldOrTableName)))
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