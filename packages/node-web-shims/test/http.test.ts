import { describe, it, expect } from "vitest";
import { createHttpShim } from "../src/http.ts";

describe("node-web-shims: http", () => {
  it("should match node:http type shape", () => {
    const shim = createHttpShim();
    const _nodeHttp: typeof import("node:http") = shim;
    expect(_nodeHttp).toBeDefined();
  });

  it("should export request", () => {
    const shim = createHttpShim();
    expect(typeof shim.request).toBe("function");
  });

  it("should export get", () => {
    const shim = createHttpShim();
    expect(typeof shim.get).toBe("function");
  });
});
