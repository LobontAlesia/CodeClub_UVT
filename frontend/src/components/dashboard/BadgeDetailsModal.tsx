import { motion } from "framer-motion";
import { X } from "lucide-react";

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

interface BadgeDetailsModalProps {
	badge: Badge | ExternalBadge;
	onClose: () => void;
}

const BadgeDetailsModal = ({ badge, onClose }: BadgeDetailsModalProps) => {
	const displayBadgeIcon = (badge: Badge | ExternalBadge) => {
		if (!badge.icon) return "";
		if (badge.icon.includes("data:image")) {
			return badge.icon.substring(badge.icon.indexOf("data:image"));
		}
		return badge.icon;
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onClose}
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
					onClick={onClose}
					className="absolute right-2 top-2 bg-gray-500 p-1 hover:bg-gray-600"
				>
					<X size={16} className="text-white" />
				</button>
				<img
					src={displayBadgeIcon(badge)}
					alt={badge.name}
					className="h-48 w-48 rounded-lg"
				/>
				<h3 className="mt-4 text-center text-xl font-bold">
					{badge.name}
				</h3>
				<p className="text-center text-gray-600">
					{"level" in badge ? badge.level : badge.category}
				</p>
			</motion.div>
		</motion.div>
	);
};

export default BadgeDetailsModal;
