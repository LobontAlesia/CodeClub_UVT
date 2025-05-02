import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { Star, Trophy, Search, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface Course {
	id: string;
	title: string;
	description: string;
	level: string;
	duration: number;
	isPublished: boolean;
	completed?: boolean;
	index?: number;
	tagNames: string[];
}

interface JwtPayload {
	roles: string;
}

const CoursesPage = () => {
	const [courses, setCourses] = useState<Course[]>([]);
	const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
	const [isAdmin, setIsAdmin] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [availableTags, setAvailableTags] = useState<string[]>([]);
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) return;

		try {
			const decoded = jwtDecode<JwtPayload>(token);
			setIsAdmin(decoded.roles === "Admin");
		} catch (err) {
			console.error("Failed to decode token", err);
		}
	}, []);

	useEffect(() => {
		const fetchTags = async () => {
			try {
				const token = localStorage.getItem("token");
				const response = await axios.get("http://localhost:5153/Tag", {
					headers: { Authorization: `Bearer ${token}` },
				});
				setAvailableTags(response.data);
			} catch (error) {
				console.error("Failed to fetch tags", error);
			}
		};

		fetchTags();
	}, []);

	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const token = localStorage.getItem("token");
				const [coursesResponse, progressResponse] = await Promise.all([
					axios.get("http://localhost:5153/LearningCourse", {
						headers: { Authorization: `Bearer ${token}` },
					}),
					axios.get("http://localhost:5153/UserProgress", {
						headers: { Authorization: `Bearer ${token}` },
					}),
				]);

				const coursesWithProgress = coursesResponse.data.map(
					(course: Course, index: number) => ({
						...course,
						index: index + 1,
						completed:
							progressResponse.data.find(
								(p: any) => p.id === course.id,
							)?.completed || false,
					}),
				);

				setCourses(coursesWithProgress);
				setFilteredCourses(coursesWithProgress);
			} catch (error) {
				console.error(error);
				toast.error("Failed to load courses");
			}
		};

		fetchCourses();
	}, []);

	useEffect(() => {
		filterCourses();
	}, [searchQuery, selectedTags, courses]);

	const filterCourses = () => {
		let filtered = courses;

		// Filter by search query
		if (searchQuery) {
			filtered = filtered.filter(
				(course) =>
					course.title
						.toLowerCase()
						.includes(searchQuery.toLowerCase()) ||
					course.description
						.toLowerCase()
						.includes(searchQuery.toLowerCase()),
			);
		}

		// Filter by selected tags
		if (selectedTags.length > 0) {
			filtered = filtered.filter((course) =>
				selectedTags.every((tag) => course.tagNames.includes(tag)),
			);
		}

		// Filter unpublished courses for non-admin users
		if (!isAdmin) {
			filtered = filtered.filter((course) => course.isPublished);
		}

		setFilteredCourses(filtered);
	};

	const handleTagSelect = (tag: string) => {
		if (selectedTags.includes(tag)) {
			setSelectedTags(selectedTags.filter((t) => t !== tag));
		} else {
			setSelectedTags([...selectedTags, tag]);
		}
	};

	const handleClick = (id: string) => {
		navigate(`/course/${id}`);
	};

	const handleDragEnd = async (result: any) => {
		if (!result.destination || !isAdmin) return;

		const reorderedCourses = Array.from(courses);
		const [removed] = reorderedCourses.splice(result.source.index, 1);
		reorderedCourses.splice(result.destination.index, 0, removed);

		const updatedCourses = reorderedCourses.map((course, idx) => ({
			...course,
			index: idx + 1,
		}));

		setCourses(updatedCourses);

		try {
			const token = localStorage.getItem("token");
			await axios.put(
				"http://localhost:5153/LearningCourse/reorder",
				{
					courses: updatedCourses.map((c) => ({
						id: c.id,
						index: c.index,
					})),
				},
				{ headers: { Authorization: `Bearer ${token}` } },
			);
			toast.success("Course order updated!");
		} catch (error) {
			console.error("Error updating course order", error);
			toast.error("Failed to update course order");
			// Revert on error by refreshing the courses
			window.location.reload();
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] px-6 py-10">
			<motion.div
				className="mb-12 flex flex-col items-center text-center"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<img
					src="/src/assets/bracket-icons-search.svg"
					alt="Search icon"
					className="mb-4 h-16 w-16"
				/>
				<h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
					Explore Courses
				</h1>
				<p className="mt-2 max-w-xl text-gray-600">
					Choose your next adventure and continue learning.
				</p>

				{/* Search and Filter Section */}
				<div className="mt-8 w-full max-w-4xl">
					<div className="relative mb-4">
						<input
							type="text"
							placeholder="Search courses..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
						/>
						<Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
					</div>

					<div className="flex flex-wrap gap-2">
						{availableTags.map((tag) => (
							<button
								key={tag}
								onClick={() => handleTagSelect(tag)}
								className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
									selectedTags.includes(tag)
										? "bg-[var(--color-secondary)] text-white"
										: "bg-color-primary text-white"
								}`}
							>
								{tag}
								{selectedTags.includes(tag) && (
									<X className="h-3 w-3 text-white" />
								)}
							</button>
						))}
					</div>
				</div>
			</motion.div>

			{filteredCourses.length === 0 ? (
				<p className="text-center text-gray-500">
					No courses available.
				</p>
			) : (
				<DragDropContext onDragEnd={handleDragEnd}>
					<Droppable droppableId="courses" direction="horizontal">
						{(provided) => (
							<div
								{...provided.droppableProps}
								ref={provided.innerRef}
								className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
							>
								{filteredCourses.map((course, index) => (
									<Draggable
										key={course.id}
										draggableId={course.id}
										index={index}
										isDragDisabled={!isAdmin}
									>
										{(provided, snapshot) => (
											<div
												ref={provided.innerRef}
												{...provided.draggableProps}
												{...provided.dragHandleProps}
												onClick={() =>
													handleClick(course.id)
												}
												className={`group cursor-pointer rounded-3xl bg-white p-6 shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl ${
													snapshot.isDragging
														? "shadow-2xl"
														: ""
												}`}
											>
												<div className="relative mb-4 h-32 w-full overflow-hidden rounded-2xl">
													<div
														className={`absolute inset-0 bg-gradient-to-r ${
															course.completed
																? "from-green-300 to-blue-300"
																: "from-[#d6ffe2] to-[#e1f4ff]"
														}`}
													/>
													{course.completed && (
														<div className="absolute inset-0 flex items-center justify-center">
															<Trophy className="h-16 w-16 text-white drop-shadow-lg" />
														</div>
													)}
													<div className="absolute bottom-2 right-2 flex items-center gap-1">
														{Array.from({
															length:
																course.level ===
																"Beginner"
																	? 1
																	: course.level ===
																		  "Intermediate"
																		? 2
																		: 3,
														}).map((_, i) => (
															<Star
																key={i}
																className="h-4 w-4 text-yellow-400 drop-shadow"
																fill="#FBBF24"
															/>
														))}
													</div>
												</div>
												<h2 className="mb-2 text-2xl font-bold text-gray-800 group-hover:text-[var(--color-primary)]">
													{course.title}
												</h2>
												<p className="mb-4 text-sm text-gray-600">
													{course.description.length >
													100
														? course.description.slice(
																0,
																100,
															) + "..."
														: course.description}
												</p>
												<div className="flex items-center justify-between text-sm text-gray-500">
													<span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-600">
														{course.level}
													</span>
													<span>
														{course.duration}h
													</span>
												</div>
												{isAdmin && (
													<p className="mt-2 text-xs font-medium">
														{course.isPublished ? (
															<span className="text-green-600">
																Published
															</span>
														) : (
															<span className="text-red-500">
																Unpublished
															</span>
														)}
													</p>
												)}
												{course.completed &&
													!isAdmin && (
														<p className="mt-2 text-sm font-medium text-green-600">
															✨ Course Completed!
														</p>
													)}
											</div>
										)}
									</Draggable>
								))}
								{provided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			)}
		</div>
	);
};

export default CoursesPage;
