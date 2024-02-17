import { z } from "zod";

import { anyArray } from "../schemas.js";

export interface PersistenceRecord {
    // "u" instead of "usages" to save data transfer
    u: number[];
}

const schema = z.object({
    u: anyArray,
});

export namespace PersistenceRecord {
    export function validate(r: PersistenceRecord) {
        schema.parse(r);
    }
}
