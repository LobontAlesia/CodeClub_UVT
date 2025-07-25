import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_CERTIFICATE_SIZE = 2 * 1024 * 1024; // 2MB

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
}

export default function EditProjectPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [externalLink, setExternalLink] = useState("");
	const [fileBase64, setFileBase64] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [screenshotBase64, setScreenshotBase64] = useState<string | null>(
		null,
	);
	const [originalScreenshotUrl, setOriginalScreenshotUrl] = useState<
		string | null
	>(null);
	const [isScratchProject, setIsScratchProject] = useState(false);
	const [certificateBase64, setCertificateBase64] = useState<string | null>(
		null,
	);
	const [certificateName, setCertificateName] = useState<string | null>(null);
	const [originalCertificateUrl, setOriginalCertificateUrl] = useState<
		string | null
	>(null);

	useEffect(() => {
		fetchProject();
	}, [id]);

	const fetchProject = async () => {
		if (!id) return;

		try {
			const response = await api.get<Portfolio>(`/portfolio/${id}`);
			const project = response.data;

			setTitle(project.title);
			setDescription(project.description);
			setExternalLink(project.externalLink || "");
			setOriginalScreenshotUrl(project.screenshotUrl);
			setIsScratchProject(project.isScratchProject || false);
			setOriginalCertificateUrl(project.certificateUrl || null);
		} catch (error) {
			console.error("Error fetching project:", error);
			toast.error("Failed to load project");
			navigate("/my-projects");
		} finally {
			setLoading(false);
		}
	};

	const compressImage = async (base64String: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				let width = img.width;
				let height = img.height;

				const maxDimension = 1200;
				if (width > height && width > maxDimension) {
					height *= maxDimension / width;
					width = maxDimension;
				} else if (height > maxDimension) {
					width *= maxDimension / height;
					height = maxDimension;
				}

				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					reject(new Error("Could not get canvas context"));
					return;
				}

				ctx.drawImage(img, 0, 0, width, height);
				resolve(canvas.toDataURL("image/jpeg", 0.7));
			};
			img.onerror = reject;
			img.src = base64String;
		});
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > MAX_FILE_SIZE) {
				toast.error(
					`File size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
				);
				return;
			}

			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				setFileBase64(base64String);
				setFileName(file.name);

				// Check if this is a Scratch project file (.sb3)
				const fileExtension = file.name.split(".").pop()?.toLowerCase();
				if (fileExtension === "sb3") {
					setIsScratchProject(true);
					toast.info(
						"Scratch project detected! Please analyze your project on Dr. Scratch and upload the certificate below.",
					);
				} else {
					setIsScratchProject(false);
					setCertificateBase64(null);
					setCertificateName(null);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const handleCertificateUpload = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > MAX_CERTIFICATE_SIZE) {
				toast.error(
					`Certificate size must be less than ${MAX_CERTIFICATE_SIZE / 1024 / 1024}MB`,
				);
				return;
			}

			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				setCertificateBase64(base64String);
				setCertificateName(file.name);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleScreenshotUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > MAX_IMAGE_SIZE) {
				toast.error(
					`Screenshot size must be less than ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
				);
				return;
			}

			const reader = new FileReader();
			reader.onloadend = async () => {
				const base64String = reader.result as string;
				try {
					if (file.type.startsWith("image/")) {
						const compressed = await compressImage(base64String);
						setScreenshotBase64(compressed);
					} else {
						setScreenshotBase64(base64String);
					}
				} catch (error) {
					console.error("Error compressing image:", error);
					toast.error("Failed to process screenshot");
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!id) return;

		// Check if it's a Scratch project with no certificate
		if (isScratchProject && !certificateBase64 && !originalCertificateUrl) {
			toast.error(
				"For Scratch projects, you need to upload a Dr. Scratch certificate.",
			);
			return;
		}

		try {
			await api.put(`/portfolio/${id}`, {
				title,
				description,
				fileUrl: fileBase64 || "", // Send empty string instead of undefined
				externalLink: externalLink || "", // Send empty string instead of undefined
				screenshotUrl: screenshotBase64 || originalScreenshotUrl || "", // Preserve original screenshot if no new one
				certificateUrl:
					certificateBase64 || originalCertificateUrl || "", // Preserve original certificate if no new one
				isScratchProject,
				status: "Pending",
			});

			toast.success(
				"Project updated successfully! It will need to be reviewed again.",
			);
			navigate(`/project/${id}`);
		} catch (error: any) {
			console.error("Error updating project:", error);
			if (error.response?.status === 431) {
				toast.error(
					"File size is too large. Please try a smaller file or compress it further.",
				);
			} else {
				toast.error("Failed to update project");
			}
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white p-4">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] px-4 py-8 sm:px-6 sm:py-10">
			<div className="mx-auto max-w-2xl">
				<div className="mb-6 text-center sm:mb-8">
					<h1 className="text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
						Edit Project
					</h1>
					<p className="mt-2 text-sm text-gray-600 sm:text-base">
						Update your project details
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="space-y-5 rounded-xl bg-white p-5 shadow-lg sm:space-y-6 sm:p-8"
				>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Project Title
						</label>
						<input
							type="text"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Description
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={4}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Update Screenshot of Your Completed Project
						</label>
						<p className="mt-1 text-xs text-gray-500 sm:text-sm">
							Please capture a screenshot showing your completed
							project in action or the final output.
						</p>
						<input
							type="file"
							accept="image/*"
							onChange={handleScreenshotUpload}
							className="mt-1 block w-full text-sm"
						/>
						{(screenshotBase64 || originalScreenshotUrl) && (
							<div className="mt-2">
								<img
									src={
										screenshotBase64 ||
										originalScreenshotUrl ||
										""
									}
									alt="Screenshot Preview"
									className="h-24 rounded shadow sm:h-32"
								/>
							</div>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Update Project File (optional)
						</label>
						<input
							type="file"
							accept=".py,.cpp,.zip,.sb3"
							onChange={handleFileUpload}
							className="mt-1 block w-full text-sm"
						/>
						{fileName && (
							<p className="mt-1 break-words text-xs text-gray-600 sm:text-sm">
								Selected file: {fileName}
							</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Project External Link (optional)
						</label>
						<input
							type="url"
							value={externalLink}
							onChange={(e) => setExternalLink(e.target.value)}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
						/>
					</div>

					{isScratchProject && (
						<div className="rounded-md bg-blue-50 p-3 sm:p-4">
							<div className="flex flex-col sm:flex-row">
								<div className="mb-2 flex-shrink-0 sm:mb-0">
									<svg
										className="h-5 w-5 text-blue-400"
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										aria-hidden="true"
									>
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
								<div className="flex flex-1 flex-col sm:ml-3">
									<p className="text-xs text-blue-700 sm:text-sm">
										To receive a badge, please analyze your
										Scratch project on Dr. Scratch and
										upload the received certificate.
									</p>
									<a
										href="https://www.drscratch.org/"
										target="_blank"
										rel="noopener noreferrer"
										className="mt-3 flex w-full transform items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-blue-700 hover:text-white hover:shadow-xl sm:mt-4 md:w-auto"
									>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-5 w-5"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
												clipRule="evenodd"
											/>
										</svg>
										Analyze Project on Dr. Scratch
									</a>
								</div>
							</div>
						</div>
					)}

					{isScratchProject && (
						<div>
							<label className="block text-sm font-medium text-gray-700">
								Upload Dr. Scratch Certificate
							</label>
							<input
								type="file"
								accept=".pdf,.jpg,.jpeg,.png"
								onChange={handleCertificateUpload}
								className="mt-1 block w-full text-sm"
							/>
							{certificateName && (
								<p className="mt-1 break-words text-xs text-gray-600 sm:text-sm">
									Selected certificate: {certificateName}
								</p>
							)}
							{originalCertificateUrl && !certificateName && (
								<div className="mt-2">
									<p className="text-xs text-gray-600 sm:text-sm">
										Existing certificate:
										<a
											href={originalCertificateUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="ml-2 text-blue-600 hover:underline"
										>
											View certificate
										</a>
									</p>
								</div>
							)}
						</div>
					)}

					<div className="flex justify-end space-x-3 sm:space-x-4">
						<button
							type="button"
							onClick={() => navigate("/my-projects")}
							className="rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:px-4 sm:text-sm"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-[var(--color-primary)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--color-primary-dark)] sm:px-4 sm:text-sm"
						>
							Save Changes
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
