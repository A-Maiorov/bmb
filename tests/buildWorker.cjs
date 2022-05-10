const esbuild = require("esbuild");
esbuild
  .build({
    entryPoints: ["suit/WebWorker/testWorker.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "suit/WebWorker/testWorker.js",
    target: "es2020",
    platform: "browser",
    format: "esm",
  })
  .catch(() => process.exit(1));
