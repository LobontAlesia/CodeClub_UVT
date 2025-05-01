import { createContext } from "react";
import { ReactNode, useContext } from "react";
// import useAxiosPrivate from "../hooks/useAxiosPrivate";

type ApiContextType = object;

const ApiContext = createContext<ApiContextType>({});

export const ApiContextProvider = ({ children }: { children: ReactNode }) => {
	// const axiosPrivate = useAxiosPrivate();

	// async function getList<T>(url: string): Promise<T[]> {
	// 	try {
	// 		const response = await axiosPrivate.get(url);
	// 		return response.data as T[];
	// 	} catch (error) {
	// 		console.error(error);
	// 		return [];
	// 	}
	// }

	return <ApiContext.Provider value={{}}>{children}</ApiContext.Provider>;
};

const useApiContext = () => {
	return useContext(ApiContext);
};

export default useApiContext;
