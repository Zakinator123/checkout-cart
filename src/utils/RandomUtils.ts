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

export const getRecordCardWidth = (viewportWidth: number) => Math.min(850, (viewportWidth > 600 ? viewportWidth - 250 : viewportWidth - 180));


export const asyncAirtableOperationWrapper = (asyncAirtableOperation: () => Promise<unknown>): Promise<unknown> => {
    /*
    * This function wraps an async Airtable operation so that an alert is shown after 15 seconds if the promise is still pending.
    * The original promise from the async operation is forwarded to the caller.
    * This is useful when a user's network connection goes offline before executing
    * a write (or read?) operation to airtable (e.g. update a record, set global config).
    * The Airtable SDK does not reject the promise if the network connection is offline, and instead continually retries the operation.
    * This means that the user is left waiting for the promise to resolve (both in scripts and in extensions if you set a loading state).
    * Further, it seems that Airtable uses an exponential backoff strategy for retries,
    * so if the network connection is offline for 4 seconds, then the user has to wait 8 seconds for the next retry.
    * But if the network is offline for 2 minutes for instance, then the user has to wait 4 minutes until the next retry occurs.
    * Thus, it may be helpful in some cases to give the user some feedback that they should fix their internet connection and that they may need
    *  to refresh the browser and retry the operation (so that they're not just left hanging for 4 minutes even after network connection is restored).
    */
    return new Promise((resolve, reject) => {
        let toastId: string | undefined = undefined;
        const timeout = setTimeout(() => {
            toastId = toast.loading(`Airtable is taking a while to respond. Please check your network connection.
            
             You may need to refresh the browser and retry the attempted action.`, {duration: 10000000})
        }, 15000);

        return asyncAirtableOperation()
            .then((fulfilledPromise) => resolve(fulfilledPromise))
            .catch((rejectedPromise) => reject(rejectedPromise))
            .finally(() => {
                if (toastId !== undefined) toast.dismiss(toastId);
                clearTimeout(timeout);
            });
    });
}