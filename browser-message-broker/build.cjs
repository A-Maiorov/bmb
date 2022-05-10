const esbuild = require("esbuild");
esbuild
  .build({
    entryPoints: ["src/Broker.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "dist/Broker.js",
    target: "es2020",
    platform: "browser",
    format: "esm",
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ["src/LitSubscriber.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "dist/LitSubscriber.js",
    target: "es2020",
    platform: "browser",
    format: "esm",
  })
  .catch(() => process.exit(1));
