import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
	baseURL: "http://localhost:5153",
});

// Request interceptor - adds token to all requests
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Response interceptor - handles token refresh on 401 errors
api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		// If the error is 401 and we haven't already tried to refresh
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				// Try to refresh the token
				const refreshToken = localStorage.getItem("refreshToken");
				const response = await axios.post(
					"http://localhost:5153/auth/refresh-token",
					{
						refreshToken,
					},
				);

				// If we get a new token, update it and retry the original request
				if (response.data?.token) {
					localStorage.setItem("token", response.data.token);
					localStorage.setItem(
						"refreshToken",
						response.data.refreshToken,
					);
					originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
					return api(originalRequest);
				}
			} catch (refreshError) {
				// If refresh fails, redirect to login
				localStorage.removeItem("token");
				localStorage.removeItem("refreshToken");
				window.location.href = "/login";
				toast.error(
					"Sesiunea a expirat. Te rugăm să te autentifici din nou.",
				);
			}
		}

		return Promise.reject(error);
	},
);

export default api;
