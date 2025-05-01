import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { Medal, BookOpen, Wrench, X } from "lucide-react";

interface JwtPayload {
	roles: string;
	sub: string;
	given_name?: string;
}

interface Badge {
	name: string;
	baseName: string;
	level: string;
	icon: string;
}

interface Progress {
	totalCourses: number;
	completedCourses: number;
	badgesEarned: Badge[];
	lastActivityDate?: string;
	lastActivityName?: string;
}

const DashboardPage = () => {
	const [role, setRole] = useState<string | null>(null);
	const [name, setName] = useState<string>("User");
	const [progress, setProgress] = useState<Progress>({
		totalCourses: 0,
		completedCourses: 0,
		badgesEarned: [],
		lastActivityDate: undefined,
		lastActivityName: undefined,
	});
	const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("token");
		if (!token) {
			navigate("/login");
			return;
		}

		try {
			const decoded = jwtDecode<JwtPayload>(token);
			setRole(decoded.roles);
			if (decoded.given_name) setName(decoded.given_name);
			fetchUserProgress();
		} catch (error) {
			console.error("Invalid token", error);
			navigate("/login");
		}
	}, [navigate]);

	const fetchUserProgress = async () => {
		try {
			const token = localStorage.getItem("token");
			const headers = { Authorization: `Bearer ${token}` };

			const [progressResponse, badgesResponse, lastActivityResponse] =
				await Promise.all([
					axios.get("http://localhost:5153/UserProgress", {
						headers,
					}),
					axios.get("http://localhost:5153/Badge/user", { headers }),
					axios.get(
						"http://localhost:5153/UserProgress/last-activity",
						{
							headers,
						},
					),
				]);

			// Filter only published courses and count them
			const publishedCourses = progressResponse.data.filter(
				(c: any) => c.isPublished,
			);
			const totalCourses = publishedCourses.length;
			const completedCourses = publishedCourses.filter(
				(c: any) => c.completed,
			).length;

			setProgress({
				totalCourses,
				completedCourses,
				badgesEarned: badgesResponse.data,
				lastActivityDate: lastActivityResponse.data?.date,
				lastActivityName: lastActivityResponse.data?.name,
			});
		} catch (error) {
			console.error("Error fetching progress", error);
		} finally {
			setLoading(false);
		}
	};

	const openBadgeModal = (badge: Badge) => {
		setSelectedBadge(badge);
	};

	const closeBadgeModal = () => {
		setSelectedBadge(null);
	};

	const displayBadgeIcon = (badge: Badge) => {
		if (!badge.icon) return "";

		// If the icon contains data:image somewhere, extract everything from that point
		if (badge.icon.includes("data:image")) {
			return badge.icon.substring(badge.icon.indexOf("data:image"));
		}

		return badge.icon;
	};

	const progressPercentage =
		progress.totalCourses > 0
			? Math.round(
					(progress.completedCourses / progress.totalCourses) * 100,
				)
			: 0;

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#f4fff7] to-white p-4">
				<div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#f4fff7] to-white px-6 py-10">
			<motion.div
				className="mb-10 flex flex-col items-center justify-center text-center"
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<img
					src="/src/assets/bracket-icons-heart.svg"
					alt="Heart icon"
					className="mb-4 h-16 w-16"
				/>
				<h1 className="text-5xl font-extrabold text-[var(--color-primary)]">
					Welcome back, {name}!
				</h1>
				<p className="text-gray-500 mt-2 max-w-xl text-lg">
					Let’s continue your learning journey! 🌱
				</p>
			</motion.div>

			<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
				<motion.section
					className="rounded-3xl bg-white p-6 shadow-2xl transition-transform hover:-translate-y-1"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<div className="mb-2 flex items-center gap-2 text-xl font-semibold text-[var(--color-primary)]">
						<BookOpen /> Digital Passport
					</div>
					<div className="flex items-center gap-6">
						<div className="h-24 w-24">
							<CircularProgressbar
								value={progressPercentage}
								text={`${progressPercentage}%`}
								styles={buildStyles({
									textSize: "16px",
									pathColor: "#41b653",
									textColor: "#37384d",
								})}
							/>
						</div>
						<ul className="text-gray-700 space-y-1 text-sm">
							<li>
								• Completed:{" "}
								<strong>{progress.completedCourses}</strong> /{" "}
								<strong>{progress.totalCourses}</strong>
							</li>
							<li>
								• Badges:{" "}
								<strong>{progress.badgesEarned.length}</strong>
							</li>
							{progress.lastActivityName && (
								<li>
									• Last Activity:{" "}
									<strong>{progress.lastActivityName}</strong>
									{progress.lastActivityDate && (
										<span className="text-gray-500">
											({" "}
											{new Date(
												progress.lastActivityDate,
											).toLocaleDateString()}{" "}
											)
										</span>
									)}
								</li>
							)}
						</ul>
					</div>
				</motion.section>

				<motion.section
					className="rounded-3xl bg-white p-6 shadow-2xl transition-transform hover:-translate-y-1"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<div className="mb-2 flex items-center gap-2 text-xl font-semibold text-[var(--color-primary)]">
						<Medal /> My Badges
					</div>
					{progress.badgesEarned.length === 0 ? (
						<p className="text-gray-500 mt-4 text-center">
							Complete courses to earn badges!
						</p>
					) : (
						<div className="flex flex-wrap justify-center gap-6">
							{progress.badgesEarned.map((badge, index) => (
								<div
									key={index}
									className="flex flex-col items-center"
									onClick={() => openBadgeModal(badge)}
									role="button"
									tabIndex={0}
								>
									<img
										src={displayBadgeIcon(badge)}
										alt={badge.name}
										className="h-16 w-16 cursor-pointer rounded-full shadow-sm transition-transform hover:scale-110"
									/>
									<span className="mt-1 text-sm font-medium">
										{badge.name}
									</span>
									<span className="text-gray-500 text-xs">
										{badge.level}
									</span>
								</div>
							))}
						</div>
					)}
				</motion.section>
			</div>

			<motion.section
				className="mt-10 rounded-3xl bg-white p-6 shadow-2xl transition-transform hover:-translate-y-1"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
			>
				<div className="mb-2 flex items-center gap-2 text-xl font-semibold text-[var(--color-primary)]">
					<BookOpen /> Continue Learning
				</div>
				<p className="text-gray-600 mb-4">
					Explore courses and keep progressing!
				</p>
				<button
					onClick={() => navigate("/courses")}
					className="rounded-xl bg-[var(--color-primary)] px-5 py-2 font-bold text-white hover:bg-[var(--color-secondary)]"
				>
					View Courses
				</button>
			</motion.section>

			{role === "Admin" && (
				<motion.section
					className="mt-10 rounded-3xl bg-white p-6 shadow-2xl transition-transform hover:-translate-y-1"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
				>
					<div className="mb-2 flex items-center gap-2 text-xl font-semibold text-purple-700">
						<Wrench /> Admin Tools
					</div>
					<div className="mt-4 flex flex-wrap gap-4">
						<button
							onClick={() => navigate("/admin/create-course")}
							className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
						>
							➕ Create Course
						</button>
						<button
							onClick={() => navigate("/admin/create-badge")}
							className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-600"
						>
							🏅 Create Badge
						</button>
					</div>
				</motion.section>
			)}

			<AnimatePresence>
				{selectedBadge && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={closeBadgeModal}
						className="bg-white/30 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
					>
						<motion.div
							initial={{ scale: 0.5 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.5 }}
							onClick={(e) => e.stopPropagation()}
							className="relative rounded-2xl bg-white p-6 shadow-xl"
						>
							<button
								onClick={closeBadgeModal}
								className="bg-gray-500 hover:bg-gray-600 absolute right-2 top-2 p-1"
							>
								<X size={16} className="text-white" />
							</button>
							<img
								src={displayBadgeIcon(selectedBadge)}
								alt={selectedBadge.name}
								className="h-48 w-48 rounded-lg"
							/>
							<h3 className="mt-4 text-center text-xl font-bold">
								{selectedBadge.name}
							</h3>
							<p className="text-gray-600 text-center">
								{selectedBadge.level}
							</p>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default DashboardPage;
