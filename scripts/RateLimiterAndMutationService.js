// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
class RateLimiter {
    constructor(maxRequests, interval) {
        this.fnQueue = [];
        this.queueScheduledToClear = false;
        this.executeLimitedNumberOfRequestsInQueue = () => {
            const queueLength = this.fnQueue.length;
            if (queueLength !== 0) {
                const promises = [];
                for (let i = 0; i < Math.min(queueLength, this._maxRequests); i++)
                    promises.push(this.fnQueue.shift()());
                Promise.all(promises).then(() => setTimeout(this.executeLimitedNumberOfRequestsInQueue, this._interval));
            }
            else
                this.queueScheduledToClear = false;
        };
        this.returnRateLimitedPromise = (fnToBeRateLimited) => {
            if (!this.queueScheduledToClear) {
                this.queueScheduledToClear = true;
                setTimeout(this.executeLimitedNumberOfRequestsInQueue, 0);
            }
            return new Promise((resolve, reject) => this.fnQueue.push(() => fnToBeRateLimited().then(resolve).catch(reject)));
        };
        this._maxRequests = maxRequests;
        this._interval = interval;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
class AirtableMutationService {
    constructor(rateLimiter) {
        this.BATCH_SIZE = 50;
        this.batchWriteRecords = async (recordsOrRecordIds, batchWriteOperation) => {
            let i = 0;
            const fulfilledPromiseValues = [];
            while (i < recordsOrRecordIds.length) {
                const recordBatch = recordsOrRecordIds.slice(i, Math.min(recordsOrRecordIds.length, i + this.BATCH_SIZE));
                fulfilledPromiseValues.push(await batchWriteOperation(recordBatch));
                i += this.BATCH_SIZE;
            }
            return fulfilledPromiseValues;
        };
        this.updateRecordsInTableAsync = (table, recordsToUpdate) => this._rateLimiter.returnRateLimitedPromise(() => this.batchWriteRecords(recordsToUpdate, table.updateRecordsAsync.bind(table))).then();
        this.deleteRecordsInTableAsync = (table, recordIdsToDelete) => this._rateLimiter.returnRateLimitedPromise(() => this.batchWriteRecords(recordIdsToDelete, table.deleteRecordsAsync.bind(table))).then();
        this.createRecordsInTableAsync = (table, recordsToCreate) => this._rateLimiter.returnRateLimitedPromise(() => this.batchWriteRecords(recordsToCreate, table.createRecordsAsync.bind(table))).then(test => test.flat());
        this.updateRecordInTableAsync = async (table, recordId, fields) => this._rateLimiter.returnRateLimitedPromise(() => table.updateRecordAsync(recordId, fields));
        this.deleteRecordInTableAsync = async (table, recordId) => this._rateLimiter.returnRateLimitedPromise(() => table.deleteRecordAsync(recordId));
        this.createRecordInTableAsync = async (table, fields) => this._rateLimiter.returnRateLimitedPromise(() => table.createRecordAsync(fields));
        this._rateLimiter = rateLimiter;
    }
}