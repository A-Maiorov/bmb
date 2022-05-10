import { esbuildPlugin } from "@web/dev-server-esbuild";

const mode = process.env.MODE || "dev";
if (!["dev", "prod"].includes(mode)) {
  throw new Error(`MODE must be "dev" or "prod", was "${mode}"`);
}

export default {
  nodeResolve: { exportConditions: mode === "dev" ? ["development"] : [] },
  preserveSymlinks: true,
  rootDir: "./",
  plugins: [esbuildPlugin({ ts: true, target: "es2020" })],
};
