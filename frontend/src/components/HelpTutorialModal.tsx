import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface HelpTutorialModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const HelpTutorialModal = ({ isOpen, onClose }: HelpTutorialModalProps) => {
	const [activeTab, setActiveTab] = useState<"general" | "scratch">(
		"general",
	);

	if (!isOpen) return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onClose}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
		>
			<motion.div
				initial={{ scale: 0.5, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.5, opacity: 0 }}
				onClick={(e) => e.stopPropagation()}
				className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
			>
				<button
					onClick={onClose}
					className="absolute right-4 top-4 rounded-full bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-300"
				>
					<X size={20} />
				</button>

				<h2 className="mb-6 text-center text-3xl font-bold text-[var(--color-primary)]">
					Need Help?
				</h2>

				{/* Tab buttons */}
				<div className="mb-6 flex justify-center space-x-4">
					<button
						onClick={() => setActiveTab("general")}
						className={`rounded-lg px-4 py-2 font-semibold transition-all ${
							activeTab === "general"
								? "bg-[var(--color-primary)] text-white"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						Project Upload Tutorial
					</button>
					<button
						onClick={() => setActiveTab("scratch")}
						className={`rounded-lg px-4 py-2 font-semibold transition-all ${
							activeTab === "scratch"
								? "bg-[var(--color-primary)] text-white"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						Dr. Scratch Guide
					</button>
				</div>

				{/* Tab content */}
				{activeTab === "general" ? (
					<div className="space-y-8">
						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								🔎 Step 1: Go to codeclub.org
							</h3>
							<p className="text-gray-700">
								Access:{" "}
								<a
									href="https://codeclub.org"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-500 hover:underline"
								>
									https://codeclub.org
								</a>
							</p>
							<p className="mt-2 text-gray-700">
								Click the Start coding button and choose a
								Learning Path.
							</p>
							<div className="mt-4 overflow-hidden rounded-lg">
								<img
									src="/src/assets/tutorial/1.png"
									alt="Step 1"
									className="w-full shadow-lg"
								/>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								📝 Step 2: Choose a Project Path
							</h3>
							<p className="text-gray-700">
								After choosing a learning path, you'll be
								redirected to projects.raspberrypi.org.
							</p>
							<p className="mt-2 text-gray-700">
								This is where your programming adventure begins!
							</p>
							<div className="mt-4 overflow-hidden rounded-lg">
								<img
									src="/src/assets/tutorial/2.png"
									alt="Step 2"
									className="w-full shadow-lg"
								/>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								🔥 Step 3: Complete the projects in the learning
								path
							</h3>
							<p className="text-gray-700">
								Follow the step-by-step instructions for each
								project.
							</p>
							<div className="mt-4 overflow-hidden rounded-lg">
								<img
									src="/src/assets/tutorial/3.png"
									alt="Step 3"
									className="w-full shadow-lg"
								/>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								💻 Step 4: Create the project in the editor
							</h3>
							<p className="text-gray-700">
								Use the online code editor provided by the
								platform.
							</p>
							<div className="mt-4 overflow-hidden rounded-lg">
								<img
									src="/src/assets/tutorial/4.png"
									alt="Step 4"
									className="w-full shadow-lg"
								/>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								🐍 Step 5: Write the project code
							</h3>
							<p className="text-gray-700">
								Develop your code directly in the editor. You
								can:
							</p>
							<ul className="ml-6 mt-2 list-disc text-gray-700">
								<li>
									Save your project file (.py, .html, etc).
								</li>
								<li>Or take a screenshot of your project.</li>
							</ul>
							<div className="mt-4 overflow-hidden rounded-lg">
								<img
									src="/src/assets/tutorial/5.png"
									alt="Step 5"
									className="w-full shadow-lg"
								/>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								📸 Step 6: Take a screenshot when your project
								is complete
							</h3>
							<p className="text-gray-700">
								Make sure you've saved a picture/screenshot of
								your completed project.
							</p>
							<div className="mt-4 overflow-hidden rounded-lg">
								<img
									src="/src/assets/tutorial/6.png"
									alt="Step 6"
									className="w-full shadow-lg"
								/>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								🚀 Step 7: Upload the project to the CodeClub
								UVT platform
							</h3>
							<ul className="ml-6 list-disc text-gray-700">
								<li>Click Add project.</li>
								<li>
									Fill in the title and a description of what
									you accomplished in your project.
								</li>
								<li>Upload the picture or project file.</li>
								<li>Click Submit!</li>
							</ul>
						</section>

						<section className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6">
							<h3 className="mb-2 text-xl font-semibold text-green-600">
								🏅 Congratulations!
							</h3>
							<p className="text-green-700">
								After approval, you'll receive badges for your
								activity!
							</p>
						</section>
					</div>
				) : (
					<div className="space-y-8">
						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								🧩 What is Dr. Scratch?
							</h3>
							<p className="text-gray-700">
								Dr. Scratch is a free online tool that analyzes
								your Scratch projects and provides feedback on
								your programming skills. It helps you understand
								how well you're using different programming
								concepts.
							</p>
							<div className="mt-4 overflow-hidden rounded-lg"></div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								🔍 Step 1: Create your Scratch project
							</h3>
							<p className="text-gray-700">
								First, create your project on the Scratch
								platform (
								<a
									href="https://scratch.mit.edu"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-500 hover:underline"
								>
									https://scratch.mit.edu
								</a>
								) and save it to your computer as an .sb3 file.
							</p>
							<div className="mt-4 overflow-hidden rounded-lg bg-blue-50 p-4">
								<p className="text-blue-700">
									<strong>Tip:</strong> In Scratch, click on
									File → Save to your computer to download
									your project as an .sb3 file.
								</p>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								🌐 Step 2: Visit Dr. Scratch website
							</h3>
							<p className="text-gray-700">
								Go to{" "}
								<a
									href="https://www.drscratch.org/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-500 hover:underline"
								>
									https://www.drscratch.org/
								</a>{" "}
								and click on "Analyze your project".
							</p>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								📤 Step 3: Upload your Scratch project
							</h3>
							<p className="text-gray-700">
								Upload your .sb3 file on the Dr. Scratch
								website. Click "Choose File" and select your
								Scratch project, then click "Analyze".
							</p>
							<div className="mt-4 overflow-hidden rounded-lg">
								<img
									src="/src/assets/tutorial/7.png"
									alt="Uploading to Dr. Scratch"
									className="w-full shadow-lg"
								/>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								📊 Step 4: Review your analysis results
							</h3>
							<p className="text-gray-700">
								Dr. Scratch will analyze your project and show
								you a detailed report on your programming
								skills. You'll receive a score and feedback on
								different computational thinking concepts.
							</p>
							<div className="mt-4 overflow-hidden rounded-lg">
								<img
									src="/src/assets/tutorial/8.png"
									alt="Dr. Scratch results"
									className="w-full shadow-lg"
								/>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								📄 Step 5: Save your certificate
							</h3>
							<p className="text-gray-700">
								Click on "Download Certificate" to get a PDF
								certificate showing your programming skills
								assessment. Save this certificate to your
								computer.
							</p>
							<div className="mt-4 overflow-hidden rounded-lg bg-yellow-50 p-4">
								<p className="text-yellow-700">
									<strong>Important:</strong> You'll need this
									certificate when uploading your Scratch
									project to the CodeClub platform.
								</p>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								🚀 Step 6: Upload your project and certificate
								to CodeClub
							</h3>
							<p className="text-gray-700">
								When adding your Scratch project to the CodeClub
								platform:
							</p>
							<ol className="ml-6 mt-2 list-decimal space-y-2 text-gray-700">
								<li>
									Click "Add Project" on the CodeClub platform
								</li>
								<li>
									Fill in your project details and upload your
									screenshot showing your completed project
								</li>
								<li>Upload your .sb3 Scratch project file</li>
								<li>
									The system will detect it's a Scratch
									project and ask for your Dr. Scratch
									certificate
								</li>
								<li>
									Upload the certificate PDF you downloaded
									from Dr. Scratch
								</li>
								<li>Submit your project for review</li>
							</ol>
							<div className="mt-4 overflow-hidden rounded-lg bg-green-50 p-4">
								<p className="text-green-700">
									<strong>Benefit:</strong> Projects with Dr.
									Scratch certificates are eligible for
									special badges and recognition!
								</p>
							</div>
						</section>

						<section className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
							<h3 className="mb-2 text-xl font-semibold text-blue-600">
								💡 Why use Dr. Scratch?
							</h3>
							<p className="text-blue-700">
								Using Dr. Scratch helps you understand your
								programming strengths and areas for improvement.
								The assessment shows your mastery of concepts
								like logic, data representation, user
								interactivity, and more. It's a great way to
								track your progress as you develop your coding
								skills!
							</p>
						</section>
					</div>
				)}
			</motion.div>
		</motion.div>
	);
};

export default HelpTutorialModal;
