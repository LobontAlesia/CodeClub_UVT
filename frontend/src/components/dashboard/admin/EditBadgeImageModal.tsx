import React, { useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

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

interface EditBadgeImageModalProps {
	badge: Badge | ExternalBadge;
	onClose: () => void;
	onBadgeUpdated: (updatedBadge: Badge | ExternalBadge) => void;
}

const EditBadgeImageModal = ({
	badge,
	onClose,
	onBadgeUpdated,
}: EditBadgeImageModalProps) => {
	const [icon, setIcon] = useState<string | null>(null);
	const [originalIcon, setOriginalIcon] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const displayBadgeIcon = (badge: Badge | ExternalBadge) => {
		if (!badge.icon) return "";
		if (badge.icon.includes("data:image")) {
			return badge.icon.substring(badge.icon.indexOf("data:image"));
		}
		return badge.icon;
	};

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				// Save original image for preview
				setOriginalIcon(base64String);

				// Generate unique identifier for the icon
				const timestamp = new Date().getTime();
				const iconId = `badge_${timestamp}`;
				setIcon(`${iconId}|${base64String}`);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!icon) {
			toast.warn("Please select an image first");
			return;
		}

		setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const headers = { Authorization: `Bearer ${token}` };

			const isExternalBadge = "category" in badge;
			const endpoint = isExternalBadge ? "ExternalBadge" : "Badge";

			await axios.put(
				`http://localhost:5153/${endpoint}/${badge.id}/icon`,
				{ icon },
				{ headers },
			);

			toast.success("Badge image updated successfully");

			// Update the badge with the new icon
			const updatedBadge = { ...badge, icon };
			onBadgeUpdated(updatedBadge);
			onClose();
		} catch (error: any) {
			console.error("Error updating badge image", error);
			toast.error(error.response?.data || "Failed to update badge image");
		} finally {
			setLoading(false);
		}
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
				className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
			>
				<button
					onClick={onClose}
					className="absolute right-2 top-2 rounded-full bg-gray-200 p-1 hover:bg-gray-300"
					aria-label="Close"
				>
					<X size={16} />
				</button>

				<h2 className="mb-4 text-center text-xl font-bold">
					Edit Badge Image
				</h2>

				<div className="mb-6 flex justify-center">
					<img
						src={originalIcon || displayBadgeIcon(badge)}
						alt={badge.name}
						className="h-32 w-32 rounded-full object-contain"
					/>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="mb-2 block text-sm font-semibold">
							Upload New Badge Image
						</label>
						<input
							type="file"
							accept="image/*"
							className="w-full text-sm"
							onChange={handleImageUpload}
							required
						/>
						<p className="mt-1 text-xs text-gray-500">
							Select a new image for the badge. All other badge
							properties will remain unchanged.
						</p>
					</div>

					<div className="flex gap-4">
						<button
							type="button"
							onClick={onClose}
							disabled={loading}
							className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={loading}
							className="flex-1 rounded bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
						>
							{loading ? (
								<span className="flex items-center justify-center">
									<svg
										className="mr-2 h-4 w-4 animate-spin"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
									Updating...
								</span>
							) : (
								"Update Image"
							)}
						</button>
					</div>
				</form>
			</motion.div>
		</motion.div>
	);
};

export default EditBadgeImageModal;
