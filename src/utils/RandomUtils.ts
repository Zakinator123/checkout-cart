// "Polyfill" for Promise.allSettled
export const allSettled = (promises: Promise<any>[]) => {
    let wrappedPromises = promises.map(p => Promise.resolve(p)
        .then(
            val => ({status: 'fulfilled', value: val}),
            err => ({status: 'rejected', reason: err})));
    return Promise.all(wrappedPromises);
};

export function mapValues<T extends object, V>(obj: T, valueMapper: (k: keyof T, v: T[keyof T]) => V) {
    return Object.fromEntries(
        Object.entries(obj).map(([k, v]) => [k, valueMapper(k as keyof T, v)])
    ) as { [K in keyof T]: V };
}

export const getRecordCardWidth = (viewportWidth: number) => Math.min(800, (viewportWidth > 600 ? viewportWidth - 340 : viewportWidth - 240));
