const esbuild = require("esbuild");
esbuild
  .build({
    entryPoints: ["suite/WebWorker/testWorker.ts"],
    bundle: true,
    minify: false,
    sourcemap: "inline",
    outfile: "suite/WebWorker/testWorker.js",
    target: "es2020",
    platform: "browser",
    format: "esm",
  })
  .catch(() => process.exit(1));
