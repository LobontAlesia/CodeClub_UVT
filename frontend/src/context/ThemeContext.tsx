import { createContext } from "react";
import { ReactNode, useEffect, useState, useContext } from "react";

type ThemeContextType = {
	theme: string;
	toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
	theme: "light",
	toggleTheme: () => {},
});

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
	const [theme, setTheme] = useState<string>("light");

	const toggleTheme = () => {
		setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
	};

	useEffect(() => {
		const localTheme = localStorage.getItem("theme");
		if (localTheme) {
			setTheme(localTheme);
		}
	}, []);

	useEffect(() => {
		document.documentElement.className = `${theme}`;
	}, [theme]);

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

const useThemeContext = () => {
	return useContext(ThemeContext);
};

export default useThemeContext;
