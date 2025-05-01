import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

interface Lesson {
	id: string;
	title: string;
	description: string | null;
	duration: number;
	index: number;
	chapterTitles: string[];
}

interface Course {
	id: string;
	title: string;
	description: string;
	level: string;
	duration: number;
	isPublished: boolean;
	tagNames: string[];
	badge?: {
		name: string;
		icon: string;
		level: string;
	};
}

interface JwtPayload {
	roles: string;
}

const CourseDetailsPage = () => {
	const { id } = useParams<{ id: string }>();
	const [course, setCourse] = useState<Course | null>(null);
	const [lessons, setLessons] = useState<Lesson[]>([]);
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [progress, setProgress] = useState({
		totalLessons: 0,
		completedLessons: 0,
		progressPercentage: 0,
		isCompleted: false,
	});
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) return;

		try {
			const decoded = jwtDecode<JwtPayload>(token);
			setIsAdmin(decoded.roles === "Admin");
		} catch (err) {
			console.error("Token decode failed", err);
		}
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = localStorage.getItem("token");
				const headers = { Authorization: `Bearer ${token}` };

				const [courseRes, lessonsRes, progressRes] = await Promise.all([
					axios.get(`http://localhost:5153/LearningCourse/${id}`, {
						headers,
					}),
					axios.get(`http://localhost:5153/Lesson/by-course/${id}`, {
						headers,
					}),
					axios.get(
						`http://localhost:5153/UserProgress/course/${id}`,
						{ headers },
					),
				]);

				setCourse(courseRes.data);
				setLessons(lessonsRes.data);
				setProgress(progressRes.data);
			} catch (err) {
				console.error(err);
				toast.error("Failed to load course data");
			} finally {
				setLoading(false);
			}
		};

		if (id) fetchData();
	}, [id]);

	const handlePublishToggle = async (newStatus: boolean) => {
		if (!course) return;

		try {
			const token = localStorage.getItem("token");
			await axios.patch(
				`http://localhost:5153/LearningCourse/${course.id}`,
				{
					...course,
					isPublished: newStatus,
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);

			toast.success(
				`Course ${newStatus ? "published" : "unpublished"} successfully!`,
			);
			setCourse({ ...course, isPublished: newStatus });
		} catch (error) {
			console.error(error);
			toast.error("Failed to update publish status");
		}
	};

	const handleDelete = async () => {
		if (!course) return;
		if (!window.confirm("Are you sure you want to delete this course?"))
			return;

		try {
			const token = localStorage.getItem("token");
			await axios.delete(
				`http://localhost:5153/LearningCourse/${course.id}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			toast.success("Course deleted");
			navigate("/courses");
		} catch (error) {
			console.error(error);
			toast.error("Failed to delete course");
		}
	};

	const handleDragEnd = async (result: any) => {
		if (!result.destination || !isAdmin || !course) return;

		const reorderedLessons = Array.from(lessons);
		const [removed] = reorderedLessons.splice(result.source.index, 1);
		reorderedLessons.splice(result.destination.index, 0, removed);

		const updatedLessons = reorderedLessons.map((lesson, idx) => ({
			...lesson,
			index: idx + 1,
		}));

		setLessons(updatedLessons);

		try {
			const token = localStorage.getItem("token");
			await axios.put(
				`http://localhost:5153/Lesson/course/${course.id}/reorder`,
				{
					lessons: updatedLessons.map((l) => ({
						id: l.id,
						index: l.index,
					})),
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			toast.success("Lesson order updated!");
		} catch (error) {
			console.error("Error updating lesson order", error);
			toast.error("Failed to update lesson order");
		}
	};

	const renderLessonCard = (lesson: Lesson) => {
		return (
			<Link
				key={lesson.id}
				to={`/lesson/${lesson.id}`}
				className="border-1 group flex cursor-pointer items-center justify-between rounded-lg border p-4 shadow transition-all hover:border-[var(--color-primary)] hover:shadow-md"
			>
				<div className="flex items-center gap-4">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
						{lesson.index}
					</div>
					<div>
						<h3 className="text-lg font-semibold">
							{lesson.title}
						</h3>
						<p className="text-gray-600 text-sm">
							{lesson.duration} minutes •{" "}
							{lesson.chapterTitles.length} chapters
						</p>
					</div>
				</div>
				{isAdmin && (
					<div
						className="hidden gap-2 group-hover:flex"
						onClick={(e) => e.preventDefault()}
					>
						<button
							onClick={() =>
								navigate(`/admin/lesson/${lesson.id}/edit`)
							}
							className="rounded bg-yellow-500 px-2 py-1 text-sm font-bold text-white hover:bg-yellow-600"
						>
							✏️ Edit
						</button>
					</div>
				)}
			</Link>
		);
	};

	if (loading || !course) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
			</div>
		);
	}

	if (!course.isPublished && !isAdmin) {
		toast.error("You are not authorized to view this course.");
		navigate("/courses");
		return null;
	}

	const statusClassName = course.isPublished
		? "text-green-600"
		: "text-yellow-600";
	const publishButtonClassName = `rounded px-4 py-2 font-bold text-white ${
		course.isPublished
			? "bg-gray-500 hover:bg-gray-600"
			: "bg-green-500 hover:bg-green-600"
	}`;

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#f4fff7] to-white px-6 py-10">
			{/* Breadcrumb navigation */}
			<div className="mx-auto mb-4 max-w-4xl">
				<div className="text-gray-600 flex items-center gap-2 text-sm">
					<button
						onClick={() => navigate("/courses")}
						className="transition-colors hover:text-white"
						type="button"
					>
						Courses
					</button>
					<span>/</span>
					<span className="text-[var(--color-primary)]">
						{course.title}
					</span>
				</div>
			</div>

			<motion.div
				className="mb-10 flex flex-col items-center text-center"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<BookOpen className="mb-4 h-12 w-12 text-[var(--color-primary)]" />
				<h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
					{course.title}
				</h1>
				<p className="text-gray-700 mt-3 max-w-2xl text-lg">
					{course.description}
				</p>
				<p className="text-gray-500 mt-2 text-sm">
					Duration: {course.duration}h · Level: {course.level}
				</p>
				{course.badge && (
					<div className="mt-4 flex items-center gap-2">
						<img
							src={course.badge.icon}
							alt={course.badge.name}
							className="h-8 w-8"
						/>
						<span className="text-sm font-medium">
							Complete this course to earn the {course.badge.name}{" "}
							badge!
						</span>
					</div>
				)}
				{isAdmin && (
					<p className="mt-2 text-sm">
						Status:{" "}
						<span className={statusClassName}>
							{course.isPublished ? "Published" : "Unpublished"}
						</span>
					</p>
				)}
			</motion.div>

			{!isAdmin && (
				<div className="mx-auto mb-10 max-w-xl rounded-xl bg-white p-4 shadow">
					<div className="mb-2 flex justify-between">
						<span className="text-sm font-medium">Progress</span>
						<span className="text-sm font-medium">
							{progress.completedLessons} /{" "}
							{progress.totalLessons} lessons
						</span>
					</div>
					<div className="bg-gray-200 h-2.5 w-full rounded-full">
						<div
							className="h-2.5 rounded-full bg-green-600 transition-all duration-500"
							style={{ width: `${progress.progressPercentage}%` }}
						/>
					</div>
					{progress.isCompleted && course.badge && (
						<div className="mt-2 text-center text-sm text-green-600">
							🎉 Course Completed! You&apos;ve earned the{" "}
							{course.badge.name} badge!
						</div>
					)}
				</div>
			)}

			{isAdmin && (
				<div className="mb-8 flex flex-wrap justify-center gap-4">
					<button
						onClick={() =>
							navigate(`/admin/edit-course/${course.id}`)
						}
						className="rounded bg-yellow-500 px-4 py-2 font-bold text-white hover:bg-yellow-600"
						type="button"
					>
						✏️ Edit Course
					</button>
					<button
						onClick={handleDelete}
						className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
						type="button"
					>
						🗑️ Delete
					</button>
					<button
						onClick={() => handlePublishToggle(!course.isPublished)}
						className={publishButtonClassName}
						type="button"
					>
						{course.isPublished ? "🚫 Unpublish" : "📢 Publish"}
					</button>
					<button
						onClick={() =>
							navigate(
								`/admin/create-lesson?courseId=${course.id}`,
							)
						}
						className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
						type="button"
					>
						➕ Add Lesson
					</button>
				</div>
			)}

			<h2 className="mb-6 text-center text-2xl font-semibold text-[var(--color-primary)]">
				Lessons in this course
			</h2>

			{lessons.length === 0 ? (
				<p className="text-gray-500 text-center">No lessons yet.</p>
			) : (
				<div className="mx-auto max-w-2xl">
					<DragDropContext onDragEnd={handleDragEnd}>
						<Droppable droppableId="lessons">
							{(provided) => (
								<div
									{...provided.droppableProps}
									ref={provided.innerRef}
									className="space-y-4"
								>
									{lessons.map((lesson, index) => (
										<Draggable
											key={lesson.id}
											draggableId={lesson.id}
											index={index}
											isDragDisabled={!isAdmin}
										>
											{(provided) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
												>
													{renderLessonCard(lesson)}
												</div>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</DragDropContext>
				</div>
			)}
		</div>
	);
};

export default CourseDetailsPage;
