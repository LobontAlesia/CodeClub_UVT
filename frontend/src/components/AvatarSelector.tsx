import { useState } from "react";
import { UserX } from "lucide-react";

// Animal avatars data with computer science themed names
const avatars = [
	{ id: "frog", src: "/src/assets/avatars/frog.svg", alt: "Algorithm Frog" },
	{
		id: "giraffe",
		src: "/src/assets/avatars/giraffe.svg",
		alt: "Stack Giraffe",
	},
	{
		id: "hedgehog",
		src: "/src/assets/avatars/hedgehog.svg",
		alt: "Secure Hedgehog",
	},
	{ id: "koala", src: "/src/assets/avatars/koala.svg", alt: "Coder Koala" },
	{ id: "llama", src: "/src/assets/avatars/llama.svg", alt: "Logic Llama" },
	{ id: "tiger", src: "/src/assets/avatars/tiger.svg", alt: "Syntax Tiger" },
	{ id: "zebra", src: "/src/assets/avatars/zebra.svg", alt: "Binary Zebra" },
];

interface AvatarSelectorProps {
	selectedAvatar: string | null;
	onChange: (avatar: string) => void;
}

const AvatarSelector = ({ selectedAvatar, onChange }: AvatarSelectorProps) => {
	const [showSelector, setShowSelector] = useState(false);

	return (
		<div className="avatar-selector">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-lg font-medium text-gray-700">
					Choose Your Avatar
				</h3>
				<button
					type="button"
					onClick={() => setShowSelector(!showSelector)}
					className="rounded-md bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-200"
				>
					{showSelector ? "Hide Avatars" : "Show Avatars"}
				</button>
			</div>
			{showSelector && (
				<div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
					{/* No avatar option */}
					<div
						key="no-avatar"
						onClick={() => {
							onChange("");
							setShowSelector(false);
						}}
						className={`cursor-pointer overflow-hidden rounded-lg p-2 transition-all hover:scale-105 hover:shadow-md ${
							selectedAvatar === "" || selectedAvatar === null
								? "ring-2 ring-green-500 ring-offset-2"
								: "border border-gray-200"
						}`}
					>
						{" "}
						<div className="flex flex-col items-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 sm:h-20 sm:w-20">
								<UserX size={24} className="text-gray-400" />
							</div>
							<span className="mt-2 text-center text-sm font-medium text-gray-700">
								No Avatar
							</span>
						</div>
					</div>

					{avatars.map((avatar) => (
						<div
							key={avatar.id}
							onClick={() => {
								onChange(avatar.id);
								setShowSelector(false);
							}}
							className={`cursor-pointer overflow-hidden rounded-lg p-2 transition-all hover:scale-105 hover:shadow-md ${
								selectedAvatar === avatar.id
									? "ring-2 ring-green-500 ring-offset-2"
									: "border border-gray-200"
							}`}
						>
							<div className="flex flex-col items-center">
								<img
									src={avatar.src}
									alt={avatar.alt}
									className="h-16 w-16 sm:h-20 sm:w-20"
								/>
								<span className="mt-2 text-center text-sm font-medium text-gray-700">
									{avatar.alt}
								</span>
							</div>
						</div>
					))}
				</div>
			)}
			{/* Current avatar display */}
			<div className="mb-4 flex items-center gap-3">
				<span className="text-sm font-medium text-gray-700">
					Current avatar:
				</span>
				<div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-gray-100">
					{" "}
					{selectedAvatar ? (
						<img
							src={
								avatars.find((a) => a.id === selectedAvatar)
									?.src || ""
							}
							alt="Selected avatar"
							className="h-10 w-10"
						/>
					) : (
						<UserX size={18} className="text-gray-400" />
					)}
				</div>
				<span className="text-sm text-gray-500">
					{selectedAvatar
						? avatars.find((a) => a.id === selectedAvatar)?.alt ||
							"Custom avatar"
						: "No avatar selected"}
				</span>
			</div>
		</div>
	);
};

export default AvatarSelector;
