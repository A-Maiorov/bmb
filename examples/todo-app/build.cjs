require("esbuild")
  .build({
    entryPoints: ["app.ts"],
    bundle: true,
    outfile: "main.js",
    sourcemap: true,
  })
  .catch(() => process.exit(1));
