import { motion } from "framer-motion";
import { Medal, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PortfolioSection = () => {
	const navigate = useNavigate();

	return (
		<motion.section
			className="hover:shadow-2xl/60 mt-10 rounded-3xl bg-white p-8 shadow-2xl transition-all hover:-translate-y-1"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<div className="mb-6 flex items-center gap-3">
				<div className="rounded-xl bg-purple-50 p-2">
					<Medal className="h-6 w-6 text-purple-600" />
				</div>
				<h2 className="text-2xl font-bold text-gray-800">
					My Portfolio
				</h2>
			</div>

			<div className="flex flex-col items-start">
				<p className="text-gray-600">
					Showcase your amazing projects, get feedback from mentors,
					and earn special badges for your achievements!
				</p>
				<button
					onClick={() => navigate("/my-projects")}
					className="group mt-6 flex transform items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
				>
					View My Projects
					<ChevronRight className="transition-transform group-hover:translate-x-1" />
				</button>
			</div>
		</motion.section>
	);
};

export default PortfolioSection;
