import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import api from "../../utils/api";
import CertificateModal from "../../components/CertificateModal";

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
	feedback?: string;
	externalBadge?: {
		id: string;
		name: string;
		icon: string;
	};
	user: {
		username: string;
		email: string;
	};
}

// Functia ca in MyProjectsPage — afiseaza corect badge-ul
function displayBadgeIcon(badge: { icon: string | undefined }) {
	if (!badge || !badge.icon) return "/src/assets/default_badge.svg";
	if (badge.icon.includes("data:image")) {
		return badge.icon.substring(badge.icon.indexOf("data:image"));
	}
	return badge.icon;
}

export default function ProjectDetailsPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
	const [loading, setLoading] = useState(true);
	const [showCertificateModal, setShowCertificateModal] = useState(false);

	useEffect(() => {
		fetchProject();
	}, [id]);

	const fetchProject = async () => {
		if (!id) return;

		try {
			const response = await api.get(`/portfolio/${id}`);
			setPortfolio(response.data);
		} catch (error) {
			console.error("Error fetching project:", error);
			toast.error("Failed to load project");
			navigate("/my-projects");
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		if (
			!portfolio ||
			!window.confirm("Are you sure you want to delete this project?")
		)
			return;

		try {
			await api.delete(`/portfolio/${portfolio.id}`);
			toast.success("Project deleted successfully!");
			navigate("/my-projects");
		} catch (error) {
			console.error("Error deleting project:", error);
			toast.error("Failed to delete project");
		}
	};

	const handleEdit = () => {
		navigate(`/edit-project/${id}`);
	};

	const handleDownload = () => {
		if (!portfolio?.fileUrl) return;

		const link = document.createElement("a");
		link.href = portfolio.fileUrl;
		link.download = `${portfolio.title.replace(/\s+/g, "_")}_project`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white p-4">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
			</div>
		);
	}

	if (!portfolio) {
		return null;
	}

	const statusClassName = {
		Approved: "bg-green-100 text-green-800",
		Rejected: "bg-red-100 text-red-800",
		Pending: "bg-yellow-100 text-yellow-800",
	}[portfolio.status];

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] px-6 py-10">
			{/* Certificate Modal using the dedicated component */}
			{portfolio?.certificateUrl && (
				<CertificateModal
					isOpen={showCertificateModal}
					onClose={() => setShowCertificateModal(false)}
					certificateUrl={portfolio.certificateUrl}
					projectTitle={portfolio.title}
				/>
			)}

			<div className="mx-auto max-w-4xl">
				{/* Breadcrumb navigation */}
				<div className="mb-6">
					<button
						onClick={() => navigate("/my-projects")}
						className="group flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-gray-600 shadow-sm transition-all hover:-translate-y-0.5 hover:text-black hover:shadow-md"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5 transition-transform group-hover:-translate-x-1"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M15 19l-7-7 7-7"
							/>
						</svg>
						Back to My Projects
					</button>
				</div>

				{/* Project Header */}
				<motion.div
					className="mb-8 overflow-hidden rounded-xl bg-white p-8 shadow-lg"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="mb-4 flex items-center justify-between">
						<h1 className="text-3xl font-bold text-gray-800">
							{portfolio.title}
						</h1>
						<div className="flex items-center gap-4">
							<span
								className={`rounded-full px-4 py-2 text-sm font-semibold ${statusClassName}`}
							>
								{portfolio.status}
							</span>
							<div className="flex gap-2">
								<button
									onClick={handleEdit}
									className="transform rounded-lg bg-yellow-500 px-4 py-2 font-bold text-white shadow transition-all hover:-translate-y-1 hover:bg-yellow-600 hover:shadow-lg"
								>
									<FiEdit className="mr-2 inline-block" />
									Edit
								</button>
								<button
									onClick={handleDelete}
									className="transform rounded-lg bg-red-500 px-4 py-2 font-bold text-white shadow transition-all hover:-translate-y-1 hover:bg-red-600 hover:shadow-lg"
								>
									<FiTrash2 className="mr-2 inline-block" />
									Delete
								</button>
							</div>
						</div>
					</div>

					<p className="mb-8 text-lg text-gray-600">
						{portfolio.description}
					</p>

					{/* Project Screenshot */}
					{portfolio.screenshotUrl && (
						<div className="mb-8 overflow-hidden rounded-lg bg-gray-50 p-4">
							<img
								src={portfolio.screenshotUrl}
								alt="Project screenshot"
								className="mx-auto h-[300px] w-auto rounded-lg object-contain shadow-sm"
							/>
						</div>
					)}

					{/* Status Message Box */}
					<div
						className={`mb-8 rounded-lg p-6 ${
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
									<span className="text-4xl">⏳</span>
									<p className="mt-2 font-medium text-yellow-700">
										Your project is being reviewed. We'll
										notify you once it's done!
									</p>
								</div>
							) : portfolio.status === "Rejected" ? (
								<div className="flex flex-col items-center text-center">
									<span className="text-4xl">💪</span>
									<p className="mt-2 font-medium text-red-700">
										{portfolio.feedback ||
											"Don't give up! Read the feedback and try again."}
									</p>
								</div>
							) : (
								<div className="flex flex-col items-center text-center">
									<span className="text-4xl">🎉</span>
									<p className="mt-2 font-medium text-green-700">
										Congratulations! Your project has been
										approved!
									</p>

									{/* Badge display */}
									{portfolio.externalBadge && (
										<div className="mt-4 flex items-center gap-4 rounded-lg bg-white p-4 shadow-sm">
											<img
												src={displayBadgeIcon(
													portfolio.externalBadge,
												)}
												alt={
													portfolio.externalBadge
														.name || "Badge"
												}
												className="h-20 w-20"
												onError={(e) => {
													const target =
														e.target as HTMLImageElement;
													target.src =
														"/src/assets/default_badge.svg";
												}}
											/>
											<div>
												<p className="font-semibold">
													{
														portfolio.externalBadge
															.name
													}
												</p>
												<p className="text-sm text-gray-600">
													You've earned this badge! 🏆
												</p>
											</div>
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					{/* Action Buttons */}
					<div className="mt-6 flex flex-wrap gap-4">
						{portfolio.externalLink && (
							<a
								href={portfolio.externalLink}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-2 font-semibold text-white transition-all hover:-translate-y-1 hover:bg-white hover:text-[var(--color-primary)] hover:shadow-lg"
							>
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
										d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
									/>
								</svg>
								Open Project Page
							</a>
						)}
						{portfolio.fileUrl && (
							<button
								onClick={handleDownload}
								className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-[var(--color-primary)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
							>
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
										d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
									/>
								</svg>
								Download Project File
							</button>
						)}
						{portfolio.certificateUrl && (
							<>
								<button
									onClick={() =>
										setShowCertificateModal(true)
									}
									className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
								>
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
									View Dr. Scratch Certificate
								</button>
								<a
									href={portfolio.certificateUrl}
									download={`${portfolio.title.replace(/\s+/g, "_")}_certificate.pdf`}
									className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-blue-600 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
								>
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
											d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
										/>
									</svg>
									Download Certificate
								</a>
							</>
						)}
					</div>

					{/* Dr. Scratch Info */}
					{portfolio.isScratchProject && (
						<div className="mt-6 rounded-lg bg-blue-50 p-4">
							<div className="flex items-start">
								<div className="flex-shrink-0">
									<svg
										className="h-6 w-6 text-blue-600"
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
									<h3 className="text-lg font-medium text-blue-800">
										Scratch Project
									</h3>
									<div className="mt-2 text-blue-700">
										<p>
											This project was created in Scratch
											and{" "}
											{portfolio.certificateUrl
												? "has been analyzed with Dr. Scratch for programming skills assessment."
												: "needs to be analyzed with Dr. Scratch for a complete evaluation."}
										</p>

										{portfolio.certificateUrl ? (
											<div className="mt-2">
												<p className="text-sm">
													The Dr. Scratch certificate
													is available for download
													using the button above.
												</p>
											</div>
										) : (
											<div className="mt-2">
												<p className="text-sm">
													No Dr. Scratch certificate
													has been uploaded for this
													project.
												</p>
												<a
													href="https://www.drscratch.org/"
													target="_blank"
													rel="noopener noreferrer"
													className="mt-2 inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
												>
													Visit Dr. Scratch for
													analysis
													<svg
														className="ml-1 h-4 w-4"
														fill="currentColor"
														viewBox="0 0 20 20"
													>
														<path
															fillRule="evenodd"
															d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
															clipRule="evenodd"
														></path>
													</svg>
												</a>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					)}
				</motion.div>
			</div>
		</div>
	);
}
