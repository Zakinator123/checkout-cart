import {FieldId, TableId} from "@airtable/blocks/types";
import {Base, Field, FieldType, Table} from "@airtable/blocks/models";
import {ExpectedAppConfigFieldTypeMapping, fieldTypeLinks} from "../utils/Constants";
import {
    ExtensionConfigurationIds,
    CheckoutTableRequiredFieldName,
    TableName,
    ValidatedExtensionConfiguration
} from "../types/ConfigurationTypes";
import * as Yup from "yup";
import {mixed, string, TestContext} from "yup";


const airtableIdIsDistinctFromOtherIdsInForm = (airtableId: string, context: TestContext) => {
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

    const tableExists = mixed((input): input is Table => input instanceof Table)
        .strict(true)
        .transform(tableId => getTableByIdFromBase(base, tableId))
        .required()

    const fieldExistsAndIsValid = string()
        .strict(true)
        .when(TableName.checkoutsTable, ([checkoutsTable], fieldSchema) => fieldSchema
            .transform((fieldId: FieldId): Field | undefined => getFieldByIdFromTable(checkoutsTable, fieldId))
            .required()
            .test('Correct Field Type',
                'The selected field type is incorrect.',
                (field: any, context) => {
                    const assertedField = field as Field;
                    const requiredFieldName = context.path as CheckoutTableRequiredFieldName;
                    return assertedField.type === ExpectedAppConfigFieldTypeMapping[requiredFieldName];
                })
            .test('Proper Field Type Link',
                'The selected linked record field links to the wrong table.',
                (field: any, context) => {
                    const assertedField = field as Field;
                    if (assertedField.config.type !== FieldType.MULTIPLE_RECORD_LINKS)
                        return true;
                    const requiredFieldName = context.path as CheckoutTableRequiredFieldName;
                    const mustLinkTo: TableName | undefined = fieldTypeLinks[requiredFieldName];
                    if (mustLinkTo === undefined)
                        return false;
                    console.log(`${requiredFieldName} must link to ${mustLinkTo} with id ${context.parent[mustLinkTo].id}`);
                    const currentlyLinkedTo: TableId = assertedField.config.options.linkedTableId;
                    console.log(`It currently links to ${currentlyLinkedTo}`);
                    return assertedField.config.options.linkedTableId === context.parent[mustLinkTo].id;
                }
            )
        ) as any as Yup.MixedSchema<Field>


    const configurationIdsSchema = Yup.object({
        [TableName.inventoryTable]: tableKeyIsPresentAndUnique,
        [TableName.userTable]: tableKeyIsPresentAndUnique,
        [TableName.checkoutsTable]: tableKeyIsPresentAndUnique,
        [CheckoutTableRequiredFieldName.linkedInventoryTableField]: checkoutTableRequiredFieldIsPresentAndUnique,
        [CheckoutTableRequiredFieldName.linkedUserTableField]: checkoutTableRequiredFieldIsPresentAndUnique,
        [CheckoutTableRequiredFieldName.checkedInField]: checkoutTableRequiredFieldIsPresentAndUnique,
        // [CheckoutTableOptionalFieldName.dateCheckedOutField]: string().optional(),
        // [CheckoutTableOptionalFieldName.dateDueField]: string().optional(),
        // [CheckoutTableOptionalFieldName.dateCheckedInField]: string().optional(),
        // deleteCheckoutsUponCheckIn: boolean().required()
    })

    const configurationTablesAndFieldsSchema = Yup.object({
        [TableName.inventoryTable]: tableExists,
        [TableName.userTable]: tableExists,
        [TableName.checkoutsTable]: tableExists,
        [CheckoutTableRequiredFieldName.linkedInventoryTableField]: fieldExistsAndIsValid,
        [CheckoutTableRequiredFieldName.linkedUserTableField]: fieldExistsAndIsValid,
        [CheckoutTableRequiredFieldName.checkedInField]: fieldExistsAndIsValid,
    });

    return {
        validateIdsAndTransformToTablesAndFieldsOrThrow(configurationIds: ExtensionConfigurationIds): ValidatedExtensionConfiguration {
            const validatedConfigIds = configurationIdsSchema.validateSync(configurationIds, {abortEarly: false})
            return configurationTablesAndFieldsSchema.validateSync(validatedConfigIds, {abortEarly: false});
        }
    }
}