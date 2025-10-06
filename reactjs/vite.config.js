import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import fs from "fs";

// https://vite.dev/config/
export default defineConfig({
    server: {
        // host: "assemble-sitecore.com",
        // https: true,
        // https: {
        //     key: fs.readFileSync("./cloudflare-private-key.pem"),
        //     cert: fs.readFileSync("./cloudflare-origin-cert.pem"),
        // },
        https: false,
        allowedHosts: ["ksdedicated.work"],
    },
    plugins: [react(), mkcert()],
});
