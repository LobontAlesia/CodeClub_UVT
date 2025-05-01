import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { Pencil } from "lucide-react";

interface Chapter {
	id: string;
	title: string;
	index: number;
	lessonId: string;
}

const EditChapterPage = () => {
	const { chapterId } = useParams<{ chapterId: string }>();
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [lessonId, setLessonId] = useState<string | null>(null);

	useEffect(() => {
		const fetchChapter = async () => {
			try {
				const token = localStorage.getItem("token");
				const headers = { Authorization: `Bearer ${token}` };

				const response = await axios.get<Chapter>(
					`http://localhost:5153/Chapter/${chapterId}`,
					{ headers },
				);

				setTitle(response.data.title);
				setLessonId(response.data.lessonId);
			} catch (error) {
				console.error("Error fetching chapter", error);
				toast.error("Error loading chapter");
			}
		};

		if (chapterId) fetchChapter();
	}, [chapterId]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const token = localStorage.getItem("token");
			const headers = { Authorization: `Bearer ${token}` };

			await axios.put(
				`http://localhost:5153/Chapter/${chapterId}`,
				{
					title,
				},
				{ headers },
			);

			toast.success("Chapter updated successfully!");
			if (lessonId) navigate(`/lesson/${lessonId}`);
		} catch (error) {
			console.error("Error updating chapter", error);
			toast.error("Error updating chapter");
		}
	};

	if (!lessonId) return <div className="p-6">Loading...</div>;

	return (
		<FormCard
			title="Edit Chapter"
			icon={<Pencil size={40} className="text-[var(--color-primary)]" />}
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
						onClick={() => navigate(`/lesson/${lessonId}`)}
						className="bg-gray-500 hover:bg-gray-600 flex-1 rounded py-2 font-semibold text-white"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="flex-1 rounded bg-yellow-500 py-2 font-semibold text-white hover:bg-yellow-600"
					>
						✏️ Save Changes
					</button>
				</div>
			</form>
		</FormCard>
	);
};

export default EditChapterPage;
