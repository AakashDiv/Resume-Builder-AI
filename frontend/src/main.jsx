import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { ResumeBuilderProvider } from "../context/ResumeBuilderContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ResumeBuilderProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ResumeBuilderProvider>
  </React.StrictMode>
);
