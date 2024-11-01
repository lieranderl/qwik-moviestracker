// adapters/cloud-run/vite.config.ts
import { cloudRunAdapter } from "file:///Users/evfedoto/Documents/github_projects/qwik-moviestracker/node_modules/@builder.io/qwik-city/lib/adapters/cloud-run/vite/index.mjs";
import { extendConfig } from "file:///Users/evfedoto/Documents/github_projects/qwik-moviestracker/node_modules/@builder.io/qwik-city/lib/vite/index.mjs";

// vite.config.ts
import { qwikCity } from "file:///Users/evfedoto/Documents/github_projects/qwik-moviestracker/node_modules/@builder.io/qwik-city/lib/vite/index.mjs";
import { qwikVite } from "file:///Users/evfedoto/Documents/github_projects/qwik-moviestracker/node_modules/@builder.io/qwik/dist/optimizer.mjs";
import { defineConfig } from "file:///Users/evfedoto/Documents/github_projects/qwik-moviestracker/node_modules/vite/dist/node/index.js";
import tsconfigPaths from "file:///Users/evfedoto/Documents/github_projects/qwik-moviestracker/node_modules/vite-tsconfig-paths/dist/index.js";

// vite-plugin-close.ts
function ClosePlugin() {
  return {
    name: "ClosePlugin",
    // required, will show up in warnings and errors
    // use this to catch errors when building
    buildEnd(error) {
      if (error) {
        console.error("Error bundling");
        console.error(error);
        process.exit(1);
      } else {
        console.log("Build ended");
      }
    },
    // use this to catch the end of a build without errors
    // biome-ignore:
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    closeBundle(_id) {
      console.log("Bundle closed");
      process.exit(0);
    }
  };
}

// vite.config.ts
var vite_config_default = defineConfig(() => {
  return {
    plugins: [qwikCity(), qwikVite(), tsconfigPaths(), ClosePlugin()],
    optimizeDeps: {
      include: ["@auth/core"]
    },
    server: {
      headers: {
        "Cache-Control": "public, max-age=0"
      }
    },
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600"
      }
    },
    build: {
      target: "esnext"
    }
  };
});

// adapters/cloud-run/vite.config.ts
var vite_config_default2 = extendConfig(vite_config_default, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.cloud-run.tsx", "@qwik-city-plan"]
      }
    },
    plugins: [cloudRunAdapter()]
  };
});
export {
  vite_config_default2 as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYWRhcHRlcnMvY2xvdWQtcnVuL3ZpdGUuY29uZmlnLnRzIiwgInZpdGUuY29uZmlnLnRzIiwgInZpdGUtcGx1Z2luLWNsb3NlLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2V2ZmVkb3RvL0RvY3VtZW50cy9naXRodWJfcHJvamVjdHMvcXdpay1tb3ZpZXN0cmFja2VyL2FkYXB0ZXJzL2Nsb3VkLXJ1blwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2V2ZmVkb3RvL0RvY3VtZW50cy9naXRodWJfcHJvamVjdHMvcXdpay1tb3ZpZXN0cmFja2VyL2FkYXB0ZXJzL2Nsb3VkLXJ1bi92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZXZmZWRvdG8vRG9jdW1lbnRzL2dpdGh1Yl9wcm9qZWN0cy9xd2lrLW1vdmllc3RyYWNrZXIvYWRhcHRlcnMvY2xvdWQtcnVuL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgY2xvdWRSdW5BZGFwdGVyIH0gZnJvbSBcIkBidWlsZGVyLmlvL3F3aWstY2l0eS9hZGFwdGVycy9jbG91ZC1ydW4vdml0ZVwiO1xuaW1wb3J0IHsgZXh0ZW5kQ29uZmlnIH0gZnJvbSBcIkBidWlsZGVyLmlvL3F3aWstY2l0eS92aXRlXCI7XG5pbXBvcnQgYmFzZUNvbmZpZyBmcm9tIFwiLi4vLi4vdml0ZS5jb25maWdcIjtcblxuZXhwb3J0IGRlZmF1bHQgZXh0ZW5kQ29uZmlnKGJhc2VDb25maWcsICgpID0+IHtcblx0cmV0dXJuIHtcblx0XHRidWlsZDoge1xuXHRcdFx0c3NyOiB0cnVlLFxuXHRcdFx0cm9sbHVwT3B0aW9uczoge1xuXHRcdFx0XHRpbnB1dDogW1wic3JjL2VudHJ5LmNsb3VkLXJ1bi50c3hcIiwgXCJAcXdpay1jaXR5LXBsYW5cIl0sXG5cdFx0XHR9LFxuXHRcdH0sXG5cdFx0cGx1Z2luczogW2Nsb3VkUnVuQWRhcHRlcigpXSxcblx0fTtcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZXZmZWRvdG8vRG9jdW1lbnRzL2dpdGh1Yl9wcm9qZWN0cy9xd2lrLW1vdmllc3RyYWNrZXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9ldmZlZG90by9Eb2N1bWVudHMvZ2l0aHViX3Byb2plY3RzL3F3aWstbW92aWVzdHJhY2tlci92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvZXZmZWRvdG8vRG9jdW1lbnRzL2dpdGh1Yl9wcm9qZWN0cy9xd2lrLW1vdmllc3RyYWNrZXIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBxd2lrQ2l0eSB9IGZyb20gXCJAYnVpbGRlci5pby9xd2lrLWNpdHkvdml0ZVwiO1xuaW1wb3J0IHsgcXdpa1ZpdGUgfSBmcm9tIFwiQGJ1aWxkZXIuaW8vcXdpay9vcHRpbWl6ZXJcIjtcbmltcG9ydCB7IHR5cGUgVXNlckNvbmZpZywgZGVmaW5lQ29uZmlnIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XG5pbXBvcnQgQ2xvc2VQbHVnaW4gZnJvbSBcIi4vdml0ZS1wbHVnaW4tY2xvc2VcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCgpOiBVc2VyQ29uZmlnID0+IHtcblx0cmV0dXJuIHtcblx0XHRwbHVnaW5zOiBbcXdpa0NpdHkoKSwgcXdpa1ZpdGUoKSwgdHNjb25maWdQYXRocygpLCBDbG9zZVBsdWdpbigpXSxcblx0XHRvcHRpbWl6ZURlcHM6IHtcblx0XHRcdGluY2x1ZGU6IFtcIkBhdXRoL2NvcmVcIl0sXG5cdFx0fSxcblx0XHRzZXJ2ZXI6IHtcblx0XHRcdGhlYWRlcnM6IHtcblx0XHRcdFx0XCJDYWNoZS1Db250cm9sXCI6IFwicHVibGljLCBtYXgtYWdlPTBcIixcblx0XHRcdH0sXG5cdFx0fSxcblx0XHRwcmV2aWV3OiB7XG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdFwiQ2FjaGUtQ29udHJvbFwiOiBcInB1YmxpYywgbWF4LWFnZT02MDBcIixcblx0XHRcdH0sXG5cdFx0fSxcblx0XHRidWlsZDoge1xuXHRcdFx0dGFyZ2V0OiBcImVzbmV4dFwiLFxuXHRcdH0sXG5cdH07XG59KTtcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2V2ZmVkb3RvL0RvY3VtZW50cy9naXRodWJfcHJvamVjdHMvcXdpay1tb3ZpZXN0cmFja2VyXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZXZmZWRvdG8vRG9jdW1lbnRzL2dpdGh1Yl9wcm9qZWN0cy9xd2lrLW1vdmllc3RyYWNrZXIvdml0ZS1wbHVnaW4tY2xvc2UudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2V2ZmVkb3RvL0RvY3VtZW50cy9naXRodWJfcHJvamVjdHMvcXdpay1tb3ZpZXN0cmFja2VyL3ZpdGUtcGx1Z2luLWNsb3NlLnRzXCI7ZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gQ2xvc2VQbHVnaW4oKSB7XG5cdHJldHVybiB7XG5cdFx0bmFtZTogXCJDbG9zZVBsdWdpblwiLCAvLyByZXF1aXJlZCwgd2lsbCBzaG93IHVwIGluIHdhcm5pbmdzIGFuZCBlcnJvcnNcblxuXHRcdC8vIHVzZSB0aGlzIHRvIGNhdGNoIGVycm9ycyB3aGVuIGJ1aWxkaW5nXG5cdFx0YnVpbGRFbmQoZXJyb3I6IEVycm9yKSB7XG5cdFx0XHRpZiAoZXJyb3IpIHtcblx0XHRcdFx0Y29uc29sZS5lcnJvcihcIkVycm9yIGJ1bmRsaW5nXCIpO1xuXHRcdFx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcblx0XHRcdFx0cHJvY2Vzcy5leGl0KDEpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc29sZS5sb2coXCJCdWlsZCBlbmRlZFwiKTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0Ly8gdXNlIHRoaXMgdG8gY2F0Y2ggdGhlIGVuZCBvZiBhIGJ1aWxkIHdpdGhvdXQgZXJyb3JzXG5cdFx0Ly8gYmlvbWUtaWdub3JlOlxuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0XHRjbG9zZUJ1bmRsZShfaWQ6IGFueSkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJCdW5kbGUgY2xvc2VkXCIpO1xuXHRcdFx0cHJvY2Vzcy5leGl0KDApO1xuXHRcdH0sXG5cdH07XG59XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStaLFNBQVMsdUJBQXVCO0FBQy9iLFNBQVMsb0JBQW9COzs7QUNEeVUsU0FBUyxnQkFBZ0I7QUFDL1gsU0FBUyxnQkFBZ0I7QUFDekIsU0FBMEIsb0JBQW9CO0FBQzlDLE9BQU8sbUJBQW1COzs7QUNIdVcsU0FBUixjQUErQjtBQUN2WixTQUFPO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQTtBQUFBLElBR04sU0FBUyxPQUFjO0FBQ3RCLFVBQUksT0FBTztBQUNWLGdCQUFRLE1BQU0sZ0JBQWdCO0FBQzlCLGdCQUFRLE1BQU0sS0FBSztBQUNuQixnQkFBUSxLQUFLLENBQUM7QUFBQSxNQUNmLE9BQU87QUFDTixnQkFBUSxJQUFJLGFBQWE7QUFBQSxNQUMxQjtBQUFBLElBQ0Q7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUtBLFlBQVksS0FBVTtBQUNyQixjQUFRLElBQUksZUFBZTtBQUMzQixjQUFRLEtBQUssQ0FBQztBQUFBLElBQ2Y7QUFBQSxFQUNEO0FBQ0Q7OztBRGpCQSxJQUFPLHNCQUFRLGFBQWEsTUFBa0I7QUFDN0MsU0FBTztBQUFBLElBQ04sU0FBUyxDQUFDLFNBQVMsR0FBRyxTQUFTLEdBQUcsY0FBYyxHQUFHLFlBQVksQ0FBQztBQUFBLElBQ2hFLGNBQWM7QUFBQSxNQUNiLFNBQVMsQ0FBQyxZQUFZO0FBQUEsSUFDdkI7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNQLFNBQVM7QUFBQSxRQUNSLGlCQUFpQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRDtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1IsU0FBUztBQUFBLFFBQ1IsaUJBQWlCO0FBQUEsTUFDbEI7QUFBQSxJQUNEO0FBQUEsSUFDQSxPQUFPO0FBQUEsTUFDTixRQUFRO0FBQUEsSUFDVDtBQUFBLEVBQ0Q7QUFDRCxDQUFDOzs7QUR0QkQsSUFBT0EsdUJBQVEsYUFBYSxxQkFBWSxNQUFNO0FBQzdDLFNBQU87QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNOLEtBQUs7QUFBQSxNQUNMLGVBQWU7QUFBQSxRQUNkLE9BQU8sQ0FBQywyQkFBMkIsaUJBQWlCO0FBQUEsTUFDckQ7QUFBQSxJQUNEO0FBQUEsSUFDQSxTQUFTLENBQUMsZ0JBQWdCLENBQUM7QUFBQSxFQUM1QjtBQUNELENBQUM7IiwKICAibmFtZXMiOiBbInZpdGVfY29uZmlnX2RlZmF1bHQiXQp9Cg==
