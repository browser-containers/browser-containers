import { describe, it, expect } from "vitest";
import { nodeWebShims } from "../src/vite-plugin.ts";

describe("node-web-shims: vite-plugin", () => {
  it("should be a function", () => {
    expect(typeof nodeWebShims).toBe("function");
  });

  it("should return a Vite plugin", () => {
    const plugin = nodeWebShims();
    expect(plugin.name).toBe("@browser-containers/node-web-shims");
  });

  it("should have resolveId hook", () => {
    const plugin = nodeWebShims();
    expect(plugin.resolveId).toBeDefined();
  });

  it("should strip node: prefix from imports", () => {
    const plugin = nodeWebShims();
    const result = plugin.resolveId?.("node:crypto");
    expect(result).toBe("crypto");
  });

  it("should return null for non-node: imports", () => {
    const plugin = nodeWebShims();
    const result = plugin.resolveId?.("fs");
    expect(result).toBeNull();
  });
});
