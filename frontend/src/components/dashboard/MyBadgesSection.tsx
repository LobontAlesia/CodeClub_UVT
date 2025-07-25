import { motion } from "framer-motion";
import { Medal } from "lucide-react";
import { useState } from "react";

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

interface MyBadgesSectionProps {
	badges: Badge[];
	externalBadges?: ExternalBadge[];
	onBadgeClick: (badge: Badge | ExternalBadge) => void;
}

const MyBadgesSection = ({
	badges,
	externalBadges = [],
	onBadgeClick,
}: MyBadgesSectionProps) => {
	const displayBadgeIcon = (badge: Badge | ExternalBadge) => {
		if (!badge.icon) return "";
		if (badge.icon.includes("data:image")) {
			return badge.icon.substring(badge.icon.indexOf("data:image"));
		}
		return badge.icon;
	};

	const allBadges = [...badges, ...externalBadges];
	const [currentPage, setCurrentPage] = useState(0);
	const badgesPerPage = 6; // Show 2 rows with 3 badges each
	const totalPages = Math.ceil(allBadges.length / badgesPerPage);

	const handleNextPage = () => {
		setCurrentPage((prev) => (prev + 1) % totalPages);
	};

	const handlePrevPage = () => {
		setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
	};

	const visibleBadges = allBadges.slice(
		currentPage * badgesPerPage,
		(currentPage + 1) * badgesPerPage,
	);

	return (
		<motion.section
			className="hover:shadow-2xl/60 rounded-3xl bg-white p-8 shadow-2xl transition-all hover:-translate-y-1"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className="mb-4 flex items-center gap-3">
				<div className="rounded-xl bg-blue-50 p-2">
					<Medal className="h-6 w-6 text-blue-600" />
				</div>
				<h2 className="text-2xl font-bold text-gray-800">My Badges</h2>
			</div>

			{allBadges.length === 0 ? (
				<div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl bg-gray-50 p-8">
					<div className="mb-4 rounded-full bg-gray-100 p-4">
						<Medal className="h-8 w-8 text-gray-400" />
					</div>
					<p className="text-center text-gray-500">
						Complete courses or projects to earn badges!
					</p>
				</div>
			) : (
				<div className="relative">
					<div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3">
						{visibleBadges.map((badge, index) => (
							<motion.div
								key={index}
								className="group flex cursor-pointer flex-col items-center rounded-2xl bg-gradient-to-br from-white to-gray-50 p-4 transition-all hover:shadow-md"
								onClick={() => onBadgeClick(badge)}
								whileHover={{ scale: 1.02 }}
								role="button"
								tabIndex={0}
							>
								<div className="relative mb-3 rounded-full">
									<div className="animate-tilt absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-600 to-green-600 opacity-20 blur group-hover:opacity-40" />
									<img
										src={displayBadgeIcon(badge)}
										alt={badge.name}
										className="relative h-20 w-20 rounded-full bg-white p-1 shadow-sm"
									/>
								</div>
								<h3 className="text-center text-sm font-semibold text-gray-800">
									{badge.name}
								</h3>
								<span className="mt-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
									{"level" in badge
										? badge.level
										: badge.category}
								</span>
							</motion.div>
						))}
					</div>

					{totalPages > 1 && (
						<div className="mt-4 flex justify-center gap-4">
							<button
								onClick={handlePrevPage}
								className="rounded-full bg-gray-200 p-2 transition-colors hover:bg-gray-300"
								aria-label="Previous page"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M15 18l-6-6 6-6" />
								</svg>
							</button>
							<div className="flex items-center">
								<span className="text-sm text-gray-500">
									{currentPage + 1}/{totalPages}
								</span>
							</div>
							<button
								onClick={handleNextPage}
								className="rounded-full bg-gray-200 p-2 transition-colors hover:bg-gray-300"
								aria-label="Next page"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M9 18l6-6-6-6" />
								</svg>
							</button>
						</div>
					)}
				</div>
			)}
		</motion.section>
	);
};

export default MyBadgesSection;
