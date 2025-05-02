import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion, AnimatePresence } from "framer-motion";
import { Medal, BookOpen, Wrench, X, Info, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

interface JwtPayload {
	roles: string;
	sub: string;
	given_name?: string;
}

interface Badge {
	id: string;
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
	const [allBadges, setAllBadges] = useState<Badge[]>([]);
	const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
	const [loading, setLoading] = useState(true);
	const [badgeToDelete, setBadgeToDelete] = useState<Badge | null>(null);
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
			if (decoded.roles === "Admin") {
				fetchAllBadges();
			} else {
				fetchUserProgress();
			}
		} catch (error) {
			console.error("Invalid token", error);
			navigate("/login");
		}
	}, [navigate]);

	const fetchAllBadges = async () => {
		try {
			const token = localStorage.getItem("token");
			const headers = { Authorization: `Bearer ${token}` };

			const badgesResponse = await axios.get(
				"http://localhost:5153/Badge",
				{ headers },
			);
			setAllBadges(badgesResponse.data);
		} catch (error) {
			console.error("Error fetching all badges", error);
		} finally {
			setLoading(false);
		}
	};

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

	const handleDeleteBadge = async (badge: Badge) => {
		setBadgeToDelete(badge);
	};

	const confirmDelete = async () => {
		if (!badgeToDelete) return;

		try {
			const token = localStorage.getItem("token");
			await axios.delete(
				`http://localhost:5153/Badge/${badgeToDelete.id}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			toast.success("Badge deleted successfully");
			setAllBadges(allBadges.filter((b) => b.id !== badgeToDelete.id));
			setBadgeToDelete(null);
		} catch (error: any) {
			const msg = error.response?.data;
			toast.error(msg || "Failed to delete badge");
		}
	};

	const cancelDelete = () => {
		setBadgeToDelete(null);
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
		<div className="min-h-screen bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] px-6 py-10">
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
				<p className="mt-2 max-w-xl text-lg text-gray-500">
					{role !== "Admin"
						? "Let's continue your learning journey! 🌱"
						: "Manage and empower learners' journeys! 🚀"}
				</p>
			</motion.div>

			{role !== "Admin" ? (
				<>
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
								<ul className="space-y-1 text-sm text-gray-700">
									<li>
										• Completed:{" "}
										<strong>
											{progress.completedCourses}
										</strong>{" "}
										/{" "}
										<strong>{progress.totalCourses}</strong>
									</li>
									<li>
										• Badges:{" "}
										<strong>
											{progress.badgesEarned.length}
										</strong>
									</li>
									{progress.lastActivityName && (
										<li>
											• Last Activity:{" "}
											<strong>
												{progress.lastActivityName}
											</strong>
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
								<p className="mt-4 text-center text-gray-500">
									Complete courses to earn badges!
								</p>
							) : (
								<div className="flex flex-wrap justify-center gap-6">
									{progress.badgesEarned.map(
										(badge, index) => (
											<div
												key={index}
												className="flex flex-col items-center"
												onClick={() =>
													openBadgeModal(badge)
												}
												role="button"
												tabIndex={0}
											>
												<img
													src={displayBadgeIcon(
														badge,
													)}
													alt={badge.name}
													className="h-16 w-16 cursor-pointer rounded-full shadow-sm transition-transform hover:scale-110"
												/>
												<span className="mt-1 text-sm font-medium">
													{badge.name}
												</span>
												<span className="text-xs text-gray-500">
													{badge.level}
												</span>
											</div>
										),
									)}
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
						<p className="mb-4 text-gray-600">
							Explore courses and keep progressing!
						</p>
						<button
							onClick={() => navigate("/courses")}
							className="rounded-xl bg-[var(--color-primary)] px-5 py-2 font-bold text-white hover:bg-[var(--color-secondary)]"
						>
							View Courses
						</button>
					</motion.section>
				</>
			) : (
				<>
					<motion.section
						className="rounded-3xl bg-white p-6 shadow-2xl transition-transform hover:-translate-y-1"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
					>
						<div className="mb-2 flex items-center gap-2 text-xl font-semibold text-[var(--color-primary)]">
							<Medal /> All Badges
						</div>
						{allBadges.length === 0 ? (
							<p className="mt-4 text-center text-gray-500">
								No badges have been created yet.
							</p>
						) : (
							<div className="flex flex-wrap justify-center gap-6">
								{allBadges.map((badge, index) => (
									<div
										key={index}
										className="flex flex-col items-center"
									>
										<div
											onClick={() =>
												openBadgeModal(badge)
											}
											role="button"
											tabIndex={0}
											className="group relative"
										>
											<img
												src={displayBadgeIcon(badge)}
												alt={badge.name}
												className="h-16 w-16 cursor-pointer rounded-full shadow-sm transition-transform hover:scale-110"
											/>
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDeleteBadge(badge);
												}}
												className="absolute -right-2 -top-2 hidden rounded-full bg-red-500 p-1 text-white hover:bg-red-600 group-hover:block"
												title="Delete badge"
											>
												<Trash2 size={14} />
											</button>
										</div>
										<span className="mt-1 text-sm font-medium">
											{badge.name}
										</span>
										<span className="text-xs text-gray-500">
											{badge.level}
										</span>
									</div>
								))}
							</div>
						)}
					</motion.section>

					<motion.section
						className="mt-10 rounded-3xl bg-white p-6 shadow-2xl transition-transform hover:-translate-y-1"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						<div className="mb-2 flex items-center gap-2 text-xl font-semibold text-[var(--color-primary)]">
							<BookOpen /> Course Management
						</div>
						<p className="mb-4 text-gray-600">
							Manage and organize your courses
						</p>
						<button
							onClick={() => navigate("/courses")}
							className="rounded-xl bg-[var(--color-primary)] px-5 py-2 font-bold text-white hover:bg-[var(--color-secondary)]"
						>
							Manage Courses
						</button>
					</motion.section>

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
				</>
			)}

			<AnimatePresence>
				{selectedBadge && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={closeBadgeModal}
						className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 p-4 backdrop-blur-sm"
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
								className="absolute right-2 top-2 bg-gray-500 p-1 hover:bg-gray-600"
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
							<p className="text-center text-gray-600">
								{selectedBadge.level}
							</p>
						</motion.div>
					</motion.div>
				)}

				{badgeToDelete && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 p-4 backdrop-blur-sm"
					>
						<motion.div
							initial={{ scale: 0.5 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.5 }}
							className="relative w-full max-w-md rounded-lg bg-white p-6 text-center shadow-xl"
						>
							<h3 className="mb-4 text-lg font-bold text-gray-900">
								Delete Badge
							</h3>
							<div className="mb-6">
								<p className="text-gray-600">
									Are you sure you want to delete the badge "
									{badgeToDelete.name} {badgeToDelete.level}"?
								</p>
								<div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-4 text-left">
									<Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
									<p className="text-sm text-blue-700">
										Note: If this badge is assigned to a
										course, deleting the badge will also
										delete the associated course.
									</p>
								</div>
							</div>
							<div className="flex justify-center gap-4">
								<button
									onClick={cancelDelete}
									className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-600"
								>
									Cancel
								</button>
								<button
									onClick={confirmDelete}
									className="rounded bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-600"
								>
									Delete
								</button>
							</div>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default DashboardPage;
