import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { FilePlus2 } from "lucide-react";

const AddElementPage = () => {
	const { chapterId } = useParams<{ chapterId: string }>();
	const navigate = useNavigate();

	const [title, setTitle] = useState("");
	const [type, setType] = useState("Header");
	const [content, setContent] = useState("");

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
				payload.image = content;
			} else {
				payload.content = content;
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

				{type !== "Form" && (
					<div>
						<label className="font-semibold">
							{type === "Image"
								? "Image URL"
								: type === "CodeFragment"
									? "Code"
									: "Content"}
						</label>
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							rows={4}
							className={`w-full rounded border p-2 ${type === "CodeFragment" ? "bg-gray-50 font-mono" : ""}`}
						/>
					</div>
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
