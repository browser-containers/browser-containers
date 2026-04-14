import { getQuickJS, type QuickJSContext, type QuickJSHandle } from 'quickjs-emscripten';
import type { VfsBus } from '@browser-containers/vfs-bus';

export interface SandboxRunResult {
  result?: string;
  error?: string;
}

export class SandboxPool {
  constructor(private vfs: VfsBus) {}

  async run(code: string): Promise<SandboxRunResult> {
    const QuickJS = await getQuickJS();
    const runtime = QuickJS.newRuntime();
    runtime.setMemoryLimit(16 * 1024 * 1024);
    runtime.setMaxStackSize(1024 * 1024);

    let ops = 0;
    runtime.setInterruptHandler(() => {
      ops++;
      return ops > 1_000_000;
    });

    const context = runtime.newContext();
    let disposed = false;

    const cleanup = () => {
      if (!disposed) {
        disposed = true;
        try { context.dispose(); } catch { /* noop: lifetime may already be freed by QuickJS on error */ }
        try { runtime.dispose(); } catch { /* noop: lifetime may already be freed by QuickJS on error */ }
      }
    };

    try {
      this.injectFsShim(context);
      const stripped = this.stripTypes(code);
      const wrapped = this.wrapInIife(stripped);
      const evalResult = context.evalCode(wrapped);

      if (evalResult.error) {
        let errMsg: string;
        try {
          const errHandle = evalResult.error;
          errMsg = context.getString(context.getProp(errHandle, 'message'));
          errHandle.dispose();
        } catch {
          errMsg = 'Unknown error';
        }
        cleanup();
        return { error: errMsg };
      }

      let result: string | undefined;
      if (evalResult.value) {
        const valHandle = evalResult.value;
        const typeTag = context.typeof(valHandle);
        if (typeTag === 'string') {
          result = context.getString(valHandle);
        } else if (typeTag === 'number') {
          result = String(context.getNumber(valHandle));
        } else if (typeTag === 'boolean') {
          result = String(context.dump(valHandle));
        } else if (typeTag === 'undefined') {
          result = 'undefined';
        }
        valHandle.dispose();
      }

      cleanup();
      return { result };
    } catch (e) {
      cleanup();
      return { error: (e as Error).message ?? String(e) };
    }
  }

  private injectFsShim(context: QuickJSContext): void {
    const fsHandle = context.newObject();

    const readFileSync = context.newFunction('readFileSync', (pathHandle: QuickJSHandle) => {
      const path = context.getString(pathHandle);
      const content = this.vfs.vol.readFileSync(path, 'utf8');
      return context.newString(content as string);
    });
    context.setProp(fsHandle, 'readFileSync', readFileSync);
    readFileSync.dispose();

    const writeBlocker = context.newFunction('writeFileSync', () => {
      throw new Error('Read-only VFS: write access is blocked');
    });
    context.setProp(fsHandle, 'writeFileSync', writeBlocker);
    writeBlocker.dispose();

    const mkdirBlocker = context.newFunction('mkdirSync', () => {
      throw new Error('Read-only VFS: write access is blocked');
    });
    context.setProp(fsHandle, 'mkdirSync', mkdirBlocker);
    mkdirBlocker.dispose();

    const rmBlocker = context.newFunction('rmSync', () => {
      throw new Error('Read-only VFS: write access is blocked');
    });
    context.setProp(fsHandle, 'rmSync', rmBlocker);
    rmBlocker.dispose();

    context.setProp(context.global, 'fs', fsHandle);
    fsHandle.dispose();
  }

  private stripTypes(code: string): string {
    return code
      .replace(/\bexport\s+(type|interface)\s+[\s\S]*?(\{|=)[\s\S]*?\}/g, '')
      .replace(/\b(type|interface)\s+\w+(\s*<[^>]*>)?\s*(\{|=)[\s\S]*?\}/g, '')
      .replace(/\bimport\s+type\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
      .replace(/:\s*(?:'[^']*'|"[^"]*"|\w+(?:<[^>]*>)?(?:\[\])?(?:\s*\|\s*(?:'[^']*'|"[^"]*"|\w+(?:<[^>]*>)?(?:\[\])?))*)/g, '')
      .replace(/\bas\s+\w+/g, '')
      .replace(/<(?=[^=])(?:[^>]*>)/g, '');
  }

  private wrapInIife(code: string): string {
    const stmtKeywords = /^(const|let|var|function|class|if|for|while|do|switch|try|throw|return|import|export|;|\s*$)/;
    const lines = code.trim().split('\n');
    const lastLine = lines[lines.length - 1].trim();
    const segments = lastLine.split(';');
    const lastSeg = (segments[segments.length - 1] ?? '').trim();
    if (lastSeg && !stmtKeywords.test(lastSeg)) {
      segments[segments.length - 1] = `return ${segments[segments.length - 1]}`;
      lines[lines.length - 1] = segments.join(';');
    }
    return `(function() { ${lines.join('\n')} })()`;
  }

}
