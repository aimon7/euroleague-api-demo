import { BATCH_A_METHODS } from "./batch-a"
import { BATCH_B_METHODS } from "./batch-b"
import { BATCH_C_METHODS } from "./batch-c"
import type { MethodDef } from "../types"

export const METHOD_CATALOG: MethodDef[] = [
  ...BATCH_A_METHODS,
  ...BATCH_B_METHODS,
  ...BATCH_C_METHODS,
]
