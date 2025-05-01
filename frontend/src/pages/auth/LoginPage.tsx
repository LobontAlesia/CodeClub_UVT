import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import logo from "../../assets/Code_Club_Green_Stacked.png";
import api from "../../utils/api";
import { jwtDecode } from "jwt-decode";

interface IFormInput {
	username: string;
	password: string;
}

export function LoginPage() {
	const navigate = useNavigate();
	const { register, handleSubmit } = useForm<IFormInput>();
	const [showPassword, setShowPassword] = useState(false);

	const onSubmit: SubmitHandler<IFormInput> = async (data) => {
		try {
			console.log("Attempting login with:", { username: data.username });
			const response = await api.post("/Auth/login", {
				username: data.username,
				password: data.password,
			});

			if (response.status !== 200) throw new Error("Login failed");

			const result = response.data;
			console.log("Login successful, received token");

			localStorage.setItem("token", result.token);
			localStorage.setItem("refreshToken", result.refreshToken);

			try {
				const decoded = jwtDecode<{ roles: string; sub: string }>(
					result.token,
				);
				console.log("Token decoded successfully");
				localStorage.setItem("role", decoded.roles);
				localStorage.setItem("userId", decoded.sub);
			} catch (error) {
				console.error("Failed to decode token:", error);
			}

			toast.success("Logged in successfully!");
			navigate("/dashboard");
		} catch (error: any) {
			console.error(
				"Login error:",
				error.response?.data || error.message,
			);
			console.error("Full error object:", error);
			toast.error(error.response?.data?.message || "Invalid credentials");
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white p-4">
			<img src={logo} alt="CodeClub Logo" className="mb-2 h-40" />

			<div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl">
				<h2 className="mb-6 text-center text-3xl font-extrabold text-[#41b653]">
					Welcome to CodeClub
				</h2>

				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="flex flex-col gap-4">
						{/* Username Input */}
						<div>
							<label
								htmlFor="username"
								className="text-gray-700 block text-sm font-medium"
							>
								Username
							</label>
							<div className="mt-1">
								<input
									id="username"
									type="text"
									placeholder="Enter your username"
									{...register("username", {
										required: true,
									})}
									className="border-gray-300 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
								/>
							</div>
						</div>

						{/* Password Input */}
						<div>
							<label
								htmlFor="password"
								className="text-gray-700 block text-sm font-medium"
							>
								Password
							</label>
							<div className="relative mt-1">
								<input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="Your password"
									{...register("password", {
										required: true,
									})}
									className="border-gray-300 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword(!showPassword)
									}
									className="text-gray-500 absolute right-3 top-1/2 -translate-y-1/2 transform p-1 transition-all hover:text-green-600"
								>
									{showPassword ? (
										<IconEyeOff
											size={20}
											className="text-white"
										/>
									) : (
										<IconEye
											size={20}
											className="text-white"
										/>
									)}
								</button>
							</div>
						</div>

						{/* Login Button */}
						<button
							type="submit"
							className="w-full rounded-xl bg-[#41b653] px-4 py-2 text-white transition-all hover:bg-green-600 focus:outline-none"
						>
							Login
						</button>

						{/* Links */}
						<div className="mt-4 text-center">
							<p className="text-sm text-green-500">
								<a
									href="/forgot-password"
									className="hover:text-green-600"
								>
									Forgot Password?
								</a>
							</p>
							<p className="text-sm">
								Don't have an account?{" "}
								<a
									href="/register"
									className="font-semibold text-[#41b653] hover:text-green-600"
								>
									Create Account
								</a>
							</p>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
