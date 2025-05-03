import { motion } from "framer-motion";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { BookOpen } from "lucide-react";
import "react-circular-progressbar/dist/styles.css";

interface DigitalPassportSectionProps {
	completedCourses: number;
	totalCourses: number;
	badgesCount: number;
	lastActivityName?: string;
	lastActivityDate?: string;
	portfolioCount: number;
}

const DigitalPassportSection = ({
	completedCourses,
	totalCourses,
	badgesCount,
	lastActivityName,
	lastActivityDate,
	portfolioCount,
}: DigitalPassportSectionProps) => {
	const progressPercentage =
		totalCourses > 0
			? Math.round((completedCourses / totalCourses) * 100)
			: 0;

	return (
		<motion.section
			className="hover:shadow-2xl/60 rounded-3xl bg-white p-8 shadow-2xl transition-all hover:-translate-y-1"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
		>
			<div className="mb-4 flex items-center gap-3">
				<div className="rounded-xl bg-green-50 p-2">
					<BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
				</div>
				<h2 className="text-2xl font-bold text-gray-800">
					Digital Passport
				</h2>
			</div>

			<div className="flex flex-col gap-8 sm:flex-row sm:items-center">
				<div className="relative h-32 w-32 flex-shrink-0">
					<CircularProgressbar
						value={progressPercentage}
						text={`${progressPercentage}%`}
						styles={buildStyles({
							textSize: "16px",
							pathColor: "var(--color-primary)",
							textColor: "#1a1a1a",
							trailColor: "#e6e6e6",
						})}
					/>
					<div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
						<p className="mt-2 text-center text-sm font-medium text-gray-500">
							Course Progress
						</p>
					</div>
				</div>

				<div className="flex-1">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div className="rounded-2xl bg-green-50 p-4">
							<p className="text-sm font-medium text-gray-500">
								Courses Completed
							</p>
							<p className="mt-1 text-2xl font-bold text-gray-800">
								{completedCourses}
								<span className="text-base font-normal text-gray-500">
									/{totalCourses}
								</span>
							</p>
						</div>

						<div className="rounded-2xl bg-blue-50 p-4">
							<p className="text-sm font-medium text-gray-500">
								Total Badges
							</p>
							<p className="mt-1 text-2xl font-bold text-gray-800">
								{badgesCount}
							</p>
						</div>

						<div className="rounded-2xl bg-purple-50 p-4">
							<p className="text-sm font-medium text-gray-500">
								Portfolio Projects
							</p>
							<p className="mt-1 text-2xl font-bold text-gray-800">
								{portfolioCount}
							</p>
						</div>

						{lastActivityName && (
							<div className="rounded-2xl bg-amber-50 p-4">
								<p className="text-sm font-medium text-gray-500">
									Last Activity
								</p>
								<p className="mt-1 font-medium text-gray-800">
									{lastActivityName}
									{lastActivityDate && (
										<span className="block text-sm text-gray-500">
											{new Date(
												lastActivityDate,
											).toLocaleDateString()}
										</span>
									)}
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</motion.section>
	);
};

export default DigitalPassportSection;
