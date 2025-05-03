import { motion } from "framer-motion";
import { Medal, Trash2 } from "lucide-react";

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

	return (
		<div className="grid grid-cols-2 gap-4">
			{badges.map((badge, index) => (
				<motion.div
					key={index}
					className="group flex w-[180px] cursor-pointer flex-col items-center rounded-xl bg-gradient-to-br from-white to-gray-50 p-3 transition-all hover:-translate-y-1 hover:shadow-lg"
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
							className="relative h-16 w-16 rounded-full bg-white p-1 shadow-sm transition-transform group-hover:scale-105"
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
					<h3 className="text-center text-sm font-semibold text-gray-800 group-hover:text-[var(--color-primary)]">
						{badge.name}
					</h3>
					<span className="mt-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
						{isExternal
							? (badge as ExternalBadge).category
							: (badge as Badge).level}
					</span>
				</motion.div>
			))}
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
				<div className="grid grid-cols-2 gap-8">
					<div className="space-y-4">
						<h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
							<span className="rounded-full bg-green-100 p-1">
								🎯
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

					<div className="space-y-4">
						<h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
							<span className="rounded-full bg-purple-100 p-1">
								🎖️
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
