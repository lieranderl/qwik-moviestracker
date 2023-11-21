import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import ClosePlugin from './vite-plugin-close'


export default defineConfig(() => {
  return {
    optimizeDeps: {
      include: ['@auth/core'],
    },
    plugins: [qwikCity(), qwikVite(), tsconfigPaths(), ClosePlugin()],
    build: {
      target: 'esnext'
    },
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
