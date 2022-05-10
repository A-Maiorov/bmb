import { esbuildPlugin } from "@web/dev-server-esbuild";
import { playwrightLauncher } from '@web/test-runner-playwright';

const browsers = {
    chromium: playwrightLauncher({product: 'chromium'}),
    firefox: playwrightLauncher({product: 'firefox'}),
    webkit: playwrightLauncher({product: 'webkit'}),  
  };
  

export default {
  nodeResolve: true,
  rootDir: './',
  files: ['./**/*.test.ts', './**/*.spec.ts', './**/*.spec.html'],
  coverageConfig: {
    include: ['src/**/*.ts'],
  },
  plugins: [esbuildPlugin({ ts: true, target: "es2020", })],
  browsers: Object.values(browsers)
};