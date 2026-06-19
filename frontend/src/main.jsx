import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.jsx";
import "./index.css";
import { ResumeBuilderProvider } from "../context/ResumeBuilderContext.jsx";
import { AdminAuthProvider } from "../context/AdminAuthContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <AdminAuthProvider>
        <ResumeBuilderProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ResumeBuilderProvider>
      </AdminAuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);
