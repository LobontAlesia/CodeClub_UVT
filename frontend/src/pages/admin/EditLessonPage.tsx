import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { Pencil } from "lucide-react";
import api from "../../utils/api";

const EditLessonPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [title, setTitle] = useState("");
	const [duration, setDuration] = useState(10);
	const [learningCourseId, setLearningCourseId] = useState<string | null>(
		null,
	);

	useEffect(() => {
		const fetchLesson = async () => {
			try {
				const response = await api.get(`/Lesson/${id}`);
				const lesson = response.data;
				setTitle(lesson.title);
				setDuration(lesson.duration);
				setLearningCourseId(lesson.learningCourseId);
			} catch (error) {
				console.error("Error fetching lesson:", error);
				toast.error("Failed to load lesson");
			}
		};

		if (id) {
			fetchLesson();
		}
	}, [id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!id) return;

		try {
			await api.put(`/Lesson/${id}`, {
				id,
				title,
				duration,
				learningCourseId,
			});

			toast.success("Lesson updated successfully!");
			if (learningCourseId) {
				navigate(`/course/${learningCourseId}`);
			}
		} catch (error) {
			console.error("Error updating lesson:", error);
			toast.error("Failed to update lesson");
		}
	};

	const handleDelete = async () => {
		if (
			!id ||
			!window.confirm("Are you sure you want to delete this lesson?")
		) {
			return;
		}

		try {
			await api.delete(`/Lesson/${id}`);
			toast.success("Lesson deleted successfully!");
			if (learningCourseId) {
				navigate(`/course/${learningCourseId}`);
			}
		} catch (error) {
			console.error("Error deleting lesson:", error);
			toast.error("Failed to delete lesson");
		}
	};

	return (
		<FormCard
			title="Edit Lesson"
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

				<div>
					<label className="font-semibold">Duration (minutes)</label>
					<input
						type="number"
						value={duration}
						onChange={(e) => setDuration(parseInt(e.target.value))}
						required
						min={1}
						className="w-full rounded border p-2"
					/>
				</div>

				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => navigate(`/course/${learningCourseId}`)}
						className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="flex-1 rounded bg-yellow-500 py-2 font-semibold text-white hover:bg-yellow-600"
					>
						Save Changes
					</button>
					<button
						type="button"
						onClick={handleDelete}
						className="flex-1 rounded bg-red-500 py-2 font-semibold text-white hover:bg-red-600"
					>
						Delete
					</button>
				</div>
			</form>
		</FormCard>
	);
};

export default EditLessonPage;
