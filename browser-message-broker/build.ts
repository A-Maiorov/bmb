import * as esbuild from "esbuild";

esbuild
  .build({
    entryPoints: ["src/Module.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "dist/Module.js",
    target: "es2021",
    platform: "browser",
    format: "esm",
    plugins: [],
  })
  .then((r) => console.log(r));

esbuild
  .build({
    entryPoints: ["src/SubscribeDecorator.ts"],
    bundle: true,
    minify: true,
    sourcemap: true,
    outfile: "dist/subscribeDecorator.js",
    target: "es2021",
    platform: "browser",
    format: "esm",
    plugins: [],
  })
  .then((r) => console.log(r));
