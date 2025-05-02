import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { BookOpen } from "lucide-react";

interface Badge {
	name: string;
	baseName: string;
	level: string;
	icon: string;
	id: string;
}

interface Course {
	id: string;
	title: string;
	description: string;
	level: string;
	duration: number;
	baseName: string;
	isPublished: boolean;
	tagNames: string[];
	badge?: {
		name: string;
		id: string;
	};
}

const CreateCoursePage = () => {
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [baseName, setBaseName] = useState("");
	const [level, setLevel] = useState("");
	const [selectedBadgeId, setSelectedBadgeId] = useState("");
	const [duration, setDuration] = useState(1);
	const [availableBadges, setAvailableBadges] = useState<Badge[]>([]);
	const [tags, setTags] = useState<string[]>([]);
	const [newTag, setNewTag] = useState("");

	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const token = localStorage.getItem("token");
				const headers = { Authorization: `Bearer ${token}` };

				const [badgesRes, coursesRes] = await Promise.all([
					axios.get("http://localhost:5153/Badge", { headers }),
					axios.get("http://localhost:5153/LearningCourse", {
						headers,
					}),
				]);

				const allBadges: Badge[] = badgesRes.data;
				const allCourses: Course[] = coursesRes.data;

				// Filter out badges that are already used in courses
				const usedBadgeIds = allCourses
					.map((c) => c.badge?.id)
					.filter(Boolean);

				const filteredBadges = allBadges.filter(
					(b) => !usedBadgeIds.includes(b.id),
				);

				setAvailableBadges(filteredBadges);
			} catch (error) {
				console.error(error);
				toast.error("Failed to load badges or courses");
			}
		};

		fetchData();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedBadgeId) {
			toast.error("Please select a badge");
			return;
		}

		try {
			const token = localStorage.getItem("token");
			const headers = { Authorization: `Bearer ${token}` };

			await axios.post(
				"http://localhost:5153/LearningCourse",
				{
					title,
					description,
					baseName,
					level,
					duration,
					tagNames: tags,
					badgeId: selectedBadgeId,
				},
				{ headers },
			);

			toast.success("Course created successfully!");
			navigate("/dashboard");
		} catch (error: any) {
			console.error(error);
			const msg = error.response?.data;
			if (typeof msg === "string") {
				toast.error(msg);
			} else {
				toast.error("Failed to create course");
			}
		}
	};

	const addTag = () => {
		if (newTag && !tags.includes(newTag)) {
			setTags([...tags, newTag]);
			setNewTag("");
			toast.success("Tag added");
		}
	};

	return (
		<FormCard
			title="Create New Course"
			icon={
				<BookOpen size={40} className="text-[var(--color-primary)]" />
			}
		>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="font-semibold">Course Title</label>
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						required
						className="w-full rounded border p-2"
					/>
				</div>

				<div>
					<label className="font-semibold">Description</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={3}
						required
						className="w-full rounded border p-2"
					></textarea>
				</div>

				<div>
					<label className="font-semibold">Duration (hours)</label>
					<input
						type="number"
						value={duration}
						onChange={(e) => setDuration(parseInt(e.target.value))}
						min={1}
						required
						className="w-full rounded border p-2"
					/>
				</div>

				<div>
					<label className="font-semibold">Badge</label>
					<select
						value={selectedBadgeId}
						onChange={(e) => {
							const selected = availableBadges.find(
								(b) => b.id === e.target.value,
							);
							if (selected) {
								setBaseName(selected.baseName);
								setLevel(selected.level);
								setSelectedBadgeId(selected.id);
							}
						}}
						required
						className="w-full rounded border p-2"
					>
						<option value="">Select a badge</option>
						{availableBadges.map((badge) => (
							<option key={badge.id} value={badge.id}>
								{badge.name} ({badge.level})
							</option>
						))}
					</select>
					{availableBadges.length === 0 && (
						<p className="mt-2 text-sm text-red-500">
							All badges are already assigned to courses.
						</p>
					)}
				</div>

				<div>
					<label className="font-semibold">Tags</label>
					<div className="flex gap-2">
						<input
							type="text"
							placeholder="New tag..."
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							className="flex-grow rounded border p-2"
						/>
						<button
							type="button"
							onClick={addTag}
							className="rounded bg-[var(--color-primary)] px-4 py-2 font-semibold text-white hover:bg-[var(--color-secondary)]"
						>
							Add Tag
						</button>
					</div>
					<div className="mt-3 flex flex-wrap gap-2">
						{tags.map((tag, idx) => (
							<span
								key={idx}
								className="rounded-full bg-gray-200 px-3 py-1 text-sm"
							>
								{tag}
							</span>
						))}
					</div>
				</div>

				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => navigate("/dashboard")}
						className="flex-1 rounded bg-gray-500 py-2 font-semibold text-white hover:bg-gray-600"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="flex-1 rounded bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
					>
						➕ Create Course
					</button>
				</div>
			</form>
		</FormCard>
	);
};

export default CreateCoursePage;
