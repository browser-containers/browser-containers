import { describe, it, expect } from "vitest";
import { createUrlShim } from "../src/url.ts";

describe("node-web-shims: url", () => {
  it("should match node:url type shape", () => {
    const shim = createUrlShim();
    const _nodeUrl: typeof import("node:url") = shim;
    expect(_nodeUrl).toBeDefined();
  });

  it("should export URL", () => {
    const shim = createUrlShim();
    expect(shim.URL).toBeDefined();
  });

  it("should export URLSearchParams", () => {
    const shim = createUrlShim();
    expect(shim.URLSearchParams).toBeDefined();
  });

  it("should export parse", () => {
    const shim = createUrlShim();
    expect(typeof shim.parse).toBe("function");
  });

  it("should export format", () => {
    const shim = createUrlShim();
    expect(typeof shim.format).toBe("function");
  });
});
