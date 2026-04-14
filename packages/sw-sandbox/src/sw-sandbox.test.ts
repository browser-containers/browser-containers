import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SWSandbox } from './sw-sandbox.js';

const mockSw = {
  postMessage: vi.fn(),
};
const mockRegistration = {
  active: mockSw,
  installing: null,
  waiting: null,
};
let messageHandlers: Array<(event: MessageEvent) => void> = [];
let swReadyResolver: (() => void) | null = null;

function setupMockNavigator() {
  messageHandlers = [];
  swReadyResolver = null;
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      serviceWorker: {
        register: vi.fn().mockResolvedValue(mockRegistration),
        ready: Promise.resolve(mockRegistration),
        addEventListener: vi.fn((_type: string, handler: (event: MessageEvent) => void) => {
          messageHandlers.push(handler);
          if (_type === 'message' && swReadyResolver) {
            swReadyResolver();
          }
        }),
        removeEventListener: vi.fn(),
      },
    },
    writable: true,
    configurable: true,
  });
}

function simulateSwReady() {
  for (const handler of messageHandlers) {
    handler({ data: { type: 'SW_READY' } } as MessageEvent);
  }
}

beforeEach(() => {
  vi.restoreAllMocks();
  mockSw.postMessage.mockClear();
  setupMockNavigator();
});

describe('SWSandbox', () => {
  it('creates instance via SWSandbox.create()', async () => {
    const createPromise = SWSandbox.create({ origin: 'http://localhost:3000', swPath: '/sw.js' });
    swReadyResolver = simulateSwReady;
    const sandbox = await createPromise;

    expect(sandbox).toBeInstanceOf(SWSandbox);
    expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
    expect(mockSw.postMessage).toHaveBeenCalledWith(
      { type: 'INIT_PORT' },
      expect.arrayContaining([expect.any(MessagePort)]),
    );
  });

  it('stores fetch handlers via onFetch()', async () => {
    const createPromise = SWSandbox.create({ origin: 'http://localhost:3000', swPath: '/sw.js' });
    swReadyResolver = simulateSwReady;
    const sandbox = await createPromise;

    const handler = vi.fn().mockResolvedValue(new Response('handled'));
    sandbox.onFetch(handler);

    const req = new Request('http://localhost:3000/api/test');
    const result = await sandbox.handleInterceptedRequest(1, req);

    expect(handler).toHaveBeenCalledWith(req);
    expect(result.status).toBe(200);
  });

  it('returns 404 when no handler matches', async () => {
    const createPromise = SWSandbox.create({ origin: 'http://localhost:3000', swPath: '/sw.js' });
    swReadyResolver = simulateSwReady;
    const sandbox = await createPromise;

    const req = new Request('http://localhost:3000/api/missing');
    const result = await sandbox.handleInterceptedRequest(2, req);

    expect(result.status).toBe(404);
  });

  it('skips handlers that throw and tries next', async () => {
    const createPromise = SWSandbox.create({ origin: 'http://localhost:3000', swPath: '/sw.js' });
    swReadyResolver = simulateSwReady;
    const sandbox = await createPromise;

    const failingHandler = vi.fn().mockRejectedValue(new Error('fail'));
    const successHandler = vi.fn().mockResolvedValue(new Response('ok'));
    sandbox.onFetch(failingHandler);
    sandbox.onFetch(successHandler);

    const req = new Request('http://localhost:3000/api/test');
    const result = await sandbox.handleInterceptedRequest(3, req);

    expect(failingHandler).toHaveBeenCalledWith(req);
    expect(successHandler).toHaveBeenCalledWith(req);
    expect(result.status).toBe(200);
  });

  it('stores policy registry via setPolicyRegistry()', async () => {
    const createPromise = SWSandbox.create({ origin: 'http://localhost:3000', swPath: '/sw.js' });
    swReadyResolver = simulateSwReady;
    const sandbox = await createPromise;

    const registry = new Map<string, unknown>([['network', true]]);
    sandbox.setPolicyRegistry(registry);

    const req = new Request('http://localhost:3000/api/test');
    const result = await sandbox.handleInterceptedRequest(4, req);
    expect(result.status).toBe(404);
  });

  it('throws when navigator.serviceWorker is not available', async () => {
    Object.defineProperty(globalThis, 'navigator', { value: {}, writable: true, configurable: true });

    await expect(SWSandbox.create({ origin: 'http://localhost:3000', swPath: '/sw.js' })).rejects.toThrow(
      'ServiceWorker not supported',
    );
  });
});
