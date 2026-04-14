import { describe, it, expect } from "vitest";
import { createWorkerThreadsShim } from "../src/worker_threads.ts";

describe("node-web-shims: worker_threads", () => {
  it("should match node:worker_threads type shape", () => {
    const shim = createWorkerThreadsShim();
    const _nodeWorkerThreads: typeof import("node:worker_threads") = shim;
    expect(_nodeWorkerThreads).toBeDefined();
  });

  it("should export Worker", () => {
    const shim = createWorkerThreadsShim();
    expect(shim.Worker).toBeDefined();
  });

  it("should export isMainThread", () => {
    const shim = createWorkerThreadsShim();
    expect(typeof shim.isMainThread).toBe("boolean");
  });

  it("should export parentPort", () => {
    const shim = createWorkerThreadsShim();
    expect(shim.parentPort).toBeDefined();
  });

  it("should export workerData", () => {
    const shim = createWorkerThreadsShim();
    expect(shim.workerData).toBeDefined();
  });

  it("should export threadId", () => {
    const shim = createWorkerThreadsShim();
    expect(shim.threadId).toBeDefined();
  });
});
