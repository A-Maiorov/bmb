import * as esbuild from "esbuild";
esbuild
  .build({
    entryPoints: ["app.ts"],
    bundle: true,
    minify: true,
    outfile: "app.js",
    sourcemap: true,
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ["todoList.ts"],
    bundle: true,
    minify: true,
    outfile: "todoList.js",
    sourcemap: true,
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ["todoEditor.ts"],
    bundle: true,
    minify: true,
    outfile: "todoEditor.js",
    sourcemap: true,
  })
  .catch(() => process.exit(1));

esbuild
  .build({
    entryPoints: ["sharedWorker.ts"],
    bundle: true,
    minify: true,
    outfile: "sharedWorker.js",
    sourcemap: true,
  })
  .catch(() => process.exit(1));
