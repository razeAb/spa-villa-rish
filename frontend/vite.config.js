import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Hyp's success redirect carries Hebrew fields encoded as windows-1255, which Vite's dev server
// can't decodeURI. Serve the SPA shell for that route before Vite parses the URL; the page reads
// the raw query from window.location, so nothing is lost.
const hypReturnRoute = () => ({
  name: "hyp-return-route",
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url?.startsWith("/booking/payment-return")) {
        req.url = "/";
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), hypReturnRoute()],
  server: {
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
