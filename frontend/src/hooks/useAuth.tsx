import { useEffect, useState } from "react";

export const useAuth = () => {
	const [role, setRole] = useState<string | null>(null);

	useEffect(() => {
		const storedRole = localStorage.getItem("role");
		setRole(storedRole);
	}, []);

	const isAdmin = role === "Admin";

	return { role, isAdmin };
};
