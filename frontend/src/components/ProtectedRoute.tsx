import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireAdmin?: boolean;
}

const ProtectedRoute = ({
	children,
	requireAdmin = false,
}: ProtectedRouteProps) => {
	const { role } = useAuth();
	const token = localStorage.getItem("token");

	if (!token) {
		return <Navigate to="/login" replace />;
	}

	if (requireAdmin && role !== "Admin") {
		return <Navigate to="/dashboard" replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
