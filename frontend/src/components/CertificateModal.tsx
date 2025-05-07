import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface CertificateModalProps {
	isOpen: boolean;
	onClose: () => void;
	certificateUrl: string;
	projectTitle: string;
}

const CertificateModal = ({
	isOpen,
	onClose,
	certificateUrl,
	projectTitle,
}: CertificateModalProps) => {
	const [isPdf, setIsPdf] = useState(false);
	const [objectUrl, setObjectUrl] = useState<string | null>(null);

	useEffect(() => {
		// Determine if the certificate is a PDF
		const isPdfCheck =
			certificateUrl.toLowerCase().endsWith(".pdf") ||
			certificateUrl.toLowerCase().includes("application/pdf") ||
			certificateUrl.toLowerCase().includes("%pdf");

		setIsPdf(isPdfCheck);

		// If it's a base64 PDF, convert it to a blob URL for better iframe handling
		if (isPdfCheck && certificateUrl.startsWith("data:")) {
			try {
				// Extract the base64 part
				const base64 = certificateUrl.split(",")[1];
				const byteCharacters = atob(base64);
				const byteArrays = [];

				for (
					let offset = 0;
					offset < byteCharacters.length;
					offset += 512
				) {
					const slice = byteCharacters.slice(offset, offset + 512);

					const byteNumbers = new Array(slice.length);
					for (let i = 0; i < slice.length; i++) {
						byteNumbers[i] = slice.charCodeAt(i);
					}

					const byteArray = new Uint8Array(byteNumbers);
					byteArrays.push(byteArray);
				}

				const blob = new Blob(byteArrays, { type: "application/pdf" });
				const url = URL.createObjectURL(blob);
				setObjectUrl(url);
			} catch (error) {
				console.error("Error processing PDF:", error);
				setObjectUrl(null);
			}
		} else {
			setObjectUrl(null);
		}

		// Cleanup function to revoke object URL when component unmounts
		return () => {
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [certificateUrl]);

	if (!isOpen) return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onClose}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
		>
			<motion.div
				initial={{ scale: 0.5, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.5, opacity: 0 }}
				onClick={(e) => e.stopPropagation()}
				className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl"
			>
				{/* Modal Header */}
				<div className="flex items-center justify-between border-b border-gray-200 p-4">
					<h3 className="text-lg font-medium text-gray-900">
						Dr. Scratch Certificate - {projectTitle}
					</h3>
					<button
						onClick={onClose}
						className="rounded-md p-1 text-white hover:bg-gray-100 hover:text-gray-500"
					>
						<svg
							className="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>

				{/* Modal Body */}
				<div className="h-[calc(90vh-8rem)] overflow-auto p-4">
					{isPdf ? (
						<object
							data={objectUrl || certificateUrl}
							type="application/pdf"
							className="h-full w-full"
						>
							<div className="flex h-full w-full flex-col items-center justify-center">
								<p className="mb-4 text-center text-red-600">
									Unable to display PDF directly.
								</p>
								<a
									href={certificateUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
								>
									Open PDF in new tab
								</a>
							</div>
						</object>
					) : (
						<img
							src={certificateUrl}
							alt="Dr. Scratch Certificate"
							className="mx-auto max-h-full"
						/>
					)}
				</div>

				{/* Modal Footer */}
				<div className="flex justify-end gap-3 border-t border-gray-200 p-4">
					<a
						href={certificateUrl}
						download={`${projectTitle.replace(/\s+/g, "_")}_certificate.pdf`}
						className="rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 hover:text-white"
					>
						Download Certificate
					</a>
					<button
						onClick={onClose}
						className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Close
					</button>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default CertificateModal;
