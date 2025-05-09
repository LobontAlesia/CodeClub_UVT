import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import logo from "../../assets/Code_Club_Green_Stacked.png";
import api from "../../utils/api";
import { jwtDecode } from "jwt-decode";
import Container from "../../components/layout/Container";

interface IFormInput {
	username: string;
	password: string;
}

export function LoginPage() {
	const navigate = useNavigate();
	const { register, handleSubmit } = useForm<IFormInput>();
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const onSubmit: SubmitHandler<IFormInput> = async (data) => {
		if (isSubmitting) return;

		try {
			setIsSubmitting(true);
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
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="login-page flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white p-4">
			<Container className="flex w-full flex-col items-center justify-center py-6 sm:py-10">
				<img
					src={logo}
					alt="CodeClub Logo"
					className="mb-4 h-auto w-32 sm:h-40 sm:w-auto"
				/>

				<div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl sm:rounded-3xl sm:p-8">
					<h2 className="mb-4 text-center text-2xl font-extrabold text-[#41b653] sm:mb-6 sm:text-3xl">
						Welcome to CodeClub
					</h2>

					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col gap-4">
							{/* Username Input */}
							<div>
								<label
									htmlFor="username"
									className="block text-sm font-medium text-gray-700"
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
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
									/>
								</div>
							</div>

							{/* Password Input */}
							<div>
								<label
									htmlFor="password"
									className="block text-sm font-medium text-gray-700"
								>
									Password
								</label>
								<div className="relative mt-1">
									<input
										id="password"
										type={
											showPassword ? "text" : "password"
										}
										placeholder="Your password"
										{...register("password", {
											required: true,
										})}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
									/>
									<button
										type="button"
										onClick={() =>
											setShowPassword(!showPassword)
										}
										className="absolute right-3 top-1/2 -translate-y-1/2 transform p-1 text-gray-500 transition-all hover:text-green-600"
									>
										{showPassword ? (
											<IconEyeOff
												size={20}
												className="text-gray-500"
											/>
										) : (
											<IconEye
												size={20}
												className="text-gray-500"
											/>
										)}
									</button>
								</div>
							</div>

							{/* Login Button */}
							<button
								type="submit"
								disabled={isSubmitting}
								className="w-full rounded-xl bg-[#41b653] px-4 py-2.5 text-white transition-all hover:bg-green-600 focus:outline-none active:bg-green-700 disabled:opacity-70"
							>
								{isSubmitting ? "Logging in..." : "Login"}
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
								<p className="mt-2 text-sm">
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
			</Container>
		</div>
	);
}
