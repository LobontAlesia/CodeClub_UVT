import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { toast } from "react-toastify";
import { AnimatePresence } from "framer-motion";

// Components
import WelcomeSection from "../../components/dashboard/WelcomeSection";
import DigitalPassportSection from "../../components/dashboard/DigitalPassportSection";
import MyBadgesSection from "../../components/dashboard/MyBadgesSection";
import ContinueLearningSection from "../../components/dashboard/ContinueLearningSection";
import PortfolioSection from "../../components/dashboard/PortfolioSection";
import AllBadgesSection from "../../components/dashboard/admin/AllBadgesSection";
import CourseManagementSection from "../../components/dashboard/admin/CourseManagementSection";
import AdminToolsSection from "../../components/dashboard/admin/AdminToolsSection";
import BadgeDetailsModal from "../../components/dashboard/BadgeDetailsModal";
import DeleteBadgeModal from "../../components/dashboard/admin/DeleteBadgeModal";
import EditBadgeImageModal from "../../components/dashboard/admin/EditBadgeImageModal";
import HeroSection from "../../components/dashboard/HeroSection";

interface Badge {
	id: string;
	name: string;
	baseName: string;
	level: string;
	icon: string;
}

interface ExternalBadge {
	id: string;
	name: string;
	category: string;
	icon: string;
}

interface JwtPayload {
	roles: string;
	sub: string;
	given_name?: string;
}

interface Progress {
	totalCourses: number;
	completedCourses: number;
	badgesEarned: Badge[];
	externalBadgesEarned: ExternalBadge[];
	lastActivityDate?: string;
	lastActivityName?: string;
	portfolioCount: number;
}

const DashboardPage = () => {
	const [role, setRole] = useState<string | null>(null);
	const [name, setName] = useState<string>("User");
	const [progress, setProgress] = useState<Progress>({
		totalCourses: 0,
		completedCourses: 0,
		badgesEarned: [],
		externalBadgesEarned: [],
		lastActivityDate: undefined,
		lastActivityName: undefined,
		portfolioCount: 0,
	});
	const [allBadges, setAllBadges] = useState<Badge[]>([]);
	const [allExternalBadges, setAllExternalBadges] = useState<ExternalBadge[]>(
		[],
	);
	const [selectedBadge, setSelectedBadge] = useState<
		Badge | ExternalBadge | null
	>(null);
	const [loading, setLoading] = useState(true);
	const [badgeToDelete, setBadgeToDelete] = useState<
		Badge | ExternalBadge | null
	>(null);
	const [badgeToEdit, setBadgeToEdit] = useState<
		Badge | ExternalBadge | null
	>(null);
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
			const [badgesResponse, externalBadgesResponse] = await Promise.all([
				axios.get("http://localhost:5153/Badge", { headers }),
				axios.get("http://localhost:5153/ExternalBadge", { headers }),
			]);
			setAllBadges(badgesResponse.data);
			setAllExternalBadges(externalBadgesResponse.data);
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

			const [
				progressResponse,
				badgesResponse,
				externalBadgesResponse,
				lastActivityResponse,
				portfoliosResponse,
			] = await Promise.all([
				axios.get("http://localhost:5153/UserProgress", {
					headers,
				}),
				axios.get("http://localhost:5153/Badge/user", { headers }),
				axios.get("http://localhost:5153/ExternalBadge/user", {
					headers,
				}),
				axios.get("http://localhost:5153/UserProgress/last-activity", {
					headers,
				}),
				axios.get("http://localhost:5153/Portfolio/user", { headers }),
			]);

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
				externalBadgesEarned: externalBadgesResponse.data,
				lastActivityDate: lastActivityResponse.data?.date,
				lastActivityName: lastActivityResponse.data?.name,
				portfolioCount: portfoliosResponse.data.length,
			});
		} catch (error) {
			console.error("Error fetching progress", error);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteBadge = async (badge: Badge | ExternalBadge) => {
		setBadgeToDelete(badge);
	};

	const handleEditBadgeImage = (badge: Badge | ExternalBadge) => {
		setSelectedBadge(null); // Close the details modal
		setBadgeToEdit(badge); // Open the edit modal
	};

	const handleBadgeUpdated = (updatedBadge: Badge | ExternalBadge) => {
		// Update the badge in the appropriate array
		if ("category" in updatedBadge) {
			// External badge
			setAllExternalBadges(
				allExternalBadges.map((b) =>
					b.id === updatedBadge.id
						? (updatedBadge as ExternalBadge)
						: b,
				),
			);
		} else {
			// Regular badge
			setAllBadges(
				allBadges.map((b) =>
					b.id === updatedBadge.id ? (updatedBadge as Badge) : b,
				),
			);
		}
	};

	const confirmDelete = async () => {
		if (!badgeToDelete) return;

		try {
			const token = localStorage.getItem("token");
			const isExternalBadge = "category" in badgeToDelete;
			const endpoint = isExternalBadge ? "ExternalBadge" : "Badge";

			await axios.delete(
				`http://localhost:5153/${endpoint}/${badgeToDelete.id}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			toast.success("Badge deleted successfully");
			if (isExternalBadge) {
				setAllExternalBadges(
					allExternalBadges.filter((b) => b.id !== badgeToDelete.id),
				);
			} else {
				setAllBadges(
					allBadges.filter((b) => b.id !== badgeToDelete.id),
				);
			}
			setBadgeToDelete(null);
		} catch (error: any) {
			const msg = error.response?.data;
			toast.error(msg || "Failed to delete badge");
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
		<div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#e8f5e9] via-white to-[#e3f2fd] px-6 py-10">
			{/* Emoji-uri decorative */}
			<div className="pointer-events-none absolute left-[-100px] top-10 rotate-[-15deg] select-none text-[200px] opacity-5">
				🚀
			</div>
			<div className="pointer-events-none absolute right-[-75px] top-10 rotate-[15deg] select-none text-[200px] opacity-5">
				⭐
			</div>
			<div className="pointer-events-none absolute bottom-10 right-[-100px] rotate-[15deg] select-none text-[200px] opacity-5">
				💻
			</div>

			<WelcomeSection name={name} role={role} />

			{role !== "Admin" ? (
				<>
					<HeroSection />
					<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
						<DigitalPassportSection
							completedCourses={progress.completedCourses}
							totalCourses={progress.totalCourses}
							badgesCount={
								progress.badgesEarned.length +
								progress.externalBadgesEarned.length
							}
							lastActivityName={progress.lastActivityName}
							lastActivityDate={progress.lastActivityDate}
							portfolioCount={progress.portfolioCount}
						/>
						<MyBadgesSection
							badges={progress.badgesEarned}
							externalBadges={progress.externalBadgesEarned}
							onBadgeClick={setSelectedBadge}
						/>
					</div>
					<ContinueLearningSection />
					<PortfolioSection />
				</>
			) : (
				<>
					<AllBadgesSection
						badges={allBadges}
						externalBadges={allExternalBadges}
						onBadgeClick={setSelectedBadge}
						onDeleteClick={handleDeleteBadge}
					/>
					<CourseManagementSection />
					<AdminToolsSection />
				</>
			)}

			<AnimatePresence>
				{selectedBadge && (
					<BadgeDetailsModal
						badge={selectedBadge}
						onClose={() => setSelectedBadge(null)}
						isAdmin={role === "Admin"}
						onEditImage={handleEditBadgeImage}
					/>
				)}

				{badgeToDelete && (
					<DeleteBadgeModal
						badge={badgeToDelete}
						onConfirm={confirmDelete}
						onCancel={() => setBadgeToDelete(null)}
					/>
				)}

				{badgeToEdit && (
					<EditBadgeImageModal
						badge={badgeToEdit}
						onClose={() => setBadgeToEdit(null)}
						onBadgeUpdated={handleBadgeUpdated}
					/>
				)}
			</AnimatePresence>
		</div>
	);
};

export default DashboardPage;
