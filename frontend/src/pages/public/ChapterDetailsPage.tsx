import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import api from "../../utils/api";
import { motion } from "framer-motion";
import { Plus, ArrowLeft, CheckCircle, Wand2 } from "lucide-react";
import { FiTarget } from "react-icons/fi";
import { BsRocketTakeoff, BsBook } from "react-icons/bs";

interface ChapterElement {
	id: string;
	title: string;
	type: string;
	index: number;
	content?: string;
	image?: string;
	formId?: string;
}

interface GeneratedQuizQuestion {
	question: string;
	options: string[];
	correctAnswerIndex: number;
}

export default function ChapterDetailsPage() {
	const { chapterId } = useParams<{ chapterId: string }>();
	const navigate = useNavigate();
	const [isAdmin, setIsAdmin] = useState(false);
	const [elements, setElements] = useState<ChapterElement[]>([]);
	const [chapterTitle, setChapterTitle] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
	const [chapterProgress, setChapterProgress] = useState({
		isCompleted: false,
	});
	const [lessonId, setLessonId] = useState<string | null>(null);
	const [lessonTitle, setLessonTitle] = useState("");
	const [courseId, setCourseId] = useState<string | null>(null);
	const [courseTitle, setCourseTitle] = useState("");
	const [generatedQuestions, setGeneratedQuestions] = useState<
		GeneratedQuizQuestion[]
	>([]);
	const [showQuizPreview, setShowQuizPreview] = useState(false);

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

	const handleGenerateQuiz = async () => {
		setIsGeneratingQuiz(true);
		try {
			const response = await api.post<GeneratedQuizQuestion[]>(
				`/Chapter/${chapterId}/generate-quiz`,
			);
			setGeneratedQuestions(response.data);
			setShowQuizPreview(true);
			toast.success("Quiz generated successfully! 🎯");
		} catch (error) {
			console.error("Error generating quiz:", error);
			toast.error("Failed to generate quiz");
		} finally {
			setIsGeneratingQuiz(false);
		}
	};

	const handleSaveQuiz = async () => {
		try {
			// Pentru debugging, să vedem cum arată datele
			console.log("Generated questions to save:", generatedQuestions);

			// Mapăm datele în formatul așteptat de backend
			const formattedQuestions = generatedQuestions.map((q) => {
				const options = Array.isArray(q.options) ? q.options : [];

				// Asigură-te că avem 4 opțiuni
				while (options.length < 4) {
					options.push("No answer");
				}

				return {
					questionText: q.question || "",
					answer1: options[0] || "",
					answer2: options[1] || "",
					answer3: options[2] || "",
					answer4: options[3] || "",
					correctAnswerIndex:
						typeof q.correctAnswerIndex !== "undefined"
							? q.correctAnswerIndex
							: 0,
				};
			});

			console.log("Formatted questions for backend:", formattedQuestions);

			// Create new quiz form - folosim formatul corect și includem ChapterId
			const quizResponse = await api.post("/QuizForm", {
				title: `${chapterTitle} - Quiz`,
				questions: formattedQuestions,
				chapterId: chapterId, // Adăugăm chapterId care este necesar
			});

			console.log("Quiz form created:", quizResponse.data);

			toast.success("Quiz saved successfully! 🎉");
			setShowQuizPreview(false);
			fetchElements();
		} catch (error: any) {
			console.error("Error saving quiz:", error);

			// Afișăm mai multe detalii despre eroare pentru debugging
			if (error.response) {
				console.error("Response error data:", error.response.data);
				console.error("Response error status:", error.response.status);
				console.error(
					"Response error headers:",
					error.response.headers,
				);
			}

			toast.error("Failed to save quiz");
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
				<div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
					{courseId && (
						<>
							<button
								onClick={() => navigate(`/course/${courseId}`)}
								className="transition-colors hover:text-black"
								type="button"
							>
								{courseTitle}
							</button>
							<BsRocketTakeoff className="text-[var(--color-primary)]" />
						</>
					)}
					{lessonId && (
						<>
							<button
								onClick={() => navigate(`/lesson/${lessonId}`)}
								className="transition-colors hover:text-black"
								type="button"
							>
								{lessonTitle}
							</button>
							<BsBook className="text-[var(--color-primary)]" />
						</>
					)}
					<span className="text-[var(--color-primary)]">
						{chapterTitle}
					</span>
				</div>

				<motion.div className="mb-8 flex flex-col items-center text-center">
					<div className="relative">
						<img
							src="/src/assets/code_icon_green.svg"
							alt="Code icon"
							className="mb-4 h-16 w-16"
						/>
					</div>
					<h1 className="bg-[var(--color-primary)] bg-clip-text text-5xl font-extrabold text-transparent">
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
							<>
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
								<button
									onClick={handleGenerateQuiz}
									className="flex transform items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-white shadow transition-all hover:-translate-y-1 hover:shadow-lg"
									type="button"
								>
									<Wand2 size={16} /> Generate Quiz with AI
								</button>
							</>
						)}
					</div>
				</motion.div>

				{/* Quiz Preview Modal */}
				{showQuizPreview && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
						<motion.div
							className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
						>
							<h2 className="mb-4 text-2xl font-bold text-gray-800">
								Preview Generated Quiz
							</h2>
							<div className="mb-6 space-y-6">
								{generatedQuestions.map((q, qIndex) => (
									<div
										key={qIndex}
										className="rounded-lg bg-gray-50 p-4"
									>
										<h3 className="mb-3 text-lg font-semibold">
											{qIndex + 1}. {q.question}
										</h3>
										<div className="ml-4 space-y-2">
											{q.options.map((option, oIndex) => (
												<div
													key={oIndex}
													className={`rounded-lg p-2 ${
														oIndex ===
														q.correctAnswerIndex
															? "bg-green-100 text-green-800"
															: "bg-white"
													}`}
												>
													{option}
													{oIndex ===
														q.correctAnswerIndex && (
														<span className="ml-2 text-green-600">
															<CheckCircle className="ml-1 inline h-4 w-4" />
														</span>
													)}
												</div>
											))}
										</div>
									</div>
								))}
							</div>
							<div className="flex justify-end gap-4">
								<button
									onClick={() => setShowQuizPreview(false)}
									className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
									type="button"
								>
									Cancel
								</button>
								<button
									onClick={handleSaveQuiz}
									className="rounded-lg bg-[var(--color-primary)] px-4 py-2 font-medium text-white hover:bg-[var(--color-primary-dark)]"
									type="button"
								>
									Save Quiz
								</button>
							</div>
						</motion.div>
					</div>
				)}

				{/* Loading indicator for AI quiz generation */}
				{isGeneratingQuiz && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
						<motion.div
							className="max-w-md rounded-xl bg-white p-6 text-center shadow-xl"
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
						>
							<Wand2
								size={32}
								className="mx-auto mb-4 animate-pulse text-purple-600"
							/>
							<h2 className="mb-2 text-2xl font-bold text-gray-800">
								Processing...
							</h2>
							<p className="text-gray-600">
								The AI is analyzing chapter information and
								generating quiz questions based on the content.
								This may take a moment.
							</p>
							<div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
								<div className="h-full animate-[loading_1.5s_ease-in-out_infinite] rounded-full bg-purple-600"></div>
							</div>
						</motion.div>
					</div>
				)}

				{/* Chapter Content */}
				{isAdmin ? (
					// Admin view - keep original layout with draggable elements
					<DragDropContext onDragEnd={handleDragEnd}>
						<Droppable droppableId="elements">
							{(provided) => (
								<div
									{...provided.droppableProps}
									ref={provided.innerRef}
									className="space-y-6"
								>
									{elements.length === 0 ? (
										<p className="text-center text-gray-500">
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
														{/* Element header with admin controls */}
														<motion.div
															className="mb-4 flex items-center justify-between"
															initial={{
																opacity: 0,
																x: -20,
															}}
															animate={{
																opacity: 1,
																x: 0,
															}}
															transition={{
																delay:
																	index * 0.1,
															}}
														>
															<div className="flex items-center gap-4">
																<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-[var(--color-primary)] to-[#4aba7a] text-lg font-bold text-white">
																	{index + 1}
																</div>
																<h2 className="bg-gradient-to-r from-[var(--color-primary)] to-[#4aba7a] bg-clip-text text-2xl font-bold text-transparent">
																	{
																		element.title
																	}
																</h2>
															</div>
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
														</motion.div>

														{/* Element content */}
														<motion.div
															initial={{
																opacity: 0,
																y: 20,
															}}
															animate={{
																opacity: 1,
																y: 0,
															}}
															transition={{
																delay:
																	index *
																		0.1 +
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
																	<pre className="relative overflow-x-auto rounded-lg bg-white p-4 font-mono text-sm shadow-lg">
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
																			<FiTarget className="h-6 w-6 text-blue-600" />
																			<h3 className="text-xl font-semibold text-blue-800">
																				Test
																				Your
																				Knowledge!
																			</h3>
																		</div>
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
																			<BsRocketTakeoff className="ml-2 h-5 w-5" />
																		</button>
																	</div>
																)}{" "}
															{element.type ===
																"Header" &&
																element.content && (
																	<div className="prose max-w-none rounded-lg bg-gray-50 p-6 leading-relaxed">
																		<h3
																			className="mb-3 mt-4 text-xl font-bold text-[var(--color-primary)]"
																			dangerouslySetInnerHTML={{
																				__html: element.content
																					.trim()
																					.startsWith(
																						"#",
																					)
																					? element.content
																							.trim()
																							.replace(
																								/^#+\s*/,
																								"",
																							)
																							.replace(
																								/\*\*(.*?)\*\*/g,
																								"<strong>$1</strong>",
																							) // Bold
																							.replace(
																								/\*(.*?)\*/g,
																								"<em>$1</em>",
																							) // Italic
																					: element.content
																							.replace(
																								/\*\*(.*?)\*\*/g,
																								"<strong>$1</strong>",
																							) // Bold
																							.replace(
																								/\*(.*?)\*/g,
																								"<em>$1</em>",
																							), // Italic
																			}}
																		/>
																	</div>
																)}
															{element.type !==
																"Image" &&
																element.type !==
																	"CodeFragment" &&
																element.type !==
																	"Form" &&
																element.type !==
																	"Header" &&
																element.content && (
																	<div className="prose max-w-none rounded-lg bg-gray-50 p-6 leading-relaxed">
																		<div className="content-element">
																			{element.content
																				.split(
																					/\r?\n/,
																				)
																				.map(
																					(
																						paragraph,
																						idx,
																					) => {
																						// Check if the paragraph is a header (starts with # in markdown style)
																						if (
																							paragraph
																								.trim()
																								.startsWith(
																									"#",
																								)
																						) {
																							const headerText =
																								paragraph
																									.trim()
																									.replace(
																										/^#+\s*/,
																										"",
																									);
																							return (
																								<h3
																									key={
																										idx
																									}
																									className="text-l mb-3 mt-4 font-bold text-[var(--color-primary)]"
																								>
																									{
																										headerText
																									}
																								</h3>
																							);
																						}
																						// Regular paragraph with HTML formatting support
																						return paragraph.trim() ? (
																							<p
																								key={
																									idx
																								}
																								className="mb-4 text-lg"
																								dangerouslySetInnerHTML={{
																									__html: paragraph
																										.replace(
																											/\*\*(.*?)\*\*/g,
																											"<strong>$1</strong>",
																										) // Bold
																										.replace(
																											/\*(.*?)\*/g,
																											"<em>$1</em>",
																										), // Italic
																									// We keep other HTML tags as-is (underline, spans for color, etc.)
																								}}
																							/>
																						) : null;
																					},
																				)}
																		</div>
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
				) : (
					// User view - book-like layout
					<div className="mx-auto">
						{elements.length === 0 ? (
							<p className="text-center text-gray-500">
								No content available in this chapter yet.
							</p>
						) : (
							<motion.div
								className="rounded-2xl border bg-white shadow-lg"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
							>
								{/* Book layout for non-admin users */}
								<div className="book-content p-8">
									{/* Display all elements in the order they appear in the database */}
									<div className="prose prose-lg max-w-none leading-relaxed">
										{elements
											.filter(
												(element) =>
													element.type === "Header" ||
													element.type ===
														"CodeFragment" ||
													(element.type !== "Image" &&
														element.type !==
															"Form" &&
														element.content),
											)
											.map((element) => (
												<div
													key={element.id}
													className="mb-6"
												>
													{" "}
													{element.type ===
														"Header" &&
														element.content && (
															<h2
																className="mb-4 border-b border-gray-200 pb-2 text-xl font-bold text-[var(--color-primary)]"
																dangerouslySetInnerHTML={{
																	__html: element.content
																		.trim()
																		.startsWith(
																			"#",
																		)
																		? element.content
																				.trim()
																				.replace(
																					/^#+\s*/,
																					"",
																				)
																				.replace(
																					/\*\*(.*?)\*\*/g,
																					"<strong>$1</strong>",
																				) // Bold
																				.replace(
																					/\*(.*?)\*/g,
																					"<em>$1</em>",
																				) // Italic
																		: element.content
																				.replace(
																					/\*\*(.*?)\*\*/g,
																					"<strong>$1</strong>",
																				) // Bold
																				.replace(
																					/\*(.*?)\*/g,
																					"<em>$1</em>",
																				), // Italic
																}}
															/>
														)}
													{element.type ===
														"CodeFragment" &&
														element.content && (
															<pre className="relative mb-6 overflow-x-auto rounded-lg bg-gray-50 p-4 font-mono text-sm shadow-lg">
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
													{element.type !==
														"Header" &&
														element.type !==
															"Image" &&
														element.type !==
															"CodeFragment" &&
														element.type !==
															"Form" &&
														element.content && (
															<div className="content-element">
																{element.content
																	.split(
																		/\r?\n/,
																	)
																	.map(
																		(
																			paragraph,
																			idx,
																		) => {
																			// Check if the paragraph is a header (starts with # in markdown style)
																			if (
																				paragraph
																					.trim()
																					.startsWith(
																						"#",
																					)
																			) {
																				const headerText =
																					paragraph
																						.trim()
																						.replace(
																							/^#+\s*/,
																							"",
																						);
																				return (
																					<h3
																						key={
																							idx
																						}
																						className="text-l mb-3 mt-6 font-bold text-[var(--color-primary)]"
																					>
																						{
																							headerText
																						}
																					</h3>
																				);
																			}
																			// Regular paragraph with HTML formatting support
																			return paragraph.trim() ? (
																				<p
																					key={
																						idx
																					}
																					className="mb-4 text-lg"
																					dangerouslySetInnerHTML={{
																						__html: paragraph
																							.replace(
																								/\*\*(.*?)\*\*/g,
																								"<strong>$1</strong>",
																							) // Bold
																							.replace(
																								/\*(.*?)\*/g,
																								"<em>$1</em>",
																							), // Italic
																						// We keep other HTML tags as-is (underline, spans for color, etc.)
																					}}
																				/>
																			) : null;
																		},
																	)}
															</div>
														)}
												</div>
											))}
									</div>

									{/* Display images in a gallery section if there are any */}
									{elements.some(
										(element) =>
											element.type === "Image" &&
											element.image,
									) && (
										<div className="mt-10 border-t border-gray-200 pt-8">
											<h3 className="mb-6 text-xl font-bold text-[var(--color-primary)]">
												Images
											</h3>
											<div className="grid grid-cols-1 gap-8">
												{elements
													.filter(
														(element) =>
															element.type ===
																"Image" &&
															element.image,
													)
													.map((element) => (
														<div
															key={element.id}
															className="flex justify-center"
														>
															<img
																src={
																	element.image
																}
																alt={
																	element.title ||
																	"Chapter image"
																}
																className="max-h-[600px] w-auto rounded-lg object-contain transition-transform hover:scale-105"
															/>
														</div>
													))}
											</div>
										</div>
									)}

									{/* Display quiz forms in a separate section if there are any */}
									{elements.some(
										(element) =>
											element.type === "Form" &&
											element.formId,
									) && (
										<div className="mt-10 border-t border-gray-200 pt-8">
											<h3 className="mb-6 text-xl font-bold text-[var(--color-primary)]">
												Knowledge Check
											</h3>
											<div className="space-y-6">
												{elements
													.filter(
														(element) =>
															element.type ===
																"Form" &&
															element.formId,
													)
													.map((element) => (
														<div
															key={element.id}
															className="overflow-hidden rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-inner"
														>
															<div className="mb-4 flex items-center gap-3">
																<FiTarget className="h-6 w-6 text-blue-600" />
																<h3 className="text-xl font-semibold text-blue-800">
																	Test Your
																	Knowledge!
																</h3>
															</div>
															<p className="mb-4 text-blue-700">
																Time to check
																your
																understanding
																with a quick
																quiz.
															</p>
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
																	Start Quiz
																</span>
																<BsRocketTakeoff className="ml-2 h-5 w-5" />
															</button>
														</div>
													))}
											</div>
										</div>
									)}
								</div>
							</motion.div>
						)}
					</div>
				)}

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
								Chapter Completed!
							</motion.div>
						)}
					</motion.div>
				)}
			</div>
		</div>
	);
}
