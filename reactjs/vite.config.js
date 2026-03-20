import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import fs from "fs";
import basicSsl from '@vitejs/plugin-basic-ssl';

// https://vite.dev/config/
export default defineConfig({
    envPrefix: ["VITE_", "API_"],
    // server: {
    //     // host: "assemble-sitecore.com",
    //     // https: true,
    //     // https: {
    //     //     key: fs.readFileSync("./cloudflare-private-key.pem"),
    //     //     cert: fs.readFileSync("./cloudflare-origin-cert.pem"),
    //     // },
    //     https: false,
    //     allowedHosts: ["ksdedicated.work", "kstf.ksdedicated.work"],
    // },
    // plugins: [react(), mkcert(), basicSsl()],
    plugins: [react(), basicSsl()],
});
