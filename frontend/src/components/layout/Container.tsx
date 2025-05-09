import React, { ReactNode } from "react";

interface ContainerProps {
	children: ReactNode;
	className?: string;
	fluid?: boolean;
}

/**
 * A responsive container component that provides consistent padding and width constraints
 * across different screen sizes.
 */
const Container: React.FC<ContainerProps> = ({
	children,
	className = "",
	fluid = false,
}) => {
	// Base container classes that apply to all containers
	const baseClasses = "mx-auto px-4 sm:px-6 md:px-8";

	// If fluid is true, the container will take up 100% of the width
	// Otherwise, it will be constrained to max widths at different breakpoints
	const widthClasses = fluid ? "w-full" : "w-full max-w-7xl";

	return (
		<div className={`${baseClasses} ${widthClasses} ${className}`.trim()}>
			{children}
		</div>
	);
};

export default Container;
