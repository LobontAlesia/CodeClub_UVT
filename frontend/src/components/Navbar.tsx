import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { Menu, X, User } from "lucide-react";

interface JwtPayload {
	roles: string;
	sub: string;
	given_name?: string;
	avatar?: string;
}

const Navbar = () => {
	const [role, setRole] = useState<string | null>(null);
	const [name, setName] = useState<string | null>(null);
	const [avatar, setAvatar] = useState<string | null>(null);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const mobileMenuRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) return;

		try {
			const decoded = jwtDecode<JwtPayload>(token);
			setRole(decoded.roles);
			if (decoded.given_name) setName(decoded.given_name);
			if (decoded.avatar) setAvatar(decoded.avatar);
		} catch {
			setRole(null);
		}
	}, []);

	// Ascultă pentru evenimentul când profilul utilizatorului a fost actualizat
	useEffect(() => {
		const handleProfileUpdate = () => {
			const token = localStorage.getItem("token");
			if (!token) return;

			try {
				const decoded = jwtDecode<JwtPayload>(token);
				setRole(decoded.roles);
				if (decoded.given_name) setName(decoded.given_name);
				if (decoded.avatar) setAvatar(decoded.avatar);
			} catch {
				setRole(null);
			}
		};

		// Adaugă listener pentru evenimentul custom
		window.addEventListener("user-profile-updated", handleProfileUpdate);

		// Curăță listener-ul la dezmontarea componentei
		return () => {
			window.removeEventListener(
				"user-profile-updated",
				handleProfileUpdate,
			);
		};
	}, []);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				mobileMenuRef.current &&
				!mobileMenuRef.current.contains(event.target as Node)
			) {
				setIsMobileMenuOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("refreshToken");
		setIsMobileMenuOpen(false);
		navigate("/login");
	};

	return (
		<nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between bg-white px-4 py-3 shadow-md md:px-6 md:py-4">
			<Link
				to="/dashboard"
				className="text-xl font-bold text-green-600 md:text-2xl"
			>
				CodeClub
			</Link>

			{/* Mobile menu button */}
			<div className="flex md:hidden">
				<button
					onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					className="text-gray-700 focus:outline-none"
					aria-label="Toggle menu"
				>
					{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
				</button>
			</div>

			{/* Desktop Navigation */}
			<div className="hidden items-center gap-6 md:flex">
				{role ? (
					<>
						<Link
							to="/dashboard"
							className="text-primary-color font-semibold hover:text-green-600"
						>
							Dashboard
						</Link>

						{/* Username with link to profile */}
						<Link
							to="/profile"
							className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-green-600"
						>
							{avatar && (
								<div className="h-8 w-8 overflow-hidden rounded-full border border-gray-200 shadow-sm">
									<img
										src={`/src/assets/avatars/${avatar}.svg`}
										alt="Avatar"
										className="h-full w-full object-cover"
										onError={(e) => {
											// If the avatar image fails to load, remove the image element
											const target =
												e.target as HTMLImageElement;
											target.style.display = "none";
										}}
									/>
								</div>
							)}
							{!avatar && (
								<div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
									<User size={18} className="text-gray-400" />
								</div>
							)}
							{role === "Admin" ? "Admin" : "User"}{" "}
							{name ? `${name}` : ""}'s Profile
						</Link>

						<button
							onClick={handleLogout}
							className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
						>
							Logout
						</button>
					</>
				) : (
					<Link
						to="/login"
						className="rounded bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
					>
						Login
					</Link>
				)}
			</div>

			{/* Mobile Navigation */}
			{isMobileMenuOpen && (
				<div
					ref={mobileMenuRef}
					className="absolute left-0 right-0 top-full z-20 flex flex-col items-center bg-white py-4 shadow-lg md:hidden"
				>
					{role ? (
						<>
							<Link
								to="/dashboard"
								className="w-full py-3 text-center font-semibold hover:bg-gray-100"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								Dashboard
							</Link>{" "}
							<Link
								to="/profile"
								className="flex w-full items-center justify-center gap-2 py-3 text-center font-medium hover:bg-gray-100"
								onClick={() => setIsMobileMenuOpen(false)}
							>
								{avatar && (
									<div className="h-7 w-7 overflow-hidden rounded-full border border-gray-200 shadow-sm">
										<img
											src={`/src/assets/avatars/${avatar}.svg`}
											alt="Avatar"
											className="h-full w-full object-cover"
											onError={(e) => {
												// If the avatar image fails to load, remove the image element
												const target =
													e.target as HTMLImageElement;
												target.style.display = "none";
											}}
										/>
									</div>
								)}
								{!avatar && (
									<div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
										<User
											size={16}
											className="text-gray-400"
										/>
									</div>
								)}
								User's Profile
							</Link>
							<button
								onClick={handleLogout}
								className="mt-3 w-4/5 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
							>
								Logout
							</button>
						</>
					) : (
						<Link
							to="/login"
							className="w-4/5 rounded bg-green-600 py-2 text-center font-semibold text-white hover:bg-green-700"
							onClick={() => setIsMobileMenuOpen(false)}
						>
							Login
						</Link>
					)}
				</div>
			)}
		</nav>
	);
};

export default Navbar;
