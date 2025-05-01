import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

interface JwtPayload {
	roles: string;
	sub: string;
	given_name?: string;
}

const Navbar = () => {
	const [role, setRole] = useState<string | null>(null);
	const [name, setName] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) return;

		try {
			const decoded = jwtDecode<JwtPayload>(token);
			setRole(decoded.roles);
			if (decoded.given_name) setName(decoded.given_name);
		} catch {
			setRole(null);
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("refreshToken");
		navigate("/login");
	};

	return (
		<nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-white px-6 py-4 shadow-md">
			<Link to="/dashboard" className="text-2xl font-bold text-green-600">
				CodeClub
			</Link>

			{role ? (
				<div className="flex items-center gap-6">
					<Link
						to="/dashboard"
						className="text-gray-700 font-semibold hover:text-green-600"
					>
						Dashboard
					</Link>

					{/* 👑 opțional: afișăm rolul */}
					<span className="text-gray-500 text-sm italic">
						{role} {name ? `| ${name}` : ""}
					</span>

					<button
						onClick={handleLogout}
						className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
					>
						Logout
					</button>
				</div>
			) : (
				<Link
					to="/login"
					className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
				>
					Login
				</Link>
			)}
		</nav>
	);
};

export default Navbar;
