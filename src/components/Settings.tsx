import React, {useState} from "react";
import {
    Box,
    Button,
    FormField,
    Heading,
    Input,
    Label,
    loadCSSFromString,
    Select,
    Switch,
    Text
} from "@airtable/blocks/ui";
import {Base} from "@airtable/blocks/models";
import {ConfigurationInstructions} from "./ConfigurationInstructions";
import {
    blankConfigurationState,
    blankErrorState,
    configurationFormData,
    defaultOtherConfigurationState
} from "../utils/Constants";
import {
    OtherConfigurationKey,
    TableAndFieldsConfigurationKey,
    TablesAndFieldsConfigurationErrors,
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
                             validateTablesAndFields,
                             globalConfig
                         }:
                             {
                                 currentConfiguration: TablesAndFieldsConfigurationIds,
                                 base: Base,
                                 validateTablesAndFields: (configurationData: TablesAndFieldsConfigurationIds) => ValidationResult,
                                 globalConfig: GlobalConfig
                             }) => {
    const [tablesAndFieldsFormState, setTablesAndFieldsFormState] = useState(currentConfiguration);
    const [currentFormErrorState, setFormErrorState] = useState(
        currentConfiguration === blankConfigurationState ? blankErrorState : validateFormAndGetFormValidationErrors(currentConfiguration, validateTablesAndFields));
    const [otherConfigurationFormState, setOtherConfigurationFormState] = useState(defaultOtherConfigurationState);


    const submitForm = () => {
        const validationResult = validateTablesAndFields(tablesAndFieldsFormState);
        if (validationResult.errorsPresent) {
            setFormErrorState(validationResult.errors);
            toast("There are error(s) with your configuration.");
        } else {
            setFormErrorState(blankErrorState);
            const submissionPromise = globalConfig.setAsync('extensionConfiguration', tablesAndFieldsFormState)
            toast.promise(submissionPromise, {
                loading: 'Attempting to save configuration.',
                success: 'Configuration saved successfully!',
                error: 'An error occurred saving the configuration.',
            });
        }
    }

    const selectorChangeHandler = (fieldOrTableName: TableAndFieldsConfigurationKey, selectedOption: SelectOptionValue) => {
        const newFormState = {...tablesAndFieldsFormState, [fieldOrTableName]: selectedOption}
        setTablesAndFieldsFormState(newFormState)
        const formValidationErrors = validateFormAndGetFormValidationErrors(newFormState, validateTablesAndFields);
        const newFormErrorState = getNewFormErrorStateForSelectorChange(currentFormErrorState, fieldOrTableName, formValidationErrors);
        setFormErrorState(newFormErrorState)
    }

    return <Box className='container'>
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
                                        value={tablesAndFieldsFormState[tableName]}
                                    />
                                </Box>
                                <Text textColor='red'>{currentFormErrorState[tableName]}</Text>
                            </FormField>
                        )


                        return (requiredFields.length !== 0 || optionalFields.length !== 0)
                            ? (<Box key={index} maxWidth={500} border='thick' padding='1rem'>
                                    {jsx}
                                    <br/>

                                    {tablesAndFieldsFormState[tableName] !== '' && <>
                                        <FieldSelectorGroup
                                            required={true}
                                            table={base.getTable(tablesAndFieldsFormState[tableName])}
                                            fields={requiredFields}
                                            formState={tablesAndFieldsFormState}
                                            formErrorState={currentFormErrorState}
                                            selectorChangeHandler={selectorChangeHandler}
                                        />

                                        <FieldSelectorGroup
                                            required={false}
                                            table={base.getTable(tablesAndFieldsFormState[tableName])}
                                            fields={optionalFields}
                                            formState={tablesAndFieldsFormState}
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
                <FormField label='Delete open checkouts upon check-in'>
                    <Switch
                        value={otherConfigurationFormState.deleteOpenCheckoutsUponCheckin}
                        onChange={newValue => setOtherConfigurationFormState({
                            ...otherConfigurationFormState,
                            [OtherConfigurationKey.deleteOpenCheckoutsUponCheckin]: newValue
                        })}
                        label={otherConfigurationFormState.deleteOpenCheckoutsUponCheckin ? 'Enabled' : 'Disabled'}
                    />
                </FormField>
                <br/>
                <br/>

                <FormField label='Default number of days from today for due date field (only applicable if enabled)'>
                    <Input
                        value={tablesAndFieldsFormState.dateDueField === '' ? '': otherConfigurationFormState.defaultNumberOfDaysFromTodayForDueDate.toString()}
                        onChange={e => setOtherConfigurationFormState({
                            ...otherConfigurationFormState,
                            [OtherConfigurationKey.defaultNumberOfDaysFromTodayForDueDate]: Number(e.target.value)
                        })}
                        placeholder='N/A: Enable the "Date Due" field to populate this.'
                        type='number'
                        min={0}
                        disabled={tablesAndFieldsFormState.dateDueField === ''}
                    />
                </FormField>
                <br/>
                <br/>
                <Button onClick={submitForm}>Save Configuration</Button>
            </Box>
        </div>
    </Box>;
}