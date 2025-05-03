import { motion } from "framer-motion";
import { X } from "lucide-react";

interface HelpTutorialModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const HelpTutorialModal = ({ isOpen, onClose }: HelpTutorialModalProps) => {
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
					Tutorial: Cum să încarci un proiect după ce finalizezi un
					learning path CodeClub
				</h2>

				<div className="space-y-8">
					<section>
						<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
							🔎 Pasul 1: Intră pe pagina codeclub.org
						</h3>
						<p className="text-gray-700">
							Accesează:{" "}
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
							Apasă pe butonul Start coding și alege un Learning
							Path.
						</p>
						<div className="mt-4 overflow-hidden rounded-lg">
							<img
								src="/src/assets/tutorial/1.png"
								alt="Pasul 1"
								className="w-full shadow-lg"
							/>
						</div>
					</section>

					<section>
						<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
							📝 Pasul 2: Alege un Project Path
						</h3>
						<p className="text-gray-700">
							După ce alegi un learning path, vei fi redirecționat
							pe projects.raspberrypi.org.
						</p>
						<p className="mt-2 text-gray-700">
							Aici începe aventura ta de programare!
						</p>
						<div className="mt-4 overflow-hidden rounded-lg">
							<img
								src="/src/assets/tutorial/2.png"
								alt="Pasul 2"
								className="w-full shadow-lg"
							/>
						</div>
					</section>

					<section>
						<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
							🔥 Pasul 3: Completează proiectele din learning path
						</h3>
						<p className="text-gray-700">
							Urmează instrucțiunile pas cu pas pentru fiecare
							proiect.
						</p>
						<div className="mt-4 overflow-hidden rounded-lg">
							<img
								src="/src/assets/tutorial/3.png"
								alt="Pasul 3"
								className="w-full shadow-lg"
							/>
						</div>
					</section>

					<section>
						<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
							💻 Pasul 4: Creează proiectul în editor
						</h3>
						<p className="text-gray-700">
							Folosește code editorul online oferit de platformă.
						</p>
						<div className="mt-4 overflow-hidden rounded-lg">
							<img
								src="/src/assets/tutorial/4.png"
								alt="Pasul 4"
								className="w-full shadow-lg"
							/>
						</div>
					</section>

					<section>
						<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
							🐍 Pasul 5: Scrie codul proiectului
						</h3>
						<p className="text-gray-700">
							Realizează codul direct în editor. Poți să:
						</p>
						<ul className="ml-6 mt-2 list-disc text-gray-700">
							<li>
								Salvezi fișierul proiectului (.py, .html, etc).
							</li>
							<li>
								Sau să faci o poză cu ecranul proiectului
								(screenshot).
							</li>
						</ul>
						<div className="mt-4 overflow-hidden rounded-lg">
							<img
								src="/src/assets/tutorial/5.png"
								alt="Pasul 5"
								className="w-full shadow-lg"
							/>
						</div>
					</section>

					<section>
						<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
							📸 Pasul 6: Fă un screenshot la finalizarea
							proiectului
						</h3>
						<p className="text-gray-700">
							Asigură-te că ai salvat o poză/screenshot cu
							proiectul tău finalizat.
						</p>
						<div className="mt-4 overflow-hidden rounded-lg">
							<img
								src="/src/assets/tutorial/6.png"
								alt="Pasul 6"
								className="w-full shadow-lg"
							/>
						</div>
					</section>

					<section>
						<h3 className="mb-2 text-xl font-semibold text-[var(--color-primary)]">
							🚀 Pasul 7: Încarcă proiectul pe platforma CodeClub
							UVT
						</h3>
						<ul className="ml-6 list-disc text-gray-700">
							<li>Apasă Adaugă proiect.</li>
							<li>
								Completează titlul și descriere a ceea ce ai
								realizat in proiectul tău.
							</li>
							<li>Încarcă poza sau fișierul proiectului.</li>
							<li>Apasă Trimite!</li>
						</ul>
					</section>

					<section className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6">
						<h3 className="mb-2 text-xl font-semibold text-green-600">
							🏅 Felicitări!
						</h3>
						<p className="text-green-700">
							După aprobare, vei primi insigne pentru activitatea
							ta!
						</p>
					</section>
				</div>
			</motion.div>
		</motion.div>
	);
};

export default HelpTutorialModal;
