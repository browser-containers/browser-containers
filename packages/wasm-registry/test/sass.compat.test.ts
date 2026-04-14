import { describe, it, expect } from 'vitest';
import { resolveWasmTool } from '../src/index';

describe('wasm-registry: sass compatibility', () => {
  it('should compile SCSS to CSS', async () => {
    const sass = await resolveWasmTool('sass');
    expect(sass).toBeDefined();

    const result = await sass!.run(['$color: red; .test { color: $color; }', '--scss']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('.test');
    expect(result.stdout).toContain('color: red');
    expect(result.stderr).toBe('');
  });

  it('should handle nesting', async () => {
    const sass = await resolveWasmTool('sass');
    expect(sass).toBeDefined();

    const result = await sass!.run(['.parent { .child { color: blue; } }', '--scss']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('.parent .child');
    expect(result.stderr).toBe('');
  });

  it('should support indented syntax', async () => {
    const sass = await resolveWasmTool('sass');
    expect(sass).toBeDefined();

    const result = await sass!.run(['.test\n  color: red']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('.test');
    expect(result.stdout).toContain('color: red');
    expect(result.stderr).toBe('');
  });

  it('should cache tool instance', async () => {
    const tool1 = await resolveWasmTool('sass');
    const tool2 = await resolveWasmTool('sass');
    expect(tool1).toBe(tool2);
  });
});
