import { defineConfig } from "vite";
import { zone } from "./zone/vite";

export default defineConfig({
    plugins: [zone()],
});
