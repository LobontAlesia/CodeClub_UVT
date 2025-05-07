import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import api from "../../utils/api";
import CertificateModal from "../../components/CertificateModal";

interface ExternalBadge {
	id: string;
	name: string;
	icon: string;
	category: string;
}

interface User {
	username: string;
	email: string;
}

interface Portfolio {
	id: string;
	title: string;
	description: string;
	fileUrl: string;
	externalLink: string;
	screenshotUrl: string;
	certificateUrl?: string;
	isScratchProject?: boolean;
	status: "Pending" | "Approved" | "Rejected";
	feedback: string;
	externalBadge?: {
		id: string;
		name: string;
		icon: string;
	};
	user: User;
}

function getFileName(portfolio: Portfolio): string {
	const defaultName = portfolio.title?.replace(/\s+/g, "_") || "project";

	if (portfolio.fileUrl.startsWith("data:text/x-python"))
		return `${defaultName}.py`;
	if (portfolio.fileUrl.startsWith("data:text/x-c++src"))
		return `${defaultName}.cpp`;
	if (portfolio.fileUrl.startsWith("data:text/html"))
		return `${defaultName}.html`;
	if (portfolio.fileUrl.startsWith("data:application/javascript"))
		return `${defaultName}.js`;
	if (portfolio.fileUrl.startsWith("data:text/css"))
		return `${defaultName}.css`;
	if (portfolio.fileUrl.startsWith("data:application/pdf"))
		return `${defaultName}.pdf`;
	if (portfolio.fileUrl.startsWith("data:image/png"))
		return `${defaultName}.png`;
	if (portfolio.fileUrl.startsWith("data:image/jpeg"))
		return `${defaultName}.jpg`;
	if (portfolio.fileUrl.startsWith("data:image/svg+xml"))
		return `${defaultName}.svg`;
	if (portfolio.fileUrl.startsWith("data:text/plain"))
		return `${defaultName}.txt`;
	if (portfolio.fileUrl.startsWith("data:application/zip"))
		return `${defaultName}.zip`;

	return defaultName;
}

export default function ProjectReviewsPage() {
	const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
	const [badges, setBadges] = useState<ExternalBadge[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState<
		"Pending" | "Approved" | "Rejected"
	>("Pending");

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const [portfoliosResponse, badgesResponse] = await Promise.all([
				api.get("/portfolio/admin"),
				api.get("/externalbadge"),
			]);
			setPortfolios(portfoliosResponse.data);
			setBadges(badgesResponse.data);
		} catch (error) {
			console.error("Error fetching data:", error);
			toast.error("Failed to load projects");
		} finally {
			setLoading(false);
		}
	};

	const handleReviewSubmit = async (
		portfolioId: string,
		status: "Approved" | "Rejected",
		feedback: string,
		badgeId?: string,
	) => {
		try {
			// IMPORTANT: ruta corecta pentru admin
			const params = new URLSearchParams({
				status,
				feedback: feedback || "",
			});
			if (badgeId) {
				params.append("externalBadgeId", badgeId);
			}

			await api.put(
				`/portfolio/${portfolioId}/status?${params.toString()}`,
			);

			toast.success(`Project ${status.toLowerCase()} successfully!`);
			fetchData();
		} catch (error) {
			console.error("Error updating project:", error);
			toast.error("Failed to update project");
		}
	};

	const filteredPortfolios = portfolios.filter((p) => p.status === activeTab);

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
				<img
					src="/src/assets/code_icon_green.svg"
					alt="Review icon"
					className="mb-4 h-16 w-16"
				/>
				<h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
					Project Reviews
				</h1>
				<p className="mt-2 max-w-xl text-gray-600">
					Review student projects and award badges 🎖️
				</p>
			</motion.div>

			<div className="mx-auto max-w-4xl">
				<div className="mb-6 flex justify-center space-x-4">
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

				<div className="space-y-6">
					{filteredPortfolios.length === 0 ? (
						<div className="text-center text-gray-500">
							No {activeTab.toLowerCase()} projects found
						</div>
					) : (
						filteredPortfolios.map((portfolio) => (
							<ProjectReviewCard
								key={portfolio.id}
								portfolio={portfolio}
								badges={badges}
								onReview={handleReviewSubmit}
							/>
						))
					)}
				</div>
			</div>
		</div>
	);
}

interface ProjectReviewCardProps {
	portfolio: Portfolio;
	badges: ExternalBadge[];
	onReview: (
		portfolioId: string,
		status: "Approved" | "Rejected",
		feedback: string,
		badgeId?: string,
	) => Promise<void>;
}

function ProjectReviewCard({
	portfolio,
	badges,
	onReview,
}: ProjectReviewCardProps) {
	const [feedback, setFeedback] = useState(portfolio.feedback || "");
	const [selectedBadgeId, setSelectedBadgeId] = useState(
		portfolio.externalBadge?.id || "",
	);
	const [isReviewing, setIsReviewing] = useState(false);
	const [showCertificateModal, setShowCertificateModal] = useState(false);

	const handleSubmit = async (status: "Approved" | "Rejected") => {
		if (!feedback.trim()) {
			toast.error("Feedback is required before submitting the review!");
			return;
		}

		setIsReviewing(true);
		try {
			await onReview(
				portfolio.id,
				status,
				feedback,
				status === "Approved" ? selectedBadgeId : undefined,
			);
		} finally {
			setIsReviewing(false);
		}
	};

	return (
		<motion.div
			className="transform overflow-hidden rounded-xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
		>
			{/* Certificate Modal using the dedicated component */}
			{portfolio?.certificateUrl && (
				<CertificateModal
					isOpen={showCertificateModal}
					onClose={() => setShowCertificateModal(false)}
					certificateUrl={portfolio.certificateUrl}
					projectTitle={portfolio.title}
				/>
			)}

			<div className="mb-4 flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-gray-800">
						{portfolio.title}
					</h2>
					<p className="text-sm text-gray-500">
						by {portfolio.user.username} ({portfolio.user.email})
					</p>
				</div>
				<span
					className={`rounded-full px-3 py-1 text-sm font-semibold ${
						portfolio.status === "Approved"
							? "bg-green-100 text-green-800"
							: portfolio.status === "Rejected"
								? "bg-red-100 text-red-800"
								: "bg-yellow-100 text-yellow-800"
					}`}
				>
					{portfolio.status}
				</span>
			</div>

			<p className="mb-4 text-gray-600">{portfolio.description}</p>

			{portfolio.screenshotUrl && (
				<div className="mb-4 overflow-hidden rounded-lg">
					<img
						src={portfolio.screenshotUrl}
						alt="Project screenshot"
						className="max-h-[300px] w-full object-contain"
					/>
				</div>
			)}

			<div className="mb-4 flex flex-wrap gap-3">
				{portfolio.externalLink && (
					<button
						onClick={() =>
							window.open(portfolio.externalLink, "_blank")
						}
						className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-[var(--color-primary)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
								clipRule="evenodd"
							/>
						</svg>
						View Project Page
					</button>
				)}
				<button
					onClick={() => {
						const link = document.createElement("a");
						link.href = portfolio.fileUrl;
						link.download = getFileName(portfolio);
						document.body.appendChild(link);
						link.click();
						document.body.removeChild(link);
					}}
					className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-[var(--color-primary)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
					Download Project File
				</button>
				{portfolio.certificateUrl && (
					<button
						onClick={() => setShowCertificateModal(true)}
						className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
							<path
								fillRule="evenodd"
								d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
								clipRule="evenodd"
							/>
						</svg>
						View Dr. Scratch Certificate
					</button>
				)}
			</div>

			{portfolio.isScratchProject && (
				<div className="mb-4 rounded-md bg-blue-50 p-4">
					<div className="flex">
						<div className="flex-shrink-0">
							<svg
								className="h-5 w-5 text-blue-600"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
						</div>
						<div className="ml-3">
							<h3 className="text-sm font-medium text-blue-800">
								Scratch Project
							</h3>
							<div className="mt-1 text-sm text-blue-700">
								<p>
									This project was created in Scratch and{" "}
									{portfolio.certificateUrl
										? "the student has uploaded a Dr. Scratch certificate."
										: "doesn't have a Dr. Scratch certificate yet."}
								</p>
								{!portfolio.certificateUrl && (
									<p className="mt-1 text-xs text-blue-600">
										The student should analyze their project
										on{" "}
										<a
											href="https://www.drscratch.org/"
											target="_blank"
											rel="noopener noreferrer"
											className="underline"
										>
											Dr. Scratch
										</a>
										.
									</p>
								)}
								{portfolio.status === "Pending" &&
									portfolio.certificateUrl && (
										<p className="mt-1 font-medium text-blue-800">
											Recommendation: Award the "Scratch
											Developer" badge for this project.
										</p>
									)}
							</div>
						</div>
					</div>
				</div>
			)}

			<div className="space-y-4 rounded-lg bg-gray-50 p-4">
				<div>
					<label className="block text-sm font-medium text-gray-700">
						Feedback
					</label>
					<textarea
						value={feedback}
						onChange={(e) => setFeedback(e.target.value)}
						rows={3}
						className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
						placeholder="Provide feedback to the student..."
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700">
						Badge to Award
					</label>
					<select
						value={selectedBadgeId}
						onChange={(e) => setSelectedBadgeId(e.target.value)}
						className="mt-1 w-full rounded-lg border border-gray-300 p-2 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
					>
						<option value="">Select a badge...</option>
						{badges.map((badge) => (
							<option key={badge.id} value={badge.id}>
								{badge.name} - {badge.category}
							</option>
						))}
					</select>
				</div>

				<div className="flex justify-end gap-4">
					<button
						onClick={() => handleSubmit("Rejected")}
						disabled={isReviewing}
						className="transform rounded-lg bg-red-500 px-4 py-2 font-semibold text-white shadow transition-all hover:-translate-y-1 hover:bg-red-600 hover:shadow-lg disabled:opacity-50"
					>
						<span className="flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
									clipRule="evenodd"
								/>
							</svg>
							Reject
						</span>
					</button>
					<button
						onClick={() => handleSubmit("Approved")}
						disabled={isReviewing}
						className="transform rounded-lg bg-green-500 px-4 py-2 font-semibold text-white shadow transition-all hover:-translate-y-1 hover:bg-green-600 hover:shadow-lg disabled:opacity-50"
					>
						<span className="flex items-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="mr-2 h-5 w-5"
								viewBox="0 0 20 20"
								fill="currentColor"
							>
								<path
									fillRule="evenodd"
									d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
									clipRule="evenodd"
								/>
							</svg>
							Approve
						</span>
					</button>
				</div>
			</div>
		</motion.div>
	);
}
