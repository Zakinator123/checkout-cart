import {getEntries, mapValues} from "../utils/RandomUtils";
import {FieldId, TableId} from "@airtable/blocks/types";
import {Base, Field, FieldType, Table} from "@airtable/blocks/models";
import {ExpectedAppConfigFieldTypeMapping, fieldTypeLinks} from "../utils/Constants";
import {AppConfigIds, TableName, ValidatedAppConfig} from "../types/ConfigurationTypes";

export const validateConfig: ((extensionConfig: AppConfigIds, base: Base) => ValidatedAppConfig | undefined) = (extensionConfig, base) => {
    try {
        const tables: ValidatedAppConfig['tables'] = mapValues(extensionConfig.tables, (tableId: TableId): Table => base.getTableById(tableId));
        const checkoutsTable: Table = tables.checkoutsTable;
        const checkoutTableRequiredFields: ValidatedAppConfig['checkoutTableFields']['required'] =
            mapValues(
                extensionConfig.checkoutTableFields.required,
                (fieldId: FieldId): Field => checkoutsTable.getFieldById(fieldId)
            );

        const checkoutTableOptionalFields: ValidatedAppConfig['checkoutTableFields']['optional'] =
            mapValues(
                extensionConfig.checkoutTableFields.optional,
                (fieldId?: FieldId): Field | undefined => {
                    if (fieldId != undefined) {
                        const optionalField = checkoutsTable.getFieldByIdIfExists(fieldId);
                        if (optionalField === null) throw new Error();
                        return optionalField;
                    }
                    return undefined;
                }
            );

        getEntries(checkoutTableRequiredFields).forEach(([fieldName, field]) => {
            if (field.type !== ExpectedAppConfigFieldTypeMapping[fieldName]) throw new Error();
            if (field.config.type === FieldType.MULTIPLE_RECORD_LINKS) {
                const tableName = fieldTypeLinks[fieldName] as TableName;
                if (field.config.options.linkedTableId !== tables[tableName].id) throw new Error();
            }
        });

        // TODO: Figure out how to simplify this
        getEntries(checkoutTableOptionalFields).forEach(optionalField => {
            if (optionalField === undefined) return;
            const [fieldName, field] = optionalField;
            if (field === undefined || fieldName === undefined) return;
            if (field.type !== ExpectedAppConfigFieldTypeMapping[fieldName]) throw new Error();
        });

        return {
            tables: tables,
            checkoutTableFields: {required: checkoutTableRequiredFields, optional: checkoutTableOptionalFields},
            deleteCheckoutsUponCheckInBoolean: extensionConfig.deleteCheckoutsUponCheckInBoolean
        }
    } catch {
        return undefined;
    }
}