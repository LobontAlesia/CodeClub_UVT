import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
	FiEdit,
	FiTrash2,
	FiExternalLink,
	FiDownload,
	FiEye,
} from "react-icons/fi";
import api from "../../utils/api";
import CertificateModal from "../../components/CertificateModal";
import Container from "../../components/layout/Container";
import ResponsiveCard from "../../components/layout/ResponsiveCard";

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

		// Determine file extension from URL or use .sb3 for Scratch projects
		let fileName = `${portfolio.title.replace(/\s+/g, "_")}_project`;

		if (portfolio.isScratchProject) {
			fileName += ".sb3";
		} else {
			// Try to extract extension from fileUrl
			const urlParts = portfolio.fileUrl.split(".");
			if (urlParts.length > 1) {
				const extension = urlParts[urlParts.length - 1];
				// Check if it's a known extension
				if (/^[a-zA-Z0-9]{1,5}$/.test(extension)) {
					fileName += `.${extension}`;
				}
			}
		}

		const link = document.createElement("a");
		link.href = portfolio.fileUrl;
		link.download = fileName;
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
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] py-6 sm:py-10">
			{/* Certificate Modal using the dedicated component */}
			{portfolio?.certificateUrl && (
				<CertificateModal
					isOpen={showCertificateModal}
					onClose={() => setShowCertificateModal(false)}
					certificateUrl={portfolio.certificateUrl}
					projectTitle={portfolio.title}
				/>
			)}

			<Container>
				{/* Breadcrumb navigation */}
				<div className="mb-4 sm:mb-6">
					<button
						onClick={() => navigate("/my-projects")}
						className="group flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm transition-all hover:-translate-y-0.5 hover:text-black hover:shadow-md sm:px-4 sm:py-2 sm:text-base"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4 transition-transform group-hover:-translate-x-1 sm:h-5 sm:w-5"
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
				<ResponsiveCard className="mb-8" padding="large">
					<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<h1 className="text-2xl font-bold text-gray-800 sm:text-3xl">
							{portfolio.title}
						</h1>
						<div className="flex flex-wrap items-center gap-2 sm:gap-4">
							<span
								className={`rounded-full px-3 py-1 text-xs font-semibold sm:px-4 sm:py-2 sm:text-sm ${statusClassName}`}
							>
								{portfolio.status}
							</span>
							<div className="flex gap-2">
								<button
									onClick={handleEdit}
									className="transform rounded-lg bg-yellow-500 px-2 py-1 text-xs font-bold text-white shadow transition-all hover:-translate-y-1 hover:bg-yellow-600 hover:shadow-lg sm:px-4 sm:py-2 sm:text-base"
								>
									<FiEdit
										className="mr-1 inline-block sm:mr-2"
										size={16}
									/>
									<span className="hidden sm:inline">
										Edit
									</span>
								</button>
								<button
									onClick={handleDelete}
									className="transform rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white shadow transition-all hover:-translate-y-1 hover:bg-red-600 hover:shadow-lg sm:px-4 sm:py-2 sm:text-base"
								>
									<FiTrash2
										className="mr-1 inline-block sm:mr-2"
										size={16}
									/>
									<span className="hidden sm:inline">
										Delete
									</span>
								</button>
							</div>
						</div>
					</div>

					<p className="mb-6 text-base text-gray-600 sm:mb-8 sm:text-lg">
						{portfolio.description}
					</p>

					{/* Project Screenshot */}
					{portfolio.screenshotUrl && (
						<div className="mb-6 overflow-hidden rounded-lg bg-gray-50 p-2 sm:mb-8 sm:p-4">
							<img
								src={portfolio.screenshotUrl}
								alt="Project screenshot"
								className="mx-auto h-[200px] w-auto rounded-lg object-contain shadow-sm sm:h-[300px]"
							/>
						</div>
					)}

					{/* Status Message Box */}
					<div
						className={`mb-6 rounded-lg p-4 sm:mb-8 sm:p-6 ${
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
									<span className="text-3xl sm:text-4xl">
										⏳
									</span>
									<p className="mt-2 text-sm font-medium text-yellow-700 sm:text-base">
										Your project is being reviewed. We'll
										notify you once it's done!
									</p>
								</div>
							) : portfolio.status === "Rejected" ? (
								<div className="flex flex-col items-center text-center">
									<span className="text-3xl sm:text-4xl">
										💪
									</span>
									<p className="mt-2 text-sm font-medium text-red-700 sm:text-base">
										{portfolio.feedback ||
											"Don't give up! Read the feedback and try again."}
									</p>
								</div>
							) : (
								<div className="flex flex-col items-center text-center">
									<span className="text-3xl sm:text-4xl">
										🎉
									</span>
									<p className="mt-2 text-sm font-medium text-green-700 sm:text-base">
										Congratulations! Your project has been
										approved!
									</p>

									{/* Badge display */}
									{portfolio.externalBadge && (
										<div className="mt-4 flex flex-col items-center gap-3 rounded-lg bg-white p-3 shadow-sm sm:flex-row sm:gap-4 sm:p-4">
											<img
												src={displayBadgeIcon(
													portfolio.externalBadge,
												)}
												alt={
													portfolio.externalBadge
														.name || "Badge"
												}
												className="h-16 w-16 sm:h-20 sm:w-20"
												onError={(e) => {
													const target =
														e.target as HTMLImageElement;
													target.src =
														"/src/assets/default_badge.svg";
												}}
											/>
											<div className="text-center sm:text-left">
												<p className="font-semibold">
													{
														portfolio.externalBadge
															.name
													}
												</p>
												<p className="text-xs text-gray-600 sm:text-sm">
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
					<div className="mt-4 flex flex-wrap gap-3 sm:mt-6 sm:gap-4">
						{portfolio.externalLink && (
							<a
								href={portfolio.externalLink}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-all hover:-translate-y-1 hover:bg-white hover:text-[var(--color-primary)] hover:shadow-lg sm:gap-2 sm:px-6 sm:py-2 sm:text-base"
							>
								<FiExternalLink
									size={16}
									className="shrink-0"
								/>
								<span className="truncate">
									Open Project Page
								</span>
							</a>
						)}
						{portfolio.fileUrl && (
							<button
								onClick={handleDownload}
								className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-primary)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
							>
								<FiDownload size={16} className="shrink-0" />
								<span className="truncate">
									Download Project
								</span>
							</button>
						)}
						{portfolio.certificateUrl && (
							<>
								<button
									onClick={() =>
										setShowCertificateModal(true)
									}
									className="flex items-center gap-1 rounded-lg bg-blue-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
								>
									<FiEye size={16} className="shrink-0" />
									<span className="truncate">
										View Certificate
									</span>
								</button>
								<a
									href={portfolio.certificateUrl}
									download={`${portfolio.title.replace(/\s+/g, "_")}_certificate.pdf`}
									className="flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:gap-2 sm:px-4 sm:py-2 sm:text-base"
								>
									<FiDownload
										size={16}
										className="shrink-0"
									/>
									<span className="truncate">
										Download Certificate
									</span>
								</a>
							</>
						)}
					</div>

					{/* Dr. Scratch Info */}
					{portfolio.isScratchProject && (
						<div className="mt-4 rounded-lg bg-blue-50 p-3 sm:mt-6 sm:p-4">
							<div className="flex flex-col items-start gap-3 sm:flex-row">
								<div className="mx-auto flex-shrink-0 sm:mx-0">
									<svg
										className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6"
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
								<div className="text-center sm:text-left">
									<h3 className="text-base font-medium text-blue-800 sm:text-lg">
										Scratch Project
									</h3>
									<div className="mt-1 text-sm text-blue-700 sm:mt-2 sm:text-base">
										<p>
											This project was created in Scratch
											and{" "}
											{portfolio.certificateUrl
												? "has been analyzed with Dr. Scratch for programming skills assessment."
												: "needs to be analyzed with Dr. Scratch for a complete evaluation."}
										</p>

										{portfolio.certificateUrl ? (
											<div className="mt-2">
												<p className="text-xs sm:text-sm">
													The Dr. Scratch certificate
													is available for download
													using the button above.
												</p>
											</div>
										) : (
											<div className="mt-2">
												<p className="text-xs sm:text-sm">
													No Dr. Scratch certificate
													has been uploaded for this
													project.
												</p>
												<a
													href="https://www.drscratch.org/"
													target="_blank"
													rel="noopener noreferrer"
													className="mt-2 inline-flex items-center text-xs font-medium text-blue-600 hover:underline sm:text-sm"
												>
													Visit Dr. Scratch for
													analysis
													<svg
														className="ml-1 h-3 w-3 sm:h-4 sm:w-4"
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
				</ResponsiveCard>
			</Container>
		</div>
	);
}
