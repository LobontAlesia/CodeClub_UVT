import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { Award } from "lucide-react";

const CreateBadgePage = () => {
	const [name, setName] = useState("");
	const [baseName, setBaseName] = useState("");
	const [level, setLevel] = useState("Beginner");
	const [icon, setIcon] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				setIcon(base64String);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!icon) {
			toast.error("Please upload a badge image");
			return;
		}

		try {
			const token = localStorage.getItem("token");

			await axios.post(
				"http://localhost:5153/Badge",
				{
					name,
					baseName,
					level,
					icon,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			toast.success("Badge created successfully!");
			navigate("/dashboard");
		} catch (error: any) {
			console.error(error);
			const message = error.response?.data?.includes("already exists")
				? "A badge with this base name and level already exists."
				: "Failed to create badge.";
			toast.error(message);
		}
	};

	return (
		<FormCard
			title="Create New Badge"
			icon={<Award size={40} className="text-[var(--color-primary)]" />}
		>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="mb-2 block text-sm font-bold">
						Badge Name
					</label>
					<input
						type="text"
						className="w-full rounded border p-3"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</div>

				<div>
					<label className="mb-2 block text-sm font-bold">
						Base Name (short code)
					</label>
					<input
						type="text"
						className="w-full rounded border p-3"
						value={baseName}
						onChange={(e) => setBaseName(e.target.value)}
						required
					/>
				</div>

				<div>
					<label className="mb-2 block text-sm font-bold">
						Level
					</label>
					<select
						className="w-full rounded border p-3"
						value={level}
						onChange={(e) => setLevel(e.target.value)}
					>
						<option>Beginner</option>
						<option>Intermediate</option>
						<option>Advanced</option>
					</select>
				</div>

				<div>
					<label className="mb-2 block text-sm font-bold">
						Badge Image
					</label>
					<input
						type="file"
						accept="image/*"
						className="w-full text-sm"
						onChange={handleImageUpload}
						required
					/>
				</div>

				{icon && (
					<div className="mt-4 flex justify-center">
						<img
							src={icon}
							alt="Badge Preview"
							className="h-24 w-24 rounded-full object-contain shadow-md"
						/>
					</div>
				)}

				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => navigate("/dashboard")}
						className="bg-gray-500 hover:bg-gray-600 flex-1 rounded py-2 font-semibold text-white"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="flex-1 rounded bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
					>
						➕ Create Badge
					</button>
				</div>
			</form>
		</FormCard>
	);
};

export default CreateBadgePage;
