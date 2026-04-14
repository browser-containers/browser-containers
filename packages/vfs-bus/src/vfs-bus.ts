import { createFsFromVolume, Volume } from 'memfs';
import { OpfsWorker } from './opfs-worker.js';

export type VfsBusHandler = (event: { type: 'write' | 'delete' | 'rename'; path: string }) => void;
export type WatchHandler = (path: string, event: 'add' | 'change' | 'unlink') => void;

export interface VfsBusMiddleware {
  (ctx: { path: string; operation: string }, next: () => void): void;
}

export class VfsBus {
  readonly vol = new Volume();
  readonly hot = createFsFromVolume(this.vol);
  readonly cold = new OpfsWorker();
  private handlers: VfsBusHandler[] = [];
  private watchers: { glob: string; handler: WatchHandler }[] = [];
  private middlewares: VfsBusMiddleware[] = [];

  use(mw: VfsBusMiddleware) { this.middlewares.push(mw); }

  private runMiddleware(path: string, operation: string, action: () => void) {
    let idx = 0;
    const next = () => {
      if (idx >= this.middlewares.length) action();
      else {
        const mw = this.middlewares[idx++];
        mw({ path, operation }, next);
      }
    };
    next();
  }

  async writeFile(path: string, content: string | Uint8Array) {
    const dir = path.substring(0, path.lastIndexOf('/'));
    if (dir && !this.hot.existsSync(dir)) {
      this.hot.mkdirSync(dir, { recursive: true });
    }
    this.runMiddleware(path, 'writeFile', () => {
      this.hot.writeFileSync(path, content);
    });
    this.emit('write', path);
    this.notifyWatchers(path, 'add');
  }

  async readFile(path: string): Promise<string | Uint8Array> {
    return this.hot.readFileSync(path, 'utf8') as string;
  }

  async mkdir(path: string, opts?: { recursive?: boolean }) {
    this.runMiddleware(path, 'mkdir', () => {
      this.hot.mkdirSync(path, { recursive: opts?.recursive ?? false });
    });
    this.emit('write', path);
  }

  async rm(path: string, opts?: { recursive?: boolean }) {
    this.runMiddleware(path, 'rm', () => {
      this.hot.rmSync(path, { recursive: opts?.recursive ?? false });
    });
    this.emit('delete', path);
    this.notifyWatchers(path, 'unlink');
  }

  async exists(path: string): Promise<boolean> {
    return this.hot.existsSync(path) as boolean;
  }

  async readdir(path: string): Promise<string[]> {
    return this.hot.readdirSync(path) as string[];
  }

  on(event: 'write' | 'delete' | 'rename', handler: VfsBusHandler) {
    const wrapped: VfsBusHandler = (e) => { if (e.type === event) handler(e); };
    this.handlers.push(wrapped);
  }

  private emit(type: 'write' | 'delete' | 'rename', path: string) {
    for (const h of this.handlers) h({ type, path });
  }

  watch(glob: string, handler: WatchHandler) {
    this.watchers.push({ glob, handler });
    return { close: () => {
      this.watchers = this.watchers.filter(w => w !== this.watchers.find(w2 => w2.glob === glob && w2.handler === handler));
    }};
  }

  private notifyWatchers(path: string, event: 'add' | 'change' | 'unlink') {
    for (const w of this.watchers) {
      if (this.matchGlob(path, w.glob)) w.handler(path, event);
    }
  }

  private matchGlob(path: string, glob: string): boolean {
    if (glob === '**') return true;
    if (glob.startsWith('*') && glob.endsWith('*')) return path.includes(glob.slice(1, -1));
    if (glob.startsWith('*')) return path.endsWith(glob.slice(1));
    if (glob.endsWith('*')) return path.startsWith(glob.slice(0, -1));
    return path === glob;
  }

  snapshot(): Record<string, any> {
    return this.vol.toJSON();
  }

  restore(snap: Record<string, any>) {
    this.vol.reset();
    this.vol.fromJSON(snap, '/');
  }
}

export const vfsRegistry = new VfsBus();
