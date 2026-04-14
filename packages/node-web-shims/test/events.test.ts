import { describe, it, expect } from "vitest";
import { createEventsShim } from "../src/events.ts";

describe("node-web-shims: events", () => {
  it("should match node:events type shape", () => {
    const shim = createEventsShim();
    const _nodeEvents: typeof import("node:events") = shim;
    expect(_nodeEvents).toBeDefined();
  });

  it("should export EventEmitter", () => {
    const shim = createEventsShim();
    expect(shim.EventEmitter).toBeDefined();
  });

  it("should export once", () => {
    const shim = createEventsShim();
    expect(typeof shim.once).toBe("function");
  });
});
