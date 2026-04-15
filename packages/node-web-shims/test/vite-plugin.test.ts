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

  it("should resolve node: imports to dist path for shimmed builtins", () => {
    const plugin = nodeWebShims();
    const result = plugin.resolveId?.("node:crypto") as string;
    expect(result).toBeDefined();
    expect(result).toMatch(/\/dist\/crypto\.js$/);
  });

  it("should return null for non-shimmed bare imports", () => {
    const plugin = nodeWebShims();
    const result = plugin.resolveId?.("fs");
    expect(result).toBeNull();
  });

  it("should resolve shimmed bare builtins to dist path", () => {
    const plugin = nodeWebShims();
    const result = plugin.resolveId?.("path") as string;
    expect(result).toBeDefined();
    expect(result).toMatch(/\/dist\/path\.js$/);
  });
});
