import { describe, it, expect } from 'vitest';
import { resolveWasmTool } from '../src/index';

describe('wasm-registry: swc compatibility', () => {
  it('should transform JavaScript code', async () => {
    const swc = await resolveWasmTool('swc');
    expect(swc).toBeDefined();

    const result = await swc!.run(['const x = 1 + 2;']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('const x');
    expect(result.stderr).toBe('');
  });

  it('should handle TypeScript syntax', async () => {
    const swc = await resolveWasmTool('swc');
    expect(swc).toBeDefined();

    const result = await swc!.run(['const x: number = 1;']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('const x');
    expect(result.stderr).toBe('');
  });

  it('should handle arrow functions', async () => {
    const swc = await resolveWasmTool('swc');
    expect(swc).toBeDefined();

    const result = await swc!.run(['const add = (a: number, b: number) => a + b;']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('const add');
    expect(result.stdout).toContain('=>');
    expect(result.stderr).toBe('');
  });

  it('should cache tool instance', async () => {
    const tool1 = await resolveWasmTool('swc');
    const tool2 = await resolveWasmTool('swc');
    expect(tool1).toBe(tool2);
  });
});
