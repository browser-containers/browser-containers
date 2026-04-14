// @ts-expect-error - unenv runtime modules lack proper TypeScript declarations
import path from "unenv/runtime/node/path";

export const createPathShim = (): typeof path => {
  return path;
};

export default createPathShim();
