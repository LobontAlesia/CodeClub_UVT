import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import FormCard from "../../components/FormCard";
import { ClipboardList } from "lucide-react";

interface Question {
	questionText: string;
	answers: string[];
	correctAnswerIndex: number;
}

const AddQuizPage = () => {
	const { chapterId } = useParams<{ chapterId: string }>();
	const navigate = useNavigate();

	const [quizTitle, setQuizTitle] = useState("");
	const [questions, setQuestions] = useState<Question[]>([]);
	const [currentQuestionText, setCurrentQuestionText] = useState("");
	const [currentAnswers, setCurrentAnswers] = useState(["", "", "", ""]);
	const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);

	const handleAddQuestion = () => {
		if (!currentQuestionText.trim()) {
			toast.error("Question cannot be empty");
			return;
		}

		if (currentAnswers.some((ans) => !ans.trim())) {
			toast.error("All answers must be filled in");
			return;
		}

		const newQuestion: Question = {
			questionText: currentQuestionText,
			answers: [...currentAnswers],
			correctAnswerIndex,
		};

		setQuestions([...questions, newQuestion]);
		setCurrentQuestionText("");
		setCurrentAnswers(["", "", "", ""]);
		setCorrectAnswerIndex(0);
	};

	const handleSubmitQuiz = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!chapterId) return;

		if (questions.length === 0) {
			toast.error("You must add at least one question");
			return;
		}

		try {
			const mappedQuestions = questions.map((q) => ({
				questionText: q.questionText,
				answer1: q.answers[0],
				answer2: q.answers[1],
				answer3: q.answers[2],
				answer4: q.answers[3],
				correctAnswerIndex: q.correctAnswerIndex,
			}));

			const requestData = {
				title: quizTitle,
				questions: mappedQuestions,
				chapterId,
			};

			const response = await api.post("/QuizForm", requestData);

			if (response.data) {
				toast.success("Quiz saved successfully!");
				navigate(-1);
			}
		} catch (error: any) {
			console.error("Error creating quiz", error);
			toast.error(error.response?.data || "Error saving quiz");
		}
	};

	return (
		<FormCard
			title="Create New Quiz"
			icon={
				<ClipboardList
					size={40}
					className="text-[var(--color-primary)]"
				/>
			}
		>
			<form onSubmit={handleSubmitQuiz} className="space-y-8">
				<div>
					<label className="font-semibold">Quiz Title</label>
					<input
						type="text"
						value={quizTitle}
						onChange={(e) => setQuizTitle(e.target.value)}
						required
						className="w-full rounded border p-2"
					/>
				</div>

				<hr />

				<div>
					<label className="font-semibold">Question</label>
					<input
						type="text"
						value={currentQuestionText}
						onChange={(e) => setCurrentQuestionText(e.target.value)}
						className="w-full rounded border p-2"
					/>
				</div>

				{currentAnswers.map((answer, idx) => (
					<div key={idx}>
						<label className="font-semibold">
							Answer {idx + 1}
						</label>
						<input
							type="text"
							value={answer}
							onChange={(e) => {
								const newAnswers = [...currentAnswers];
								newAnswers[idx] = e.target.value;
								setCurrentAnswers(newAnswers);
							}}
							className="w-full rounded border p-2"
						/>
					</div>
				))}

				<div>
					<label className="font-semibold">
						Correct Answer Index
					</label>
					<select
						value={correctAnswerIndex}
						onChange={(e) =>
							setCorrectAnswerIndex(parseInt(e.target.value))
						}
						className="w-full rounded border p-2"
					>
						{currentAnswers.map((_, idx) => (
							<option key={idx} value={idx}>
								Answer {idx + 1}
							</option>
						))}
					</select>
				</div>

				<button
					type="button"
					onClick={handleAddQuestion}
					className="w-full rounded bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
				>
					➕ Add Question
				</button>

				<div>
					<h2 className="mt-6 text-xl font-bold">
						Questions Added: {questions.length}
					</h2>
					<ul className="list-inside list-decimal">
						{questions.map((q, idx) => (
							<li key={idx}>{q.questionText}</li>
						))}
					</ul>
				</div>

				<div className="mt-8 flex gap-4">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="flex-1 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
					>
						Create Quiz
					</button>
				</div>
			</form>
		</FormCard>
	);
};

export default AddQuizPage;
