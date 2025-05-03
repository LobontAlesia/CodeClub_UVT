import { motion } from "framer-motion";

interface WelcomeSectionProps {
	name: string;
	role: string | null;
}

const WelcomeSection = ({ name, role }: WelcomeSectionProps) => {
	return (
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
					? "Let's continue your learning journey!"
					: "Manage and empower learners' journeys!"}
			</p>
		</motion.div>
	);
};

export default WelcomeSection;
