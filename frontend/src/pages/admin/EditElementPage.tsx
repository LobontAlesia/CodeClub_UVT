import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { FileEdit } from "lucide-react";

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
		} catch (error) {
			console.error("Error loading element", error);
			toast.error("Failed to load element");
		}
	};

	const handleSave = async () => {
		try {
			const token = localStorage.getItem("token");
			const headers = { Authorization: `Bearer ${token}` };

			await axios.put(
				`http://localhost:5153/chapterelement/${elementId}`,
				{
					title,
					content,
					image,
					type: element?.type,
					index: element?.index,
					formId: element?.formId || null,
				},
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
						<p className="text-gray-600 mb-2">
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
					element.type === "CodeFragment") && (
					<div>
						<label className="mb-1 block font-semibold">
							{element.type === "CodeFragment"
								? "Code"
								: "Content"}
						</label>
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
								<pre className="bg-gray-50 overflow-x-auto rounded-lg p-4">
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
							Image URL
						</label>
						<input
							type="text"
							value={image}
							onChange={(e) => setImage(e.target.value)}
							className="w-full rounded border p-2"
						/>
						{image && (
							<img
								src={image}
								alt="Preview"
								className="mt-2 max-w-md rounded"
								onError={(e) =>
									(e.currentTarget.style.display = "none")
								}
							/>
						)}
					</div>
				)}

				<div className="flex gap-4">
					<button
						onClick={() => navigate(-1)}
						className="bg-gray-500 hover:bg-gray-600 flex-1 rounded py-2 font-semibold text-white"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="flex-1 rounded bg-yellow-500 py-2 font-semibold text-white hover:bg-yellow-600"
					>
						✏️ Save Changes
					</button>
				</div>
			</div>
		</FormCard>
	);
}
