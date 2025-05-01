import { axiosPrivate } from "../config/axios.tsx";
import { useEffect } from "react";

const useAxiosPrivate = () => {
	useEffect(() => {
		const requestIntercept = axiosPrivate.interceptors.request.use(
			(config) => {
				if (!config.headers["Authorization"]) {
					config.headers["Authorization"] =
						`Bearer ${localStorage.getItem("token")}`;
				}
				return config;
			},
			(error) => Promise.reject(error),
		);

		const responseIntercept = axiosPrivate.interceptors.response.use(
			(response) => response,
			async (error) => {
				const prevRequest = error?.config;
				if (
					(error?.response?.status === 403 ||
						error?.response?.status === 401) &&
					!prevRequest?.sent
				) {
					prevRequest.sent = true;
					const newAccessToken = "token"; // refreshToken
					// console.log("New Access Token: ", newAccessToken);
					prevRequest.headers["Authorization"] =
						`Bearer ${newAccessToken}`;
					return axiosPrivate(prevRequest);
				}
				return Promise.reject(error);
			},
		);

		return () => {
			axiosPrivate.interceptors.request.eject(requestIntercept);
			axiosPrivate.interceptors.response.eject(responseIntercept);
		};
	}, []);

	return axiosPrivate;
};

export default useAxiosPrivate;
