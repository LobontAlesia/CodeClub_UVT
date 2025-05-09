import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { Star, Trophy, Search, X } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Container from "../../components/layout/Container";
import ResponsiveGrid from "../../components/layout/ResponsiveGrid";

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
	const [loading, setLoading] = useState(true);
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
			setLoading(true);
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
			} finally {
				setLoading(false);
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
				<motion.div
					className="mb-8 flex flex-col items-center text-center sm:mb-12"
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<img
						src="/src/assets/bracket-icons-search.svg"
						alt="Search icon"
						className="mb-3 h-12 w-12 sm:mb-4 sm:h-16 sm:w-16"
					/>
					<h1 className="text-3xl font-extrabold text-[var(--color-primary)] sm:text-4xl md:text-5xl">
						Explore Courses
					</h1>
					<p className="mt-2 max-w-xl text-sm text-gray-600 sm:text-base">
						Choose your next adventure and continue learning.
					</p>

					{/* Search and Filter Section */}
					<div className="mt-6 w-full max-w-4xl sm:mt-8">
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
									className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
										selectedTags.includes(tag)
											? "bg-[var(--color-secondary)] text-white"
											: "bg-amber-500 text-white"
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
						<Droppable droppableId="courses">
							{(provided) => (
								<ResponsiveGrid
									{...provided.droppableProps}
									ref={provided.innerRef}
									className="mb-6"
									cols={{ xs: 1, sm: 2, lg: 3 }}
									gap="large"
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
													className={`group cursor-pointer rounded-2xl bg-white p-4 shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl sm:rounded-3xl sm:p-6 ${
														snapshot.isDragging
															? "shadow-xl"
															: ""
													}`}
												>
													<div className="relative mb-3 h-24 w-full overflow-hidden rounded-xl sm:mb-4 sm:h-32 sm:rounded-2xl">
														<div
															className={`absolute inset-0 bg-gradient-to-r ${
																course.completed
																	? "from-green-300 to-blue-300"
																	: "from-[#d6ffe2] to-[#e1f4ff]"
															}`}
														/>
														{course.completed && (
															<div className="absolute inset-0 flex items-center justify-center">
																<Trophy className="h-10 w-10 text-white drop-shadow-lg sm:h-16 sm:w-16" />
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
																	className="h-3 w-3 text-yellow-400 drop-shadow sm:h-4 sm:w-4"
																	fill="#FBBF24"
																/>
															))}
														</div>
													</div>
													<h2 className="mb-2 line-clamp-2 text-lg font-bold text-gray-800 group-hover:text-[var(--color-primary)] sm:text-xl md:text-2xl">
														{course.title}
													</h2>
													<p className="mb-3 line-clamp-3 text-xs text-gray-600 sm:mb-4 sm:text-sm">
														{course.description}
													</p>
													<div className="flex items-center justify-between text-xs text-gray-500 sm:text-sm">
														<span className="rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-600 sm:px-3 sm:py-1">
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
															<p className="mt-2 text-xs font-medium text-green-600 sm:text-sm">
																✨ Course
																Completed!
															</p>
														)}
												</div>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</ResponsiveGrid>
							)}
						</Droppable>
					</DragDropContext>
				)}
			</Container>
		</div>
	);
};

export default CoursesPage;
