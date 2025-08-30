import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  define: {
    "process.env": {},
  },
  resolve: {
    alias: {
      "@palatine_whiteboard_frontend": path.resolve(__dirname, "src"),
    },
  },
});
