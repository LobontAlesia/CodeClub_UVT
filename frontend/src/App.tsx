import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from "react";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import CreateCoursePage from "./pages/admin/CreateCoursePage";
import CreateBadgePage from "./pages/admin/CreateBadgePage";
import CreateExternalBadgePage from "./pages/admin/CreateExternalBadgePage";
import CoursesPage from "./pages/public/CoursesPage";
import CourseDetailsPage from "./pages/public/CourseDetailsPage";
import EditCoursePage from "./pages/admin/EditCoursePage";
import CreateLessonPage from "./pages/admin/CreateLessonPage";
import LessonDetailsPage from "./pages/public/LessonDetailsPage";
import AddChapterPage from "./pages/admin/AddChapterPage";
import EditChapterPage from "./pages/admin/EditChapterPage";
import AddElementPage from "./pages/admin/AddElementPage";
import EditElementPage from "./pages/admin/EditElementPage";
import EditQuizPage from "./pages/admin/EditQuizPage";
import AddQuizPage from "./pages/admin/AddQuizPage";
import QuizPage from "./pages/public/QuizPage";
import ChapterDetailsPage from "./pages/public/ChapterDetailsPage";
import EditLessonPage from "./pages/admin/EditLessonPage";
import ProjectReviewsPage from "./pages/admin/ProjectReviewsPage";
import MyProjectsPage from "./pages/public/MyProjectsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AddProjectPage from "./pages/public/AddProjectPage";
import ProjectDetailsPage from "./pages/public/ProjectDetailsPage";
import EditProjectPage from "./pages/public/EditProjectPage";
import ProfilePage from "./pages/public/ProfilePage";

function App() {
	const location = useLocation();
	const hideNavbarOn = ["/login", "/register"];
	const shouldHideNavbar = hideNavbarOn.includes(location.pathname);

	useEffect(() => {
		const isLoginPage = location.pathname === "/login";
		const isRegisterPage = location.pathname === "/register";

		if (isLoginPage) {
			document.body.classList.add("login-page");
		} else if (isRegisterPage) {
			document.body.classList.add("register-page");
		} else {
			document.body.classList.remove("login-page", "register-page");
		}

		// Cleanup function to remove classes when component unmounts
		return () => {
			document.body.classList.remove("login-page", "register-page");
		};
	}, [location.pathname]);

	return (
		<>
			{!shouldHideNavbar && <Navbar />}

			<Routes>
				{/* Auth */}
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />

				{/* Dashboard comun */}
				<Route
					path="/dashboard"
					element={
						<ProtectedRoute>
							<DashboardPage />
						</ProtectedRoute>
					}
				/>

				{/* Admin routes */}
				<Route
					path="/admin/project-reviews"
					element={
						<ProtectedRoute requireAdmin>
							<ProjectReviewsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/create-course"
					element={
						<ProtectedRoute requireAdmin>
							<CreateCoursePage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/create-badge"
					element={
						<ProtectedRoute requireAdmin>
							<CreateBadgePage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/create-external-badge"
					element={
						<ProtectedRoute requireAdmin>
							<CreateExternalBadgePage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/create-lesson"
					element={
						<ProtectedRoute requireAdmin>
							<CreateLessonPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/edit-course/:id"
					element={
						<ProtectedRoute requireAdmin>
							<EditCoursePage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/lesson/:lessonId/add-chapter"
					element={
						<ProtectedRoute requireAdmin>
							<AddChapterPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/chapter/:chapterId/edit"
					element={
						<ProtectedRoute requireAdmin>
							<EditChapterPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/chapter/:chapterId"
					element={
						<ProtectedRoute requireAdmin>
							<ChapterDetailsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/chapter/:chapterId/add-element"
					element={
						<ProtectedRoute requireAdmin>
							<AddElementPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/edit-element/:elementId"
					element={
						<ProtectedRoute requireAdmin>
							<EditElementPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/edit-quiz/:formId"
					element={
						<ProtectedRoute requireAdmin>
							<EditQuizPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/chapter/:chapterId/add-quiz"
					element={
						<ProtectedRoute requireAdmin>
							<AddQuizPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/admin/lesson/:id/edit"
					element={
						<ProtectedRoute requireAdmin>
							<EditLessonPage />
						</ProtectedRoute>
					}
				/>

				{/* Public routes */}
				<Route
					path="/my-projects"
					element={
						<ProtectedRoute>
							<MyProjectsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/profile"
					element={
						<ProtectedRoute>
							<ProfilePage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/project/:id"
					element={
						<ProtectedRoute>
							<ProjectDetailsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/edit-project/:id"
					element={
						<ProtectedRoute>
							<EditProjectPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/courses"
					element={
						<ProtectedRoute>
							<CoursesPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/course/:id"
					element={
						<ProtectedRoute>
							<CourseDetailsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/lesson/:id"
					element={
						<ProtectedRoute>
							<LessonDetailsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/chapter/:chapterId"
					element={
						<ProtectedRoute>
							<ChapterDetailsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/quiz/:formId"
					element={
						<ProtectedRoute>
							<QuizPage />
						</ProtectedRoute>
					}
				/>

				<Route
					path="/admin/add-project"
					element={
						<ProtectedRoute>
							<AddProjectPage />
						</ProtectedRoute>
					}
				/>

				{/* Fallback */}
				<Route path="*" element={<Navigate to="/dashboard" />} />
			</Routes>

			<ToastContainer />
		</>
	);
}

export default App;
