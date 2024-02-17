import { z } from "zod";

export const anyObject = z.record(z.any());
export const anyArray = z.array(z.any());
