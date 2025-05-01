import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/api": {
				target:
					process.env.VITE_BACKEND_URL_HTTP ||
					"http://85.120.206.26:8080",
				changeOrigin: true,
				configure: (proxy, _options) => {
					proxy.on("error", (err, _req, _res) => {
						console.log("proxy error", err);
					});
					proxy.on("proxyReq", (proxyReq, req, _res) => {
						console.log(
							"Sending Request to the Target:",
							req.method,
							req.url,
						);
					});
					proxy.on("proxyRes", (proxyRes, req, _res) => {
						console.log(
							"Received Response from the Target:",
							proxyRes.statusCode,
							req.url,
						);
					});
				},
				proxyTimeout: 60000,
				timeout: 60000,
			},
		},
		hmr: {
			overlay: true,
		},
		maxHeaderSize: 32768, // 32KB
	},
});
