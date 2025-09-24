import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/App.css";
import App from "./components/App";
import { ToastProvider } from "./components/Toast";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>
);

// Performance reporting removed during cleanup to reduce bundle size
