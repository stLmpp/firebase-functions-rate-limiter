import { FirebaseFunctionsRateLimiterConfiguration } from "./FirebaseFunctionsRateLimiterConfiguration.js";
import { PersistenceProvider } from "./persistence/PersistenceProvider.js";
import { PersistenceRecord } from "./persistence/PersistenceRecord.js";
import { anyObject } from "./schemas.js";
import { TimestampProvider } from "./timestamp/TimestampProvider.js";

export class GenericRateLimiter {
    private configuration: FirebaseFunctionsRateLimiterConfiguration.ConfigurationFull;
    private persistenceProvider: PersistenceProvider;
    private timestampProvider: TimestampProvider;
    private debugFn: (msg: string) => void;

    public constructor(
        configuration: FirebaseFunctionsRateLimiterConfiguration,
        persistenceProvider: PersistenceProvider,
        timestampProvider: TimestampProvider,
        debugFn: (msg: string) => void = (msg: string) => {
            /* */
        },
    ) {
        this.configuration = { ...FirebaseFunctionsRateLimiterConfiguration.DEFAULT_CONFIGURATION, ...configuration };
        anyObject.parse(this.configuration);
        FirebaseFunctionsRateLimiterConfiguration.ConfigurationFull.validate(this.configuration);

        this.persistenceProvider = persistenceProvider;
        anyObject.parse(this.persistenceProvider);

        this.timestampProvider = timestampProvider;
        anyObject.parse(this.timestampProvider);

        this.debugFn = debugFn;
    }

    public async isQuotaExceededOrRecordCall(qualifier: string): Promise<boolean> {
        const resultHolder = {
            isQuotaExceeded: false,
        };
        await this.persistenceProvider.updateAndGet(this.configuration.name, qualifier, (record) => {
            return this.runTransactionForAnswer(record, resultHolder);
        });

        return resultHolder.isQuotaExceeded;
    }

    public async isQuotaAlreadyExceededDoNotRecordCall(qualifier: string): Promise<boolean> {
        const timestampsSeconds = this.getTimestampsSeconds();
        const record = await this.persistenceProvider.get(this.configuration.name, qualifier);
        const recentUsages: number[] = this.selectRecentUsages(record.u, timestampsSeconds.threshold);
        return this.isQuotaExceeded(recentUsages.length);
    }

    private runTransactionForAnswer(
        input: PersistenceRecord,
        resultHolder: { isQuotaExceeded: boolean },
    ): PersistenceRecord {
        const timestampsSeconds = this.getTimestampsSeconds();

        this.debugFn("Got record with usages " + input.u.length);

        const recentUsages: number[] = this.selectRecentUsages(input.u, timestampsSeconds.threshold);
        this.debugFn("Of these usages there are" + recentUsages.length + " usages that count into period");

        const result = this.isQuotaExceeded(recentUsages.length);
        resultHolder.isQuotaExceeded = result;
        this.debugFn("The result is quotaExceeded=" + result);

        if (!result) {
            this.debugFn("Quota was not exceeded, so recording a usage at " + timestampsSeconds.current);
            recentUsages.push(timestampsSeconds.current);
        }

        return {
            u: recentUsages,
        };
    }

    private selectRecentUsages(allUsages: number[], timestampThresholdSeconds: number): number[] {
        const recentUsages: number[] = [];

        for (const usageTime of allUsages) {
            if (usageTime > timestampThresholdSeconds) {
                recentUsages.push(usageTime);
            }
        }
        return recentUsages;
    }

    private isQuotaExceeded(numOfRecentUsages: number): boolean {
        return numOfRecentUsages >= this.configuration.maxCalls;
    }

    private getTimestampsSeconds(): { current: number; threshold: number } {
        const currentServerTimestampSeconds: number = this.timestampProvider.getTimestampSeconds();
        return {
            current: currentServerTimestampSeconds,
            threshold: currentServerTimestampSeconds - this.configuration.periodSeconds,
        };
    }
}
