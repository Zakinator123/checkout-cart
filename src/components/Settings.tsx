import React, {useState} from "react";
import {Box, Button, FormField, Heading, Label, loadCSSFromString, Select, Text} from "@airtable/blocks/ui";
import {Base} from "@airtable/blocks/models";
import {ValidationError} from 'yup';

import {ConfigurationInstructions} from "./ConfigurationInstructions";
import {blankConfigurationState, configurationFormData} from "../utils/Constants";
import {
    CheckoutTableOptionalFieldName,
    CheckoutTableRequiredFieldName,
    ExtensionConfigurationIds,
    TableName,
    ValidatedExtensionConfiguration
} from "../types/ConfigurationTypes";
import {FieldSelectorGroup} from "./FieldSelectorGroup";
import {SelectOptionValue} from "@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers";
import {GlobalConfig} from "@airtable/blocks/types";
import toast from "react-hot-toast";

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

const validateConfigAndGetValidationErrors = (configurationValidator: (appConfigIds: ExtensionConfigurationIds, abortEarly: boolean) => ValidatedExtensionConfiguration,
                                              configurationData: ExtensionConfigurationIds,
                                              formErrorStateGenerator: ((validationErrors: ValidationError[]) => ExtensionConfigurationIds)) => {
    try {
        configurationValidator(configurationData, false);
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
        const fieldErrors = validationErrors.find((error: ValidationError) => error.path === fieldOrTableName) ?? {message: ''}
        // TODO: Make this more readable. This code updates the form error state to remove all errors for keys that don't have errors anymore.
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
                             globalConfig
                         }:
                             {
                                 currentConfiguration: ExtensionConfigurationIds,
                                 base: Base,
                                 configurationValidator: (configurationData: ExtensionConfigurationIds, abortEarly: boolean) => ValidatedExtensionConfiguration,
                                 globalConfig: GlobalConfig
                             }) => {
    const [formState, setFormState] = useState(currentConfiguration);
    const [formErrorState, setFormErrorState] = useState(
        currentConfiguration === blankConfigurationState
            ? blankConfigurationState
            : validateConfigAndGetValidationErrors(configurationValidator, currentConfiguration, entireFormSubmissionErrorStateGenerator)
    );
    const submitForm = () => {
        const formErrorState = validateConfigAndGetValidationErrors(configurationValidator, formState, entireFormSubmissionErrorStateGenerator);
        setFormErrorState(formErrorState);
        if (Object.entries(formErrorState).find(([, formErrorValue]) => formErrorValue !== '') === undefined) {
            const submissionPromise = globalConfig.setAsync('extensionConfiguration', formState)
            toast.promise(submissionPromise, {
                loading: 'Attempting to save configuration.',
                success: 'Configuration saved successfully!',
                error: 'An error occurred saving the configuration.',
            });
        } else toast("There are error(s) with your configuration.")
    }
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
                            <Box border='default' borderColor={formErrorState[tableName] !== '' ? 'red': ''}>
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
                            </Box>
                            <Text textColor='red'>{formErrorState[tableName]}</Text>
                        </FormField>
                    )


                    return (requiredFields.length !== 0 || optionalFields.length !== 0)
                        ? (<Box key={index} maxWidth={500} border='thick' padding='1rem'>
                                {jsx}
                                <br/>

                                {formState[tableName] !== '' && <>
                                    <FieldSelectorGroup
                                        required={true}
                                        table={base.getTable(formState[tableName])}
                                        fields={requiredFields}
                                        formState={formState}
                                        formErrorState={formErrorState}
                                        selectorChangeHandler={selectorChangeHandler}
                                    />

                                    <FieldSelectorGroup
                                        required={false}
                                        table={base.getTable(formState[tableName])}
                                        fields={optionalFields}
                                        formState={formState}
                                        formErrorState={formErrorState}
                                        selectorChangeHandler={selectorChangeHandler}/>
                                </>}
                            </Box>
                        )
                        : jsx;

                }
                )}
                <br/>
                <br/>
                <Button onClick={submitForm}>Submit Extension Configuration</Button>
            </Box>
        </div>
    </Box>;
}