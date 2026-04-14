import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initSW, handleFetch } from './sw.js';

const mockClients = {
  claim: vi.fn().mockResolvedValue(undefined),
  matchAll: vi.fn().mockResolvedValue([]),
};

const mockPort = {
  postMessage: vi.fn(),
};

beforeEach(() => {
  vi.restoreAllMocks();
  mockClients.claim.mockResolvedValue(undefined);
  mockClients.matchAll.mockResolvedValue([]);
  mockPort.postMessage.mockClear();
});

describe('SW script behavior', () => {
  it('calls skipWaiting on install', () => {
    const skipWaitingSpy = vi.fn();
    const swGlobal = {
      addEventListener: vi.fn((type: string, handler: (...args: unknown[]) => void) => {
        if (type === 'install') handler();
      }),
      skipWaiting: skipWaitingSpy,
      clients: mockClients,
    } as unknown as ServiceWorkerGlobalScope;

    initSW(swGlobal);
    expect(skipWaitingSpy).toHaveBeenCalled();
  });

  it('calls clients.claim and matchAll on activate', () => {
    const swGlobal = {
      addEventListener: vi.fn((type: string, handler: (event: ExtendableEvent) => void) => {
        if (type === 'activate') {
          handler({ waitUntil: vi.fn() } as unknown as ExtendableEvent);
        }
      }),
      skipWaiting: vi.fn(),
      clients: mockClients,
    } as unknown as ServiceWorkerGlobalScope;

    initSW(swGlobal);
    expect(mockClients.claim).toHaveBeenCalled();
    expect(mockClients.matchAll).toHaveBeenCalledWith({ type: 'window' });
  });

  it('handleFetch sends response via port', () => {
    const req = new Request('http://localhost:3000/api/test');
    handleFetch(42, req, mockPort as unknown as MessagePort);

    expect(mockPort.postMessage).toHaveBeenCalledWith({
      requestId: 42,
      response: { status: 200, body: 'OK', headers: {} },
    });
  });
});
