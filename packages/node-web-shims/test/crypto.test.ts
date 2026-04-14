import { describe, it, expect } from "vitest";
import { createCryptoShim } from "../src/crypto.ts";

describe("node-web-shims: crypto", () => {
  it("should match node:crypto type shape", () => {
    const shim = createCryptoShim();
    const _nodeCrypto: typeof import("node:crypto") = shim;
    expect(_nodeCrypto).toBeDefined();
  });

  it("should export createHash", () => {
    const shim = createCryptoShim();
    expect(typeof shim.createHash).toBe("function");
  });

  it("should export randomBytes", () => {
    const shim = createCryptoShim();
    expect(typeof shim.randomBytes).toBe("function");
  });
});
