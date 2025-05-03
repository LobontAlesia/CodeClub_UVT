import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import HelpTutorialModal from "../../components/HelpTutorialModal";

interface Portfolio {
	id: string;
	title: string;
	description: string;
	fileUrl: string;
	externalLink: string;
	screenshotUrl: string;
	status: "Pending" | "Approved" | "Rejected";
	feedback?: string;
	externalBadge?: {
		name: string;
		icon: string;
	};
}

function displayBadgeIcon(badge: { icon: string | undefined }) {
	if (!badge.icon) return "/src/assets/default_badge.svg";
	if (badge.icon.includes("data:image")) {
		return badge.icon.substring(badge.icon.indexOf("data:image"));
	}
	return badge.icon;
}

export default function MyProjectsPage() {
	const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<
		"All" | "Pending" | "Approved" | "Rejected"
	>("All");
	const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		fetchPortfolios();
	}, []);

	const fetchPortfolios = async () => {
		try {
			const response = await api.get("/portfolio/user");
			setPortfolios(response.data);
		} catch (error) {
			console.error("Error fetching portfolios:", error);
			toast.error("Failed to load your projects");
		} finally {
			setLoading(false);
		}
	};

	const filteredPortfolios =
		activeTab === "All"
			? portfolios
			: portfolios.filter((p) => p.status === activeTab);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white p-4">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] px-6 py-10">
			<motion.div
				className="mb-12 flex flex-col items-center text-center"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<div className="relative">
					<img
						src="/src/assets/code_icon_green.svg"
						alt="Projects icon"
						className="mb-4 h-16 w-16"
					/>
					<motion.button
						onClick={() => setIsHelpModalOpen(true)}
						className="absolute -right-12 -top-2 transform rounded-full bg-white p-2 text-yellow-500 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
						title="Ajutor pentru încărcarea proiectelor"
						whileHover={{ scale: 1.1 }}
						animate={{
							boxShadow: [
								"0 0 0 0 rgba(234, 179, 8, 0.7)",
								"0 0 8px 4px rgba(234, 179, 8, 0)",
							],
						}}
						transition={{
							repeat: Infinity,
							duration: 1.2,
							ease: "easeInOut",
						}}
					>
						<HelpCircle size={24} />
					</motion.button>
				</div>
				<h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
					My Projects
				</h1>
				<p className="mt-2 max-w-xl text-gray-600">
					Showcase your work and earn badges! 🏆
				</p>
				<button
					onClick={() => navigate("/admin/add-project")}
					className="mt-6 transform rounded-xl bg-[var(--color-primary)] px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
				>
					🚀 Add New Project
				</button>

				<div className="mt-8 flex justify-center space-x-4">
					<button
						onClick={() => setActiveTab("All")}
						className={`rounded-lg px-6 py-2 font-semibold transition-all ${
							activeTab === "All"
								? "bg-blue-100 text-blue-800"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						All ({portfolios.length})
					</button>
					<button
						onClick={() => setActiveTab("Pending")}
						className={`rounded-lg px-6 py-2 font-semibold transition-all ${
							activeTab === "Pending"
								? "bg-yellow-100 text-yellow-800"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						Pending (
						{
							portfolios.filter((p) => p.status === "Pending")
								.length
						}
						)
					</button>
					<button
						onClick={() => setActiveTab("Approved")}
						className={`rounded-lg px-6 py-2 font-semibold transition-all ${
							activeTab === "Approved"
								? "bg-green-100 text-green-800"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						Approved (
						{
							portfolios.filter((p) => p.status === "Approved")
								.length
						}
						)
					</button>
					<button
						onClick={() => setActiveTab("Rejected")}
						className={`rounded-lg px-6 py-2 font-semibold transition-all ${
							activeTab === "Rejected"
								? "bg-red-100 text-red-800"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						Rejected (
						{
							portfolios.filter((p) => p.status === "Rejected")
								.length
						}
						)
					</button>
				</div>
			</motion.div>

			<div className="mx-auto max-w-screen-xl">
				<div className="grid gap-6 md:grid-cols-3">
					{filteredPortfolios.length === 0 ? (
						<div className="col-span-2 text-center text-gray-500">
							No{" "}
							{activeTab.toLowerCase() === "all"
								? ""
								: activeTab.toLowerCase()}{" "}
							projects found
						</div>
					) : (
						filteredPortfolios.map((portfolio) => (
							<motion.div
								key={portfolio.id}
								className="transform cursor-pointer overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								onClick={() =>
									navigate(`/project/${portfolio.id}`)
								}
							>
								<div className="mb-4 flex items-center justify-between">
									<h2 className="text-xl font-bold text-gray-800">
										{portfolio.title}
									</h2>
									<span
										className={`rounded-full px-3 py-1 text-sm font-semibold ${
											portfolio.status === "Approved"
												? "bg-green-100 text-green-800"
												: portfolio.status ===
													  "Rejected"
													? "bg-red-100 text-red-800"
													: "bg-yellow-100 text-yellow-800"
										}`}
									>
										{portfolio.status}
									</span>
								</div>

								<p className="mb-4 text-gray-600">
									{portfolio.description}
								</p>

								<div
									className={`relative mb-4 overflow-hidden rounded-lg p-6 ${
										portfolio.status === "Pending"
											? "bg-gradient-to-br from-yellow-50 to-yellow-100"
											: portfolio.status === "Rejected"
												? "bg-gradient-to-br from-red-50 to-red-100"
												: "bg-gradient-to-br from-green-50 to-green-100"
									}`}
								>
									<div className="relative z-10">
										{portfolio.status === "Pending" ? (
											<div className="flex flex-col items-center text-center">
												<span className="text-4xl">
													⏳
												</span>
												<p className="mt-2 font-medium text-yellow-700">
													Your project is being
													reviewed. We'll notify you
													once it's done!
												</p>
											</div>
										) : portfolio.status === "Rejected" ? (
											<div className="flex flex-col items-center text-center">
												<span className="text-4xl">
													💪
												</span>
												<p className="mt-2 font-medium text-red-700">
													Don't give up! Read the
													feedback and try again.
												</p>
											</div>
										) : (
											<div className="flex flex-col items-center text-center">
												<span className="text-4xl">
													🎉
												</span>
												<p className="mt-2 font-medium text-green-700">
													Congratulations! Your
													project has been approved!
												</p>
											</div>
										)}
									</div>
									<div className="absolute -right-8 -top-8 h-32 w-32 rotate-12 opacity-10">
										{portfolio.status === "Pending" ? (
											<div className="text-[80px]">
												⌛
											</div>
										) : portfolio.status === "Rejected" ? (
											<div className="text-[80px]">
												🎯
											</div>
										) : (
											<div className="text-[80px]">
												🏆
											</div>
										)}
									</div>
								</div>

								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2 text-[var(--color-primary)]">
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
											/>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
											/>
										</svg>
										View Details
									</div>
									{portfolio.externalBadge && (
										<div className="ml-auto flex items-center gap-2">
											<div className="relative h-12 w-12 overflow-hidden rounded-full shadow-inner">
												<img
													src={displayBadgeIcon(
														portfolio.externalBadge,
													)}
													alt={
														portfolio.externalBadge
															.name
													}
													className="h-full w-full object-cover"
													onError={(e) => {
														const target =
															e.target as HTMLImageElement;
														target.src =
															"/src/assets/default_badge.svg";
													}}
												/>
											</div>
											<span className="text-sm font-medium text-gray-600">
												{portfolio.externalBadge.name}
											</span>
										</div>
									)}
								</div>
							</motion.div>
						))
					)}
				</div>
			</div>
			<HelpTutorialModal
				isOpen={isHelpModalOpen}
				onClose={() => setIsHelpModalOpen(false)}
			/>
		</div>
	);
}
