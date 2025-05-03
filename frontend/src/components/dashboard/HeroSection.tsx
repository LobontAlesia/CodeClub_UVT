import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import robotImage from "../../assets/robot.svg";

const messages = [
	"Hi bestie! Keep coding today 💻",
	"Every bug is a lesson 🐞",
	"Python is fun, right? 🐍",
	"You're doing amazing, keep it up! 🚀",
	"Transform your dreams into code ✨",
	"	-.-. --- -.. . / --- -.",
	"Track your progress and badges 🏅",
	"Every lesson takes you one step closer!",
	"Your progress is the key to success 🔑",
	"Learn, code, conquer! 💡",
	"	-.- . . .--. / --. --- .. -. --.",
];

const HeroSection = () => {
	const [message, setMessage] = useState("");
	const [displayText, setDisplayText] = useState("");
	const [textIndex, setTextIndex] = useState(0);

	useEffect(() => {
		const randomIndex = Math.floor(Math.random() * messages.length);
		const selectedMessage = messages[randomIndex];
		setMessage(selectedMessage);
		setDisplayText("");
		setTextIndex(0);
	}, []);

	useEffect(() => {
		if (textIndex < message.length) {
			const timeout = setTimeout(() => {
				setDisplayText((prev) => prev + message[textIndex]);
				setTextIndex(textIndex + 1);
			}, 50);
			return () => clearTimeout(timeout);
		}
	}, [message, textIndex]);

	return (
		<motion.section
			className="mb-10 mt-10 flex items-center justify-center gap-4"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.2 }}
		>
			{/* Robot animat */}
			<motion.img
				src={robotImage}
				alt="Robot"
				className="h-24 w-24 md:h-32 md:w-32"
				animate={{
					y: [0, -5, 0],
					rotate: [0, -3, 3, 0],
				}}
				transition={{
					duration: 3,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Speech bubble ca terminal */}
			<div className="relative max-w-md">
				<div className="relative min-h-[3rem] rounded-xl border border-green-500/30 bg-gray-900/95 px-6 py-4 font-mono text-lg text-green-400 shadow-lg shadow-green-500/10 backdrop-blur-sm">
					{/* Terminal header */}
					<div className="absolute left-0 top-0 flex w-full items-center gap-2 border-b border-green-500/20 px-4 py-1">
						<div className="flex gap-1.5">
							<div className="h-2.5 w-2.5 rounded-full bg-red-500/70"></div>
							<div className="h-2.5 w-2.5 rounded-full bg-yellow-500/70"></div>
							<div className="h-2.5 w-2.5 rounded-full bg-green-500/70"></div>
						</div>
					</div>
					{/* Terminal content */}
					<div className="mt-4 text-white">
						<span>{displayText}</span>
					</div>
				</div>
				<div className="absolute left-[-10px] top-7 h-0 w-0 border-b-[12px] border-r-[12px] border-t-[12px] border-b-transparent border-r-gray-900/95 border-t-transparent"></div>
			</div>
		</motion.section>
	);
};

export default HeroSection;
