import React, {useState} from "react";
import {Box, Button, FormField, Input, loadCSSFromString, Select, Switch, Text} from "@airtable/blocks/ui";
import {Base} from "@airtable/blocks/models";
import {ConfigurationInstructions} from "./ConfigurationInstructions";
import {
    blankConfigurationState,
    blankErrorState,
    combinedCheckoutsTableFields,
    configurationFormData,
    defaultOtherConfigurationState
} from "../utils/Constants";
import {
    CheckoutTableOptionalFieldName,
    CheckoutTableRequiredFieldName,
    OtherConfigurationKey,
    TableAndFieldsConfigurationKey,
    TableName,
    TablesAndFieldsConfigurationErrors,
    TablesAndFieldsConfigurationIds,
    ValidationResult
} from "../types/ConfigurationTypes";
import {FieldSelectorGroup} from "./FieldSelectorGroup";
import {SelectOptionValue} from "@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers";
import {GlobalConfig} from "@airtable/blocks/types";
import toast from "react-hot-toast";
import {mapValues} from "../utils/RandomUtils";
import {SelectorLabelWithTooltip} from "./SelectorLabelWithTooltip";

loadCSSFromString(`
.settings-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 2rem;
    overflow: auto;
    gap: 1.5rem;
    height: 100%;
    max-width: 1000px;
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
                                 currentConfiguration: TablesAndFieldsConfigurationIds | undefined
                                 base: Base,
                                 validateTablesAndFields: (configurationData: TablesAndFieldsConfigurationIds) => ValidationResult,
                                 globalConfig: GlobalConfig
                             }) => {
    const [tablesAndFieldsFormState, setTablesAndFieldsFormState] = useState(currentConfiguration === undefined ? blankConfigurationState : currentConfiguration);
    const [currentFormErrorState, setFormErrorState] = useState(
        currentConfiguration === undefined ? blankErrorState : validateFormAndGetFormValidationErrors(currentConfiguration, validateTablesAndFields));
    const [otherConfigurationFormState, setOtherConfigurationFormState] = useState(defaultOtherConfigurationState);

    // TODO: See if this is still needed?
    // If currentFormErrorState has any entries with values that are not empty, call validateFormAndGetFormValidationErrors with the currentConfiguration and if there are
    // errors in the currentFormErrorState that no longer exist in the validationResult, call setFormErrorState to remove the error from the currentFormErrorState.
    // This is to handle the case where the user has corrected the error in the form and the error is no longer present in the validationResult.
    if (currentFormErrorState !== blankErrorState) {
        const validationResult = validateTablesAndFields(tablesAndFieldsFormState);
        if (validationResult.errorsPresent) {
            let thereAreErrorsToBeCleared: boolean = false;
            const newFormErrorState = mapValues(currentFormErrorState, (key, value) => {
                if (validationResult.errors[key as TableAndFieldsConfigurationKey] === '' && value !== '') {
                    console.log('Clearing error for key: ' + key)
                    thereAreErrorsToBeCleared = true;
                    return '';
                } else return value;
            });
            if (thereAreErrorsToBeCleared) setFormErrorState(newFormErrorState);
        } else {
            setFormErrorState(blankErrorState);
        }
    }

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
        let newFormState = {...tablesAndFieldsFormState, [fieldOrTableName]: selectedOption}

        //TODO: See if there's a programmatic way to do this with more mappings.
        if (fieldOrTableName === TableName.checkoutsTable) {
            newFormState = {
                ...newFormState, ...mapValues(combinedCheckoutsTableFields, (key,) =>
                    newFormState[key as CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName] = '')
            }
        }
        setTablesAndFieldsFormState(newFormState)
        const formValidationErrors = validateFormAndGetFormValidationErrors(newFormState, validateTablesAndFields);
        const newFormErrorState = getNewFormErrorStateForSelectorChange(currentFormErrorState, fieldOrTableName, formValidationErrors);
        setFormErrorState(newFormErrorState)
    }

    return <Box className='settings-container'>
        <ConfigurationInstructions/>
        <div>
            <Text as='strong' fontWeight='600' fontSize={14}>Extension Configuration</Text>
            <Box padding='1.5rem' maxWidth={800}>

                {configurationFormData.schemaConfiguration.map(({
                                                                    tableName,
                                                                    tablePickerLabel,
                                                                    tablePickerTooltip,
                                                                    requiredFields = [],
                                                                    optionalFields = []
                                                                }, index) => {
                    const jsx = (
                        <FormField key={index}
                                   label={<SelectorLabelWithTooltip selectorLabel={tablePickerLabel}
                                                                    selectorLabelTooltip={tablePickerTooltip}/>}>
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


                    if (requiredFields.length !== 0 || optionalFields.length !== 0) {
                        const table = base.getTableByIdIfExists(tablesAndFieldsFormState[tableName]) ?? undefined;

                        return <Box key={index} maxWidth={500} border='thick' padding='1rem'>
                            {jsx}
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
                                </>}
                        </Box>;
                    } else {
                        return jsx;
                    }

                }
                )}
                <br/>
                <br/>
                <FormField label={<Text textColor='red'>CAUTION: Delete Open Checkouts upon Check-In</Text>}>
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
                    label='Default Due Date (expressed in # of days from checkout date) for new Checkouts. Only applicable if Due-Date field is enabled'>
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
                <Button onClick={submitForm}>Save Configuration</Button>
            </Box>
        </div>
    </Box>;
}