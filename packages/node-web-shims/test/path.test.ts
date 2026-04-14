import { describe, it, expect } from "vitest";
import { createPathShim } from "../src/path.ts";

describe("node-web-shims: path", () => {
  it("should match node:path type shape", () => {
    const shim = createPathShim();
    const _nodePath: typeof import("node:path") = shim;
    expect(_nodePath).toBeDefined();
  });

  it("should export join", () => {
    const shim = createPathShim();
    expect(typeof shim.join).toBe("function");
  });

  it("should export resolve", () => {
    const shim = createPathShim();
    expect(typeof shim.resolve).toBe("function");
  });

  it("should export basename", () => {
    const shim = createPathShim();
    expect(typeof shim.basename).toBe("function");
  });

  it("should export dirname", () => {
    const shim = createPathShim();
    expect(typeof shim.dirname).toBe("function");
  });
});
