import type { SWSandbox } from '@browser-containers/sw-sandbox';
import { EventEmitter } from 'events';

export const createHttpShim = (sandbox: SWSandbox) => {
  const createServer = (handler?: (req: IncomingMessage, res: ServerResponse) => void) => {
    const server = new EventEmitter() as unknown as Server;

    server.listen = (port?: number, host?: string, callback?: () => void) => {
      sandbox.onFetch(async (req) => {
        const url = new URL(req.url);
        const request: IncomingMessage = {
          url: url.pathname + url.search,
          method: req.method,
          headers: Object.fromEntries(req.headers.entries()),
        };

        const chunks: Uint8Array[] = [];
        let status = 200;
        const headers: Record<string, string> = { 'Content-Type': 'text/plain' };

        const response: ServerResponse = {
          writeHead: (s: number, h?: Record<string, string>) => {
            status = s;
            if (h) Object.assign(headers, h);
          },
          write: (chunk: Uint8Array | string) => {
            chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk);
          },
          end: (chunk?: Uint8Array | string) => {
            if (chunk) chunks.push(typeof chunk === 'string' ? new TextEncoder().encode(chunk) : chunk);
          },
        };

        if (handler) {
          await handler(request, response);
        }

        const body = new Uint8Array(chunks.reduce((a, b) => a + b.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
          body.set(chunk, offset);
          offset += chunk.length;
        }
        return new Response(body, { status, headers });
      });

      if (callback) callback();
      return server;
    };

    return server;
  };

  return { createServer };
};

export interface IncomingMessage {
  url: string;
  method: string;
  headers: Record<string, string>;
}

export interface ServerResponse {
  writeHead(status: number, headers?: Record<string, string>): void;
  write(chunk: Uint8Array | string): void;
  end(chunk?: Uint8Array | string): void;
}

export interface Server {
  listen(port?: number, host?: string, callback?: () => void): Server;
  on(event: string, listener: (...args: any[]) => void): Server;
}

export const createNetShim = (sandbox: SWSandbox) => {
  return createHttpShim(sandbox);
};
