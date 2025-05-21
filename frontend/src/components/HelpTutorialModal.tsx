import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface HelpTutorialModalProps {
	isOpen: boolean;
	onClose: () => void;
}

// Translation content
const translations = {
	en: {
		title: "Need Help?",
		tabs: {
			general: "Project Upload Tutorial",
			scratch: "Dr. Scratch Guide",
		},
		generalContent: {
			step1: {
				title: "🔎 Step 1: Go to codeclub.org",
				text1: "Access:",
				text2: "Click the Start coding button and choose a Learning Path.",
			},
			step2: {
				title: "📝 Step 2: Choose a Project Path",
				text1: "After choosing a learning path, you'll be redirected to projects.raspberrypi.org.",
				text2: "This is where your programming adventure begins!",
			},
			step3: {
				title: "🔥 Step 3: Complete the projects in the learning path",
				text1: "Follow the step-by-step instructions for each project.",
			},
			step4: {
				title: "💻 Step 4: Create the project in the editor",
				text1: "Use the online code editor provided by the platform.",
			},
			step5: {
				title: "🐍 Step 5: Write the project code",
				text1: "Develop your code directly in the editor. You can:",
				items: [
					"Save your project file (.py, .html, etc).",
					"Or take a screenshot of your project.",
				],
			},
			step6: {
				title: "📸 Step 6: Take a screenshot when your project is complete",
				text1: "Make sure you've saved a picture/screenshot of your completed project.",
			},
			step7: {
				title: "🚀 Step 7: Upload the project to the CodeClub UVT platform",
				items: [
					"Click Add project.",
					"Fill in the title and a description of what you accomplished in your project.",
					"Upload the picture or project file.",
					"Click Submit!",
				],
			},
			congrats: {
				title: "🏅 Congratulations!",
				text1: "After approval, you'll receive badges for your activity!",
			},
		},
		scratchContent: {
			intro: {
				title: "🧩 What is Dr. Scratch?",
				text1: "Dr. Scratch is a free online tool that analyzes your Scratch projects and provides feedback on your programming skills. It helps you understand how well you're using different programming concepts.",
			},
			step1: {
				title: "🔍 Step 1: Create your Scratch project",
				text1: "First, create your project on the Scratch platform (",
				text2: ") and save it to your computer as an .sb3 file.",
				tip: "In Scratch, click on File → Save to your computer to download your project as an .sb3 file.",
			},
			step2: {
				title: "🌐 Step 2: Visit Dr. Scratch website",
				text1: "Go to",
				text2: 'and click on "Analyze your project".',
			},
			step3: {
				title: "📤 Step 3: Upload your Scratch project",
				text1: 'Upload your .sb3 file on the Dr. Scratch website. Click "Choose File" and select your Scratch project, then click "Analyze".',
			},
			step4: {
				title: "📊 Step 4: Review your analysis results",
				text1: "Dr. Scratch will analyze your project and show you a detailed report on your programming skills. You'll receive a score and feedback on different computational thinking concepts.",
			},
			step5: {
				title: "📄 Step 5: Save your certificate",
				text1: 'Click on "Download Certificate" to get a PDF certificate showing your programming skills assessment. Save this certificate to your computer.',
				important:
					"Important: You'll need this certificate when uploading your Scratch project to the CodeClub platform.",
			},
			step6: {
				title: "🚀 Step 6: Upload your project and certificate to CodeClub",
				text1: "When adding your Scratch project to the CodeClub platform:",
				items: [
					'Click "Add Project" on the CodeClub platform',
					"Fill in your project details and upload your screenshot showing your completed project",
					"Upload your .sb3 Scratch project file",
					"The system will detect it's a Scratch project and ask for your Dr. Scratch certificate",
					"Upload the certificate PDF you downloaded from Dr. Scratch",
					"Submit your project for review",
				],
				benefit:
					"Benefit: Projects with Dr. Scratch certificates are eligible for special badges and recognition!",
			},
			why: {
				title: "💡 Why use Dr. Scratch?",
				text1: "Using Dr. Scratch helps you understand your programming strengths and areas for improvement. The assessment shows your mastery of concepts like logic, data representation, user interactivity, and more. It's a great way to track your progress as you develop your coding skills!",
			},
		},
	},
	ro: {
		title: "Ai nevoie de ajutor?",
		tabs: {
			general: "Tutorial încărcare proiect",
			scratch: "Ghid Dr. Scratch",
		},
		generalContent: {
			step1: {
				title: "🔎 Pasul 1: Accesează codeclub.org",
				text1: "Accesează:",
				text2: "Apasă butonul Start coding și alege un traseu de învățare.",
			},
			step2: {
				title: "📝 Pasul 2: Alege un traseu de proiecte",
				text1: "După ce alegi un traseu de învățare, vei fi redirecționat la projects.raspberrypi.org.",
				text2: "Aici începe aventura ta de programare!",
			},
			step3: {
				title: "🔥 Pasul 3: Completează proiectele din traseul de învățare",
				text1: "Urmează instrucțiunile pas cu pas pentru fiecare proiect.",
			},
			step4: {
				title: "💻 Pasul 4: Creează proiectul în editor",
				text1: "Folosește editorul de cod online oferit de platformă.",
			},
			step5: {
				title: "🐍 Pasul 5: Scrie codul proiectului",
				text1: "Dezvoltă codul tău direct în editor. Poți:",
				items: [
					"Salvează fișierul proiectului (.py, .html, etc).",
					"Sau fă un screenshot al proiectului tău.",
				],
			},
			step6: {
				title: "📸 Pasul 6: Fă un screenshot când proiectul este finalizat",
				text1: "Asigură-te că ai salvat o imagine/screenshot al proiectului finalizat.",
			},
			step7: {
				title: "🚀 Pasul 7: Încarcă proiectul pe platforma CodeClub UVT",
				items: [
					"Apasă pe Adaugă proiect.",
					"Completează titlul și o descriere a ceea ce ai realizat în proiectul tău.",
					"Încarcă imaginea sau fișierul proiectului.",
					"Apasă pe Trimite!",
				],
			},
			congrats: {
				title: "🏅 Felicitări!",
				text1: "După aprobare, vei primi insigne pentru activitatea ta!",
			},
		},
		scratchContent: {
			intro: {
				title: "🧩 Ce este Dr. Scratch?",
				text1: "Dr. Scratch este un instrument online gratuit care analizează proiectele tale Scratch și oferă feedback despre abilitățile tale de programare. Te ajută să înțelegi cât de bine folosești diferite concepte de programare.",
			},
			step1: {
				title: "🔍 Pasul 1: Creează proiectul tău Scratch",
				text1: "Mai întâi, creează proiectul tău pe platforma Scratch (",
				text2: ") și salvează-l pe calculator ca fișier .sb3.",
				tip: "În Scratch, apasă pe File → Save to your computer pentru a descărca proiectul tău ca fișier .sb3.",
			},
			step2: {
				title: "🌐 Pasul 2: Vizitează site-ul Dr. Scratch",
				text1: "Accesează",
				text2: 'și apasă pe "Analyze your project".',
			},
			step3: {
				title: "📤 Pasul 3: Încarcă proiectul tău Scratch",
				text1: 'Încarcă fișierul tău .sb3 pe site-ul Dr. Scratch. Apasă pe "Choose File" și selectează proiectul tău Scratch, apoi apasă pe "Analyze".',
			},
			step4: {
				title: "📊 Pasul 4: Revizuiește rezultatele analizei",
				text1: "Dr. Scratch va analiza proiectul tău și îți va arăta un raport detaliat despre abilitățile tale de programare. Vei primi un scor și feedback referitor la diferite concepte de gândire computațională.",
			},
			step5: {
				title: "📄 Pasul 5: Salvează certificatul",
				text1: 'Apasă pe "Download Certificate" pentru a obține un certificat PDF care arată evaluarea abilităților tale de programare. Salvează acest certificat pe calculatorul tău.',
				important:
					"Important: Vei avea nevoie de acest certificat când încarci proiectul tău Scratch pe platforma CodeClub.",
			},
			step6: {
				title: "🚀 Pasul 6: Încarcă proiectul și certificatul pe CodeClub",
				text1: "Când adaugi proiectul tău Scratch pe platforma CodeClub:",
				items: [
					'Apasă pe "Adaugă proiect" pe platforma CodeClub',
					"Completează detaliile proiectului și încarcă screenshot-ul care arată proiectul tău finalizat",
					"Încarcă fișierul proiectului tău Scratch .sb3",
					"Sistemul va detecta că este un proiect Scratch și va cere certificatul tău Dr. Scratch",
					"Încarcă certificatul PDF pe care l-ai descărcat de la Dr. Scratch",
					"Trimite proiectul pentru evaluare",
				],
				benefit:
					"Beneficiu: Proiectele cu certificate Dr. Scratch sunt eligibile pentru insigne și recunoaștere speciale!",
			},
			why: {
				title: "💡 De ce să folosești Dr. Scratch?",
				text1: "Folosirea Dr. Scratch te ajută să înțelegi punctele tale forte de programare și zonele de îmbunătățit. Evaluarea arată măiestria ta în concepte precum logica, reprezentarea datelor, interactivitatea cu utilizatorul și multe altele. Este o modalitate excelentă de a-ți urmări progresul pe măsură ce îți dezvolți abilitățile de programare!",
			},
		},
	},
};

const HelpTutorialModal = ({ isOpen, onClose }: HelpTutorialModalProps) => {
	const [activeTab, setActiveTab] = useState<"general" | "scratch">(
		"general",
	);
	const [language, setLanguage] = useState<"en" | "ro">("en");

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
				<div className="mb-6 flex justify-between">
					{/* Language Selector */}
					<div className="flex items-center space-x-2">
						<button
							onClick={() => setLanguage("ro")}
							className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 p-0 transition-all ${language === "ro" ? "border-[var(--color-primary)] shadow-md ring-1 ring-[var(--color-primary)] ring-opacity-50" : "border-gray-200"}`}
							title="Română"
						>
							<img
								src="/ro-flag.svg"
								alt="Romanian Flag"
								className="h-full w-full object-cover"
							/>
						</button>
						<button
							onClick={() => setLanguage("en")}
							className={`flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 p-0 transition-all ${language === "en" ? "border-[var(--color-primary)] shadow-md ring-1 ring-[var(--color-primary)] ring-opacity-50" : "border-gray-200"}`}
							title="English"
						>
							<img
								src="/en-flag.svg"
								alt="English Flag"
								className="h-full w-full object-cover"
							/>
						</button>
					</div>

					<button
						onClick={onClose}
						className="rounded-full bg-gray-200 p-2 text-gray-600 transition-colors hover:bg-gray-300"
					>
						<X size={20} />
					</button>
				</div>

				<h2 className="mb-6 text-center text-3xl font-bold text-[var(--color-primary)]">
					{language === "en" ? "Need Help?" : "Ai nevoie de ajutor?"}
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
						{language === "en"
							? "Project Upload Tutorial"
							: "Tutorial încărcare proiect"}
					</button>
					<button
						onClick={() => setActiveTab("scratch")}
						className={`rounded-lg px-4 py-2 font-semibold transition-all ${
							activeTab === "scratch"
								? "bg-[var(--color-primary)] text-white"
								: "bg-gray-100 text-gray-600 hover:bg-gray-200"
						}`}
					>
						{language === "en"
							? "Dr. Scratch Guide"
							: "Ghid Dr. Scratch"}
					</button>
				</div>

				{/* Tab content */}
				{activeTab === "general" ? (
					<div className="space-y-8">
						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								{
									translations[language].generalContent.step1
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].generalContent.step1
										.text1
								}{" "}
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
								{
									translations[language].generalContent.step1
										.text2
								}
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
								{
									translations[language].generalContent.step2
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].generalContent.step2
										.text1
								}
							</p>
							<p className="mt-2 text-gray-700">
								{
									translations[language].generalContent.step2
										.text2
								}
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
								{
									translations[language].generalContent.step3
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].generalContent.step3
										.text1
								}
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
								{
									translations[language].generalContent.step4
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].generalContent.step4
										.text1
								}
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
								{
									translations[language].generalContent.step5
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].generalContent.step5
										.text1
								}
							</p>
							<ul className="ml-6 mt-2 list-disc text-gray-700">
								{translations[
									language
								].generalContent.step5.items.map(
									(item, idx) => (
										<li key={idx}>{item}</li>
									),
								)}
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
								{
									translations[language].generalContent.step6
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].generalContent.step6
										.text1
								}
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
								{
									translations[language].generalContent.step7
										.title
								}
							</h3>
							<ul className="ml-6 list-disc text-gray-700">
								{translations[
									language
								].generalContent.step7.items.map(
									(item, idx) => (
										<li key={idx}>{item}</li>
									),
								)}
							</ul>
						</section>

						<section className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6">
							<h3 className="mb-2 text-xl font-semibold text-green-600">
								{
									translations[language].generalContent
										.congrats.title
								}
							</h3>
							<p className="text-green-700">
								{
									translations[language].generalContent
										.congrats.text1
								}
							</p>
						</section>
					</div>
				) : (
					<div className="space-y-8">
						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								{
									translations[language].scratchContent.intro
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].scratchContent.intro
										.text1
								}
							</p>
							<div className="mt-4 overflow-hidden rounded-lg"></div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								{
									translations[language].scratchContent.step1
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].scratchContent.step1
										.text1
								}
								<a
									href="https://scratch.mit.edu"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-500 hover:underline"
								>
									https://scratch.mit.edu
								</a>
								{
									translations[language].scratchContent.step1
										.text2
								}
							</p>
							<div className="mt-4 overflow-hidden rounded-lg bg-blue-50 p-4">
								<p className="text-blue-700">
									<strong>
										{language === "en" ? "Tip:" : "Sfat:"}
									</strong>{" "}
									{
										translations[language].scratchContent
											.step1.tip
									}
								</p>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								{
									translations[language].scratchContent.step2
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].scratchContent.step2
										.text1
								}{" "}
								<a
									href="https://www.drscratch.org/"
									target="_blank"
									rel="noopener noreferrer"
									className="text-blue-500 hover:underline"
								>
									https://www.drscratch.org/
								</a>{" "}
								{
									translations[language].scratchContent.step2
										.text2
								}
							</p>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								{
									translations[language].scratchContent.step3
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].scratchContent.step3
										.text1
								}
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
								{
									translations[language].scratchContent.step4
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].scratchContent.step4
										.text1
								}
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
								{
									translations[language].scratchContent.step5
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].scratchContent.step5
										.text1
								}
							</p>
							<div className="mt-4 overflow-hidden rounded-lg bg-yellow-50 p-4">
								<p className="text-yellow-700">
									<strong>
										{language === "en"
											? "Important:"
											: "Important:"}
									</strong>{" "}
									{
										translations[language].scratchContent
											.step5.important
									}
								</p>
							</div>
						</section>

						<section>
							<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
								{
									translations[language].scratchContent.step6
										.title
								}
							</h3>
							<p className="text-gray-700">
								{
									translations[language].scratchContent.step6
										.text1
								}
							</p>
							<ol className="ml-6 mt-2 list-decimal space-y-2 text-gray-700">
								{translations[
									language
								].scratchContent.step6.items.map(
									(item, idx) => (
										<li key={idx}>{item}</li>
									),
								)}
							</ol>
							<div className="mt-4 overflow-hidden rounded-lg bg-green-50 p-4">
								<p className="text-green-700">
									<strong>
										{language === "en"
											? "Benefit:"
											: "Beneficiu:"}
									</strong>{" "}
									{
										translations[language].scratchContent
											.step6.benefit
									}
								</p>
							</div>
						</section>

						<section className="rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
							<h3 className="mb-2 text-xl font-semibold text-blue-600">
								{
									translations[language].scratchContent.why
										.title
								}
							</h3>
							<p className="text-blue-700">
								{
									translations[language].scratchContent.why
										.text1
								}
							</p>
						</section>
					</div>
				)}
			</motion.div>
		</motion.div>
	);
};

export default HelpTutorialModal;
