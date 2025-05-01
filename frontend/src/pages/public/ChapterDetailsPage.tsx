import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import api from "../../utils/api";
import { motion } from "framer-motion";
import { BookText, Plus, ArrowLeft, CheckCircle } from "lucide-react";

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

	const handleComplete = async () => {
		try {
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
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#f4fff7] to-white px-6 py-10">
			<div className="mx-auto max-w-4xl">
				{/* Breadcrumb navigation */}
				<div className="text-gray-600 mb-4 flex items-center gap-2 text-sm">
					{courseId && (
						<>
							<button
								onClick={() => navigate(`/course/${courseId}`)}
								className="transition-colors hover:text-[var(--color-primary)]"
							>
								{courseTitle}
							</button>
							<span>/</span>
						</>
					)}
					{lessonId && (
						<>
							<button
								onClick={() => navigate(`/lesson/${lessonId}`)}
								className="transition-colors hover:text-[var(--color-primary)]"
							>
								{lessonTitle}
							</button>
							<span>/</span>
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
					<BookText className="mb-4 h-12 w-12 text-[var(--color-primary)]" />
					<h1 className="text-4xl font-extrabold text-[var(--color-primary)]">
						{chapterTitle}
					</h1>
					<div className="mt-4 flex flex-wrap justify-center gap-4">
						<button
							onClick={() => navigate(`/lesson/${lessonId}`)}
							className="bg-gray-500 hover:bg-gray-600 flex items-center gap-2 rounded-xl px-4 py-2 text-white"
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
								className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
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
										No elements yet in this chapter.
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
													className="rounded-2xl border bg-white p-6 shadow-md transition-all hover:shadow-xl"
												>
													<div className="mb-4 flex items-center justify-between">
														<div className="flex items-center gap-4">
															<div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
																{index + 1}
															</div>
															<h2 className="text-xl font-bold">
																{element.title}
															</h2>
														</div>
														{isAdmin && (
															<div className="flex gap-2">
																<button
																	onClick={() =>
																		handleEdit(
																			element.id,
																		)
																	}
																	className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
																>
																	✏️ Edit
																</button>
																<button
																	onClick={() =>
																		handleDelete(
																			element.id,
																		)
																	}
																	className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
																>
																	🗑️ Delete
																</button>
															</div>
														)}
													</div>

													{/* Render different content types */}
													{element.type === "Image" &&
														element.image && (
															<img
																src={
																	element.image
																}
																alt={
																	element.title
																}
																className="rounded-lg"
															/>
														)}
													{element.type ===
														"CodeFragment" &&
														element.content && (
															<pre className="bg-gray-50 overflow-x-auto rounded-lg p-4">
																<code className="font-mono text-sm">
																	{
																		element.content
																	}
																</code>
															</pre>
														)}
													{element.type === "Form" &&
														element.formId && (
															<div className="rounded-lg bg-blue-50 p-4">
																<p className="mb-4 text-blue-700">
																	Test your
																	knowledge!
																</p>
																<button
																	onClick={() =>
																		navigate(
																			`/quiz/${element.formId}`,
																		)
																	}
																	className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
																>
																	Start Quiz
																</button>
															</div>
														)}
													{element.type !== "Image" &&
														element.type !==
															"CodeFragment" &&
														element.type !==
															"Form" &&
														element.content && (
															<div className="prose max-w-none">
																<p>
																	{
																		element.content
																	}
																</p>
															</div>
														)}
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
					<div className="mt-10 flex justify-end">
						{!chapterProgress?.isCompleted ? (
							<button
								onClick={handleComplete}
								className="flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"
							>
								<CheckCircle size={20} />
								Mark Chapter as Completed
							</button>
						) : (
							<div className="flex items-center gap-2 rounded-xl bg-green-100 px-6 py-3 text-green-800">
								<CheckCircle size={20} />
								Chapter Completed!
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
