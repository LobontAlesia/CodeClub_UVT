import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_CERTIFICATE_SIZE = 2 * 1024 * 1024; // 2MB

export default function AddProjectPage() {
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [externalLink, setExternalLink] = useState("");
	const [fileBase64, setFileBase64] = useState<string | null>(null);
	const [fileName, setFileName] = useState<string | null>(null);
	const [screenshotBase64, setScreenshotBase64] = useState<string | null>(
		null,
	);
	const [isScratchProject, setIsScratchProject] = useState(false);
	const [certificateBase64, setCertificateBase64] = useState<string | null>(
		null,
	);
	const [certificateName, setCertificateName] = useState<string | null>(null);

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

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!screenshotBase64) {
			toast.error("Screenshot is required!");
			return;
		}

		// If it's a Scratch project but no certificate was uploaded
		if (isScratchProject && !certificateBase64) {
			toast.error(
				"Please analyze your Scratch project on Dr. Scratch and upload the certificate",
			);
			return;
		}

		try {
			await api.post("/portfolio", {
				title,
				description,
				fileUrl: fileBase64 || "",
				externalLink,
				screenshotUrl: screenshotBase64,
				certificateUrl: certificateBase64 || "",
				isScratchProject,
			});
			toast.success("Project added successfully!");
			navigate("/my-projects");
		} catch (error: any) {
			console.error("Error adding project:", error);
			if (error.response?.status === 431) {
				toast.error(
					"File size is too large. Please try a smaller file or compress it further.",
				);
			} else {
				toast.error("Failed to add project");
			}
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] px-3 py-6 sm:px-6 sm:py-10">
			<div className="mx-auto max-w-2xl">
				<div className="mb-6 text-center sm:mb-8">
					<h1 className="text-2xl font-bold text-[var(--color-primary)] sm:text-4xl">
						Add New Project
					</h1>
					<p className="mt-2 text-sm text-gray-600 sm:text-base">
						Create a new project to showcase your work
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="space-y-4 rounded-xl bg-white p-4 shadow-lg sm:space-y-6 sm:p-8"
				>
					<div>
						<label className="block text-sm font-medium text-gray-700">
							Project Title
						</label>
						<div className="relative">
							<input
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								maxLength={128}
								className={`mt-1 block w-full rounded-md border ${
									title.length >= 128
										? "border-red-500"
										: "border-gray-300"
								} px-3 py-2 text-sm sm:text-base`}
								required
							/>
							<div
								className={`mt-1 text-right text-xs ${
									title.length >= 100
										? title.length >= 128
											? "text-red-500"
											: "text-orange-500"
										: "text-gray-500"
								}`}
							>
								{title.length}/128 characters
							</div>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Description
						</label>
						<div className="relative">
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								rows={4}
								maxLength={256}
								className={`mt-1 block w-full rounded-md border ${
									description.length >= 256
										? "border-red-500"
										: "border-gray-300"
								} px-3 py-2 text-sm sm:text-base`}
								required
							/>
							<div
								className={`mt-1 text-right text-xs ${
									description.length >= 230
										? description.length >= 256
											? "text-red-500"
											: "text-orange-500"
										: "text-gray-500"
								}`}
							>
								{description.length}/256 characters
							</div>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Upload Screenshot of Your Completed Project
						</label>
						<p className="mt-1 text-xs text-gray-500 sm:text-sm">
							Please capture a screenshot showing your completed
							project in action or the final output.
						</p>
						<input
							type="file"
							accept="image/*"
							onChange={handleScreenshotUpload}
							className="mt-1 block w-full text-sm sm:text-base"
							required
						/>
						{screenshotBase64 && (
							<div className="mt-2">
								<img
									src={screenshotBase64}
									alt="Screenshot Preview"
									className="h-24 rounded shadow sm:h-32"
								/>
							</div>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Upload Project File
						</label>
						<input
							type="file"
							accept=".py,.cpp,.zip,.sb3,.html,.js,.css,.pdf,.png,.jpg,.jpeg,.svg,.txt"
							onChange={handleFileUpload}
							className="mt-1 block w-full text-sm sm:text-base"
						/>
						{fileName && (
							<p className="mt-1 text-xs text-gray-600 sm:text-sm">
								Selected file: {fileName}
							</p>
						)}
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
								<div className="flex-1 sm:ml-3 md:flex md:flex-col">
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
								Upload Dr. Scratch Certificate (PDF)
							</label>
							<input
								type="file"
								accept="application/pdf,image/*"
								onChange={handleCertificateUpload}
								className="mt-1 block w-full text-sm sm:text-base"
								required={isScratchProject}
							/>
							{certificateName && (
								<p className="mt-1 text-xs text-gray-600 sm:text-sm">
									Selected certificate: {certificateName}
								</p>
							)}
						</div>
					)}

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Project External Link
						</label>
						<p className="mt-1 text-xs text-gray-500 sm:text-sm">
							Provide a link to your project on CodeClub platform
							so your teacher can see your project.
						</p>
						<input
							type="url"
							value={externalLink}
							onChange={(e) => setExternalLink(e.target.value)}
							className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm sm:text-base"
						/>
					</div>

					<div className="flex flex-col space-y-2 pt-2 sm:flex-row sm:justify-end sm:space-x-4 sm:space-y-0">
						<button
							type="button"
							onClick={() => navigate("/my-projects")}
							className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="w-full rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:border hover:border-[var(--color-primary)] hover:bg-white hover:text-[var(--color-primary)] sm:w-auto"
						>
							Add Project
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
