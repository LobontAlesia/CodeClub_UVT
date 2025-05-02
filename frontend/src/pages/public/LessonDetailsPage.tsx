import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, GraduationCap } from "lucide-react";
import api from "../../utils/api";

interface Chapter {
	id: string;
	title: string;
	index: number;
	isCompleted?: boolean;
}

interface JwtPayload {
	roles: string;
}

interface ChapterProgressResponse {
	data: {
		isCompleted: boolean;
	};
}

export default function LessonDetailsPage() {
	const { id: lessonId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [chapters, setChapters] = useState<Chapter[]>([]);
	const [lessonTitle, setLessonTitle] = useState("");
	const [lessonDuration, setLessonDuration] = useState(0);
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);
	const [courseId, setCourseId] = useState<string | null>(null);
	const [courseTitle, setCourseTitle] = useState("");
	const [progress, setProgress] = useState({
		completedChapters: 0,
		totalChapters: 0,
		progressPercentage: 0,
	});

	const fetchLessonData = async () => {
		if (!lessonId) return;

		try {
			setLoading(true);
			const [lessonResponse, chaptersResponse, progressResponse] =
				await Promise.all([
					api.get(`/Lesson/${lessonId}`),
					api.get(`/Chapter/lesson/${lessonId}`),
					api.get(`/UserProgress/lesson/${lessonId}`),
				]);

			if (!lessonResponse?.data) {
				throw new Error("Lesson not found");
			}

			setLessonTitle(lessonResponse.data.title || "Lesson");
			setLessonDuration(lessonResponse.data.duration || 0);
			setCourseId(lessonResponse.data.learningCourseId);
			setCourseTitle(lessonResponse.data.courseTitle || "");

			const chaptersData = chaptersResponse.data || [];
			const chapterProgress = progressResponse.data || {
				completedChapters: 0,
				totalChapters: 0,
				progressPercentage: 0,
			};

			// Update chapters with completion status
			const updatedChapters = chaptersData.map((chapter: Chapter) => ({
				...chapter,
				isCompleted: false, // This will be set individually by checking each chapter
			}));
			setChapters(updatedChapters);

			// If not admin, fetch completion status for each chapter
			if (!isAdmin) {
				const chapterProgressPromises = updatedChapters.map(
					(chapter: Chapter) =>
						api.get(`/UserProgress/chapter/${chapter.id}`),
				);
				const chapterProgressResults = await Promise.allSettled(
					chapterProgressPromises,
				);

				const updatedChaptersWithProgress = updatedChapters.map(
					(chapter: Chapter, index: number) => {
						const progressResult = chapterProgressResults[index];
						return {
							...chapter,
							isCompleted:
								progressResult.status === "fulfilled" &&
								(
									progressResult.value as ChapterProgressResponse
								)?.data?.isCompleted,
						};
					},
				);
				setChapters(updatedChaptersWithProgress);

				// Set overall lesson progress
				setProgress({
					completedChapters: chapterProgress.completedChapters,
					totalChapters: chapterProgress.totalChapters,
					progressPercentage: chapterProgress.progressPercentage,
				});
			}
		} catch (error: any) {
			console.error("Error fetching lesson details:", error);
			const errorMessage =
				error.response?.status === 404
					? "Lesson not found"
					: error.response?.data?.message ||
						error.message ||
						"Failed to load lesson details";
			toast.error(errorMessage);
			if (error.response?.status === 404) {
				navigate("/courses");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLessonData();
	}, [lessonId, isAdmin, navigate]);

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}

		try {
			const decoded = jwtDecode<JwtPayload>(token);
			setIsAdmin(decoded.roles === "Admin");
		} catch (err) {
			console.error("Failed to decode token", err);
			navigate("/login");
		}
	}, [navigate]);

	const handleDeleteChapter = async (chapterId: string) => {
		if (!window.confirm("Are you sure you want to delete this chapter?"))
			return;

		try {
			await api.delete(`/Chapter/${chapterId}`);
			toast.success("Chapter deleted!");
			setChapters(chapters.filter((c) => c.id !== chapterId));
		} catch (error) {
			console.error("Error deleting chapter", error);
			toast.error("Failed to delete chapter");
		}
	};

	const handleDragEnd = async (result: any) => {
		if (!result.destination || !isAdmin) return;

		const reorderedChapters = Array.from(chapters);
		const [removed] = reorderedChapters.splice(result.source.index, 1);
		reorderedChapters.splice(result.destination.index, 0, removed);

		const updatedChapters = reorderedChapters.map((chapter, idx) => ({
			...chapter,
			index: idx + 1,
		}));

		setChapters(updatedChapters);

		try {
			await api.put(`/Chapter/lesson/${lessonId}/reorder`, {
				chapters: updatedChapters.map((c) => ({
					id: c.id,
					index: c.index,
				})),
			});
			toast.success("Chapter order updated!");
		} catch (error) {
			console.error("Error updating chapter order", error);
			toast.error("Failed to update chapter order");
			// Revert to original order on error
			fetchLessonData();
		}
	};

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white p-4">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] px-6 py-10">
			<div className="mx-auto mb-4 max-w-4xl">
				{/* Breadcrumb navigation */}
				<div className="flex items-center gap-2 text-sm text-gray-600">
					{courseId && (
						<>
							<button
								onClick={() => navigate(`/course/${courseId}`)}
								className="transition-colors hover:text-black"
								type="button"
							>
								{courseTitle}
							</button>
							<span>🚀</span>
						</>
					)}
					<span className="text-[var(--color-primary)]">
						{lessonTitle}
					</span>
				</div>
			</div>

			{/* Header with navigation */}
			<motion.div
				className="mb-8 flex flex-col items-center text-center"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<div className="relative">
					<img
						src="/src/assets/code_icon_green.svg"
						alt="Code icon"
						className="mb-4 h-16 w-16"
					/>
					<motion.div
						className="absolute -right-2 -top-2"
						animate={{ y: [-4, 4, -4] }}
						transition={{ repeat: Infinity, duration: 2 }}
					>
						📖
					</motion.div>
				</div>
				<h1 className="bg-gradient-to-r from-[var(--color-primary)] via-[#4aba7a] to-[var(--color-accent)] bg-clip-text text-5xl font-extrabold text-transparent">
					{lessonTitle}
				</h1>
				<p className="mt-2 flex items-center justify-center gap-2 text-lg text-gray-500">
					<span>⏱️ {lessonDuration} minutes</span>
					<span>•</span>
					<span>📚 {chapters.length} chapters</span>
				</p>
				<div className="mt-4 flex flex-wrap justify-center gap-4">
					<button
						onClick={() => navigate(`/course/${courseId}`)}
						className="flex transform items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-white shadow transition-all hover:-translate-y-1 hover:shadow-lg"
						type="button"
					>
						<ArrowLeft size={16} /> Back to Course
					</button>
					{isAdmin && (
						<button
							onClick={() =>
								navigate(
									`/admin/lesson/${lessonId}/add-chapter`,
								)
							}
							className="flex transform items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-white shadow transition-all hover:-translate-y-1 hover:shadow-lg"
							type="button"
						>
							<Plus size={16} /> Add Chapter
						</button>
					)}
				</div>
			</motion.div>

			{/* Progress bar for students */}
			{!isAdmin && chapters.length > 0 && (
				<div className="mx-auto mb-10 max-w-xl overflow-hidden rounded-xl bg-white p-6 shadow-lg">
					<div className="mb-2 flex justify-between">
						<span className="text-sm font-medium">
							Your Progress
						</span>
						<span className="text-sm font-medium">
							{progress.completedChapters} /{" "}
							{progress.totalChapters} chapters
						</span>
					</div>
					<div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
						<div
							className="h-4 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[#4aba7a] transition-all duration-500"
							style={{ width: `${progress.progressPercentage}%` }}
						/>
					</div>
				</div>
			)}

			<h2 className="mb-6 text-center text-2xl font-semibold">
				<span className="mr-2">📚</span>
				Chapters in this Lesson
			</h2>

			{/* Chapters List */}
			<div className="mx-auto max-w-2xl">
				<DragDropContext onDragEnd={handleDragEnd}>
					<Droppable droppableId="chapters">
						{(provided) => (
							<div
								{...provided.droppableProps}
								ref={provided.innerRef}
								className="space-y-4"
							>
								{chapters.length === 0 ? (
									<p className="text-center text-gray-500">
										No chapters available yet.
									</p>
								) : (
									chapters.map((chapter, index) => (
										<Draggable
											key={chapter.id}
											draggableId={chapter.id}
											index={index}
											isDragDisabled={!isAdmin}
										>
											{(provided) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
												>
													<div
														onClick={() =>
															navigate(
																`/chapter/${chapter.id}`,
															)
														}
														className="group relative block transform overflow-hidden rounded-xl bg-white p-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg"
													>
														<div className="flex items-center gap-4">
															<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white">
																{chapter.index}
															</div>
															<div>
																<h3 className="text-lg font-semibold group-hover:text-[var(--color-primary)]">
																	{
																		chapter.title
																	}
																</h3>
															</div>
															<div className="ml-auto flex items-center gap-2">
																{!isAdmin &&
																	chapter.isCompleted && (
																		<div className="animate-bounce">
																			<GraduationCap
																				className="text-green-600"
																				size={
																					24
																				}
																			/>
																		</div>
																	)}
																{isAdmin && (
																	<div
																		className="hidden transform gap-2 group-hover:flex"
																		onClick={(
																			e,
																		) =>
																			e.stopPropagation()
																		}
																	>
																		<button
																			onClick={(
																				e,
																			) => {
																				e.stopPropagation();
																				navigate(
																					`/admin/chapter/${chapter.id}/edit`,
																				);
																			}}
																			className="rounded-lg bg-yellow-500 px-3 py-1 text-sm font-bold text-white transition-colors hover:bg-yellow-600"
																			type="button"
																		>
																			✏️
																			Edit
																		</button>
																		<button
																			onClick={(
																				e,
																			) => {
																				e.stopPropagation();
																				handleDeleteChapter(
																					chapter.id,
																				);
																			}}
																			className="rounded-lg bg-red-500 px-3 py-1 text-sm font-bold text-white transition-colors hover:bg-red-600"
																			type="button"
																		>
																			🗑️
																			Delete
																		</button>
																	</div>
																)}
															</div>
														</div>
													</div>
												</div>
											)}
										</Draggable>
									))
								)}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>
		</div>
	);
}
