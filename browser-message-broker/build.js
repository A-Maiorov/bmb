import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/Module.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "dist/Module.js",
    target: "es2020",
    platform: "browser",
    format: "esm",
    plugins: [],
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ["src/SubscribeDecorator.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "dist/subscribeDecorator.js",
    target: "es2020",
    platform: "browser",
    format: "esm",
    plugins: [],
  })
  .catch(() => process.exit(1));
