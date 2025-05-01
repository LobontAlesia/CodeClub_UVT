import { ReactNode } from "react";
import { motion } from "framer-motion";

interface FormCardProps {
	title: string;
	icon?: ReactNode;
	children: ReactNode;
	widthClass?: string;
}

const FormCard = ({
	title,
	icon,
	children,
	widthClass = "max-w-xl",
}: FormCardProps) => {
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#f4fff7] to-white px-6 py-10">
			<motion.div
				className={`mx-auto ${widthClass}`}
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
			>
				<div className="mb-6 flex flex-col items-center text-center">
					{icon && (
						<div className="mb-2 text-[var(--color-primary)]">
							{icon}
						</div>
					)}
					<h1 className="text-4xl font-extrabold text-[var(--color-primary)]">
						{title}
					</h1>
				</div>
				<div className="space-y-6 rounded-xl bg-white p-6 shadow-xl">
					{children}
				</div>
			</motion.div>
		</div>
	);
};

export default FormCard;
