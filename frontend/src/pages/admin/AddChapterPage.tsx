import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { PlusCircle } from "lucide-react";

const AddChapterPage = () => {
	const { lessonId } = useParams<{ lessonId: string }>();
	const navigate = useNavigate();
	const [title, setTitle] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const token = localStorage.getItem("token");
			const headers = { Authorization: `Bearer ${token}` };

			await axios.post(
				`http://localhost:5153/Chapter/lesson/${lessonId}`,
				{
					title,
				},
				{ headers },
			);

			toast.success("Chapter added successfully!");
			navigate(`/lesson/${lessonId}`);
		} catch (error: any) {
			console.error(
				"Error adding chapter:",
				error.response?.data || error.message,
			);
			toast.error(error.response?.data || "Error adding chapter");
		}
	};

	return (
		<FormCard
			title="Add New Chapter"
			icon={
				<PlusCircle size={40} className="text-[var(--color-primary)]" />
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

				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="flex-1 rounded bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
					>
						Add Chapter
					</button>
				</div>
			</form>
		</FormCard>
	);
};

export default AddChapterPage;
