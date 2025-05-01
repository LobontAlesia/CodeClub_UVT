import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import api from "../../utils/api";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, CheckCircle } from "lucide-react";

interface ChapterElement {
	id: string;
	title: string;
	type: string;
	index: number;
	content?: string;
	image?: string;
	formId?: string;
}

export default function ChapterDetailsPage() {
	const { chapterId } = useParams<{ chapterId: string }>();
	const navigate = useNavigate();
	const [isAdmin, setIsAdmin] = useState(false);
	const [elements, setElements] = useState<ChapterElement[]>([]);
	const [chapterTitle, setChapterTitle] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [chapterProgress, setChapterProgress] = useState({
		isCompleted: false,
	});
	const [lessonId, setLessonId] = useState<string | null>(null);
	const [lessonTitle, setLessonTitle] = useState("");
	const [courseId, setCourseId] = useState<string | null>(null);
	const [courseTitle, setCourseTitle] = useState("");

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (token) {
			const decodedToken = JSON.parse(atob(token.split(".")[1]));
			setIsAdmin(decodedToken.roles?.includes("Admin") || false);
		}
	}, []);

	useEffect(() => {
		fetchElements();
		fetchHierarchyInfo();
		if (!isAdmin) {
			fetchProgress();
		}
	}, [chapterId, isAdmin]);

	const fetchElements = async () => {
		setIsLoading(true);
		try {
			const res = await api.get(`/chapter/${chapterId}/elements`);
			setElements(res.data.elements || []);
			setChapterTitle(res.data.title);
		} catch (error) {
			console.error("Error loading chapter elements", error);
			toast.error("Failed to load chapter content");
		} finally {
			setIsLoading(false);
		}
	};

	const fetchHierarchyInfo = async () => {
		try {
			const response = await api.get(`/Chapter/${chapterId}/hierarchy`);
			setLessonId(response.data.lessonId);
			setLessonTitle(response.data.lessonTitle);
			setCourseId(response.data.courseId);
			setCourseTitle(response.data.courseTitle);
		} catch (error) {
			console.error("Error fetching hierarchy info", error);
		}
	};

	const fetchProgress = async () => {
		try {
			const res = await api.get(`/userprogress/chapter/${chapterId}`);
			setChapterProgress(res.data);
		} catch (error) {
			console.error("Error fetching progress", error);
		}
	};

	const checkQuizCompletions = async () => {
		const quizElements = elements.filter(
			(element) => element.type === "Form" && element.formId,
		);
		if (quizElements.length === 0) return true;

		try {
			const quizCompletions = await Promise.all(
				quizElements.map(async (element) => {
					if (!element.formId) return false;
					try {
						const response = await api.get(
							`/QuizSubmission/check/${element.formId}`,
						);
						return response.data.passed;
					} catch {
						return false;
					}
				}),
			);

			return quizCompletions.every((completed) => completed);
		} catch (error) {
			console.error("Error checking quiz completions:", error);
			return false;
		}
	};

	const handleComplete = async () => {
		try {
			const quizzesCompleted = await checkQuizCompletions();
			if (!quizzesCompleted) {
				toast.error(
					"You must complete all quizzes in this chapter before marking it as complete!",
				);
				return;
			}

			await api.post(`/userprogress/chapter/${chapterId}/complete`);
			toast.success("Chapter completed! 🌟");
			setChapterProgress((prev) => ({ ...prev, isCompleted: true }));

			if (lessonId) {
				await api.get(`/userprogress/lesson/${lessonId}`);
			}
		} catch (error) {
			console.error("Error marking chapter as complete", error);
			toast.error("Could not mark chapter as completed");
		}
	};

	const handleDelete = async (elementId: string) => {
		if (!isAdmin) return;
		const confirmDelete = window.confirm(
			"Are you sure you want to delete this element?",
		);
		if (!confirmDelete) return;

		try {
			await api.delete(`/chapterelement/${elementId}`);
			toast.success("Element deleted successfully!");
			fetchElements();
		} catch (error) {
			console.error(error);
			toast.error("Error deleting element!");
		}
	};

	const handleEdit = (elementId: string) => {
		if (!isAdmin) return;
		navigate(`/admin/edit-element/${elementId}`);
	};

	const handleDragEnd = async (result: any) => {
		if (!isAdmin || !result.destination) return;

		const items = Array.from(elements);
		const [reorderedItem] = items.splice(result.source.index, 1);
		items.splice(result.destination.index, 0, reorderedItem);

		const updatedItems = items.map((item, index) => ({
			...item,
			index: index + 1,
		}));

		setElements(updatedItems);

		try {
			await api.put(`/chapter/${chapterId}/reorder-elements`, {
				elements: updatedItems.map((item) => ({
					id: item.id,
					index: item.index,
				})),
			});
			toast.success("Order updated successfully!");
		} catch (error) {
			console.error("Error updating elements order", error);
			toast.error("Error updating order!");
			fetchElements();
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white p-4">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] px-6 py-10">
			<div className="mx-auto max-w-4xl">
				{/* Breadcrumb navigation */}
				<div className="text-gray-600 mb-4 flex items-center gap-2 text-sm">
					{courseId && (
						<>
							<button
								onClick={() => navigate(`/course/${courseId}`)}
								className="transition-colors hover:text-white"
								type="button"
							>
								{courseTitle}
							</button>
							<span>🚀</span>
						</>
					)}
					{lessonId && (
						<>
							<button
								onClick={() => navigate(`/lesson/${lessonId}`)}
								className="transition-colors hover:text-white"
								type="button"
							>
								{lessonTitle}
							</button>
							<span>📖</span>
						</>
					)}
					<span className="text-[var(--color-primary)]">
						{chapterTitle}
					</span>
				</div>

				{/* Header */}
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
							✨
						</motion.div>
					</div>
					<h1 className="bg-gradient-to-r from-[var(--color-primary)] via-[#4aba7a] to-[var(--color-accent)] bg-clip-text text-5xl font-extrabold text-transparent">
						{chapterTitle}
					</h1>
					<div className="mt-4 flex flex-wrap justify-center gap-4">
						<button
							onClick={() => navigate(`/lesson/${lessonId}`)}
							className="flex transform items-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-2 text-white shadow transition-all hover:-translate-y-1 hover:shadow-lg"
							type="button"
						>
							<ArrowLeft size={16} /> Back to Lesson
						</button>
						{isAdmin && (
							<button
								onClick={() =>
									navigate(
										`/admin/chapter/${chapterId}/add-element`,
									)
								}
								className="flex transform items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2 text-white shadow transition-all hover:-translate-y-1 hover:shadow-lg"
								type="button"
							>
								<Plus size={16} /> Add Element
							</button>
						)}
					</div>
				</motion.div>

				{/* Chapter Content */}
				<DragDropContext onDragEnd={handleDragEnd}>
					<Droppable droppableId="elements">
						{(provided) => (
							<div
								{...provided.droppableProps}
								ref={provided.innerRef}
								className="space-y-6"
							>
								{elements.length === 0 ? (
									<p className="text-gray-500 text-center">
										No elements in this chapter yet.
									</p>
								) : (
									elements.map((element, index) => (
										<Draggable
											key={element.id}
											draggableId={element.id}
											index={index}
											isDragDisabled={!isAdmin}
										>
											{(provided) => (
												<div
													ref={provided.innerRef}
													{...provided.draggableProps}
													{...provided.dragHandleProps}
													className="transform rounded-2xl border bg-white p-6 shadow-md transition-all hover:shadow-xl"
												>
													<motion.div
														className="mb-4 flex items-center justify-between"
														initial={
															!isAdmin
																? {
																		opacity: 0,
																		x: -20,
																	}
																: false
														}
														animate={{
															opacity: 1,
															x: 0,
														}}
														transition={{
															delay: index * 0.1,
														}}
													>
														<div className="flex items-center gap-4">
															{!isAdmin && (
																<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[#4aba7a] text-lg font-bold text-white">
																	{index + 1}
																</div>
															)}
															{isAdmin && (
																<h2 className="bg-gradient-to-r from-[var(--color-primary)] to-[#4aba7a] bg-clip-text text-2xl font-bold text-transparent">
																	{
																		element.title
																	}
																</h2>
															)}
														</div>
														{isAdmin && (
															<div className="flex gap-2">
																<button
																	onClick={() =>
																		handleEdit(
																			element.id,
																		)
																	}
																	className="transform rounded-lg bg-yellow-500 px-3 py-1 text-white shadow transition-all hover:-translate-y-1 hover:shadow-md"
																	type="button"
																>
																	Edit
																</button>
																<button
																	onClick={() =>
																		handleDelete(
																			element.id,
																		)
																	}
																	className="transform rounded-lg bg-red-500 px-3 py-1 text-white shadow transition-all hover:-translate-y-1 hover:shadow-md"
																	type="button"
																>
																	Delete
																</button>
															</div>
														)}
													</motion.div>

													{/* Element content with improved styling */}
													<motion.div
														initial={
															!isAdmin
																? {
																		opacity: 0,
																		y: 20,
																	}
																: false
														}
														animate={{
															opacity: 1,
															y: 0,
														}}
														transition={{
															delay:
																index * 0.1 +
																0.2,
														}}
													>
														{element.type ===
															"Image" &&
															element.image && (
																<div className="flex justify-center">
																	<img
																		src={
																			element.image
																		}
																		alt={
																			element.title
																		}
																		className="max-h-[600px] w-auto transform rounded-lg object-contain transition-transform hover:scale-105"
																	/>
																</div>
															)}
														{element.type ===
															"CodeFragment" &&
															element.content && (
																<pre className="bg-gray-900 relative overflow-x-auto rounded-lg p-4 font-mono text-sm shadow-lg">
																	<div className="mb-2 flex gap-2">
																		<div className="h-3 w-3 rounded-full bg-red-500"></div>
																		<div className="h-3 w-3 rounded-full bg-yellow-500"></div>
																		<div className="h-3 w-3 rounded-full bg-green-500"></div>
																	</div>
																	<code>
																		{
																			element.content
																		}
																	</code>
																</pre>
															)}
														{element.type ===
															"Form" &&
															element.formId && (
																<div className="overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-inner">
																	<div className="mb-4 flex items-center gap-3">
																		<span className="text-2xl">
																			🎯
																		</span>
																		<h3 className="text-xl font-semibold text-blue-800">
																			Test
																			Your
																			Knowledge!
																		</h3>
																	</div>
																	{!isAdmin && (
																		<p className="mb-4 text-blue-700">
																			Time
																			to
																			check
																			your
																			understanding
																			with
																			a
																			quick
																			quiz.
																		</p>
																	)}
																	{!isAdmin && (
																		<button
																			onClick={() =>
																				navigate(
																					`/quiz/${element.formId}`,
																				)
																			}
																			className="flex transform items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:bg-blue-700 hover:shadow-xl"
																			type="button"
																		>
																			<span>
																				Start
																				Quiz
																			</span>
																			<span className="text-xl">
																				🚀
																			</span>
																		</button>
																	)}
																</div>
															)}

														{element.type !==
															"Image" &&
															element.type !==
																"CodeFragment" &&
															element.type !==
																"Form" &&
															element.content && (
																<div className="prose bg-gray-50 max-w-none rounded-lg p-6 leading-relaxed">
																	<p className="text-lg">
																		{
																			element.content
																		}
																	</p>
																</div>
															)}
													</motion.div>
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

				{/* Chapter completion section for students */}
				{!isAdmin && elements.length > 0 && (
					<motion.div
						className="mt-10 flex justify-end"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
					>
						{!chapterProgress?.isCompleted ? (
							<button
								onClick={handleComplete}
								className="flex transform items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[#4aba7a] px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
								type="button"
							>
								<CheckCircle size={20} />
								Mark Chapter as Complete
							</button>
						) : (
							<motion.div
								className="flex items-center gap-2 rounded-xl bg-green-100 px-6 py-3 text-green-800"
								animate={{ scale: [1, 1.05, 1] }}
								transition={{ duration: 0.5 }}
							>
								<CheckCircle size={20} />
								Chapter Completed! 🎉
							</motion.div>
						)}
					</motion.div>
				)}
			</div>
		</div>
	);
}
