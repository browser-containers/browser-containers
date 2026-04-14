import { Thread } from "threads.js";

/**
 * Creates a node:worker_threads shim using threads.js.
 *
 * This provides a minimal implementation of node:worker_threads using threads.js.
 * Note: This is a simplified implementation and may not cover all worker_threads features.
 *
 * @example
 * ```ts
 * const { Worker, isMainThread, parentPort, workerData } = createWorkerThreadsShim();
 * ```
 */
export const createWorkerThreadsShim = () => {
  const isMainThread = true;
  const parentPort = null;
  const workerData = null;

  class Worker {
    readonly _worker: any;
    readonly _listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

    constructor(filename: string, options?: Record<string, unknown>) {
      this._worker = filename;
      this._listeners.set("message", new Set());
      this._listeners.set("error", new Set());
    }

    postMessage(message: unknown, transfer?: unknown[]): void {
      const listeners = this._listeners.get("message");
      if (listeners) {
        listeners.forEach((listener) => {
          try {
            listener(message);
          } catch (error) {
            const errorListeners = this._listeners.get("error");
            if (errorListeners) {
              errorListeners.forEach((errorListener) => {
                errorListener(error);
              });
            }
          }
        });
      }
    }

    on(event: string, listener: (...args: any[]) => void): this {
      const listeners = this._listeners.get(event) || new Set();
      listeners.add(listener);
      this._listeners.set(event, listeners);
      return this;
    }

    once(event: string, listener: (...args: any[]) => void): this {
      const onceListener = (...args: unknown[]) => {
        listener(...args);
        this.off(event, onceListener);
      };
      return this.on(event, onceListener);
    }

    off(event: string, listener: (...args: any[]) => void): this {
      const listeners = this._listeners.get(event);
      if (listeners) {
        listeners.delete(listener);
      }
      return this;
    }

    terminate(): Promise<number> {
      return Promise.resolve(0);
    }
  }

  const receiveMessageOnPort = (port: unknown): unknown => {
    return undefined;
  };

  const threadId = "0";

  return {
    Worker,
    isMainThread,
    parentPort,
    workerData,
    receiveMessageOnPort,
    threadId,
    resourceLimits: {
      maxYoungGenerationSizeMb: 0,
      maxOldGenerationSizeMb: 0,
      codeRangeSizeMb: 0,
      stackSizeMb: 0,
    },
    setEnvironmentData: (key: number, value: unknown): void => {},
    getEnvironmentData: (key: number): unknown => undefined,
  };
};

export default createWorkerThreadsShim();
