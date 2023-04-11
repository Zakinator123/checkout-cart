import React, {useState} from "react";
import {
    Box,
    Button,
    ConfirmationDialog,
    FormField,
    Input,
    loadCSSFromString,
    Loader,
    Select,
    Switch,
    Text
} from "@airtable/blocks/ui";
import {Base} from "@airtable/blocks/models";
import {ConfigurationInstructions} from "./ConfigurationInstructions";
import {
    blankConfigurationState,
    blankErrorState,
    defaultOtherConfigurationState,
    settingsFormSchema
} from "../utils/Constants";
import {
    ExtensionConfiguration,
    OtherConfigurationKey,
    OtherExtensionConfiguration,
    TableAndFieldsConfigurationKey,
    TablesAndFieldsConfigurationErrors,
    TablesAndFieldsConfigurationIds,
    ValidationResult
} from "../types/ConfigurationTypes";
import {FieldSelectorGroup} from "./FieldSelectorGroup";
import {SelectOptionValue} from "@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers";
import {Id, toast} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import {FormFieldLabelWithTooltip} from "./FormFieldLabelWithTooltip";
import {
    getNewFormErrorStateForSelectorChange,
    getNewFormStateForSelectorChange,
    getUpdatedFormErrorStateIfStaleErrorsExist,
    validateFormAndGetFormValidationErrors
} from "../utils/SettingsFormUtils";
import {asyncAirtableOperationWrapper, generateRandomPositiveInteger} from "../utils/RandomUtils";
import {createSchema} from "../services/SchemaGeneratorService";
import {CollapsibleSectionHeader} from "./CollapsibleSectionHeader";
import Collapsible from "react-collapsible";
import {OfflineToastMessage} from "./OfflineToastMessage";
import {Toast} from "./Toast";
import {ExtensionConfigurationUpdateResult} from "../types/OtherTypes";

loadCSSFromString(`
.settings-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    padding: 1rem;
    overflow: auto;
    height: 100%;
    max-width: 1000px;
}`)

const attemptConfigUpdateAndShowToast = (
    extensionConfiguration: ExtensionConfiguration,
    toastContainerId: { containerId: Id },
    setConfigurationUpdatePending: (pending: boolean) => void,
    setFormErrorState: (formErrorState: TablesAndFieldsConfigurationErrors) => void,
    validateConfigUpdateAndSaveToGlobalConfig: (extensionConfiguration: ExtensionConfiguration) => Promise<ExtensionConfigurationUpdateResult>
) => {
    setConfigurationUpdatePending(true);

    const configurationUpdateToastId = toast.loading('Attempting to save configuration..', toastContainerId);
    asyncAirtableOperationWrapper(() => validateConfigUpdateAndSaveToGlobalConfig(extensionConfiguration),
        () => toast.loading(<OfflineToastMessage/>, {autoClose: false, containerId: toastContainerId.containerId}))
        .then((configurationUpdateResult) => {
            if (configurationUpdateResult.errorsOccurred) {
                toast.update(configurationUpdateToastId, {
                    render: configurationUpdateResult.errorMessage,
                    type: 'error',
                    autoClose: 5000,
                    isLoading: false,
                    containerId: toastContainerId.containerId,
                    closeButton: true
                });
                setFormErrorState(configurationUpdateResult.tablesAndFieldsConfigurationErrors);
            } else {
                toast.update(configurationUpdateToastId, {
                    render: 'Configuration saved successfully!',
                    type: 'success',
                    autoClose: 3000,
                    isLoading: false,
                    containerId: toastContainerId.containerId,
                    closeButton: true
                });
                setFormErrorState(blankErrorState);
            }
        })
        .catch(() => toast.update(configurationUpdateToastId, {
            render: 'An unexpected error occurred.',
            type: 'error',
            autoClose: 3000,
            isLoading: false,
            containerId: toastContainerId.containerId,
            closeButton: true
        }))
        .finally(() => setConfigurationUpdatePending(false));
};

export const Settings = ({
                             currentTableAndFieldIds,
                             currentOtherConfiguration,
                             base,
                             validateTablesAndFields,
                             validateConfigUpdateAndSaveToGlobalConfig,
                             configurationUpdatePending,
                             setConfigurationUpdatePending
                         }:
                             {
                                 currentTableAndFieldIds: TablesAndFieldsConfigurationIds | undefined,
                                 currentOtherConfiguration: OtherExtensionConfiguration | undefined,
                                 base: Base,
                                 validateTablesAndFields: (configurationData: TablesAndFieldsConfigurationIds) => ValidationResult,
                                 validateConfigUpdateAndSaveToGlobalConfig: (extensionConfiguration: ExtensionConfiguration) => Promise<ExtensionConfigurationUpdateResult>,
                                 configurationUpdatePending: boolean,
                                 setConfigurationUpdatePending: (pending: boolean) => void
                             }) => {
    const [tablesAndFieldsFormState, setTablesAndFieldsFormState] = useState(currentTableAndFieldIds === undefined ? blankConfigurationState : currentTableAndFieldIds);
    const [tablesAndFieldsFormErrorState, setFormErrorState] = useState(currentTableAndFieldIds === undefined ? blankErrorState : () => validateFormAndGetFormValidationErrors(currentTableAndFieldIds, validateTablesAndFields));
    const [otherConfigurationFormState, setOtherConfigurationFormState] = useState(currentOtherConfiguration === undefined ? defaultOtherConfigurationState : currentOtherConfiguration);
    const [schemaGenerationDialogOpen, setSchemaGenerationDialogOpen] = useState(false);
    const [autoGeneratedSchemaId, setAutoGeneratedSchemaId] = useState(generateRandomPositiveInteger);

    const [schemaGenerationToastId, manualConfigurationToastId] = [{containerId: 'schema-generation-toast'}, {containerId: 'manual-configuration-toast'}];

    const result = getUpdatedFormErrorStateIfStaleErrorsExist(tablesAndFieldsFormErrorState, validateTablesAndFields, tablesAndFieldsFormState)
    if (result.staleErrorsExist) setFormErrorState(result.newFormErrorState);

    const selectorChangeHandler = (fieldOrTableName: TableAndFieldsConfigurationKey, selectedOption: SelectOptionValue) => {
        let newFormState = getNewFormStateForSelectorChange(tablesAndFieldsFormState, fieldOrTableName, selectedOption);
        setTablesAndFieldsFormState(newFormState)
        const newFormValidationErrors = validateFormAndGetFormValidationErrors(newFormState, validateTablesAndFields);
        const newFormErrorState = getNewFormErrorStateForSelectorChange(tablesAndFieldsFormErrorState, newFormValidationErrors, fieldOrTableName);
        setFormErrorState(newFormErrorState)
    }

    const openSchemaGenerationDialog = () => {
        if (!base.hasPermissionToCreateTable()) {
            toast.error('You do not have permission to create tables or fields in this base.', {containerId: 'schema-generation-toast'});
        } else {
            const randomSchemaId = generateRandomPositiveInteger();
            setAutoGeneratedSchemaId(randomSchemaId);
            setSchemaGenerationDialogOpen(true);
        }
    }

    const generateSchema = (autoGeneratedSchemaRandomSuffix: number) => {
        setConfigurationUpdatePending(true);
        const schemaCreationPromise = asyncAirtableOperationWrapper(() => createSchema(base, autoGeneratedSchemaRandomSuffix),
            () => toast.loading(<OfflineToastMessage/>, {
                autoClose: false,
                containerId: schemaGenerationToastId.containerId
            }))
            .then(extensionConfiguration => {
                setTablesAndFieldsFormState(extensionConfiguration.tableAndFieldIds);
                setOtherConfigurationFormState(extensionConfiguration.otherConfiguration);
                attemptConfigUpdateAndShowToast(extensionConfiguration, schemaGenerationToastId, setConfigurationUpdatePending, setFormErrorState, validateConfigUpdateAndSaveToGlobalConfig);
                // TODO: - Set currently viewed table to be checkouts table
            })
            .finally(() => setConfigurationUpdatePending(false));

        toast.promise(schemaCreationPromise, {
            pending: 'Attempting to generate schema..',
            success: {render: 'Schema generated successfully!', autoClose: 3000},
            error: 'An error occurred generating the schema.',
        }, schemaGenerationToastId);
    }

    return <>
        <Box className='settings-container'>
            <Collapsible
                trigger={CollapsibleSectionHeader(false, 'Required Minimum Schema')}
                triggerWhenOpen={CollapsibleSectionHeader(true, 'Required Minimum Schema')}
            >
                <ConfigurationInstructions/>
            </Collapsible>
            <Box margin='1rem'>
                <Button onClick={openSchemaGenerationDialog}>Generate Schema</Button>
            </Box>
            <Toast {...schemaGenerationToastId}/>

            <Collapsible
                trigger={CollapsibleSectionHeader(false, 'Manual Configuration')}
                triggerWhenOpen={CollapsibleSectionHeader(true, 'Manual Configuration')}
            >
                <Box marginTop='1rem'>
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
                                            options={[{
                                                disabled: true,
                                                value: '',
                                                label: ''
                                            }, ...base.tables.map(table => ({
                                                value: table.id,
                                                label: table.name
                                            }))]}
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
                            <Button disabled={configurationUpdatePending} variant='primary'
                                    onClick={() => attemptConfigUpdateAndShowToast({
                                            tableAndFieldIds: tablesAndFieldsFormState,
                                            otherConfiguration: otherConfigurationFormState
                                        }, manualConfigurationToastId,
                                        setConfigurationUpdatePending,
                                        setFormErrorState,
                                        validateConfigUpdateAndSaveToGlobalConfig
                                    )}>
                                {configurationUpdatePending
                                    ? <Loader scale={0.2} fillColor='white'/>
                                    : <Text textColor='white'>Save Configuration</Text>
                                }
                            </Button>
                        </Box>
                    </Box>
                </Box>
                <Toast {...manualConfigurationToastId}/>
            </Collapsible>
        </Box>

        {schemaGenerationDialogOpen && (
            <ConfirmationDialog
                isConfirmActionDangerous={true}
                title="Are you sure?"
                body={
                    <Text>The following three tables will be created:<br/><br/>
                        - Inventory Example #{autoGeneratedSchemaId}<br/>
                        - Users Example #{autoGeneratedSchemaId}<br/>
                        - Checkouts Example #{autoGeneratedSchemaId}<br/>

                        <br/>
                        Table names and field names can be changed later.
                        <br/>
                        {currentTableAndFieldIds === undefined
                            ? <><br/>The generated tables and fields will be used to configure the extensions settings.
                                You can change the settings yourself later.<br/></>
                            : <><br/>The current extension configuration will be overwritten and replaced with the
                                auto-generated tables/fields. This can be changed later.<br/></>}

                        <br/>Would you like to proceed?
                    </Text>
                }
                onConfirm={() => {
                    setSchemaGenerationDialogOpen(false);
                    generateSchema(autoGeneratedSchemaId);
                }}
                onCancel={() => setSchemaGenerationDialogOpen(false)}
            />
        )}
    </>
}