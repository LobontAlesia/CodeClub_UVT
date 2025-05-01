import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../utils/api";

interface Question {
	id: string;
	questionText: string;
	answer1: string;
	answer2: string;
	answer3: string;
	answer4: string;
	correctAnswerIndex: number;
}

interface Quiz {
	id: string;
	title: string;
	questions: Question[];
}

interface QuizResult {
	score: number;
	total: number;
	percentage: number;
	passed: boolean;
	message: string;
}

export default function TakeQuizPage() {
	const { formId } = useParams<{ formId: string }>();
	const [quiz, setQuiz] = useState<Quiz | null>(null);
	const [answers, setAnswers] = useState<number[]>([]);
	const [submitted, setSubmitted] = useState(false);
	const [result, setResult] = useState<QuizResult | null>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchQuiz = async () => {
			try {
				const res = await api.get(`/QuizForm/${formId}`);
				setQuiz(res.data);
				setAnswers(new Array(res.data.questions.length).fill(-1));
			} catch (error) {
				console.error("Error fetching quiz", error);
				toast.error("Failed to load quiz.");
			}
		};

		if (formId) fetchQuiz();
	}, [formId]);

	const handleChange = (index: number, answerIndex: number) => {
		const updated = [...answers];
		updated[index] = answerIndex;
		setAnswers(updated);
	};

	const handleSubmit = async () => {
		if (!quiz) return;

		if (answers.some((a) => a === -1)) {
			toast.error("Please answer all questions before submitting! 🤔");
			return;
		}

		setLoading(true);
		try {
			const validAnswers = answers.map((answer) =>
				answer === -1 ? 0 : answer,
			);

			const response = await api.post("/QuizSubmission", {
				quizId: quiz.id,
				answers: validAnswers,
			});

			setResult(response.data);
			setSubmitted(true);

			if (response.data.passed) {
				toast.success("Quiz completed successfully! 🌟");

				// Check progress but don't show celebration
				const elementResponse = await api.get(
					`/ChapterElement/by-form/${quiz.id}`,
				);
				if (elementResponse.data?.chapterId) {
					// Get chapter first to access course ID
					const chapterResponse = await api.get(
						`/Chapter/${elementResponse.data.chapterId}`,
					);
					if (chapterResponse.data?.lesson?.learningCourseId) {
						await api.get(
							`/UserProgress/course/${chapterResponse.data.lesson.learningCourseId}`,
						);
					}
				}
			} else {
				toast.info(response.data.message);
			}
		} catch (error) {
			console.error("Error submitting quiz", error);
			toast.error("Could not submit the quiz. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleRetry = () => {
		setAnswers(new Array(quiz?.questions.length || 0).fill(-1));
		setSubmitted(false);
		setResult(null);
	};

	if (!quiz) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd]">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
			</div>
		);
	}

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white p-4">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] px-6 py-10">
			<div className="mx-auto max-w-4xl">
				<motion.div
					className="mb-8 flex flex-col items-center text-center"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<div className="relative">
						<HelpCircle className="mb-4 h-16 w-16 text-[var(--color-primary)]" />
						<motion.div
							className="absolute -right-2 -top-2"
							animate={{ y: [-4, 4, -4] }}
							transition={{ repeat: Infinity, duration: 2 }}
						>
							🎯
						</motion.div>
					</div>
					<h1 className="bg-gradient-to-r from-[var(--color-primary)] via-[#4aba7a] to-[var(--color-accent)] bg-clip-text text-5xl font-extrabold text-transparent">
						{quiz.title}
					</h1>
					<p className="text-gray-600 mt-2 text-lg">
						Answer all questions to complete the quiz! 💪
					</p>
				</motion.div>

				<div className="space-y-8">
					{quiz.questions.map((q, idx) => (
						<motion.div
							key={q.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: idx * 0.1 }}
							className={`transform rounded-2xl border bg-white p-6 shadow-lg transition-all hover:shadow-xl ${
								submitted
									? answers[idx] === q.correctAnswerIndex
										? "border-green-500 bg-green-50"
										: "border-red-500 bg-red-50"
									: ""
							}`}
						>
							<p className="mb-6 text-lg font-semibold">
								<span className="text-[var(--color-primary)]">
									{idx + 1}.
								</span>{" "}
								{q.questionText}
							</p>
							<div className="space-y-4">
								{[
									q.answer1,
									q.answer2,
									q.answer3,
									q.answer4,
								].map((answer, ansIdx) => (
									<label
										key={ansIdx}
										className={`hover:bg-gray-50 block transform cursor-pointer rounded-xl border p-4 transition-all hover:-translate-y-1 ${
											submitted
												? ansIdx ===
													q.correctAnswerIndex
													? "border-green-500 bg-green-100"
													: answers[idx] === ansIdx
														? "border-red-500 bg-red-100"
														: ""
												: answers[idx] === ansIdx
													? "border-blue-500 bg-blue-50"
													: ""
										}`}
									>
										<div className="flex items-center gap-3">
											<input
												type="radio"
												name={`q-${idx}`}
												checked={
													answers[idx] === ansIdx
												}
												onChange={() =>
													handleChange(idx, ansIdx)
												}
												disabled={submitted}
												className="h-4 w-4 text-[var(--color-primary)]"
											/>
											<span className="text-lg">
												{answer}
											</span>
										</div>
									</label>
								))}
							</div>
							{submitted && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className={`mt-6 rounded-xl p-4 ${
										answers[idx] === q.correctAnswerIndex
											? "bg-green-100 text-green-800"
											: "bg-red-100 text-red-800"
									}`}
								>
									{answers[idx] === q.correctAnswerIndex ? (
										<div className="flex items-center gap-2">
											<span className="text-xl">✨</span>
											<span>
												Excellent! Correct answer!
											</span>
										</div>
									) : (
										<div className="flex items-center gap-2">
											<span className="text-xl">💡</span>
											<span>
												The correct answer was option{" "}
												{q.correctAnswerIndex + 1}
											</span>
										</div>
									)}
								</motion.div>
							)}
						</motion.div>
					))}
				</div>

				<motion.div
					className="mt-8 flex justify-center gap-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					{!submitted ? (
						<button
							onClick={handleSubmit}
							disabled={loading || answers.some((a) => a === -1)}
							className="disabled:bg-gray-400 transform rounded-xl bg-[var(--color-primary)] px-8 py-3 text-lg font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
						>
							{loading ? (
								"Submitting..."
							) : (
								<span className="flex items-center gap-2">
									Submit Answers
									<span className="text-xl">🚀</span>
								</span>
							)}
						</button>
					) : (
						<>
							<button
								onClick={() => navigate(-1)}
								className="transform rounded-xl bg-[var(--color-primary)] px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
							>
								Back to Chapter
							</button>
							{!result?.passed && (
								<button
									onClick={handleRetry}
									className="transform rounded-xl bg-[var(--color-accent)] px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
								>
									Try Again 💪
								</button>
							)}
						</>
					)}
				</motion.div>

				<AnimatePresence>
					{result && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 20 }}
							className="mt-8 overflow-hidden rounded-2xl bg-white p-8 text-center shadow-xl"
						>
							<h2 className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-3xl font-bold text-transparent">
								Your Result
							</h2>
							<div className="mt-4 space-y-2">
								<p className="text-2xl font-semibold">
									Score:{" "}
									<span
										className={
											result.passed
												? "text-green-600"
												: "text-red-600"
										}
									>
										{result.score} / {result.total}
									</span>
								</p>
								<p className="text-xl">
									Percentage:{" "}
									<span
										className={
											result.passed
												? "text-green-600"
												: "text-red-600"
										}
									>
										{result.percentage.toFixed(1)}%
									</span>
								</p>
								<p
									className={`mt-4 text-lg ${
										result.passed
											? "text-green-600"
											: "text-yellow-600"
									}`}
								>
									{result.message}
								</p>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	);
}
