import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // expose on LAN so you can open it on your phone (e.g. http://192.168.x.x:5173)
    port: 5173,
  },
});