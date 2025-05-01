import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { FilePlus2 } from "lucide-react";

const CHUNK_SIZE = 500000; // 500KB chunks

const AddElementPage = () => {
	const { chapterId } = useParams<{ chapterId: string }>();
	const navigate = useNavigate();

	const [title, setTitle] = useState("");
	const [type, setType] = useState("Header");
	const [content, setContent] = useState("");
	const [image, setImage] = useState<string>("");
	const [previewImage, setPreviewImage] = useState<string | null>(null);

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 5000000) {
				// 5MB limit
				toast.error("Image size should be less than 5MB");
				return;
			}

			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				setPreviewImage(base64String);

				// Compress image if it's too large
				const img = new Image();
				img.src = base64String;
				img.onload = () => {
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d")!;

					// Calculate new dimensions while maintaining aspect ratio
					let width = img.width;
					let height = img.height;
					const maxSize = 800;

					if (width > height && width > maxSize) {
						height *= maxSize / width;
						width = maxSize;
					} else if (height > maxSize) {
						width *= maxSize / height;
						height = maxSize;
					}

					canvas.width = width;
					canvas.height = height;

					// Draw and compress
					ctx.drawImage(img, 0, 0, width, height);
					const compressedBase64 = canvas.toDataURL(
						"image/jpeg",
						0.6,
					);

					setImage(compressedBase64);
				};
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!chapterId) return;

		try {
			const token = localStorage.getItem("token");
			const headers = {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			};

			if (type === "Form") {
				navigate(`/admin/chapter/${chapterId}/add-quiz`);
				return;
			}

			const payload: any = { title, type };

			if (type === "Image") {
				if (!image) {
					toast.error("Please upload an image");
					return;
				}
				payload.image = image;
			} else {
				payload.content = content;
			}

			// Split large requests into chunks if needed
			if (
				JSON.stringify(payload).length > CHUNK_SIZE &&
				type === "Image"
			) {
				const chunks = Math.ceil(image.length / CHUNK_SIZE);
				const imageChunks = [];

				for (let i = 0; i < chunks; i++) {
					imageChunks.push(
						image.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
					);
				}

				// Send each chunk
				for (let i = 0; i < chunks; i++) {
					const chunkPayload = {
						...payload,
						image: imageChunks[i],
						isChunk: true,
						chunkIndex: i,
						totalChunks: chunks,
					};

					await axios.post(
						`http://localhost:5153/ChapterElement/chapter/${chapterId}/chunk`,
						chunkPayload,
						{ headers },
					);
				}

				toast.success("Element added successfully!");
				navigate(-1);
				return;
			}

			await axios.post(
				`http://localhost:5153/ChapterElement/chapter/${chapterId}`,
				payload,
				{ headers },
			);

			toast.success("Element added successfully!");
			navigate(-1);
		} catch (error) {
			console.error("Error adding element", error);
			toast.error("Failed to add element");
		}
	};

	return (
		<FormCard
			title="Add New Element"
			icon={
				<FilePlus2 size={40} className="text-[var(--color-primary)]" />
			}
		>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="font-semibold">Title</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						className="w-full rounded border p-2"
					/>
				</div>

				<div>
					<label className="font-semibold">Type</label>
					<select
						value={type}
						onChange={(e) => setType(e.target.value)}
						className="w-full rounded border p-2"
					>
						<option value="Header">Header</option>
						<option value="Text">Text</option>
						<option value="CodeFragment">Code Fragment</option>
						<option value="Image">Image</option>
						<option value="Form">Form (Quiz)</option>
					</select>
				</div>

				{type === "Image" ? (
					<div>
						<label className="mb-1 block font-semibold">
							Image
						</label>
						<input
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
							className="w-full text-sm"
							required
						/>
						{previewImage && (
							<div className="mt-4 flex justify-center">
								<img
									src={previewImage}
									alt="Preview"
									className="mt-2 max-w-md rounded shadow-md"
									onError={(e) =>
										(e.currentTarget.style.display = "none")
									}
								/>
							</div>
						)}
					</div>
				) : (
					type !== "Form" && (
						<div>
							<label className="font-semibold">
								{type === "CodeFragment" ? "Code" : "Content"}
							</label>
							<textarea
								value={content}
								onChange={(e) => setContent(e.target.value)}
								rows={4}
								className={`w-full rounded border p-2 ${type === "CodeFragment" ? "bg-gray-50 font-mono" : ""}`}
								required
							/>
							{type === "CodeFragment" && content && (
								<div className="mt-4">
									<label className="mb-1 block font-semibold">
										Preview:
									</label>
									<pre className="bg-gray-50 overflow-x-auto rounded-lg p-4">
										<code className="font-mono text-sm">
											{content}
										</code>
									</pre>
								</div>
							)}
						</div>
					)
				)}

				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="bg-gray-500 hover:bg-gray-600 flex-1 rounded py-2 font-semibold text-white"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="flex-1 rounded bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
					>
						➕ Add Element
					</button>
				</div>
			</form>
		</FormCard>
	);
};

export default AddElementPage;
