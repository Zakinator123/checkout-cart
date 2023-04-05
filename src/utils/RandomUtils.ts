// "Polyfill" for Promise.allSettled
import toast from "react-hot-toast";

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

export const airtableMutationWrapper = (airtableMutator: () => Promise<unknown>): Promise<unknown> => {
    return new Promise((resolve, reject) => {
        console.log("Timeout was activated");
        const timeout = setTimeout(() => {
            toast.loading(`Airtable is taking a while to respond. Please check your network connection.
            
             You may need to refresh the browser and retry the attempted action.`, {duration: 6000})
        }, 10000);

        return airtableMutator()
            .then((fulfilledPromise) => resolve(fulfilledPromise))
            .catch((rejectedPromise) => reject(rejectedPromise))
            .finally(() => clearTimeout(timeout));
    });
}