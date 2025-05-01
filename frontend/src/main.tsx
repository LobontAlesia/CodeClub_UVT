import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ThemeContextProvider } from "./context/ThemeContext";
import { MantineProvider } from "@mantine/core";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
	<ThemeContextProvider>
		<MantineProvider
			theme={{
				fontFamily: "Lexend, sans-serif",
				primaryColor: "green",
			}}
		>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</MantineProvider>
	</ThemeContextProvider>,
);
