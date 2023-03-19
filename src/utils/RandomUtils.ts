import {Table} from "@airtable/blocks/models";

export const getTableFields = (table: Table, fieldNames: string[]) => fieldNames.map(fieldName => table.getField(fieldName));

// "Polyfill" for Promise.allSettled
export const allSettled = (promises: Promise<any>[]) => {
    let wrappedPromises = promises.map(p => Promise.resolve(p)
        .then(
            val => ({ status: 'fulfilled', value: val }),
            err => ({ status: 'rejected', reason: err })));
    return Promise.all(wrappedPromises);
};

export function mapValues<T extends object, V>(obj: T, valueMapper: (k: T[keyof T]) => V) {
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, valueMapper(v)])
    ) as { [K in keyof T]: V };
}

type Entries<T> = {
    [K in keyof T]: [K, T[K]];
}[keyof T][];

export const getEntries = <T extends object>(obj: T) => Object.entries(obj) as Entries<T>;