import { createContext } from "react";
import { ReactNode, useContext } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";

export type BadgeInputModel = {
	name: string;
	baseName: string;
	level: string;
	icon: string;
};

export type BadgeModel = {
	name: string;
	level: string;
	icon: string;
};

type TestContextType = {
	createBadge: (badge: BadgeInputModel) => Promise<null>;
	getAllBadges: () => Promise<BadgeModel[]>;
};

const TestContext = createContext<TestContextType>({
	createBadge: async () => null,
	getAllBadges: async () => [],
});

export const TestContextProvider = ({ children }: { children: ReactNode }) => {
	const axiosPublic = useAxiosPublic();

	const createBadge = async (badge: BadgeInputModel): Promise<null> => {
		console.log("createBadge");
		try {
			await axiosPublic.post(`/Badge`, badge);
			return null;
		} catch (error) {
			console.error(error);
			return null;
		}
	};

	const getAllBadges = async (): Promise<BadgeModel[]> => {
		console.log("getAllBadges");
		try {
			const response = await axiosPublic.get(`/Badge`);
			return response.data as BadgeModel[];
		} catch (error) {
			console.error(error);
			return [];
		}
	};

	return (
		<TestContext.Provider
			value={{
				createBadge,
				getAllBadges,
			}}
		>
			{children}
		</TestContext.Provider>
	);
};

const useTestContext = () => {
	return useContext(TestContext);
};

export default useTestContext;
