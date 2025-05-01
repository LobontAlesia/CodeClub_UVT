import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import { motion } from "framer-motion";
import { BookText } from "lucide-react";

interface Course {
	id: string;
	title: string;
	description: string;
	level: string;
	duration: number;
	isPublished: boolean;
}

interface JwtPayload {
	roles: string;
}

const CoursesPage = () => {
	const [courses, setCourses] = useState<Course[]>([]);
	const [isAdmin, setIsAdmin] = useState(false);
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
		const fetchCourses = async () => {
			try {
				const token = localStorage.getItem("token");
				const response = await axios.get(
					"http://localhost:5153/LearningCourse",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				setCourses(response.data);
			} catch (error) {
				console.error(error);
				toast.error("Failed to load courses");
			}
		};

		fetchCourses();
	}, []);

	const handleClick = (id: string) => {
		navigate(`/course/${id}`);
	};

	const visibleCourses = courses.filter(
		(course) => isAdmin || course.isPublished,
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#f4fff7] to-white px-6 py-10">
			<motion.div
				className="mb-12 flex flex-col items-center text-center"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<BookText className="mb-4 h-12 w-12 text-[var(--color-primary)]" />
				<h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
					Explore Courses
				</h1>
				<p className="text-gray-600 mt-2 max-w-xl">
					Choose your next adventure and continue learning.
				</p>
			</motion.div>

			{visibleCourses.length === 0 ? (
				<p className="text-gray-500 text-center">
					No courses available.
				</p>
			) : (
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
					{visibleCourses.map((course) => (
						<motion.div
							key={course.id}
							onClick={() => handleClick(course.id)}
							className="group cursor-pointer rounded-3xl bg-white p-6 shadow-xl transition-transform hover:-translate-y-1 hover:shadow-2xl"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							whileHover={{ scale: 1.03 }}
						>
							<div className="mb-4 h-32 w-full rounded-2xl bg-gradient-to-r from-[#d6ffe2] to-[#e1f4ff]" />
							<h2 className="text-gray-800 mb-2 text-2xl font-bold group-hover:text-[var(--color-primary)]">
								{course.title}
							</h2>
							<p className="text-gray-600 mb-4 text-sm">
								{course.description.length > 100
									? course.description.slice(0, 100) + "..."
									: course.description}
							</p>
							<div className="text-gray-500 flex items-center justify-between text-sm">
								<span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-600">
									{course.level}
								</span>
								<span>{course.duration}h</span>
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
						</motion.div>
					))}
				</div>
			)}
		</div>
	);
};

export default CoursesPage;
