import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import FormCard from "../../components/FormCard";
import { Medal } from "lucide-react";

const CreateExternalBadgePage = () => {
	const [name, setName] = useState("");
	const [category, setCategory] = useState("");
	const [icon, setIcon] = useState<string | null>(null);
	const [originalIcon, setOriginalIcon] = useState<string | null>(null);
	const navigate = useNavigate();

	const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64String = reader.result as string;
				// Save original image for preview
				setOriginalIcon(base64String);

				// Generate unique identifier for the icon
				const timestamp = new Date().getTime();
				const uniqueIdentifier = `${timestamp}-${Math.random().toString(36).substring(7)}`;
				const uniqueBase64 = `${uniqueIdentifier}:${base64String}`;
				setIcon(uniqueBase64);
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
				"http://localhost:5153/ExternalBadge",
				{
					name,
					category,
					icon,
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			toast.success("External badge created successfully!");
			navigate("/dashboard");
		} catch (error: any) {
			console.error(error);
			const message = error.response?.data
				? error.response.data
				: "Failed to create external badge.";
			toast.error(message);
		}
	};

	return (
		<FormCard
			title="Create External Badge"
			icon={<Medal size={40} className="text-purple-600" />}
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
						placeholder="e.g. Raspberry Pi Certified"
						required
					/>
				</div>

				<div>
					<label className="mb-2 block text-sm font-bold">
						Category
					</label>
					<input
						type="text"
						className="w-full rounded border p-3"
						value={category}
						onChange={(e) => setCategory(e.target.value)}
						placeholder="e.g. Hardware, Web Development, etc."
						required
					/>
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

				{originalIcon && (
					<div className="mt-4 flex justify-center">
						<img
							src={originalIcon}
							alt="Badge Preview"
							className="h-24 w-24 rounded-full object-contain shadow-md"
						/>
					</div>
				)}

				<div className="flex gap-4">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="flex-1 rounded bg-blue-500 py-2 font-semibold text-white hover:bg-blue-600"
					>
						Create Badge
					</button>
				</div>
			</form>
		</FormCard>
	);
};

export default CreateExternalBadgePage;
