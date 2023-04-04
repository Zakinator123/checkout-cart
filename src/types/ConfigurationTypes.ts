import {Field, Table} from "@airtable/blocks/models";
import {FieldId, TableId} from "@airtable/blocks/types";

export enum TableName {
    inventoryTable = 'inventoryTable',
    userTable = 'userTable',
    checkoutsTable = 'checkoutsTable'
}

export enum CheckoutTableRequiredFieldName {
    linkedInventoryTableField = 'linkedInventoryTableField',
    linkedUserTableField = 'linkedUserTableField',
    checkedInField = 'checkedInField',
}

export enum CheckoutTableOptionalFieldName {
    dateCheckedOutField = 'dateCheckedOutField',
    dateDueField = 'dateDueField',
    dateCheckedInField = 'dateCheckedInField',
    cartGroupField = 'cartGroupField'
}

export enum OtherConfigurationKey {
    deleteOpenCheckoutsUponCheckin = 'deleteOpenCheckoutsUponCheckin',
    defaultNumberOfDaysFromTodayForDueDate = 'defaultNumberOfDaysFromTodayForDueDate',
    premiumLicenseVerified = 'premiumLicenseVerified'
}

export type TableAndFieldsConfigurationKey = TableName | CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName;

type TablesAndFieldsConfiguration<TableOrTableIdOrErrorMessage, FieldOrFieldIdOrErrorMessage, OptionalFieldOrFieldIdOrErrorMessage> = {
    [TableName.inventoryTable]: TableOrTableIdOrErrorMessage,
    [TableName.userTable]: TableOrTableIdOrErrorMessage,
    [TableName.checkoutsTable]: TableOrTableIdOrErrorMessage,
    [CheckoutTableRequiredFieldName.linkedInventoryTableField]: FieldOrFieldIdOrErrorMessage,
    [CheckoutTableRequiredFieldName.linkedUserTableField]: FieldOrFieldIdOrErrorMessage,
    [CheckoutTableRequiredFieldName.checkedInField]: FieldOrFieldIdOrErrorMessage,
    [CheckoutTableOptionalFieldName.dateCheckedOutField]: OptionalFieldOrFieldIdOrErrorMessage,
    [CheckoutTableOptionalFieldName.dateDueField]: OptionalFieldOrFieldIdOrErrorMessage,
    [CheckoutTableOptionalFieldName.dateCheckedInField]: OptionalFieldOrFieldIdOrErrorMessage,
    [CheckoutTableOptionalFieldName.cartGroupField]: OptionalFieldOrFieldIdOrErrorMessage
}

/*
type TablesAndFieldsConfiguration<TableOrTableIdOrErrorMessage, FieldOrFieldIdOrErrorMessage, OptionalFieldOrFieldIdOrErrorMessage> = {
    [tableName in keyof TableName]: TableOrTableIdOrErrorMessage} & {
    [requiredField in keyof CheckoutTableRequiredFieldName]: FieldOrFieldIdOrErrorMessage; } & {
    [optionalField in keyof CheckoutTableOptionalFieldName]: OptionalFieldOrFieldIdOrErrorMessage };

 */

export type OtherExtensionConfiguration = {
    [OtherConfigurationKey.premiumLicenseVerified]: boolean,
    [OtherConfigurationKey.deleteOpenCheckoutsUponCheckin]: boolean,
    [OtherConfigurationKey.defaultNumberOfDaysFromTodayForDueDate]: number,
}
export type ExtensionConfiguration = {
    tableAndFieldIds: TablesAndFieldsConfigurationIds,
    otherConfiguration: OtherExtensionConfiguration,
}

export type TablesAndFieldsConfigurationIds = TablesAndFieldsConfiguration<TableId, FieldId, string>;
export type TablesAndFieldsConfigurationErrors = TablesAndFieldsConfiguration<string, string, string>;
export type ValidatedTablesAndFieldsConfiguration = Readonly<TablesAndFieldsConfiguration<Table, Field, Field | undefined>>;

export type ValidationResult = {errorsPresent: true, errors: TablesAndFieldsConfigurationErrors}
    | {errorsPresent: false, configuration: ValidatedTablesAndFieldsConfiguration}

export type FieldConfiguration = {
    readonly fieldName: CheckoutTableRequiredFieldName | CheckoutTableOptionalFieldName,
    readonly fieldPickerLabel: string,
    readonly fieldPickerTooltip: string,
}

export type TableConfiguration = {
    readonly tableName: TableName,
    readonly tablePickerLabel: string,
    readonly tablePickerTooltip: string,
    readonly requiredFields?: ReadonlyArray<FieldConfiguration>,
    readonly optionalFields?: ReadonlyArray<FieldConfiguration>,
}

export type SchemaConfiguration = ReadonlyArray<TableConfiguration>;

export type ExtensionConfigurationFormSchema = {
    readonly schemaConfiguration: SchemaConfiguration,
    readonly deleteCheckoutsUponCheckin: boolean,
}