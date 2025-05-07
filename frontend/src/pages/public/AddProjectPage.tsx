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

		if (!fileBase64 && !externalLink) {
			toast.error(
				"Please either upload a project file or provide an external link",
			);
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
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] px-6 py-10">
			<div className="mx-auto max-w-2xl">
				<div className="mb-8 text-center">
					<h1 className="text-4xl font-bold text-[var(--color-primary)]">
						Add New Project
					</h1>
					<p className="mt-2 text-gray-600">
						Create a new project to showcase your work
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					className="space-y-6 rounded-xl bg-white p-8 shadow-lg"
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
							Upload Screenshot of Your Completed Project
						</label>
						<p className="mt-1 text-sm text-gray-500">
							Please capture a screenshot showing your completed
							project in action or the final output.
						</p>
						<input
							type="file"
							accept="image/*"
							onChange={handleScreenshotUpload}
							className="mt-1 block w-full"
							required
						/>
						{screenshotBase64 && (
							<div className="mt-2">
								<img
									src={screenshotBase64}
									alt="Screenshot Preview"
									className="h-32 rounded shadow"
								/>
							</div>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">
							Upload Project File (optional)
						</label>
						<input
							type="file"
							accept=".py,.cpp,.zip,.sb3,.html,.js,.css,.pdf,.png,.jpg,.jpeg,.svg,.txt"
							onChange={handleFileUpload}
							className="mt-1 block w-full"
						/>
						{fileName && (
							<p className="mt-1 text-sm text-gray-600">
								Selected file: {fileName}
							</p>
						)}
					</div>

					{isScratchProject && (
						<div className="rounded-md bg-blue-50 p-4">
							<div className="flex">
								<div className="flex-shrink-0">
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
								<div className="ml-3 flex-1 md:flex md:justify-between">
									<p className="text-sm text-blue-700">
										To receive a badge, please analyze your
										Scratch project on Dr. Scratch and
										upload the received certificate.
									</p>
									<p className="mt-3 text-sm md:ml-6 md:mt-0">
										<a
											href="https://www.drscratch.org/"
											target="_blank"
											rel="noopener noreferrer"
											className="whitespace-nowrap font-medium text-blue-700 hover:text-blue-600"
										>
											Go to Dr. Scratch
											<span aria-hidden="true">
												{" "}
												&rarr;
											</span>
										</a>
									</p>
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
								className="mt-1 block w-full"
								required={isScratchProject}
							/>
							{certificateName && (
								<p className="mt-1 text-sm text-gray-600">
									Selected certificate: {certificateName}
								</p>
							)}
						</div>
					)}

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

					<div className="flex justify-end space-x-4">
						<button
							type="button"
							onClick={() => navigate("/my-projects")}
							className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:border hover:border-[var(--color-primary)] hover:bg-white hover:text-[var(--color-primary)]"
						>
							Add Project
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
