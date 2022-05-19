import * as esbuild from "esbuild";

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
    entryPoints: ["src/LitSubscriptionContorller.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "dist/LitSubscriptionContorller.js",
    target: "es2020",
    platform: "browser",
    format: "esm",
  })
  .catch(() => process.exit(1));
