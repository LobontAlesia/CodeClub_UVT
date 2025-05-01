import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { Pencil } from "lucide-react";

interface Course {
	id: string;
	title: string;
	description: string;
	duration: number;
	level: string;
	isPublished: boolean;
	tagNames: string[];
}

interface Lesson {
	id: string;
	title: string;
	index: number;
	duration: number;
	chapterTitles: string[];
}

const EditCoursePage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [course, setCourse] = useState<Course | null>(null);
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [tagInput, setTagInput] = useState("");

	useEffect(() => {
		const fetchCourse = async () => {
			try {
				const token = localStorage.getItem("token");
				const headers = { Authorization: `Bearer ${token}` };

				const [courseRes, lessonsRes] = await Promise.all([
					axios.get(`http://localhost:5153/LearningCourse/${id}`, {
						headers,
					}),
					axios.get(`http://localhost:5153/Lesson/by-course/${id}`, {
						headers,
					}),
				]);

				setCourse(courseRes.data);
				setLessons(lessonsRes.data);
			} catch (error) {
				console.error(error);
				toast.error("Failed to load course");
			}
		};

		if (id) fetchCourse();
	}, [id]);

	const handleUpdate = async () => {
		if (!course) return;
		const token = localStorage.getItem("token");
		const headers = { Authorization: `Bearer ${token}` };

		try {
			await axios.patch(
				`http://localhost:5153/LearningCourse/${course.id}`,
				{
					...course,
					lessonTitles: lessons.map((l) => l.title),
				},
				{ headers },
			);
			toast.success("Course updated successfully");
			navigate(`/course/${course.id}`);
		} catch (error: any) {
			console.error(error);
			const msg = error.response?.data;
			if (typeof msg === "string") {
				toast.error(msg);
			} else {
				toast.error("Failed to update the course. Please try again.");
			}
		}
	};

	const handleAddTag = () => {
		if (tagInput && !course?.tagNames.includes(tagInput)) {
			setCourse({
				...course!,
				tagNames: [...course!.tagNames, tagInput],
			});
			setTagInput("");
		}
	};

	const handleRemoveTag = (tag: string) => {
		if (!course) return;
		setCourse({
			...course,
			tagNames: course.tagNames.filter((t) => t !== tag),
		});
	};

	if (!course) return <div className="p-6">Loading...</div>;

	return (
		<FormCard
			title="Edit Course"
			icon={<Pencil size={40} className="text-[var(--color-primary)]" />}
		>
			<div className="space-y-6">
				<div>
					<label className="font-semibold">Title</label>
					<input
						type="text"
						value={course.title}
						onChange={(e) =>
							setCourse({ ...course, title: e.target.value })
						}
						className="w-full rounded border p-2"
					/>
				</div>

				<div>
					<label className="font-semibold">Description</label>
					<textarea
						value={course.description}
						onChange={(e) =>
							setCourse({
								...course,
								description: e.target.value,
							})
						}
						rows={3}
						className="w-full rounded border p-2"
					/>
				</div>

				<div>
					<label className="font-semibold">Duration (hours)</label>
					<input
						type="number"
						min={1}
						value={course.duration}
						onChange={(e) =>
							setCourse({
								...course,
								duration: parseInt(e.target.value),
							})
						}
						className="w-full rounded border p-2"
					/>
				</div>

				<div>
					<label className="font-semibold">Level</label>
					<input
						type="text"
						value={course.level}
						onChange={(e) =>
							setCourse({ ...course, level: e.target.value })
						}
						className="w-full rounded border p-2"
					/>
				</div>

				<div className="flex items-center gap-2">
					<input
						type="checkbox"
						checked={course.isPublished}
						onChange={(e) =>
							setCourse({
								...course,
								isPublished: e.target.checked,
							})
						}
					/>
					<label className="font-medium">Published</label>
				</div>

				<div>
					<label className="font-semibold">Tags</label>
					<div className="mt-1 flex gap-2">
						<input
							type="text"
							placeholder="Add tag"
							value={tagInput}
							onChange={(e) => setTagInput(e.target.value)}
							className="flex-grow rounded border p-2"
						/>
						<button
							onClick={handleAddTag}
							className="rounded bg-[var(--color-primary)] px-4 py-2 font-bold text-white hover:bg-[var(--color-secondary)]"
						>
							Add
						</button>
					</div>
					<div className="mt-2 flex flex-wrap gap-2">
						{course.tagNames.map((tag, idx) => (
							<span
								key={idx}
								className="bg-gray-200 flex items-center gap-2 rounded-full px-3 py-1 text-sm"
							>
								{tag}
								<button onClick={() => handleRemoveTag(tag)}>
									✖
								</button>
							</span>
						))}
					</div>
				</div>

				<div className="flex gap-4">
					<button
						onClick={() => navigate(-1)}
						className="bg-gray-500 hover:bg-gray-600 flex-1 rounded py-2 font-semibold text-white"
					>
						Cancel
					</button>
					<button
						onClick={handleUpdate}
						className="flex-1 rounded bg-yellow-500 py-2 font-semibold text-white hover:bg-yellow-600"
					>
						✏️ Save Changes
					</button>
				</div>
			</div>
		</FormCard>
	);
};

export default EditCoursePage;
