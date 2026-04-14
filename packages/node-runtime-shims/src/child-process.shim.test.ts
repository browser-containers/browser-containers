import { describe, it, expect } from 'vitest';
import { createChildProcessShim } from './child-process-shim.js';
import type child_process from 'node:child_process';

describe('child_process shim', () => {
  it('spawn uses registry when available', async () => {
    const registry = {
      dispatch: async (_cmd: string, _args: string[]) => ({ stdout: 'ok', stderr: '', exitCode: 0 }),
    };
    const shim = createChildProcessShim(registry);
    const _typeCheck: typeof child_process = shim as unknown as typeof child_process;
    void _typeCheck;

    let exitCode: number | null = null;
    const child = shim.spawn('tsc', ['--version']);
    child.on('close', (code) => { exitCode = code; });
    await new Promise((r) => setTimeout(r, 10));
    expect(exitCode).toBe(0);
  });

  it('spawn falls back to shell service', async () => {
    const shell = {
      exec: async (_cmd: string, _args: string[]) => ({ stdout: 'out', stderr: '', exitCode: 0 }),
    };
    const shim = createChildProcessShim(undefined, shell);

    let exitCode: number | null = null;
    const child = shim.spawn('echo', ['hello']);
    child.on('close', (code) => { exitCode = code; });
    await new Promise((r) => setTimeout(r, 10));
    expect(exitCode).toBe(0);
  });

  it('spawn errors when no registry or shell', async () => {
    const shim = createChildProcessShim();

    let exitCode: number | null = null;
    const child = shim.spawn('unknown', []);
    child.on('close', (code) => { exitCode = code; });
    await new Promise((r) => setTimeout(r, 10));
    expect(exitCode).toBe(1);
  });
});
