import { Navigate, Route, Routes } from "react-router-dom";
import SignupPage from "../pages/SignupPage.jsx";
import LoginPage from "../pages/LoginPage.jsx";
import HomePage from "../pages/HomePage.jsx";
import TemplatesPage from "../pages/TemplatesPage.jsx";
import PublicPricingPage from "../pages/PublicPricingPage.jsx";
import JobSearchPage from "../pages/JobSearchPage.jsx";
import ResumeBuilderPage from "../pages/ResumeBuilderPage.jsx";
import ImproveResumePage from "../pages/ImproveResumePage.jsx";
import AtsScorePage from "../pages/AtsScorePage.jsx";
import TailorResumePage from "../pages/TailorResumePage.jsx";
import CoverLetterPage from "../pages/CoverLetterPage.jsx";
import SubscriptionPage from "../pages/SubscriptionPage.jsx";
import ProfilePage from "../pages/ProfilePage.jsx";
import ProtectedRoute from "../layout/ProtectedRoute.jsx";
import PublicRoute from "../layout/PublicRoute.jsx";
import AppShell from "../layout/AppShell.jsx";
import MarketingLayout from "../layout/MarketingLayout.jsx";

const appRoutes = [
  { path: "job-search", element: <JobSearchPage /> },
  { path: "resume-builder", element: <ResumeBuilderPage /> },
  { path: "improve-resume", element: <ImproveResumePage /> },
  { path: "ats-score", element: <AtsScorePage /> },
  { path: "tailor-resume", element: <TailorResumePage /> },
  { path: "cover-letter", element: <CoverLetterPage /> },
  { path: "subscription", element: <SubscriptionPage /> },
  { path: "profile", element: <ProfilePage /> }
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
        <Route index element={<Navigate to="job-search" replace />} />
        {appRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
      <Route path="/dashboard" element={<Navigate to="/app/job-search" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
