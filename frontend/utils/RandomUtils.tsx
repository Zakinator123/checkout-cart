import {Table} from "@airtable/blocks/models";

export const getTableFields = (table: Table, fieldNames: string[]) => fieldNames.map(fieldName => table.getField(fieldName));