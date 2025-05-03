import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FiBook, FiAward, FiStar, FiClipboard } from "react-icons/fi";

const AdminToolsSection = () => {
	const navigate = useNavigate();

	return (
		<motion.section
			className="hover:shadow-2xl/60 mt-10 rounded-3xl bg-white p-8 shadow-2xl transition-all hover:-translate-y-1"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.4 }}
		>
			<div className="mb-6 flex items-center gap-3">
				<div className="rounded-xl bg-purple-50 p-2">
					<Wrench className="h-6 w-6 text-purple-600" />
				</div>
				<h2 className="text-2xl font-bold text-gray-800">
					Admin Tools
				</h2>
			</div>

			<div className="flex flex-col items-start">
				<p className="text-gray-600">
					Create courses and badges, review projects, and manage the
					platform's achievements system!
				</p>
				<div className="mt-6 flex w-full flex-wrap justify-center gap-4">
					<button
						onClick={() => navigate("/admin/create-course")}
						className="bg-500 group flex transform items-center gap-2 rounded-xl px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
					>
						<FiBook className="text-lg" /> Create Course
					</button>
					<button
						onClick={() => navigate("/admin/create-badge")}
						className="group flex transform items-center gap-2 rounded-xl bg-blue-500 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
					>
						<FiAward className="text-lg" /> Course Badge
					</button>
					<button
						onClick={() => navigate("/admin/create-external-badge")}
						className="group flex transform items-center gap-2 rounded-xl bg-purple-500 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
					>
						<FiStar className="text-lg" /> External Badge
					</button>
					<button
						onClick={() => navigate("/admin/project-reviews")}
						className="group flex transform items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 font-bold text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
					>
						<FiClipboard className="text-lg" /> Review Projects
					</button>
				</div>
			</div>
		</motion.section>
	);
};

export default AdminToolsSection;
