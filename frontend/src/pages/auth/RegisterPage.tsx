import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/Code_Club_Green_Stacked.png";
import Container from "../../components/layout/Container";

const BACKEND_URL =
	import.meta.env.VITE_BACKEND_URL_HTTP || "http://localhost:5000";

interface IFormInput {
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

export function RegisterPage() {
	const navigate = useNavigate();
	const {
		register,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<IFormInput>();
	const [loading, setLoading] = useState(false);

	// Regula pentru validarea parolei
	const passwordPattern =
		/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

	const onSubmit: SubmitHandler<IFormInput> = async (data) => {
		try {
			if (data.password !== data.confirmPassword) {
				toast.error("Passwords don't match");
				return;
			}

			setLoading(true);
			const response = await fetch(`${BACKEND_URL}/auth/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				toast.error(errorData.message || "Registration failed");
				throw new Error("Registration failed");
			}

			toast.success("Registration successful! You can now log in.");
			navigate("/login");
		} catch (error) {
			console.error(error);
			toast.error("Error occurred during registration");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="register-page flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white p-4">
			<Container className="flex w-full flex-col items-center justify-center py-6 sm:py-10">
				<img
					src={logo}
					alt="CodeClub Logo"
					className="mb-4 h-auto w-32 sm:mb-8 sm:h-40 sm:w-auto"
				/>

				<div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl sm:rounded-3xl sm:p-8">
					<h2 className="mb-4 text-center text-2xl font-extrabold text-[#41b653] sm:mb-6 sm:text-3xl">
						Register for CodeClub
					</h2>

					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="flex flex-col gap-3 sm:gap-4">
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
										placeholder="Choose a username"
										{...register("username", {
											required: "Username is required",
										})}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
									/>
									{errors.username && (
										<p className="mt-1 text-xs text-red-500">
											{errors.username.message}
										</p>
									)}
								</div>
							</div>

							{/* First Name Input */}
							<div>
								<label
									htmlFor="firstName"
									className="block text-sm font-medium text-gray-700"
								>
									First Name
								</label>
								<div className="mt-1">
									<input
										id="firstName"
										type="text"
										placeholder="Your first name"
										{...register("firstName", {
											required: "First name is required",
										})}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
									/>
									{errors.firstName && (
										<p className="mt-1 text-xs text-red-500">
											{errors.firstName.message}
										</p>
									)}
								</div>
							</div>

							{/* Last Name Input */}
							<div>
								<label
									htmlFor="lastName"
									className="block text-sm font-medium text-gray-700"
								>
									Last Name
								</label>
								<div className="mt-1">
									<input
										id="lastName"
										type="text"
										placeholder="Your last name"
										{...register("lastName", {
											required: "Last name is required",
										})}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
									/>
									{errors.lastName && (
										<p className="mt-1 text-xs text-red-500">
											{errors.lastName.message}
										</p>
									)}
								</div>
							</div>

							{/* Email Input */}
							<div>
								<label
									htmlFor="email"
									className="block text-sm font-medium text-gray-700"
								>
									Email
								</label>
								<div className="mt-1">
									<input
										id="email"
										type="email"
										placeholder="you@example.com"
										{...register("email", {
											required: "Email is required",
										})}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
									/>
									{errors.email && (
										<p className="mt-1 text-xs text-red-500">
											{errors.email.message}
										</p>
									)}
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
								<div className="mt-1">
									<input
										id="password"
										type="password"
										placeholder="Your password"
										{...register("password", {
											required: "Password is required",
											pattern: {
												value: passwordPattern,
												message:
													"Password must be at least 8 characters long, contain a number, an uppercase letter, and a special character",
											},
										})}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
									/>
									{errors.password && (
										<p className="mt-1 text-wrap text-xs text-red-500">
											{errors.password.message}
										</p>
									)}
								</div>
							</div>

							{/* Confirm Password Input */}
							<div>
								<label
									htmlFor="confirmPassword"
									className="block text-sm font-medium text-gray-700"
								>
									Confirm Password
								</label>
								<div className="mt-1">
									<input
										id="confirmPassword"
										type="password"
										placeholder="Confirm your password"
										{...register("confirmPassword", {
											required:
												"Please confirm your password",
											validate: (value) =>
												value === watch("password") ||
												"Passwords do not match",
										})}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-green-400"
									/>
									{errors.confirmPassword && (
										<p className="mt-1 text-xs text-red-500">
											{errors.confirmPassword.message}
										</p>
									)}
								</div>
							</div>

							{/* Register Button */}
							<button
								type="submit"
								disabled={loading}
								className="mt-2 w-full rounded-xl bg-[#41b653] px-4 py-2.5 text-white transition-all hover:bg-green-600 focus:outline-none active:bg-green-700 disabled:opacity-70"
							>
								{loading ? "Registering..." : "Register"}
							</button>

							{/* Links */}
							<div className="mt-2 text-center sm:mt-4">
								<p className="text-sm">
									Already have an account?{" "}
									<a
										href="/login"
										className="font-semibold text-[#41b653] hover:text-green-600"
									>
										Login
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
