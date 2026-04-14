import { describe, it, expect } from 'vitest';
import { SandboxPool } from './sandbox-pool';
import { VfsBus } from '@browser-containers/vfs-bus';

describe('SandboxPool', () => {
  it('runs plain JavaScript', async () => {
    const pool = new SandboxPool(new VfsBus());
    const out = await pool.run('const x = 42; x');
    expect(out.result).toBe('42');
  });

  it('runs TypeScript after stripping types', async () => {
    const pool = new SandboxPool(new VfsBus());
    const out = await pool.run('const x: number = 42; x');
    expect(out.result).toBe('42');
  });

  it('allows fs reads from VfsBus', async () => {
    const vfs = new VfsBus();
    await vfs.writeFile('/hello.txt', 'world');
    const pool = new SandboxPool(vfs);
    const out = await pool.run("fs.readFileSync('/hello.txt')");
    expect(out.result).toBe('world');
  });

  it('blocks fs writes', async () => {
    const pool = new SandboxPool(new VfsBus());
    const out = await pool.run("fs.writeFileSync('/x.txt', 'bad')");
    expect(out.error).toContain('Read-only');
  });

  it('enforces memory limit', async () => {
    const pool = new SandboxPool(new VfsBus());
    const out = await pool.run('const a = []; while(true) a.push(0);');
    expect(out.error).toBeTruthy();
  });

  it('returns error for invalid code', async () => {
    const pool = new SandboxPool(new VfsBus());
    const out = await pool.run('const x = ;');
    expect(out.error).toBeTruthy();
  });
});
