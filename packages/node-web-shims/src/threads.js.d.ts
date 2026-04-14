declare module "threads.js" {
  export interface Thread {
    spawn(config: {
      data: unknown;
      move?: unknown[];
      fn: (data: unknown) => unknown;
    }): Promise<unknown>;
  }

  export const Thread: Thread;
}
