import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { User, Save, Lock, Image } from "lucide-react";
import api from "../../utils/api";
import Container from "../../components/layout/Container";
import ResponsiveCard from "../../components/layout/ResponsiveCard";
import AvatarSelector from "../../components/AvatarSelector";

interface JwtPayload {
	roles: string;
	sub: string;
	given_name?: string;
}

interface ProfileFormData {
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	avatar: string | null;
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

interface ValidationErrors {
	username?: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	currentPassword?: string;
	newPassword?: string;
	confirmPassword?: string;
}

export default function ProfilePage() {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [userId, setUserId] = useState<string | null>(null);
	const [formData, setFormData] = useState<ProfileFormData>({
		username: "",
		email: "",
		firstName: "",
		lastName: "",
		avatar: null,
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<ValidationErrors>({});
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}

		try {
			const decoded = jwtDecode<JwtPayload>(token);
			setUserId(decoded.sub);
		} catch (error) {
			console.error("Invalid token", error);
			navigate("/login");
		}
	}, [navigate]);

	useEffect(() => {
		if (userId) {
			fetchUserProfile();
		}
	}, [userId]);
	const fetchUserProfile = async () => {
		try {
			setLoading(true);
			const response = await api.get(`/Auth/profile/${userId}`);
			const profileData = response.data;
			setFormData({
				...formData,
				username: profileData.username,
				email: profileData.email,
				firstName: profileData.firstName,
				lastName: profileData.lastName,
				avatar: profileData.avatar || null,
			});
		} catch (error) {
			console.error("Failed to fetch profile", error);
			toast.error("Failed to load profile data");
		} finally {
			setLoading(false);
		}
	};

	const validateForm = (): boolean => {
		const newErrors: ValidationErrors = {};

		// Basic validations
		if (!formData.username) newErrors.username = "Username is required";
		if (!formData.email) newErrors.email = "Email is required";
		if (!formData.firstName) newErrors.firstName = "First name is required";
		if (!formData.lastName) newErrors.lastName = "Last name is required";

		// Email validation
		if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		// Password validations (only if changing password)
		if (isChangingPassword) {
			if (!formData.currentPassword)
				newErrors.currentPassword = "Current password is required";

			if (!formData.newPassword) {
				newErrors.newPassword = "New password is required";
			} else if (
				!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
					formData.newPassword,
				)
			) {
				newErrors.newPassword =
					"Password must have at least 8 characters, one uppercase letter, one number, and one special character";
			}

			if (!formData.confirmPassword) {
				newErrors.confirmPassword = "Please confirm your new password";
			} else if (formData.newPassword !== formData.confirmPassword) {
				newErrors.confirmPassword = "Passwords don't match";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;
		try {
			setSaving(true);
			// Prepare data to send to API
			const updateData = {
				username: formData.username,
				email: formData.email,
				firstName: formData.firstName,
				lastName: formData.lastName,
				avatar: formData.avatar,
			};
			// Add password fields if changing password
			if (isChangingPassword) {
				Object.assign(updateData, {
					currentPassword: formData.currentPassword,
					newPassword: formData.newPassword,
				});
			}
			await api.put(`/Auth/profile/${userId}`, updateData);

			// După actualizarea profilului, obținem un nou token care include avatarul actualizat
			try {
				const loginResponse = await api.post("/Auth/login", {
					username: formData.username,
					password: isChangingPassword
						? formData.newPassword
						: formData.currentPassword,
				});

				if (loginResponse.data && loginResponse.data.token) {
					// Actualizăm token-ul în localStorage
					localStorage.setItem("token", loginResponse.data.token);
					localStorage.setItem(
						"refreshToken",
						loginResponse.data.refreshToken,
					);

					// Forțăm actualizarea navbar-ului folosind un eveniment custom
					window.dispatchEvent(new Event("user-profile-updated"));
				}
			} catch (loginError) {
				console.error(
					"Failed to refresh token after profile update",
					loginError,
				);
				// Continuăm chiar dacă actualizarea token-ului eșuează
			}

			if (isChangingPassword) {
				toast.success("Profile and password updated successfully");
				setFormData({
					...formData,
					currentPassword: "",
					newPassword: "",
					confirmPassword: "",
				});
				setIsChangingPassword(false);
			} else {
				toast.success("Profile information updated successfully");
			}
		} catch (error: any) {
			console.error("Failed to update profile", error);
			const message = error.response?.data || "Failed to update profile";
			toast.error(
				typeof message === "string" ? message : "An error occurred",
			);
		} finally {
			setSaving(false);
		}
	};
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleAvatarChange = (avatarId: string) => {
		setFormData({
			...formData,
			avatar: avatarId,
		});
	};

	if (loading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="text-xl">Loading...</div>
			</div>
		);
	}

	return (
		<Container className="mt-24 max-w-4xl px-4 pb-20">
			{" "}
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="mb-8 text-center"
			>
				{/* Display avatar above the profile title */}
				{formData.avatar && (
					<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-[var(--color-primary)] shadow-md">
						<img
							src={`/src/assets/avatars/${formData.avatar}.svg`}
							alt="User Avatar"
							className="h-full w-full object-cover"
							onError={(e) => {
								// If the avatar image fails to load, remove the image element
								const target = e.target as HTMLImageElement;
								target.style.display = "none";
							}}
						/>
					</div>
				)}
				{!formData.avatar && (
					<div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 shadow-md">
						<User size={40} className="text-gray-400" />
					</div>
				)}
				<h1 className="text-4xl font-bold text-[var(--color-primary)]">
					My Profile
				</h1>
				<p className="mt-2 text-gray-600">
					Manage your personal information and account settings
				</p>
			</motion.div>
			<ResponsiveCard className="mx-auto">
				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Avatar section */}
					<div className="space-y-4">
						<h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
							<Image
								size={20}
								className="text-[var(--color-primary)]"
							/>
							Profile Avatar
						</h2>

						<AvatarSelector
							selectedAvatar={formData.avatar}
							onChange={handleAvatarChange}
						/>
					</div>

					<div className="space-y-4 border-t border-gray-200 pt-6">
						<h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
							<User
								size={20}
								className="text-[var(--color-primary)]"
							/>
							Personal Information
						</h2>

						<div className="grid gap-6 md:grid-cols-2">
							<div>
								<label
									htmlFor="username"
									className="block text-sm font-medium text-gray-700"
								>
									Username
								</label>
								<input
									id="username"
									name="username"
									type="text"
									value={formData.username}
									onChange={handleInputChange}
									className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
								/>
								{errors.username && (
									<p className="mt-1 text-sm text-red-500">
										{errors.username}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700"
								>
									Email
								</label>
								<input
									id="email"
									name="email"
									type="email"
									value={formData.email}
									onChange={handleInputChange}
									className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
								/>
								{errors.email && (
									<p className="mt-1 text-sm text-red-500">
										{errors.email}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="firstName"
									className="block text-sm font-medium text-gray-700"
								>
									First Name
								</label>
								<input
									id="firstName"
									name="firstName"
									type="text"
									value={formData.firstName}
									onChange={handleInputChange}
									className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
								/>
								{errors.firstName && (
									<p className="mt-1 text-sm text-red-500">
										{errors.firstName}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="lastName"
									className="block text-sm font-medium text-gray-700"
								>
									Last Name
								</label>
								<input
									id="lastName"
									name="lastName"
									type="text"
									value={formData.lastName}
									onChange={handleInputChange}
									className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
								/>
								{errors.lastName && (
									<p className="mt-1 text-sm text-red-500">
										{errors.lastName}
									</p>
								)}{" "}
							</div>
						</div>
					</div>

					<div className="border-t border-gray-200 pt-6">
						<div className="flex items-center justify-between">
							<h2 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
								<Lock
									size={20}
									className="text-[var(--color-primary)]"
								/>
								Password
							</h2>

							<button
								type="button"
								onClick={() =>
									setIsChangingPassword(!isChangingPassword)
								}
								className="rounded-lg px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-green-50"
							>
								{isChangingPassword
									? "Cancel"
									: "Change Password"}
							</button>
						</div>

						{isChangingPassword && (
							<div className="mt-4 space-y-4">
								<div>
									<label
										htmlFor="currentPassword"
										className="block text-sm font-medium text-gray-700"
									>
										Current Password
									</label>
									<input
										id="currentPassword"
										name="currentPassword"
										type="password"
										value={formData.currentPassword}
										onChange={handleInputChange}
										className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
									/>
									{errors.currentPassword && (
										<p className="mt-1 text-sm text-red-500">
											{errors.currentPassword}
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor="newPassword"
										className="block text-sm font-medium text-gray-700"
									>
										New Password
									</label>
									<input
										id="newPassword"
										name="newPassword"
										type="password"
										value={formData.newPassword}
										onChange={handleInputChange}
										className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
									/>
									{errors.newPassword && (
										<p className="mt-1 text-sm text-red-500">
											{errors.newPassword}
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor="confirmPassword"
										className="block text-sm font-medium text-gray-700"
									>
										Confirm New Password
									</label>
									<input
										id="confirmPassword"
										name="confirmPassword"
										type="password"
										value={formData.confirmPassword}
										onChange={handleInputChange}
										className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-green-500"
									/>
									{errors.confirmPassword && (
										<p className="mt-1 text-sm text-red-500">
											{errors.confirmPassword}
										</p>
									)}
								</div>
							</div>
						)}
					</div>

					<div className="flex justify-end">
						<button
							type="submit"
							disabled={saving}
							className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-2 text-white transition-all hover:bg-green-600 disabled:bg-gray-400"
						>
							<Save size={18} />
							{saving ? "Saving..." : "Save Changes"}
						</button>
					</div>
				</form>
			</ResponsiveCard>
		</Container>
	);
}
