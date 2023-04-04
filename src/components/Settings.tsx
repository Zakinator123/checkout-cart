import React, {useState} from "react";
import {Box, Button, FormField, Input, loadCSSFromString, Select, Switch, Text} from "@airtable/blocks/ui";
import {Base} from "@airtable/blocks/models";
import {ConfigurationInstructions} from "./ConfigurationInstructions";
import {
    blankConfigurationState,
    blankErrorState,
    defaultOtherConfigurationState,
    settingsFormSchema
} from "../utils/Constants";
import {
    OtherConfigurationKey,
    TableAndFieldsConfigurationKey,
    TablesAndFieldsConfigurationIds,
    ValidationResult
} from "../types/ConfigurationTypes";
import {FieldSelectorGroup} from "./FieldSelectorGroup";
import {SelectOptionValue} from "@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers";
import {GlobalConfig} from "@airtable/blocks/types";
import toast from "react-hot-toast";
import {FormFieldLabelWithTooltip} from "./FormFieldLabelWithTooltip";
import {
    getNewFormErrorStateForSelectorChange,
    getNewFormStateForSelectorChange,
    getUpdatedFormErrorStateIfStaleErrorsExist,
    validateFormAndGetFormValidationErrors
} from "../utils/SettingsFormUtils";

loadCSSFromString(`
.settings-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 2rem;
    margin-bottom: 1rem;
    overflow: auto;
    gap: 1.5rem;
    height: 100%;
    max-width: 1000px;
}`)

export const Settings = ({
                             currentConfiguration,
                             base,
                             validateTablesAndFields,
                             globalConfig
                         }:
                             {
                                 currentConfiguration: TablesAndFieldsConfigurationIds | undefined
                                 base: Base,
                                 validateTablesAndFields: (configurationData: TablesAndFieldsConfigurationIds) => ValidationResult,
                                 globalConfig: GlobalConfig
                             }) => {
    const [tablesAndFieldsFormState, setTablesAndFieldsFormState] = useState(currentConfiguration === undefined ? blankConfigurationState : currentConfiguration);
    const [currentFormErrorState, setFormErrorState] = useState(currentConfiguration === undefined ? blankErrorState : validateFormAndGetFormValidationErrors(currentConfiguration, validateTablesAndFields));
    const [otherConfigurationFormState, setOtherConfigurationFormState] = useState(defaultOtherConfigurationState);

    const result = getUpdatedFormErrorStateIfStaleErrorsExist(currentFormErrorState, validateTablesAndFields, tablesAndFieldsFormState)
    if (result.staleErrorsExist) setFormErrorState(result.newFormErrorState);

    const submitForm = () => {
        const validationResult = validateTablesAndFields(tablesAndFieldsFormState);
        if (validationResult.errorsPresent) {
            setFormErrorState(validationResult.errors);
            toast.error("There are error(s) with your configuration.");
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
        let newFormState = getNewFormStateForSelectorChange(tablesAndFieldsFormState, fieldOrTableName, selectedOption);
        setTablesAndFieldsFormState(newFormState)
        const newFormValidationErrors = validateFormAndGetFormValidationErrors(newFormState, validateTablesAndFields);
        const newFormErrorState = getNewFormErrorStateForSelectorChange(currentFormErrorState, newFormValidationErrors, fieldOrTableName);
        setFormErrorState(newFormErrorState)
    }

    return <Box className='settings-container'>
        <ConfigurationInstructions/>
        <div>
            <Text as='strong' fontWeight='600' fontSize={14}>Extension Configuration</Text>
            <Box padding='1.5rem' maxWidth={800}>
                {settingsFormSchema.schemaConfiguration.map(({
                                                                 tableName,
                                                                 tablePickerLabel,
                                                                 tablePickerTooltip,
                                                                 requiredFields = [],
                                                                 optionalFields = []
                                                             }, index) => {
                    const tableSelector = (
                        <FormField key={index}
                                   label={<FormFieldLabelWithTooltip fieldLabel={tablePickerLabel}
                                                                     fieldLabelTooltip={tablePickerTooltip}/>}>
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
                        </FormField>)


                    if (requiredFields.length !== 0 || optionalFields.length !== 0) {
                        const table = base.getTableByIdIfExists(tablesAndFieldsFormState[tableName]) ?? undefined;

                        return <Box key={index} maxWidth={500} border='thick' padding='1rem'>
                            {tableSelector}
                            <br/>

                            {
                                table && <>
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
                                </>
                            }
                        </Box>;
                    }
                    return tableSelector;
                })}
                <br/>
                <br/>
                <FormField
                    label={<FormFieldLabelWithTooltip fieldLabel='Delete Open Checkouts Upon Check-In: CAUTION!'
                                                      fieldLabelTooltip='Only enable this if you fully understand the implications. Read the "About" section for more information.'
                                                      dangerous={true}/>}>
                    <Switch
                        value={otherConfigurationFormState.deleteOpenCheckoutsUponCheckin}
                        onChange={newValue => setOtherConfigurationFormState({
                            ...otherConfigurationFormState,
                            [OtherConfigurationKey.deleteOpenCheckoutsUponCheckin]: newValue
                        })}
                        label={otherConfigurationFormState.deleteOpenCheckoutsUponCheckin ? 'Enabled' : 'Disabled'}
                        variant='danger'
                    />
                </FormField>
                <br/>
                <br/>

                <FormField
                    label={<FormFieldLabelWithTooltip
                        fieldLabel='Default Due Date (expressed in # of days from Checkout creation)'
                        fieldLabelTooltip='Applies to new Checkouts. Only applicable if Due Date field is enabled.'/>}>
                    <Input
                        value={tablesAndFieldsFormState.dateDueField === '' ? '' : otherConfigurationFormState.defaultNumberOfDaysFromTodayForDueDate.toString()}
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
                <Box display='flex' justifyContent='center'>
                    <Button variant='primary' onClick={submitForm}>Save Configuration</Button>
                </Box>
            </Box>
        </div>
    </Box>;
}