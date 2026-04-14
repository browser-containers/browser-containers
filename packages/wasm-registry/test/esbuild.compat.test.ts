import { describe, it, expect } from 'vitest';
import { resolveWasmTool } from '../src/index';

describe('wasm-registry: esbuild compatibility', () => {
  it('should transform JavaScript code', async () => {
    const esbuild = await resolveWasmTool('esbuild');
    expect(esbuild).toBeDefined();

    const result = await esbuild!.run(['const x = 1 + 2;']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('x=3');
    expect(result.stderr).toBe('');
  });

  it('should handle TypeScript syntax', async () => {
    const esbuild = await resolveWasmTool('esbuild');
    expect(esbuild).toBeDefined();

    const result = await esbuild!.run(['const x: number = 1;']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('const x');
    expect(result.stderr).toBe('');
  });

  it('should cache tool instance', async () => {
    const tool1 = await resolveWasmTool('esbuild');
    const tool2 = await resolveWasmTool('esbuild');
    expect(tool1).toBe(tool2);
  });

  it('should export createWasmRegistry function', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.createWasmRegistry).toBe('function');
  });

  it('should export registerWasmTool function', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.registerWasmTool).toBe('function');
  });

  it('should export resolveWasmTool function', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.resolveWasmTool).toBe('function');
  });

  it('should export clearCache function', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.clearCache).toBe('function');
  });

  it('should export getRegisteredToolNames function', async () => {
    const mod = await import('../src/index');
    expect(typeof mod.getRegisteredToolNames).toBe('function');
  });
});
