import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, GraduationCap, Edit, Trash2 } from "lucide-react";
import ConfirmationModal from "../../components/ConfirmationModal";
import { FiClock, FiBook, FiBookOpen } from "react-icons/fi";
import { BsRocketTakeoff } from "react-icons/bs";
import api from "../../utils/api";
import Container from "../../components/layout/Container";
import ResponsiveCard from "../../components/layout/ResponsiveCard";

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
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);

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

	const handleDeleteClick = (chapterId: string) => {
		if (!isAdmin) return;
		setChapterToDelete(chapterId);
		setShowDeleteModal(true);
	};

	const handleConfirmDelete = async () => {
		if (!chapterToDelete || !isAdmin) return;

		try {
			await api.delete(`/Chapter/${chapterToDelete}`);
			toast.success("Chapter deleted!");
			setChapters(chapters.filter((c) => c.id !== chapterToDelete));
			setShowDeleteModal(false);
			setChapterToDelete(null);
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
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] py-6 sm:py-10">
			<Container>
				{/* Breadcrumb navigation */}
				<div className="mb-4">
					<div className="flex items-center gap-2 text-sm text-gray-600">
						{courseId && (
							<>
								<button
									onClick={() =>
										navigate(`/course/${courseId}`)
									}
									className="transition-colors hover:text-black"
									type="button"
								>
									{courseTitle}
								</button>
								<BsRocketTakeoff className="text-[var(--color-primary)]" />
							</>
						)}
						<span className="truncate text-[var(--color-primary)]">
							{lessonTitle}
						</span>
					</div>
				</div>

				{/* Header with navigation */}
				<motion.div
					className="mb-6 flex flex-col items-center text-center sm:mb-8"
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
						{lessonTitle}
					</h1>
					<p className="mt-2 flex flex-wrap items-center justify-center gap-2 text-base text-gray-500 sm:text-lg">
						<span className="flex items-center">
							<FiClock className="mr-1" /> {lessonDuration}{" "}
							minutes
						</span>
						<span>•</span>
						<span className="flex items-center">
							<FiBook className="mr-1" /> {chapters.length}{" "}
							chapters
						</span>
					</p>
					<div className="mt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
						<button
							onClick={() => navigate(`/course/${courseId}`)}
							className="flex transform items-center gap-2 rounded-lg bg-[var(--color-primary)] px-3 py-1.5 text-sm text-white shadow transition-all hover:-translate-y-1 hover:shadow-lg sm:rounded-xl sm:px-4 sm:py-2 sm:text-base"
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
								className="flex transform items-center gap-2 rounded-lg bg-[var(--color-accent)] px-3 py-1.5 text-sm text-white shadow transition-all hover:-translate-y-1 hover:shadow-lg sm:rounded-xl sm:px-4 sm:py-2 sm:text-base"
								type="button"
							>
								<Plus size={16} /> Add Chapter
							</button>
						)}
					</div>
				</motion.div>

				{/* Progress bar for students */}
				{!isAdmin && chapters.length > 0 && (
					<ResponsiveCard className="mx-auto mb-6 max-w-xl sm:mb-10">
						<div className="mb-2 flex justify-between">
							<span className="text-xs font-medium sm:text-sm">
								Your Progress
							</span>
							<span className="text-xs font-medium sm:text-sm">
								{progress.completedChapters} /{" "}
								{progress.totalChapters} chapters
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
					</ResponsiveCard>
				)}

				<h2 className="mb-4 text-center text-xl font-semibold sm:mb-6 sm:text-2xl">
					<FiBookOpen className="mr-2 inline text-[var(--color-primary)]" />
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
									className="space-y-3 sm:space-y-4"
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
															className="group relative block transform overflow-hidden rounded-xl bg-white p-4 shadow-md transition-all hover:-translate-y-1 hover:shadow-lg sm:p-5"
														>
															<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
																<div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-bold text-white sm:h-12 sm:w-12 sm:text-xl">
																	{
																		chapter.index
																	}
																</div>
																<div>
																	<h3 className="text-lg font-semibold group-hover:text-[var(--color-primary)] sm:text-xl">
																		{
																			chapter.title
																		}
																	</h3>
																</div>
																<div className="mt-2 flex items-center justify-end gap-2 sm:ml-auto sm:mt-0 sm:justify-normal">
																	{!isAdmin &&
																		chapter.isCompleted && (
																			<div className="animate-bounce">
																				<GraduationCap
																					className="text-green-600"
																					size={
																						20
																					}
																				/>
																			</div>
																		)}
																	{isAdmin && (
																		<div
																			className="flex transform gap-2 sm:hidden sm:group-hover:flex"
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
																				className="rounded-lg bg-yellow-500 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-yellow-600 sm:text-sm"
																				type="button"
																			>
																				<Edit
																					size={
																						14
																					}
																				/>{" "}
																				<span className="hidden sm:inline">
																					Edit
																				</span>
																			</button>
																			<button
																				onClick={(
																					e,
																				) => {
																					e.stopPropagation();
																					handleDeleteClick(
																						chapter.id,
																					);
																				}}
																				className="rounded-lg bg-red-500 px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-red-600 sm:text-sm"
																				type="button"
																			>
																				<Trash2
																					size={
																						14
																					}
																				/>{" "}
																				<span className="hidden sm:inline">
																					Delete
																				</span>
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
			</Container>

			{/* Confirmation Modal for Delete */}
			<ConfirmationModal
				isOpen={showDeleteModal}
				title="Delete Chapter"
				message="Are you sure you want to delete this chapter? This action cannot be undone."
				onConfirm={handleConfirmDelete}
				onCancel={() => {
					setShowDeleteModal(false);
					setChapterToDelete(null);
				}}
				confirmText="Delete"
				cancelText="Cancel"
			/>
		</div>
	);
}
