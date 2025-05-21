import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import {
	FiClock,
	FiFileText,
	FiTrash2,
	FiSend,
	FiPlus,
	FiBook,
	FiAward,
	FiCheckCircle,
	FiX,
} from "react-icons/fi";
import { Pencil } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import { BsRocketTakeoff, BsStar, BsTrophy, BsTree } from "react-icons/bs";
import Container from "../../components/layout/Container";
import ResponsiveCard from "../../components/layout/ResponsiveCard";

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
	const [showDeleteModal, setShowDeleteModal] = useState(false);
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

	const handleDeleteClick = () => {
		if (!course || !isAdmin) return;
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		if (!course || !isAdmin) return;

		try {
			const token = localStorage.getItem("token");
			await axios.delete(
				`http://localhost:5153/LearningCourse/${course.id}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			toast.success("Course deleted");
			setShowDeleteModal(false);
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
				className="group relative block transform overflow-hidden rounded-xl bg-white p-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg sm:p-5"
			>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white sm:h-12 sm:w-12 sm:text-xl">
						{lesson.index}
					</div>
					<div>
						<h3 className="text-lg font-semibold text-black group-hover:text-[var(--color-primary)] sm:text-xl">
							{lesson.title}
						</h3>
						<p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600 sm:text-sm">
							<span className="flex items-center">
								<FiClock className="mr-1" /> {lesson.duration}{" "}
								minutes
							</span>
							<span>•</span>
							<span className="flex items-center">
								<FiFileText className="mr-1" />{" "}
								{lesson.chapterTitles.length} chapters
							</span>
						</p>
					</div>
				</div>
				{isAdmin && (
					<div
						className="absolute right-2 top-1/2 hidden -translate-y-1/2 transform gap-2 group-hover:flex sm:right-5"
						onClick={(e) => e.preventDefault()}
					>
						<button
							onClick={() =>
								navigate(`/admin/lesson/${lesson.id}/edit`)
							}
							className="rounded-lg bg-yellow-500 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-yellow-600 sm:text-sm"
						>
							<Pencil size={14} className="mr-1 inline" /> Edit
						</button>
					</div>
				)}
			</Link>
		);
	};

	if (loading || !course) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white p-4">
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
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] py-6 sm:py-10">
			<Container>
				{/* Breadcrumb navigation */}
				<div className="mb-4">
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<button
							onClick={() => navigate("/courses")}
							className="transition-colors hover:text-black"
							type="button"
						>
							Courses
						</button>
						<BsRocketTakeoff className="text-[var(--color-primary)]" />
						<span className="truncate text-[var(--color-primary)]">
							{course.title}
						</span>
					</div>
				</div>

				<motion.div
					className="mb-6 flex flex-col items-center text-center sm:mb-10"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="relative">
						<img
							src="/src/assets/code_icon_green.svg"
							alt="Code icon"
							className="mb-4 h-12 w-12 sm:h-16 sm:w-16"
						/>
					</div>
					<h1 className="bg-[var(--color-primary)] bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl md:text-5xl">
						{course.title}
					</h1>
					<p className="mt-3 max-w-4xl text-base text-gray-700 sm:text-lg">
						{course.description}
					</p>
					<p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 sm:text-sm">
						<span className="flex items-center">
							<FiClock className="mr-1" /> {course.duration}h
						</span>
						<span>•</span>
						<span className="flex items-center">
							{course.level === "Beginner" && (
								<>
									<BsTree className="mr-1 text-green-500" />{" "}
									Perfect for beginners
								</>
							)}
							{course.level === "Intermediate" && (
								<>
									<BsStar className="mr-1 text-yellow-500" />{" "}
									Intermediate level
								</>
							)}
							{course.level === "Advanced" && (
								<>
									<BsTrophy className="mr-1 text-amber-500" />{" "}
									For experts
								</>
							)}
						</span>
					</p>
					{course.badge && (
						<div className="mt-4 transform rounded-xl bg-white p-3 shadow-lg transition-transform hover:scale-105 sm:p-4">
							<div className="flex items-center gap-2">
								<img
									src={course.badge.icon}
									alt={course.badge.name}
									className="h-10 w-10 sm:h-12 sm:w-12"
								/>
								<div className="text-left">
									<p className="font-semibold">
										{course.badge.name} Badge
									</p>
									<p className="text-xs text-gray-600 sm:text-sm">
										Complete the course to earn it!{" "}
										<FiAward className="ml-1 inline text-amber-500" />
									</p>
								</div>
							</div>
						</div>
					)}
					{isAdmin && (
						<p className="mt-2 text-sm">
							Status:{" "}
							<span className={statusClassName}>
								{course.isPublished
									? "Published"
									: "Unpublished"}
							</span>
						</p>
					)}
				</motion.div>

				{!isAdmin && (
					<ResponsiveCard className="mx-auto mb-6 max-w-xl sm:mb-10">
						<div className="mb-2 flex justify-between">
							<span className="text-xs font-medium sm:text-sm">
								Your Progress
							</span>
							<span className="text-xs font-medium sm:text-sm">
								{progress.completedLessons} /{" "}
								{progress.totalLessons} lessons
							</span>
						</div>
						<div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 sm:h-4">
							<div
								className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[#4aba7a] transition-all duration-500"
								style={{
									width: `${progress.progressPercentage}%`,
								}}
							/>
						</div>
						{progress.isCompleted && course.badge && (
							<div className="mt-4 animate-bounce text-center">
								<FiCheckCircle className="inline text-base text-[var(--color-primary)] sm:text-lg" />
								<span className="ml-2 text-xs font-medium text-[var(--color-primary)] sm:text-sm">
									Congratulations! You've earned the{" "}
									{course.badge.name} badge!
								</span>
							</div>
						)}
					</ResponsiveCard>
				)}

				{isAdmin && (
					<div className="mb-8 flex flex-wrap justify-center gap-3 sm:gap-4">
						<button
							onClick={() =>
								navigate(`/admin/edit-course/${course.id}`)
							}
							className="transform rounded-lg bg-yellow-500 px-3 py-1.5 text-sm font-bold text-white shadow transition-all hover:-translate-y-1 hover:bg-yellow-600 hover:shadow-lg sm:px-4 sm:py-2 sm:text-base"
							type="button"
						>
							<Pencil size={16} className="mr-1 inline" /> Edit
							Course
						</button>
						<button
							onClick={handleDeleteClick}
							className="transform rounded-lg bg-red-500 px-3 py-1.5 text-sm font-bold text-white shadow transition-all hover:-translate-y-1 hover:bg-red-600 hover:shadow-lg sm:px-4 sm:py-2 sm:text-base"
							type="button"
						>
							<FiTrash2 className="mr-1 inline" /> Delete
						</button>
						<button
							onClick={() =>
								handlePublishToggle(!course.isPublished)
							}
							className={`transform rounded-lg px-3 py-1.5 text-sm font-bold sm:px-4 sm:py-2 sm:text-base ${publishButtonClassName} shadow transition-all hover:-translate-y-1 hover:shadow-lg`}
							type="button"
						>
							{course.isPublished ? (
								<>
									<FiX className="mr-1 inline" /> Unpublish
								</>
							) : (
								<>
									<FiSend className="mr-1 inline" /> Publish
								</>
							)}
						</button>
						<button
							onClick={() =>
								navigate(
									`/admin/create-lesson?courseId=${course.id}`,
								)
							}
							className="transform rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm font-bold text-white shadow transition-all hover:-translate-y-1 hover:bg-[#5658ac] hover:shadow-lg sm:px-4 sm:py-2 sm:text-base"
							type="button"
						>
							<FiPlus className="mr-1 inline" /> Add Lesson
						</button>
					</div>
				)}

				<h2 className="mb-4 text-center text-xl font-semibold sm:mb-6 sm:text-2xl">
					<FiBook className="mr-2 inline text-[var(--color-primary)]" />
					Lessons in this Course
				</h2>

				{lessons.length === 0 ? (
					<p className="text-center text-gray-500">
						No lessons available yet.
					</p>
				) : (
					<div className="mx-auto">
						<DragDropContext onDragEnd={handleDragEnd}>
							<Droppable droppableId="lessons">
								{(provided) => (
									<div
										{...provided.droppableProps}
										ref={provided.innerRef}
										className="space-y-3 sm:space-y-4"
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
														{renderLessonCard(
															lesson,
														)}
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
			</Container>

			{/* Confirmation Modal for Delete */}
			<ConfirmationModal
				isOpen={showDeleteModal}
				title="Delete Course"
				message="Are you sure you want to delete this course? This action cannot be undone."
				onConfirm={handleConfirmDelete}
				onCancel={() => setShowDeleteModal(false)}
				confirmText="Delete"
				cancelText="Cancel"
			/>
		</div>
	);
};

export default CourseDetailsPage;
