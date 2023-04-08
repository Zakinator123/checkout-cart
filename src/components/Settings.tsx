import React, {useEffect, useState} from "react";
import {Box, Button, FormField, Input, loadCSSFromString, Loader, Select, Switch, Text} from "@airtable/blocks/ui";
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
    OtherExtensionConfiguration,
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
import {asyncAirtableOperationWrapper} from "../utils/RandomUtils";
import {Toast} from "./Toaster";

loadCSSFromString(`
.settings-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 1rem;
    margin-bottom: 1rem;
    overflow: auto;
    gap: 1.5rem;
    height: 100%;
    max-width: 1000px;
}`)

export const Settings = ({
                             currentTableAndFieldIds,
                             currentOtherConfiguration,
                             base,
                             validateTablesAndFields,
                             globalConfig,
                             configurationUpdatePending,
                             setConfigurationUpdatePending
                         }:
                             {
                                 currentTableAndFieldIds: TablesAndFieldsConfigurationIds | undefined,
                                 currentOtherConfiguration: OtherExtensionConfiguration | undefined,
                                 base: Base,
                                 validateTablesAndFields: (configurationData: TablesAndFieldsConfigurationIds) => ValidationResult,
                                 globalConfig: GlobalConfig,
                                 configurationUpdatePending: boolean,
                                 setConfigurationUpdatePending: (pending: boolean) => void
                             }) => {
    const [tablesAndFieldsFormState, setTablesAndFieldsFormState] = useState(currentTableAndFieldIds === undefined ? blankConfigurationState : currentTableAndFieldIds);
    const [tablesAndFieldsFormErrorState, setFormErrorState] = useState(currentTableAndFieldIds === undefined ? blankErrorState : validateFormAndGetFormValidationErrors(currentTableAndFieldIds, validateTablesAndFields));
    const [otherConfigurationFormState, setOtherConfigurationFormState] = useState(currentOtherConfiguration === undefined ? defaultOtherConfigurationState : currentOtherConfiguration);

    // Clear toasts on component mount and unmount
    useEffect(() => {
        toast.remove();
        return () => toast.remove();
    }, [])

    const result = getUpdatedFormErrorStateIfStaleErrorsExist(tablesAndFieldsFormErrorState, validateTablesAndFields, tablesAndFieldsFormState)
    if (result.staleErrorsExist) setFormErrorState(result.newFormErrorState);

    const submitForm = () => {
        setConfigurationUpdatePending(true);
        const validationResult = validateTablesAndFields(tablesAndFieldsFormState);
        if (validationResult.errorsPresent) {
            setFormErrorState(validationResult.errors);
            toast.error("There are error(s) with your configuration.", {
                style: {minWidth: 'max-content'}
            });
            setConfigurationUpdatePending(false);
        } else {
            setFormErrorState(blankErrorState);

            const mergedConfiguration = {
                tableAndFieldIds: tablesAndFieldsFormState,
                otherConfiguration: otherConfigurationFormState
            };

            const hasPermission: boolean = globalConfig.hasPermissionToSet('extensionConfiguration', mergedConfiguration)
            if (!hasPermission) {
                toast.error('You must have base editor permissions to update extension settings.');
                setConfigurationUpdatePending(false);
            } else {
                const submissionPromise = asyncAirtableOperationWrapper(() => globalConfig.setAsync('extensionConfiguration', mergedConfiguration))
                    .finally(() => setConfigurationUpdatePending(false));

                toast.promise(submissionPromise, {
                    loading: 'Attempting to save configuration..',
                    success: 'Configuration saved successfully!',
                    error: 'An error occurred saving the configuration.',
                });
            }
        }
    }

    const selectorChangeHandler = (fieldOrTableName: TableAndFieldsConfigurationKey, selectedOption: SelectOptionValue) => {
        let newFormState = getNewFormStateForSelectorChange(tablesAndFieldsFormState, fieldOrTableName, selectedOption);
        setTablesAndFieldsFormState(newFormState)
        const newFormValidationErrors = validateFormAndGetFormValidationErrors(newFormState, validateTablesAndFields);
        const newFormErrorState = getNewFormErrorStateForSelectorChange(tablesAndFieldsFormErrorState, newFormValidationErrors, fieldOrTableName);
        setFormErrorState(newFormErrorState)
    }

    return <>
        <Box className='settings-container'>
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
                                <Box border='default'
                                     borderColor={tablesAndFieldsFormErrorState[tableName] !== '' ? 'red' : ''}>
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
                                <Text textColor='red'>{tablesAndFieldsFormErrorState[tableName]}</Text>
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
                                            formErrorState={tablesAndFieldsFormErrorState}
                                            selectorChangeHandler={selectorChangeHandler}
                                        />

                                        <FieldSelectorGroup
                                            required={false}
                                            table={base.getTable(tablesAndFieldsFormState[tableName])}
                                            fields={optionalFields}
                                            formState={tablesAndFieldsFormState}
                                            formErrorState={tablesAndFieldsFormErrorState}
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
                                                          fieldLabelTooltip='See the "About" tab. Only enable if you understand the implications!'
                                                          dangerous={true}/>}>
                        <Switch
                            value={otherConfigurationFormState.deleteOpenCheckoutsUponCheckIn}
                            onChange={newValue => setOtherConfigurationFormState({
                                ...otherConfigurationFormState,
                                [OtherConfigurationKey.deleteOpenCheckoutsUponCheckIn]: newValue
                            })}
                            label={otherConfigurationFormState.deleteOpenCheckoutsUponCheckIn ? 'Enabled' : 'Disabled'}
                            variant='danger'
                        />
                    </FormField>
                    <br/>
                    <br/>

                    <FormField
                        label={<FormFieldLabelWithTooltip
                            fieldLabel='Default Due Date (expressed in # of days from Checkout creation)'
                            fieldLabelTooltip='For newly created Checkouts. Due Date field must be enabled.'/>}>
                        <Input
                            value={tablesAndFieldsFormState.dateDueField === '' ? '' : otherConfigurationFormState.defaultNumberOfDaysFromTodayForDueDate.toString()}
                            onChange={e => setOtherConfigurationFormState({
                                ...otherConfigurationFormState,
                                [OtherConfigurationKey.defaultNumberOfDaysFromTodayForDueDate]: Number(e.target.value)
                            })}
                            placeholder='N/A: Enable the "Date Due" field to populate.'
                            type='number'
                            min={0}
                            disabled={tablesAndFieldsFormState.dateDueField === ''}
                        />
                    </FormField>
                    <br/>
                    <Box display='flex' justifyContent='center'>
                        <Button disabled={configurationUpdatePending} variant='primary' onClick={submitForm}>
                            {configurationUpdatePending
                                ? <Loader scale={0.2} fillColor='white'/>
                                : <Text textColor='white'>Save Configuration</Text>
                            }
                        </Button>
                    </Box>
                </Box>
            </div>
        </Box>
        <Toast top='0rem'/>
    </>
}