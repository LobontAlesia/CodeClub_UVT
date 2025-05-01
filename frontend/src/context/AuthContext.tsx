import { createContext } from "react";
import { ReactNode, useContext } from "react";
import useAxiosPublic from "../hooks/useAxiosPublic";
import { LoginModel, RegisterModel } from "../utils/models";

type AuthContextType = {
	checkUsername: (username: string) => Promise<string | null>;
	checkEmail: (email: string) => Promise<string | null>;
	register: (model: RegisterModel) => Promise<string | null>;
	login: (model: LoginModel) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType>({
	checkUsername: async () => null,
	checkEmail: async () => null,
	register: async () => null,
	login: async () => null,
});

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
	const axiosPublic = useAxiosPublic();

	const checkUsernameExists = async (username: string): Promise<boolean> => {
		try {
			const response = await axiosPublic.get(
				`/Auth/username/${username}`,
			);
			return response.data;
		} catch (error) {
			console.error(error);
			return false;
		}
	};

	const checkUsername = async (username: string): Promise<string | null> => {
		if (username.length < 3) {
			return "Username must be at least 3 characters";
		}
		if (username.length > 20) {
			return "Username must be at most 20 characters";
		}
		if (!/^[a-zA-Z0-9_]*$/.test(username)) {
			return "Username can only contain letters, numbers and underscores";
		}
		if (await checkUsernameExists(username)) {
			return "Username already exists";
		}
		return null;
	};

	const checkEmailExists = async (email: string): Promise<boolean> => {
		try {
			const response = await axiosPublic.get(`/Auth/email/${email}`);
			return response.data;
		} catch (error) {
			console.error(error);
			return false;
		}
	};

	const checkEmail = async (email: string): Promise<string | null> => {
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			return "Invalid email";
		}
		if (await checkEmailExists(email)) {
			return "Email already exists";
		}
		return null;
	};

	const register = async (model: RegisterModel): Promise<string | null> => {
		try {
			const response = await axiosPublic.post("/Auth/register", model);

			if (response.status === 200) {
				return null;
			} else return "Registration failed";
		} catch (error) {
			console.error(error);
			return "Error registering user";
		}
	};

	const login = async (model: LoginModel): Promise<string | null> => {
		try {
			let response = null;

			if (model.usernameOrEmail?.includes("@")) {
				response = await axiosPublic.post("/Auth/login", {
					email: model.usernameOrEmail,
					password: model.password,
				});
			} else {
				response = await axiosPublic.post("/Auth/login", {
					username: model.usernameOrEmail,
					password: model.password,
				});
			}

			if (response.status === 200) {
				return null;
			} else return "Invalid email or password";
		} catch (error) {
			console.error(error);
			return "Error logging in";
		}
	};

	return (
		<AuthContext.Provider
			value={{
				checkUsername,
				checkEmail,
				register,
				login,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};

const useAuthContext = () => {
	return useContext(AuthContext);
};

export default useAuthContext;
