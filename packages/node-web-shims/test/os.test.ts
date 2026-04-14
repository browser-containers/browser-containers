import { describe, it, expect } from "vitest";
import { createOsShim } from "../src/os.ts";

describe("node-web-shims: os", () => {
  it("should match node:os type shape", () => {
    const shim = createOsShim();
    const _nodeOs: typeof import("node:os") = shim;
    expect(_nodeOs).toBeDefined();
  });

  it("should export platform", () => {
    const shim = createOsShim();
    expect(typeof shim.platform).toBe("function");
  });

  it("should export arch", () => {
    const shim = createOsShim();
    expect(typeof shim.arch).toBe("function");
  });

  it("should export tmpdir", () => {
    const shim = createOsShim();
    expect(typeof shim.tmpdir).toBe("function");
  });

  it("should export homedir", () => {
    const shim = createOsShim();
    expect(typeof shim.homedir).toBe("function");
  });

  it("should export EOL", () => {
    const shim = createOsShim();
    expect(shim.EOL).toBeDefined();
  });
});
