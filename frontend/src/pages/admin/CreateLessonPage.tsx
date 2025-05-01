import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { Layers } from "lucide-react";

const CreateLessonPage = () => {
	const [title, setTitle] = useState("");
	const [duration, setDuration] = useState(10);

	const [searchParams] = useSearchParams();
	const courseId = searchParams.get("courseId");
	const navigate = useNavigate();

	useEffect(() => {
		if (!courseId) {
			toast.error("Missing courseId in URL!");
			navigate("/dashboard");
		}
	}, [courseId, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!courseId) return;

		try {
			const token = localStorage.getItem("token");
			const response = await axios.post(
				"http://localhost:5153/Lesson",
				{
					title,
					duration,
					learningCourseId: courseId,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			const createdLessonId = response.data;
			toast.success("Lesson created!");
			navigate(`/lesson/${createdLessonId}`);
		} catch (err) {
			console.error(err);
			toast.error("Failed to create lesson");
		}
	};

	return (
		<FormCard
			title="Add New Lesson"
			icon={<Layers size={40} className="text-[var(--color-primary)]" />}
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
						min={1}
						value={duration}
						onChange={(e) => setDuration(parseInt(e.target.value))}
						required
						className="w-full rounded border p-2"
					/>
				</div>
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
						➕ Add Lesson
					</button>
				</div>
			</form>
		</FormCard>
	);
};

export default CreateLessonPage;
