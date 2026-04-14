import { describe, it, expect, beforeEach } from 'vitest';
import { VfsBus } from './vfs-bus.js';

describe('VfsBus', () => {
  let vfs: VfsBus;

  beforeEach(() => {
    vfs = new VfsBus();
  });

  it('writeFile and readFile round-trip', async () => {
    await vfs.writeFile('/hello.txt', 'world');
    const data = await vfs.readFile('/hello.txt');
    expect(data).toBe('world');
  });

  it('writeFile with Uint8Array', async () => {
    await vfs.writeFile('/binary.bin', new Uint8Array([1, 2, 3]));
    const data = await vfs.readFile('/binary.bin');
    expect(data).toBe('\x01\x02\x03');
  });

  it('mkdir creates directories', async () => {
    await vfs.mkdir('/src');
    const exists = await vfs.exists('/src');
    expect(exists).toBe(true);
  });

  it('mkdir recursive creates nested directories', async () => {
    await vfs.mkdir('/a/b/c', { recursive: true });
    const exists = await vfs.exists('/a/b/c');
    expect(exists).toBe(true);
  });

  it('exists returns false for missing files', async () => {
    const exists = await vfs.exists('/nope');
    expect(exists).toBe(false);
  });

  it('readdir returns directory entries', async () => {
    await vfs.mkdir('/src');
    await vfs.writeFile('/src/a.ts', 'a');
    await vfs.writeFile('/src/b.ts', 'b');
    const entries = await vfs.readdir('/src');
    expect(entries.sort()).toEqual(['a.ts', 'b.ts']);
  });

  it('rm removes files', async () => {
    await vfs.writeFile('/tmp.txt', 'x');
    await vfs.rm('/tmp.txt');
    const exists = await vfs.exists('/tmp.txt');
    expect(exists).toBe(false);
  });

  it('rm recursive removes directories', async () => {
    await vfs.mkdir('/del', { recursive: true });
    await vfs.writeFile('/del/f.txt', 'f');
    await vfs.rm('/del', { recursive: true });
    const exists = await vfs.exists('/del');
    expect(exists).toBe(false);
  });
});
