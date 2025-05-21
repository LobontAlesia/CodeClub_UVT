import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";

interface ConfirmationModalProps {
	isOpen: boolean;
	title: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	confirmText?: string;
	cancelText?: string;
}

const ConfirmationModal = ({
	isOpen,
	title,
	message,
	onConfirm,
	onCancel,
	confirmText = "Delete",
	cancelText = "Cancel",
}: ConfirmationModalProps) => {
	if (!isOpen) return null;

	return (
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
					{title}
				</h3>
				<div className="mb-6">
					<div className="mb-2 flex items-center justify-center gap-2 text-red-500">
						<AlertCircle />
						<span className="font-medium">Warning</span>
					</div>
					<p className="text-gray-600">{message}</p>
				</div>
				<div className="flex justify-end gap-4">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						{cancelText}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
					>
						{confirmText}
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default ConfirmationModal;
