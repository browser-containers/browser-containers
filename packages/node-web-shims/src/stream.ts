// @ts-expect-error - unenv runtime modules lack proper TypeScript declarations
import stream from "unenv/runtime/node/stream";

export const createStreamShim = (): typeof stream => {
  return stream;
};

export default createStreamShim();
