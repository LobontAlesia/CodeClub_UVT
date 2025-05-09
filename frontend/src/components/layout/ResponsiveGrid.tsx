import { ReactNode, forwardRef } from "react";

interface ResponsiveGridProps {
	children: ReactNode;
	className?: string;
	cols?: {
		xs?: number;
		sm?: number;
		md?: number;
		lg?: number;
		xl?: number;
	};
	gap?: "small" | "medium" | "large";
}

/**
 * A responsive grid component that adjusts the number of columns
 * based on the screen size.
 */
const ResponsiveGrid = forwardRef<HTMLDivElement, ResponsiveGridProps>(
	(
		{
			children,
			className = "",
			cols = { xs: 1, sm: 2, md: 3, lg: 4 },
			gap = "medium",
			...rest
		},
		ref,
	) => {
		// Construct grid template columns classes based on breakpoints
		const getGridColsClass = () => {
			const gridClasses = [];

			if (cols.xs) gridClasses.push(`grid-cols-${cols.xs}`);
			if (cols.sm) gridClasses.push(`sm:grid-cols-${cols.sm}`);
			if (cols.md) gridClasses.push(`md:grid-cols-${cols.md}`);
			if (cols.lg) gridClasses.push(`lg:grid-cols-${cols.lg}`);
			if (cols.xl) gridClasses.push(`xl:grid-cols-${cols.xl}`);

			return gridClasses.join(" ");
		};

		// Gap classes based on the size prop
		const gapClasses = {
			small: "gap-3 sm:gap-4",
			medium: "gap-4 sm:gap-6",
			large: "gap-6 sm:gap-8",
		};

		// Base grid classes
		const baseClasses = "grid w-full";

		return (
			<div
				ref={ref}
				className={`${baseClasses} ${getGridColsClass()} ${gapClasses[gap]} ${className}`.trim()}
				{...rest}
			>
				{children}
			</div>
		);
	},
);

ResponsiveGrid.displayName = "ResponsiveGrid";

export default ResponsiveGrid;
