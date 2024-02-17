import { z } from "zod";

export interface FirebaseFunctionsRateLimiterConfiguration {
    name?: string;
    periodSeconds?: number;
    maxCalls?: number;
    debug?: boolean;
}

export namespace FirebaseFunctionsRateLimiterConfiguration {
    export interface ConfigurationFull extends FirebaseFunctionsRateLimiterConfiguration {
        name: string;
        periodSeconds: number;
        maxCalls: number;
        debug: boolean;
    }

    export namespace ConfigurationFull {
        const schema = z.object({
            name: z.string().min(0),
            periodSeconds: z.number().int().finite().gt(0),
            maxCalls: z.number().int().finite().gt(0),
            debug: z.boolean(),
        });

        export function validate(o: ConfigurationFull & FirebaseFunctionsRateLimiterConfiguration) {
            schema.parse(o);
        }
    }

    export const DEFAULT_CONFIGURATION: ConfigurationFull = {
        name: "rlimit",
        periodSeconds: 5 * 60,
        maxCalls: 5,
        debug: false,
    };
}
