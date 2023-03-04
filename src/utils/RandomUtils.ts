import {Table} from "@airtable/blocks/models";

export const getTableFields = (table: Table, fieldNames: string[]) => fieldNames.map(fieldName => table.getField(fieldName));

// "Polyfill" for Promise.allSettled
export function allSettled(promises: Promise<any>[]) {
    let wrappedPromises = promises.map(p => Promise.resolve(p)
        .then(
            val => ({ status: 'fulfilled', value: val }),
            err => ({ status: 'rejected', reason: err })));
    return Promise.all(wrappedPromises);
}