import React, {useState} from "react";
import {Box, Button, FormField, Heading, Label, loadCSSFromString, Select, Text} from "@airtable/blocks/ui";
import {Base} from "@airtable/blocks/models";
import {ConfigurationInstructions} from "./ConfigurationInstructions";
import {blankConfigurationState, blankErrorState, configurationFormData} from "../utils/Constants";
import {
    TableAndFieldsConfigurationKey, TablesAndFieldsConfigurationErrors,
    TablesAndFieldsConfigurationIds,
    ValidationResult
} from "../types/ConfigurationTypes";
import {FieldSelectorGroup} from "./FieldSelectorGroup";
import {SelectOptionValue} from "@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers";
import {GlobalConfig} from "@airtable/blocks/types";
import toast from "react-hot-toast";
import {mapValues} from "../utils/RandomUtils";

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

const validateFormAndGetFormValidationErrors = (formState: TablesAndFieldsConfigurationIds, configurationValidator: (configurationData: TablesAndFieldsConfigurationIds) => ValidationResult) => {
    const validationResult = configurationValidator(formState);
    return validationResult.errorsPresent ? validationResult.errors : blankErrorState;
}

function getNewFormErrorStateForSelectorChange(currentFormErrorState: Readonly<TablesAndFieldsConfigurationErrors>, fieldOrTableName: TableAndFieldsConfigurationKey, formValidationErrors: TablesAndFieldsConfigurationErrors) {
    return mapValues(currentFormErrorState, (key, value) => {
        // Replace values in the currentFormErrorState with values from the formValidationErrors
        // iff the formValidationErrors has no value for the key or if field/table name is the same as the key.
        if (key === fieldOrTableName) return formValidationErrors[key as TableAndFieldsConfigurationKey];
        if (formValidationErrors[key as TableAndFieldsConfigurationKey] === '') return '';
        return value;
    });
}

export const Settings = ({
                             currentConfiguration,
                             base,
                             configurationValidator,
                             globalConfig
                         }:
                             {
                                 currentConfiguration: TablesAndFieldsConfigurationIds,
                                 base: Base,
                                 configurationValidator: (configurationData: TablesAndFieldsConfigurationIds) => ValidationResult,
                                 globalConfig: GlobalConfig
                             }) => {
    const [formState, setFormState] = useState(currentConfiguration);
    const [currentFormErrorState, setFormErrorState] = useState(
        currentConfiguration === blankConfigurationState ? blankErrorState : validateFormAndGetFormValidationErrors(currentConfiguration, configurationValidator));

    const submitForm = () => {
        const validationResult = configurationValidator(formState);
        if (validationResult.errorsPresent) {
            setFormErrorState(validationResult.errors);
            toast("There are error(s) with your configuration.");
        } else {
            setFormErrorState(blankErrorState);
            const submissionPromise = globalConfig.setAsync('extensionConfiguration', formState)
            toast.promise(submissionPromise, {
                loading: 'Attempting to save configuration.',
                success: 'Configuration saved successfully!',
                error: 'An error occurred saving the configuration.',
            });
        }
    }

    const selectorChangeHandler = (fieldOrTableName: TableAndFieldsConfigurationKey, selectedOption: SelectOptionValue) => {
        const newFormState = {...formState, [fieldOrTableName]: selectedOption}
        setFormState(newFormState)
        const formValidationErrors = validateFormAndGetFormValidationErrors(newFormState, configurationValidator);
        const newFormErrorState = getNewFormErrorStateForSelectorChange(currentFormErrorState, fieldOrTableName, formValidationErrors);
        setFormErrorState(newFormErrorState)
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
                                <Box border='default' borderColor={currentFormErrorState[tableName] !== '' ? 'red' : ''}>
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
                                <Text textColor='red'>{currentFormErrorState[tableName]}</Text>
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
                                            formErrorState={currentFormErrorState}
                                            selectorChangeHandler={selectorChangeHandler}
                                        />

                                        <FieldSelectorGroup
                                            required={false}
                                            table={base.getTable(formState[tableName])}
                                            fields={optionalFields}
                                            formState={formState}
                                            formErrorState={currentFormErrorState}
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