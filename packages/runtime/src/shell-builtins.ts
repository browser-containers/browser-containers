import type { VfsBus } from '@browser-containers/vfs-bus';

export interface BuiltinResult {
  stdout?: string;
  stderr?: string;
  exitCode: number;
}

export interface BuiltinEnv {
  cwd: string;
}

export type BuiltinFn = (
  args: string[],
  env: BuiltinEnv,
  vfs: VfsBus,
) => BuiltinResult;

export const joinPath = (cwd: string, target: string): string => {
  if (target.startsWith('/')) return target;
  const parts = cwd.split('/').filter(Boolean);
  for (const seg of target.split('/')) {
    if (seg === '..') parts.pop();
    else if (seg !== '.') parts.push(seg);
  }
  return '/' + parts.join('/');
};

export const builtins = new Map<string, BuiltinFn>([
  [
    'pwd',
    (_args, env) => ({
      stdout: env.cwd + '\n',
      exitCode: 0,
    }),
  ],
  [
    'cd',
    (args, env, vfs) => {
      const target = args[0] ?? '/';
      const newCwd = joinPath(env.cwd, target);
      if (!vfs.hot.existsSync(newCwd)) {
        return { stderr: `cd: no such file or directory: ${target}\n`, exitCode: 1 };
      }
      return { stdout: newCwd + '\n', exitCode: 0 };
    },
  ],
  [
    'ls',
    (args, env, vfs) => {
      const target = args[0] ? joinPath(env.cwd, args[0]) : env.cwd;
      try {
        const entries = vfs.hot.readdirSync(target) as string[];
        return { stdout: entries.join('\n') + (entries.length ? '\n' : ''), exitCode: 0 };
      } catch {
        return { stderr: `ls: cannot access '${args[0] ?? target}': No such file or directory\n`, exitCode: 1 };
      }
    },
  ],
  [
    'cat',
    (args, env, vfs) => {
      if (args.length === 0) {
        return { stderr: 'cat: missing file operand\n', exitCode: 1 };
      }
      const outputs: string[] = [];
      for (const arg of args) {
        const filePath = joinPath(env.cwd, arg);
        try {
          outputs.push(vfs.hot.readFileSync(filePath, 'utf8') as string);
        } catch {
          return { stderr: `cat: ${arg}: No such file or directory\n`, exitCode: 1 };
        }
      }
      return { stdout: outputs.join(''), exitCode: 0 };
    },
  ],
  [
    'echo',
    (args) => ({
      stdout: args.join(' ') + '\n',
      exitCode: 0,
    }),
  ],
  [
    'clear',
    () => ({
      stdout: '\x1b[2J\x1b[H',
      exitCode: 0,
    }),
  ],
  [
    'help',
    () => ({
      stdout:
        'Available commands:\n' +
        '  pwd       Print current working directory\n' +
        '  cd <dir>  Change directory\n' +
        '  ls [dir]  List directory contents\n' +
        '  cat <f>   Display file contents\n' +
        '  echo <..> Print arguments\n' +
        '  clear     Clear terminal screen\n' +
        '  help      Show this help message\n' +
        '  npm       Package management (install, run)\n' +
        '  runtime   Execute scripts (run)\n' +
        '  agent     Run agent scripts (run)\n',
      exitCode: 0,
    }),
  ],
]);
