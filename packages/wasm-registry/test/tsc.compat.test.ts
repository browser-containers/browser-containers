import { describe, it, expect } from 'vitest';
import { resolveWasmTool } from '../src/index';

describe('wasm-registry: tsc compatibility', () => {
  it('should transpile TypeScript to JavaScript', async () => {
    const tsc = await resolveWasmTool('tsc');
    expect(tsc).toBeDefined();

    const result = await tsc!.run(['const x: number = 1;']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('const x');
    expect(result.stderr).toBe('');
  });

  it('should handle type annotations', async () => {
    const tsc = await resolveWasmTool('tsc');
    expect(tsc).toBeDefined();

    const result = await tsc!.run(['interface User { name: string; } const u: User = { name: "test" };']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('const u');
    expect(result.stderr).toBe('');
  });

  it('should handle arrow functions', async () => {
    const tsc = await resolveWasmTool('tsc');
    expect(tsc).toBeDefined();

    const result = await tsc!.run(['const add = (a: number, b: number) => a + b;']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('const add');
    expect(result.stdout).toContain('=>');
    expect(result.stderr).toBe('');
  });

  it('should cache tool instance', async () => {
    const tool1 = await resolveWasmTool('tsc');
    const tool2 = await resolveWasmTool('tsc');
    expect(tool1).toBe(tool2);
  });
});
