const esbuild = require("esbuild");

async function buildAndServe() {
  const context = await esbuild.context({
    entryPoints: ["suite/worker.ts", "suite/sut.ts"],
    bundle: true,
    minify: false,
    sourcemap: "inline",
    outdir: "suite/dist",
    target: "es2020",
    platform: "browser",
    format: "esm",
  });

  context
    .serve({
      servedir: "suite",
      port: 3000,
    })
    .then((server) => {
      console.log(`Server is listening on port ${server.port}`);
    })
    .catch(() => process.exit(1));
}

buildAndServe();
