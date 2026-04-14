import { describe, it, expect } from "vitest";
import { createStreamShim } from "../src/stream.ts";

describe("node-web-shims: stream", () => {
  it("should match node:stream type shape", () => {
    const shim = createStreamShim();
    const _nodeStream: typeof import("node:stream") = shim;
    expect(_nodeStream).toBeDefined();
  });

  it("should export Readable", () => {
    const shim = createStreamShim();
    expect(shim.Readable).toBeDefined();
  });

  it("should export Writable", () => {
    const shim = createStreamShim();
    expect(shim.Writable).toBeDefined();
  });

  it("should export Duplex", () => {
    const shim = createStreamShim();
    expect(shim.Duplex).toBeDefined();
  });

  it("should export Transform", () => {
    const shim = createStreamShim();
    expect(shim.Transform).toBeDefined();
  });
});
