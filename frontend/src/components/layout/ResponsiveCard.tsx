import React, { ReactNode } from "react";

interface ResponsiveCardProps {
	children: ReactNode;
	className?: string;
	padding?: "small" | "medium" | "large";
	elevation?: "low" | "medium" | "high";
}

/**
 * A responsive card component that adapts its padding and appearance
 * based on the screen size.
 */
const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
	children,
	className = "",
	padding = "medium",
	elevation = "medium",
}) => {
	// Padding classes based on the size prop
	const paddingClasses = {
		small: "p-3 sm:p-4",
		medium: "p-4 sm:p-6",
		large: "p-5 sm:p-8",
	};

	// Shadow classes based on the elevation prop
	const shadowClasses = {
		low: "shadow-sm",
		medium: "shadow-md",
		high: "shadow-xl",
	};

	// Base card classes
	const baseClasses = "bg-white rounded-xl overflow-hidden";

	return (
		<div
			className={`${baseClasses} ${paddingClasses[padding]} ${shadowClasses[elevation]} ${className}`.trim()}
		>
			{children}
		</div>
	);
};

export default ResponsiveCard;
