import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import robotSvg from "../../assets/robot.svg";
import confetti from "canvas-confetti";

type FeedbackType = "correct" | "incorrect" | "encouragement" | "completion";

interface FeedbackPopupProps {
	isVisible: boolean;
	type: FeedbackType;
	onClose: () => void;
	autoCloseDelay?: number;
}

const messages = {
	correct: [
		"Great job! You got it right! 🎉",
		"Amazing work! That's correct! ⭐",
		"Brilliant! Keep it up! 💪",
		"You're on fire! That's right! 🔥",
	],
	incorrect: [
		"Not quite right, but keep trying! 💡",
		"You can do this! Try again! 🚀",
		"Almost there! Give it another shot! 🎯",
		"Don't give up! You're learning! 📚",
	],
	encouragement: [
		"You're doing great! Keep going! 🌟",
		"You've got this! I believe in you! 💯",
		"Keep up the good work! You're awesome! 🤩",
		"You're making progress! Keep it up! 📈",
	],
	completion: [
		"Congratulations on completing the quiz! 🏆",
		"Well done! You've finished the challenge! 🎊",
		"You made it to the end! Great effort! 🥇",
		"Awesome job completing the quiz! 🌈",
	],
};

// Emoji reactions that will float around the robot
const emojiReactions = {
	correct: ["🎉", "⭐", "✅", "👏", "🥳", "💯"],
	incorrect: ["💪", "🧠", "🔄", "📚", "💡", "🚀"],
	encouragement: ["✨", "🌟", "💪", "🙌", "👍", "🎯"],
	completion: ["🏆", "🎊", "🥇", "🌈", "🎖️", "🎯"],
};

export default function FeedbackPopup({
	isVisible,
	type,
	onClose,
	autoCloseDelay = 3000,
}: FeedbackPopupProps) {
	const [message, setMessage] = useState("");
	const [emojisToShow, setEmojisToShow] = useState<string[]>([]);

	useEffect(() => {
		if (isVisible) {
			// Pick a random message from the appropriate category
			const options = messages[type];
			const randomMessage =
				options[Math.floor(Math.random() * options.length)];
			setMessage(randomMessage);

			// Set random emojis for this feedback
			const typeEmojis = emojiReactions[type];
			// Pick 3 random emojis from the set
			const selectedEmojis = [...typeEmojis]
				.sort(() => 0.5 - Math.random())
				.slice(0, 3);
			setEmojisToShow(selectedEmojis);

			// Trigger confetti for correct answers and completion
			if (type === "correct" || type === "completion") {
				setTimeout(() => {
					triggerConfetti(type === "completion");
				}, 300);
			}

			// Play sound effect
			playFeedbackSound(type);

			// Auto close after delay
			const timer = setTimeout(() => {
				onClose();
			}, autoCloseDelay);

			return () => clearTimeout(timer);
		}
	}, [isVisible, type, onClose, autoCloseDelay]);

	// Function to play sound based on feedback type
	const playFeedbackSound = (feedbackType: FeedbackType) => {
		// You can implement actual sound playback here when assets are available
		// For example with Howler.js or native Audio API
		console.log(`Playing ${feedbackType} sound`);

		// Example of how you would play a sound:
		// const sound = new Audio(`/sounds/${feedbackType}.mp3`);
		// sound.play();
	};

	// Function to trigger confetti effect
	const triggerConfetti = (isCompletion = false) => {
		const particleCount = isCompletion ? 200 : 80;

		confetti({
			particleCount,
			spread: 70,
			origin: { y: 0.6 },
			colors: [
				"#26ccff",
				"#a25afd",
				"#ff5e7e",
				"#88ff5a",
				"#fcff42",
				"#ffa62d",
			],
			disableForReducedMotion: true,
			zIndex: 9999,
			gravity: 0.8,
			drift: 0,
			scalar: 0.9,
		});

		// For completion, add another burst after a delay
		if (isCompletion) {
			setTimeout(() => {
				confetti({
					particleCount: 100,
					angle: 60,
					spread: 80,
					origin: { x: 0 },
					colors: ["#26ccff", "#a25afd", "#ff5e7e"],
				});

				confetti({
					particleCount: 100,
					angle: 120,
					spread: 80,
					origin: { x: 1 },
					colors: ["#88ff5a", "#fcff42", "#ffa62d"],
				});
			}, 500);
		}
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={onClose}
				>
					<div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" />
					<motion.div
						className="relative z-10 max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
						initial={{ scale: 0.8, y: 50 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.8, y: 50 }}
						transition={{
							type: "spring",
							damping: 20,
							stiffness: 300,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-6 text-center">
							{/* Robot container with floating emojis */}
							<div className="relative mx-auto mb-4 h-36 w-36">
								{/* Animated robot */}
								<motion.div
									className="h-full w-full"
									initial={{ rotate: -10 }}
									animate={{
										rotate: [
											type === "incorrect" ? -5 : -8,
											type === "incorrect" ? 5 : 8,
										],
										y: [
											0,
											type === "correct" ? -10 : -5,
											0,
										],
									}}
									transition={{
										rotate: {
											repeat: Infinity,
											repeatType: "reverse",
											duration:
												type === "incorrect"
													? 0.5
													: 0.8,
										},
										y: {
											repeat: Infinity,
											repeatType: "reverse",
											duration: 1.5,
											ease: "easeInOut",
										},
									}}
								>
									<img
										src={robotSvg}
										alt="Robot assistant"
										className="h-full w-full"
									/>
								</motion.div>

								{/* Floating emojis around robot */}
								{emojisToShow.map((emoji, index) => (
									<motion.div
										key={index}
										className="absolute text-2xl"
										initial={{
											opacity: 0,
											scale: 0.5,
											x: 0,
											y: 0,
										}}
										animate={{
											opacity: [0, 1, 0],
											scale: [0.5, 1.2, 0.8],
											// Position alternating left and right
											x:
												index % 2 === 0
													? [
															-60 - index * 5,
															-75 - index * 10,
														] // Left side - moved further left
													: [
															30 + index * 5,
															45 + index * 10,
														], // Right side
											y: [-5, -20 - index * 5],
										}}
										transition={{
											duration: 2,
											repeat: Infinity,
											repeatType: "loop",
											delay: index * 0.4,
										}}
										style={{
											top: "40%", // Positioned at middle of robot
											left: "50%", // Center horizontally initially
										}}
									>
										{emoji}
									</motion.div>
								))}
							</div>

							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
							>
								<motion.h2
									className="text-2xl font-bold text-[var(--color-primary)]"
									animate={{
										scale:
											type === "correct" ||
											type === "completion"
												? [1, 1.1, 1]
												: 1,
									}}
									transition={{
										duration: 0.5,
										repeat:
											type === "correct" ||
											type === "completion"
												? 2
												: 0,
										repeatType: "reverse",
									}}
								>
									{type === "correct"
										? "Correct!"
										: type === "incorrect"
											? "Not quite!"
											: type === "completion"
												? "Amazing!"
												: "Hey there!"}
								</motion.h2>

								<motion.p
									className="mt-3 text-lg"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.4 }}
								>
									{message}
								</motion.p>
							</motion.div>

							<motion.button
								className="mt-6 rounded-xl bg-[var(--color-primary)] px-6 py-2 font-semibold text-white transition hover:bg-opacity-90"
								whileHover={{
									scale: 1.05,
									boxShadow:
										"0px 5px 15px rgba(0, 0, 0, 0.1)",
								}}
								whileTap={{ scale: 0.98 }}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.6 }}
								onClick={onClose}
							>
								Continue
							</motion.button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
