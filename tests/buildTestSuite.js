import * as esbuild from "esbuild";

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

const server = await context.serve({
  servedir: "suite",
  port: 3000,
});

console.log(`Server is listening on port ${server.port}`);
