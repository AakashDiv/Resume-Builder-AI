import { Navigate } from "react-router-dom";
import { isAuthenticated } from "../services/authStorage.js";

export default function PublicRoute({ children }) {
  if (isAuthenticated()) {
    return <Navigate to="/app/job-search" replace />;
  }

  return children;
}
