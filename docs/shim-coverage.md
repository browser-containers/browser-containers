# Node.js Shim Coverage

| Module | Package | Status | Notes |
|--------|---------|--------|-------|
| `node:crypto` | node-web-shims | Implemented | WebCrypto via unenv |
| `node:stream` | node-web-shims | Implemented | WebStreams via unenv |
| `node:buffer` | node-web-shims | Implemented | ArrayBuffer/Uint8Array via unenv |
| `node:path` | node-web-shims | Implemented | path-browserify via unenv |
| `node:url` | node-web-shims | Implemented | URL/URLSearchParams via unenv |
| `node:events` | node-web-shims | Implemented | EventEmitter via unenv |
| `node:os` | node-web-shims | Implemented | Minimal stub via unenv |
| `node:http` (client) | node-web-shims | Implemented | fetch adapter via unenv |
| `node:worker_threads` | node-web-shims | Implemented | Minimal wrapper around threads.js |
| `node:fs` | node-runtime-shims | Planned | VfsBus |
| `node:fs/promises` | node-runtime-shims | Planned | VfsBus |
| `node:http` (createServer) | node-runtime-shims | Planned | VirtualServer via sw-sandbox |
| `node:net` (createServer) | node-runtime-shims | Planned | VirtualServer via sw-sandbox |
| `node:child_process` | node-runtime-shims | Planned | WASM registry + ShellService |
| `fs.watch` / `chokidar` | node-runtime-shims | Planned | VfsBus.watch() |
