import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/api":
				process.env.VITE_BACKEND_URL_HTTP ||
				"http://85.120.206.26:8080", // Redirecționează cererile API către backend
		},
	},
});
