import { Navigate, Route, Routes } from "react-router-dom";
import SignupPage from "../pages/SignupPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import TemplatesPage from "../pages/TemplatesPage.jsx";
import PublicPricingPage from "../pages/PublicPricingPage.jsx";
import JobSearchPage from "../pages/JobSearchPage.jsx";
import DashboardPage from "../pages/DashboardPage.jsx";
import ResumeBuilderPage from "../pages/ResumeBuilderPage.jsx";
import ImproveResumePage from "../pages/ImproveResumePage.jsx";
import AtsScorePage from "../pages/AtsScorePage.jsx";
import TailorResumePage from "../pages/TailorResumePage.jsx";
import CoverLetterPage from "../pages/CoverLetterPage.jsx";
import SubscriptionPage from "../pages/SubscriptionPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import ApplicationsPage from "../pages/ApplicationsPage.jsx";
import BlogListPage from "../pages/BlogListPage.jsx";
import BlogDetailPage from "../pages/BlogDetailPage.jsx";
import AdminBlogsPage from "../pages/AdminBlogsPage.jsx";
import AdminBlogEditorPage from "../pages/AdminBlogEditorPage.jsx";
import StaticInfoPage from "../pages/StaticInfoPage.jsx";
import ProtectedRoute from "../layout/ProtectedRoute.jsx";
import PublicRoute from "../layout/PublicRoute.jsx";
import AppShell from "../layout/AppShell.jsx";
import MarketingLayout from "../layout/MarketingLayout.jsx";
import AdminLayout from "../layout/AdminLayout.jsx";
import AdminProtectedRoute from "../layout/AdminProtectedRoute.jsx";
import AdminLoginPage from "../pages/admin/AdminLoginPage.jsx";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage.jsx";
import AdminBlogsListPage from "../pages/admin/AdminBlogsListPage.jsx";
import AdminBlogEditorPageNew from "../pages/admin/AdminBlogEditorPage.jsx";
import AdminMediaPage from "../pages/admin/AdminMediaPage.jsx";
import AdminCategoriesPage from "../pages/admin/AdminCategoriesPage.jsx";
import AdminSettingsPage from "../pages/admin/AdminSettingsPage.jsx";

const appRoutes = [
  { path: "dashboard", element: <DashboardPage /> },
  { path: "job-search", element: <JobSearchPage /> },
  { path: "resume-builder", element: <ResumeBuilderPage /> },
  { path: "improve-resume", element: <ImproveResumePage /> },
  { path: "ats-score", element: <AtsScorePage /> },
  { path: "tailor-resume", element: <TailorResumePage /> },
  { path: "cover-letter", element: <CoverLetterPage /> },
  { path: "applications", element: <ApplicationsPage /> },
  { path: "subscription", element: <SubscriptionPage /> },
  { path: "profile", element: <ProfilePage /> },
  { path: "admin/blogs", element: <AdminBlogsPage /> },
  { path: "admin/blogs/create", element: <AdminBlogEditorPage /> },
  { path: "admin/blogs/edit/:id", element: <AdminBlogEditorPage /> }
];

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingLayout />}>
        <Route index element={<HomePage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="pricing" element={<PublicPricingPage />} />
        <Route path="enterprise" element={<PublicPricingPage />} />
        <Route path="builder" element={<div className="container mx-auto w-full max-w-[1440px] px-4 py-10 md:px-6"><ResumeBuilderPage /></div>} />
        <Route path="blog" element={<BlogListPage />} />
        <Route path="blog/:slug" element={<BlogDetailPage />} />
        <Route path="privacy-policy" element={<StaticInfoPage type="privacy" />} />
        <Route path="terms" element={<StaticInfoPage type="terms" />} />
        <Route path="about" element={<StaticInfoPage type="about" />} />
        <Route path="contact" element={<StaticInfoPage type="contact" />} />
        <Route path="disclaimer" element={<StaticInfoPage type="disclaimer" />} />
      </Route>

      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        {appRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
      <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

      {/* Super Admin routes - completely separate from user auth */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="blogs" element={<AdminBlogsListPage />} />
        <Route path="blogs/create" element={<AdminBlogEditorPageNew />} />
        <Route path="blogs/edit/:id" element={<AdminBlogEditorPageNew />} />
        <Route path="media" element={<AdminMediaPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
