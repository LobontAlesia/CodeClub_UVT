import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { HelpCircle } from "lucide-react";

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

		// Check if all questions are answered
		if (answers.some((a) => a === -1)) {
			toast.error("Please answer all questions before submitting!");
			return;
		}

		setLoading(true);
		try {
			const response = await api.post("/QuizSubmission", {
				quizId: quiz.id,
				answers: answers,
			});

			setResult(response.data);
			setSubmitted(true);

			if (response.data.passed) {
				toast.success("🎉 " + response.data.message);
				// Get element info to navigate back
				const elementResponse = await api.get(
					`/ChapterElement/by-form/${quiz.id}`,
				);
				if (elementResponse.data?.chapterId) {
					setTimeout(() => {
						navigate(`/chapter/${elementResponse.data.chapterId}`);
					}, 3000);
				}
			} else {
				toast.info(response.data.message);
			}
		} catch (error) {
			console.error("Error submitting quiz", error);
			toast.error("Failed to submit quiz. Please try again.");
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
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
			</div>
		);
	}

	return (
		<FormCard
			title="Take Quiz"
			icon={
				<HelpCircle size={40} className="text-[var(--color-primary)]" />
			}
		>
			<div className="space-y-8">
				<div className="flex items-center justify-between">
					<button
						onClick={() => navigate(-1)}
						className="bg-gray-500 hover:bg-gray-600 flex items-center gap-2 rounded px-4 py-2 font-semibold text-white"
					>
						← Back to Chapter
					</button>
					<h1 className="text-3xl font-bold text-[var(--color-primary)]">
						{quiz.title}
					</h1>
				</div>

				{quiz.questions.map((q, idx) => (
					<div
						key={q.id}
						className={`rounded-lg border bg-white p-6 shadow transition-all ${
							submitted
								? answers[idx] === q.correctAnswerIndex
									? "border-green-500 bg-green-50"
									: "border-red-500 bg-red-50"
								: ""
						}`}
					>
						<p className="mb-4 font-semibold">
							{idx + 1}. {q.questionText}
						</p>
						{[q.answer1, q.answer2, q.answer3, q.answer4].map(
							(answer, ansIdx) => (
								<label
									key={ansIdx}
									className={`hover:bg-gray-50 mt-2 block cursor-pointer rounded-lg border p-3 ${
										submitted
											? ansIdx === q.correctAnswerIndex
												? "border-green-500 bg-green-100"
												: answers[idx] === ansIdx
													? "border-red-500 bg-red-100"
													: ""
											: answers[idx] === ansIdx
												? "border-blue-500 bg-blue-50"
												: ""
									}`}
								>
									<input
										type="radio"
										name={`q-${idx}`}
										checked={answers[idx] === ansIdx}
										onChange={() =>
											handleChange(idx, ansIdx)
										}
										disabled={submitted}
										className="mr-2"
									/>
									{answer}
								</label>
							),
						)}
						{submitted && (
							<div
								className={`mt-4 rounded-lg p-3 ${
									answers[idx] === q.correctAnswerIndex
										? "bg-green-100 text-green-800"
										: "bg-red-100 text-red-800"
								}`}
							>
								{answers[idx] === q.correctAnswerIndex
									? "✅ Correct!"
									: `❌ Incorrect. The correct answer was ${
											q.correctAnswerIndex + 1
										}.`}
							</div>
						)}
					</div>
				))}

				<div className="flex justify-center gap-4">
					{!submitted ? (
						<button
							onClick={handleSubmit}
							disabled={loading || answers.some((a) => a === -1)}
							className="disabled:bg-gray-400 rounded bg-green-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-green-700"
						>
							{loading ? "Submitting..." : "Submit Answers"}
						</button>
					) : (
						<>
							<button
								onClick={() => navigate(-1)}
								className="bg-gray-500 hover:bg-gray-600 rounded px-6 py-2 font-semibold text-white"
							>
								Back to Chapter
							</button>
							{!result?.passed && (
								<button
									onClick={handleRetry}
									className="rounded bg-blue-500 px-6 py-2 font-semibold text-white hover:bg-blue-600"
								>
									Try Again
								</button>
							)}
						</>
					)}
				</div>

				{result && (
					<div className="mt-8 rounded-xl bg-white p-6 text-center shadow-lg">
						<h2 className="text-2xl font-bold text-[var(--color-primary)]">
							Quiz Results
						</h2>
						<p className="mt-4 text-lg">
							Score:{" "}
							<span className="font-semibold">
								{result.score} / {result.total}
							</span>
						</p>
						<p className="mt-2 text-lg">
							Percentage:{" "}
							<span
								className={`font-semibold ${
									result.passed
										? "text-green-600"
										: "text-red-600"
								}`}
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
						{result.passed && (
							<p className="text-gray-600 mt-2 text-sm">
								Redirecting back to chapter...
							</p>
						)}
					</div>
				)}
			</div>
		</FormCard>
	);
}
