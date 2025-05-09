import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import HelpTutorialModal from "../../components/HelpTutorialModal";
import { FiAward } from "react-icons/fi";
import { BsRocketTakeoff } from "react-icons/bs";
import Container from "../../components/layout/Container";

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
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] py-6 sm:py-10">
			<Container>
				<motion.div
					className="mb-6 flex flex-col items-center text-center sm:mb-12"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="relative">
						<img
							src="/src/assets/code_icon_green.svg"
							alt="Projects icon"
							className="mb-3 h-12 w-12 sm:mb-4 sm:h-16 sm:w-16"
						/>
					</div>
					<h1 className="text-3xl font-extrabold text-[var(--color-primary)] sm:text-4xl md:text-5xl">
						My Projects
					</h1>
					<p className="mt-2 max-w-xl text-sm text-gray-600 sm:text-base">
						Showcase your work and earn badges!{" "}
						<FiAward className="ml-1 inline text-amber-500" />
					</p>
					<div className="mt-4 flex flex-col items-center gap-3 sm:mt-6 sm:flex-row sm:gap-4">
						<button
							onClick={() => navigate("/admin/add-project")}
							className="w-full transform rounded-xl bg-[var(--color-primary)] px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl sm:w-auto sm:px-6 sm:py-3 sm:text-base"
						>
							<BsRocketTakeoff className="mr-2 inline" /> Add New
							Project
						</button>
						<motion.button
							onClick={() => setIsHelpModalOpen(true)}
							className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-400 px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-1 hover:shadow-lg sm:w-auto sm:py-3 sm:text-base"
							title="Ajutor pentru încărcarea proiectelor"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							animate={{
								boxShadow: [
									"0 0 0 0 rgba(99, 102, 241, 0.4)",
									"0 0 10px 3px rgba(99, 102, 241, 0.3)",
									"0 0 0 0 rgba(99, 102, 241, 0.4)",
								],
							}}
							transition={{
								boxShadow: {
									repeat: Infinity,
									duration: 2,
									ease: "easeInOut",
								},
							}}
						>
							<HelpCircle size={18} className="drop-shadow-sm" />
							Need Help?
						</motion.button>
					</div>

					<div className="mt-6 flex flex-wrap justify-center gap-2 sm:mt-8 sm:gap-4">
						<button
							onClick={() => setActiveTab("All")}
							className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:px-6 sm:py-2 sm:text-sm ${
								activeTab === "All"
									? "bg-blue-100 text-blue-800"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							All ({portfolios.length})
						</button>
						<button
							onClick={() => setActiveTab("Pending")}
							className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:px-6 sm:py-2 sm:text-sm ${
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
							className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:px-6 sm:py-2 sm:text-sm ${
								activeTab === "Approved"
									? "bg-green-100 text-green-800"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							Approved (
							{
								portfolios.filter(
									(p) => p.status === "Approved",
								).length
							}
							)
						</button>
						<button
							onClick={() => setActiveTab("Rejected")}
							className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all sm:px-6 sm:py-2 sm:text-sm ${
								activeTab === "Rejected"
									? "bg-red-100 text-red-800"
									: "bg-gray-100 text-gray-600 hover:bg-gray-200"
							}`}
						>
							Rejected (
							{
								portfolios.filter(
									(p) => p.status === "Rejected",
								).length
							}
							)
						</button>
					</div>
				</motion.div>

				<div className="mx-auto">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
						{filteredPortfolios.length === 0 ? (
							<div className="col-span-full p-8 text-center text-gray-500">
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
									className="transform cursor-pointer overflow-hidden rounded-xl bg-white p-4 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl sm:p-6"
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									onClick={() =>
										navigate(`/project/${portfolio.id}`)
									}
								>
									<div className="mb-3 flex items-center justify-between sm:mb-4">
										<h2 className="truncate pr-2 text-lg font-bold text-gray-800 sm:text-xl">
											{portfolio.title}
										</h2>
										<span
											className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold sm:px-3 sm:py-1 sm:text-sm ${
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

									<p className="mb-3 line-clamp-2 text-sm text-gray-600 sm:mb-4 sm:text-base">
										{portfolio.description}
									</p>

									<div
										className={`relative mb-3 overflow-hidden rounded-lg p-3 sm:mb-4 sm:p-4 ${
											portfolio.status === "Pending"
												? "bg-gradient-to-br from-yellow-50 to-yellow-100"
												: portfolio.status ===
													  "Rejected"
													? "bg-gradient-to-br from-red-50 to-red-100"
													: "bg-gradient-to-br from-green-50 to-green-100"
										}`}
									>
										<div className="relative z-10">
											{portfolio.status === "Pending" ? (
												<div className="flex flex-col items-center text-center">
													<span className="text-2xl sm:text-3xl">
														⏳
													</span>
													<p className="mt-1 text-xs font-medium text-yellow-700 sm:mt-2 sm:text-sm">
														Your project is being
														reviewed. We'll notify
														you once it's done!
													</p>
												</div>
											) : portfolio.status ===
											  "Rejected" ? (
												<div className="flex flex-col items-center text-center">
													<span className="text-2xl sm:text-3xl">
														💪
													</span>
													<p className="mt-1 text-xs font-medium text-red-700 sm:mt-2 sm:text-sm">
														Don't give up! Read the
														feedback and try again.
													</p>
												</div>
											) : (
												<div className="flex flex-col items-center text-center">
													<span className="text-2xl sm:text-3xl">
														🎉
													</span>
													<p className="mt-1 text-xs font-medium text-green-700 sm:mt-2 sm:text-sm">
														Congratulations! Your
														project has been
														approved!
													</p>
												</div>
											)}
										</div>
										<div className="absolute -right-8 -top-8 h-24 w-24 rotate-12 opacity-10 sm:h-32 sm:w-32">
											{portfolio.status === "Pending" ? (
												<div className="text-[60px] sm:text-[80px]">
													⌛
												</div>
											) : portfolio.status ===
											  "Rejected" ? (
												<div className="text-[60px] sm:text-[80px]">
													🎯
												</div>
											) : (
												<div className="text-[60px] sm:text-[80px]">
													🏆
												</div>
											)}
										</div>
									</div>

									<div className="flex items-center gap-2 sm:gap-4">
										<div className="flex items-center gap-1 text-sm text-[var(--color-primary)] sm:gap-2">
											<svg
												xmlns="http://www.w3.org/2000/svg"
												className="h-4 w-4 sm:h-5 sm:w-5"
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
											<span className="text-xs sm:text-sm">
												View Details
											</span>
										</div>
										{portfolio.externalBadge && (
											<div className="ml-auto flex items-center gap-1 sm:gap-2">
												<div className="relative h-8 w-8 overflow-hidden rounded-full shadow-inner sm:h-10 sm:w-10">
													<img
														src={displayBadgeIcon(
															portfolio.externalBadge,
														)}
														alt={
															portfolio
																.externalBadge
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
												<span className="max-w-[80px] truncate text-xs font-medium text-gray-600 sm:max-w-[120px] sm:text-sm">
													{
														portfolio.externalBadge
															.name
													}
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
			</Container>
		</div>
	);
}
