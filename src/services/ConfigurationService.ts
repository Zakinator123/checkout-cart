import {FieldId, TableId} from "@airtable/blocks/types";
import {Base, Field, FieldType, Table} from "@airtable/blocks/models";
import {ExpectedAppConfigFieldTypeMapping, fieldTypeLinks} from "../utils/Constants";
import {
    CheckoutTableOptionalFieldName,
    CheckoutTableRequiredFieldName,
    ExtensionConfigurationIds,
    TableName,
    ValidatedExtensionConfiguration
} from "../types/ConfigurationTypes";
import * as Yup from "yup";
import {mixed, string, TestContext} from "yup";


const airtableIdIsDistinctFromOtherIdsInForm = (airtableId: string | undefined, context: TestContext) => {
    // Empty optional fields do not need to be distinct.
    if (!airtableId) return true;

    const currentSchemaKey = context.path;
    let idsAreUnique: boolean = true;
    for (const schemaKey of Object.keys(context.parent)) {
        if (schemaKey !== currentSchemaKey && context.parent[schemaKey] !== '' && context.parent[schemaKey] === airtableId) {
            idsAreUnique = false;
        }
    }
    return idsAreUnique;
}

const getTableByIdFromBase: (base: Base, tableId: TableId) => Table | undefined = (base, tableId) => base.getTableByIdIfExists(tableId) ?? undefined
const getFieldByIdFromTable: (table: Table, fieldId: FieldId) => Field | undefined = (table, fieldId) => table.getFieldByIdIfExists(fieldId) ?? undefined

export const getConfigurationValidatorForBase = (base: Base) => {

    const tableKeyIsPresentAndUnique = string()
        .required()
        .test('UniqueTable', 'Configured tables must be distinct.', airtableIdIsDistinctFromOtherIdsInForm)

    const checkoutTableRequiredFieldIsPresentAndUnique = string()
        .required()
        .test('UniqueField', 'Configured fields must be distinct.', airtableIdIsDistinctFromOtherIdsInForm)

    const checkoutTableOptionalFieldIsPresentAndUnique = string()
        .optional()
        .test('UniqueField', 'Configured fields must be distinct.', airtableIdIsDistinctFromOtherIdsInForm)

    const tableExists = mixed((input): input is Table => input instanceof Table)
        .transform(tableId => getTableByIdFromBase(base, tableId))
        .required()

    const fieldExistsAndIsValidIfRequired = (fieldIsRequired: boolean) =>
        mixed()
            .when(TableName.checkoutsTable, ([checkoutsTable], fieldSchema) => fieldSchema
                .transform((fieldId: FieldId | ''): Field | undefined => (fieldId === '' || fieldId === undefined) ? undefined : getFieldByIdFromTable(checkoutsTable, fieldId))
                .test('Field Required.', 'Field is required.', (field: any) => !(fieldIsRequired && field === undefined))
                .test('Correct Field Type',
                    'The selected field type is incorrect.',
                    (field: any, context) => {
                        try {
                            if (!fieldIsRequired && field === undefined || field === '') return true;
                            const assertedField = field as Field;
                            const requiredFieldName = context.path as CheckoutTableRequiredFieldName;
                            return assertedField.type === ExpectedAppConfigFieldTypeMapping[requiredFieldName];
                        } catch (e) {
                            return false;
                        }
                    })
                .test('Proper Field Type Link',
                    'The selected linked record field links to the wrong table.',
                    (field: any, context) => {
                        try {
                            if (!fieldIsRequired && (field === undefined || field === '')) return true;

                            const assertedField = field as Field;
                            if (assertedField.config.type !== FieldType.MULTIPLE_RECORD_LINKS)
                                return true;
                            const requiredFieldName = context.path as CheckoutTableRequiredFieldName;
                            const mustLinkTo: TableName | undefined = fieldTypeLinks[requiredFieldName];
                            if (mustLinkTo === undefined)
                                return false;
                            const currentlyLinkedTo: TableId = assertedField.config.options.linkedTableId;
                            return currentlyLinkedTo === context.parent[mustLinkTo].id;
                        } catch (e) {
                            return false;
                        }
                    }
                )
            )


    const configurationIdsSchema = Yup.object({
        [TableName.inventoryTable]: tableKeyIsPresentAndUnique,
        [TableName.userTable]: tableKeyIsPresentAndUnique,
        [TableName.checkoutsTable]: tableKeyIsPresentAndUnique,
        [CheckoutTableRequiredFieldName.linkedInventoryTableField]: checkoutTableRequiredFieldIsPresentAndUnique,
        [CheckoutTableRequiredFieldName.linkedUserTableField]: checkoutTableRequiredFieldIsPresentAndUnique,
        [CheckoutTableRequiredFieldName.checkedInField]: checkoutTableRequiredFieldIsPresentAndUnique,
        [CheckoutTableOptionalFieldName.dateCheckedOutField]: checkoutTableOptionalFieldIsPresentAndUnique,
        [CheckoutTableOptionalFieldName.dateDueField]: checkoutTableOptionalFieldIsPresentAndUnique,
        [CheckoutTableOptionalFieldName.dateCheckedInField]: checkoutTableOptionalFieldIsPresentAndUnique,
        [CheckoutTableOptionalFieldName.cartGroupField]: checkoutTableOptionalFieldIsPresentAndUnique
        // deleteCheckoutsUponCheckIn: boolean().required()
    })

    const configurationTablesAndFieldsSchema = Yup.object({
        [TableName.inventoryTable]: tableExists,
        [TableName.userTable]: tableExists,
        [TableName.checkoutsTable]: tableExists,
        [CheckoutTableRequiredFieldName.linkedInventoryTableField]: fieldExistsAndIsValidIfRequired(true) as any as Yup.MixedSchema<Field>,
        [CheckoutTableRequiredFieldName.linkedUserTableField]: fieldExistsAndIsValidIfRequired(true) as any as Yup.MixedSchema<Field>,
        [CheckoutTableRequiredFieldName.checkedInField]: fieldExistsAndIsValidIfRequired(true) as any as Yup.MixedSchema<Field>,
        [CheckoutTableOptionalFieldName.dateCheckedOutField]: fieldExistsAndIsValidIfRequired(false) as any as Yup.MixedSchema<Field | undefined>,
        [CheckoutTableOptionalFieldName.dateDueField]: fieldExistsAndIsValidIfRequired(false) as any as Yup.MixedSchema<Field | undefined>,
        [CheckoutTableOptionalFieldName.dateCheckedInField]: fieldExistsAndIsValidIfRequired(false) as any as Yup.MixedSchema<Field | undefined>,
        [CheckoutTableOptionalFieldName.cartGroupField]: fieldExistsAndIsValidIfRequired(false) as any as Yup.MixedSchema<Field | undefined>
    });

    return {
        validateIdsAndTransformToTablesAndFieldsOrThrow(configurationIds: ExtensionConfigurationIds, abortEarly: boolean): ValidatedExtensionConfiguration {
            const validatedConfigIds = configurationIdsSchema.validateSync(configurationIds, {abortEarly})
            let validateSync = configurationTablesAndFieldsSchema.validateSync(validatedConfigIds, {abortEarly});
            return validateSync;
        }
    }
}