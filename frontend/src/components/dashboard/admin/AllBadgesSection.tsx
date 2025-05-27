import { motion } from "framer-motion";
import { Medal, Trash2 } from "lucide-react";
import { FiAward, FiStar } from "react-icons/fi";
import { useState, useEffect } from "react";

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

interface AllBadgesSectionProps {
	badges: Badge[];
	externalBadges: ExternalBadge[];
	onBadgeClick: (badge: Badge | ExternalBadge) => void;
	onDeleteClick: (badge: Badge | ExternalBadge) => void;
}

const BadgeGrid = ({
	badges,
	onBadgeClick,
	onDeleteClick,
	isExternal = false,
}: {
	badges: (Badge | ExternalBadge)[];
	onBadgeClick: (badge: Badge | ExternalBadge) => void;
	onDeleteClick: (badge: Badge | ExternalBadge) => void;
	isExternal?: boolean;
}) => {
	const displayBadgeIcon = (badge: Badge | ExternalBadge) => {
		if (!badge.icon) return "";
		if (badge.icon.includes("data:image")) {
			return badge.icon.substring(badge.icon.indexOf("data:image"));
		}
		return badge.icon;
	};

	const [currentPage, setCurrentPage] = useState(0);
	const badgesPerPage = {
		mobile: 1, // Show only 1 badge on mobile
		desktop: 3, // Show only 3 badges on desktop (1 row)
	};

	// Get actual badges per page depending on screen size
	// Use window.innerWidth to check if we're on mobile or not
	const [isMobile, setIsMobile] = useState(
		typeof window !== "undefined" && window.innerWidth < 640,
	);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 640);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const actualBadgesPerPage = isMobile
		? badgesPerPage.mobile
		: badgesPerPage.desktop;
	const totalPages = Math.ceil(badges.length / actualBadgesPerPage);

	const handleNextPage = (e: React.MouseEvent) => {
		e.stopPropagation();
		setCurrentPage((prev) => (prev + 1) % totalPages);
	};

	const handlePrevPage = (e: React.MouseEvent) => {
		e.stopPropagation();
		setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1));
	};

	const visibleBadges = badges.slice(
		currentPage * actualBadgesPerPage,
		(currentPage + 1) * actualBadgesPerPage,
	);

	return (
		<div className="relative">
			{/* Navigation arrow - previous (only visible if we have multiple pages) */}
			{totalPages > 1 && (
				<button
					onClick={handlePrevPage}
					className="absolute left-0 top-1/2 z-10 -translate-x-2 -translate-y-1/2 rounded-full bg-gray-100 p-2 shadow-md transition-colors hover:bg-gray-200 sm:-translate-x-4"
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
			)}

			{/* Badge Grid - Centered badges with flex-based layout on mobile */}
			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				{visibleBadges.map((badge, index) => (
					<motion.div
						key={index}
						className="group mx-auto flex w-auto max-w-[200px] cursor-pointer flex-col items-center rounded-xl bg-gradient-to-br from-white to-gray-50 p-4 transition-all hover:-translate-y-1 hover:shadow-lg sm:mx-0 sm:p-3"
						onClick={() => onBadgeClick(badge)}
						whileHover={{ scale: 1.02 }}
						role="button"
						tabIndex={0}
					>
						<div className="relative mb-2">
							<div className="animate-tilt absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-600 to-green-600 opacity-20 blur group-hover:opacity-40" />
							<img
								src={displayBadgeIcon(badge)}
								alt={badge.name}
								className="sm:h-18 sm:w-18 relative h-24 w-24 rounded-full bg-white p-1 shadow-sm transition-transform group-hover:scale-105 md:h-16 md:w-16"
							/>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onDeleteClick(badge);
								}}
								className="absolute -right-1 -top-1 hidden rounded-full bg-red-500 p-1.5 text-white shadow-md transition-all hover:bg-red-600 group-hover:block"
								title="Delete badge"
							>
								<Trash2 size={12} />
							</button>
						</div>
						<h3 className="text-center text-base font-semibold text-gray-800 group-hover:text-[var(--color-primary)] sm:text-sm">
							{badge.name}
						</h3>
						<span className="mt-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 sm:px-2.5 sm:py-0.5">
							{isExternal
								? (badge as ExternalBadge).category
								: (badge as Badge).level}
						</span>
					</motion.div>
				))}
			</div>

			{/* Navigation arrow - next (only visible if we have multiple pages) */}
			{totalPages > 1 && (
				<button
					onClick={handleNextPage}
					className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 rounded-full bg-gray-100 p-2 shadow-md transition-colors hover:bg-gray-200 sm:translate-x-4 md:right-2"
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
			)}

			{/* Page indicator */}
			{totalPages > 1 && (
				<div className="mt-4 flex justify-center">
					<span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-500">
						{currentPage + 1}/{totalPages}
					</span>
				</div>
			)}
		</div>
	);
};

const AllBadgesSection = ({
	badges,
	externalBadges,
	onBadgeClick,
	onDeleteClick,
}: AllBadgesSectionProps) => {
	return (
		<motion.section
			className="hover:shadow-2xl/60 rounded-3xl bg-white p-8 shadow-2xl transition-all hover:-translate-y-1"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			<div className="mb-6 flex items-center gap-3">
				<div className="rounded-xl bg-blue-50 p-2">
					<Medal className="h-6 w-6 text-blue-600" />
				</div>
				<h2 className="text-2xl font-bold text-gray-800">All Badges</h2>
			</div>

			{badges.length === 0 && externalBadges.length === 0 ? (
				<div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl bg-gray-50 p-8">
					<div className="mb-4 rounded-full bg-gray-100 p-4">
						<Medal className="h-8 w-8 text-gray-400" />
					</div>
					<p className="text-center text-gray-500">
						No badges have been created yet.
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-12">
					<div className="space-y-4 md:pr-4">
						<h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
							<span className="rounded-full bg-blue-100 p-1">
								<FiAward className="text-blue-600" />
							</span>
							Course Badges
						</h3>
						{badges.length === 0 ? (
							<p className="text-center text-gray-500">
								No course badges created yet.
							</p>
						) : (
							<BadgeGrid
								badges={badges}
								onBadgeClick={onBadgeClick}
								onDeleteClick={onDeleteClick}
							/>
						)}
					</div>

					<div className="space-y-4 md:pl-4">
						<h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
							<span className="rounded-full bg-purple-100 p-1">
								<FiStar className="text-purple-600" />
							</span>
							External Badges
						</h3>
						{externalBadges.length === 0 ? (
							<p className="text-center text-gray-500">
								No external badges created yet.
							</p>
						) : (
							<BadgeGrid
								badges={externalBadges}
								onBadgeClick={onBadgeClick}
								onDeleteClick={onDeleteClick}
								isExternal={true}
							/>
						)}
					</div>
				</div>
			)}
		</motion.section>
	);
};

export default AllBadgesSection;
