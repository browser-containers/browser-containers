import { describe, it, expect } from "vitest";
import { createBufferShim } from "../src/buffer.ts";

describe("node-web-shims: buffer", () => {
  it("should match node:buffer type shape", () => {
    const shim = createBufferShim();
    const _nodeBuffer: typeof import("node:buffer") = shim;
    expect(_nodeBuffer).toBeDefined();
  });

  it("should export Buffer", () => {
    const shim = createBufferShim();
    expect(shim.Buffer).toBeDefined();
  });

  it("should export Blob", () => {
    const shim = createBufferShim();
    expect(shim.Blob).toBeDefined();
  });
});
