import axios from "axios";

const BASE_URL =
	import.meta.env.VITE_BACKEND_URL_HTTP || "http://localhost:5153"; // 🛠️ folosim corect variabila ta

export const axiosPublic = axios.create({
	baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
	baseURL: BASE_URL,
	headers: { "Content-Type": "application/json" },
	withCredentials: true,
});
