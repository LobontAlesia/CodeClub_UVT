import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { FileEdit, Bold, Italic, Underline } from "lucide-react";

const CHUNK_SIZE = 500000; // 500KB chunks

interface ChapterElement {
	id: string;
	title: string;
	type: string;
	index: number;
	content?: string;
	image?: string;
	formId?: string;
}

export default function EditElementPage() {
	const { elementId } = useParams<{ elementId: string }>();
	const navigate = useNavigate();

	const [element, setElement] = useState<ChapterElement | null>(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [image, setImage] = useState("");
	const [previewImage, setPreviewImage] = useState<string | null>(null);

	// Text formatting state
	const [isBold, setIsBold] = useState(false);
	const [isItalic, setIsItalic] = useState(false);
	const [isUnderline, setIsUnderline] = useState(false);

	useEffect(() => {
		fetchElement();
	}, [elementId]);

	const fetchElement = async () => {
		try {
			const token = localStorage.getItem("token");
			const headers = { Authorization: `Bearer ${token}` };
			const res = await axios.get(
				`http://localhost:5153/chapterelement/${elementId}`,
				{ headers },
			);
			setElement(res.data);
			setTitle(res.data.title);
			setContent(res.data.content || "");
			setImage(res.data.image || "");
			setPreviewImage(res.data.image || null);
		} catch (error) {
			console.error("Error loading element", error);
			toast.error("Failed to load element");
		}
	};

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

	// Formatting Functions
	const applyBold = () => {
		setIsBold(!isBold);
		const textarea = document.querySelector(
			"textarea",
		) as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end);

		if (start !== end) {
			const newText =
				content.substring(0, start) +
				`**${selectedText}**` +
				content.substring(end);
			setContent(newText);
		}
	};

	const applyItalic = () => {
		setIsItalic(!isItalic);
		const textarea = document.querySelector(
			"textarea",
		) as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end);

		if (start !== end) {
			const newText =
				content.substring(0, start) +
				`*${selectedText}*` +
				content.substring(end);
			setContent(newText);
		}
	};

	const applyUnderline = () => {
		setIsUnderline(!isUnderline);
		const textarea = document.querySelector(
			"textarea",
		) as HTMLTextAreaElement;
		if (!textarea) return;

		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const selectedText = content.substring(start, end);

		if (start !== end) {
			const newText =
				content.substring(0, start) +
				`<u>${selectedText}</u>` +
				content.substring(end);
			setContent(newText);
		}
	};

	const handleSave = async () => {
		try {
			const token = localStorage.getItem("token");
			const headers = { Authorization: `Bearer ${token}` };

			const payload = {
				title,
				content,
				image,
				type: element?.type,
				index: element?.index,
				formId: element?.formId || null,
			};

			// Split large requests into chunks if needed
			if (
				JSON.stringify(payload).length > CHUNK_SIZE &&
				element?.type === "Image"
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

					await axios.put(
						`http://localhost:5153/chapterelement/${elementId}/chunk`,
						chunkPayload,
						{ headers },
					);
				}

				toast.success("Element updated successfully!");
				navigate(-1);
				return;
			}

			await axios.put(
				`http://localhost:5153/chapterelement/${elementId}`,
				payload,
				{ headers },
			);

			toast.success("Element updated successfully!");
			navigate(-1);
		} catch (error) {
			console.error(error);
			toast.error("Failed to save changes");
		}
	};

	if (!element) {
		return <div className="p-8">Loading element...</div>;
	}

	return (
		<FormCard
			title="Edit Element"
			icon={
				<FileEdit size={40} className="text-[var(--color-primary)]" />
			}
		>
			<div className="space-y-6">
				<div>
					<label className="font-semibold">Title</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className="w-full rounded border p-2"
					/>
				</div>

				{element.type === "Form" && (
					<div>
						<p className="mb-2 text-gray-600">
							{element.formId
								? "This element has an associated quiz."
								: "No quiz is currently linked to this element."}
						</p>
						{element.formId && (
							<button
								className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
								onClick={() =>
									navigate(
										`/admin/edit-quiz/${element.formId}`,
									)
								}
							>
								Edit Quiz
							</button>
						)}
					</div>
				)}

				{(element.type === "Text" ||
					element.type === "CodeFragment" ||
					element.type === "Header") && (
					<div>
						<label className="mb-1 block font-semibold">
							{element.type === "CodeFragment"
								? "Code"
								: "Content"}
						</label>
						{element.type === "Text" && (
							<div className="mb-2 flex flex-wrap gap-2 rounded-lg bg-gray-100 p-2">
								<button
									type="button"
									onClick={applyBold}
									className={`rounded p-2 ${isBold ? "bg-blue-200" : "hover:bg-gray-200"}`}
									title="Bold"
								>
									<Bold size={16} />
								</button>
								<button
									type="button"
									onClick={applyItalic}
									className={`rounded p-2 ${isItalic ? "bg-blue-200" : "hover:bg-gray-200"}`}
									title="Italic"
								>
									<Italic size={16} />
								</button>
								<button
									type="button"
									onClick={applyUnderline}
									className={`rounded p-2 ${isUnderline ? "bg-blue-200" : "hover:bg-gray-200"}`}
									title="Underline"
								>
									<Underline size={16} />
								</button>
							</div>
						)}
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className={`w-full rounded border p-2 ${element.type === "CodeFragment" ? "bg-gray-50 font-mono" : ""}`}
							rows={6}
						/>

						{element.type === "CodeFragment" && content && (
							<div className="mt-4">
								<label className="mb-1 block font-semibold">
									Preview:
								</label>
								<pre className="overflow-x-auto rounded-lg bg-gray-50 p-4">
									<code className="font-mono text-sm">
										{content}
									</code>
								</pre>
							</div>
						)}
					</div>
				)}

				{element.type === "Image" && (
					<div>
						<label className="mb-1 block font-semibold">
							Image
						</label>
						<input
							type="file"
							accept="image/*"
							onChange={handleImageUpload}
							className="w-full text-sm"
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
				)}

				<div className="flex gap-4">
					<button
						onClick={() => navigate(-1)}
						className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="flex-1 rounded bg-yellow-500 py-2 font-semibold text-white hover:bg-yellow-600"
					>
						Save Changes
					</button>
				</div>
			</div>
		</FormCard>
	);
}
