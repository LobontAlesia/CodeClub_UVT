import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../utils/api";
import FormCard from "../../components/FormCard";
import { ClipboardEdit } from "lucide-react";

interface QuizQuestion {
	id: string;
	questionText: string;
	answer1: string;
	answer2: string;
	answer3: string;
	answer4: string;
	correctAnswerIndex: number;
}

interface QuizForm {
	id: string;
	title: string;
	questions: QuizQuestion[];
}

export default function EditQuizPage() {
	const { formId } = useParams<{ formId: string }>();
	const navigate = useNavigate();
	const [quiz, setQuiz] = useState<QuizForm | null>(null);

	useEffect(() => {
		fetchQuiz();
	}, [formId]);

	const fetchQuiz = async () => {
		try {
			const res = await api.get(`/quizform/${formId}`);
			setQuiz(res.data);
		} catch (error) {
			console.error(error);
			toast.error("Failed to load quiz");
		}
	};

	const handleQuestionChange = (
		index: number,
		field: keyof QuizQuestion,
		value: string | number,
	) => {
		if (!quiz) return;
		const updatedQuestions = [...quiz.questions];
		(updatedQuestions[index] as any)[field] = value;
		setQuiz({ ...quiz, questions: updatedQuestions });
	};

	const handleSave = async () => {
		try {
			await api.put(`/quizform/${formId}`, quiz);
			toast.success("Quiz updated successfully");
			navigate(-1);
		} catch (error) {
			console.error(error);
			toast.error("Failed to save quiz");
		}
	};

	if (!quiz) {
		return <div className="p-8">Loading quiz...</div>;
	}

	return (
		<FormCard
			title="Edit Quiz"
			icon={
				<ClipboardEdit
					size={40}
					className="text-[var(--color-primary)]"
				/>
			}
		>
			<div className="space-y-8">
				{quiz.questions.map((question, idx) => (
					<div
						key={question.id}
						className="space-y-4 rounded-xl border p-4"
					>
						<h2 className="text-lg font-semibold">
							Question {idx + 1}
						</h2>
						<input
							type="text"
							value={question.questionText}
							onChange={(e) =>
								handleQuestionChange(
									idx,
									"questionText",
									e.target.value,
								)
							}
							className="w-full rounded border p-2"
							placeholder="Question"
						/>
						{[1, 2, 3, 4].map((n) => (
							<input
								key={n}
								type="text"
								value={(question as any)[`answer${n}`]}
								onChange={(e) =>
									handleQuestionChange(
										idx,
										`answer${n}` as keyof QuizQuestion,
										e.target.value,
									)
								}
								className="w-full rounded border p-2"
								placeholder={`Answer ${n}`}
							/>
						))}
						<div>
							<label className="mb-1 block font-semibold">
								Correct Answer Index (0–3)
							</label>
							<input
								type="number"
								min={0}
								max={3}
								value={question.correctAnswerIndex}
								onChange={(e) =>
									handleQuestionChange(
										idx,
										"correctAnswerIndex",
										parseInt(e.target.value),
									)
								}
								className="w-20 rounded border p-2"
							/>
						</div>
					</div>
				))}

				<div className="flex gap-4">
					<button
						onClick={() => navigate(-1)}
						className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="flex-1 rounded bg-yellow-500 py-2 font-semibold text-white hover:bg-yellow-600"
					>
						✏️ Save Changes
					</button>
				</div>
			</div>
		</FormCard>
	);
}
