import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/algo-node-rewards/",
  build: {
    outDir: "build", // Ensure this matches your YAML configuration
  },
  plugins: [react()],
});
