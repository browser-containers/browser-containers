import type { Plugin } from "vite";

const SHIMMED_BUILTINS = new Set([
  "buffer",
  "crypto",
  "events",
  "http",
  "os",
  "path",
  "stream",
  "url",
  "worker_threads",
]);

/**
 * Creates a Vite plugin that aliases node:* modules to browser-compatible shims.
 *
 * This plugin should be used when bundling Node.js applications for the browser,
 * particularly for the RuntimeWorker bundle.
 */
export const nodeWebShims = (): Plugin => {
  const pkgRoot = new URL("..", import.meta.url).pathname;

  return {
    name: "@browser-containers/node-web-shims",
    enforce: "pre",
    resolveId(id) {
      const bareName = id.startsWith("node:")
        ? id.slice("node:".length)
        : id;

      if (SHIMMED_BUILTINS.has(bareName)) {
        return `${pkgRoot}/dist/${bareName}.js`;
      }
      if (id.startsWith("unenv/runtime/node/")) {
        const name = id.slice("unenv/runtime/node/".length);
        return `${pkgRoot}/node_modules/unenv/runtime/node/${name}/index.mjs`;
      }
      return null;
    },
  };
};

export default nodeWebShims;
