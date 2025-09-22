import React, { useState, useEffect, useContext, createContext } from "react";

// Create a context for the toast
export const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "", // 'success', 'error', etc.
  });

  const showToast = (message, type = "") => {
    setToast({
      visible: true,
      message,
      type,
    });

    // Hide toast after 3 seconds
    setTimeout(() => {
      setToast((prevToast) => ({
        ...prevToast,
        visible: false,
      }));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast.visible && (
        <div
          className={`toast ${toast.type} ${!toast.visible ? "hidden" : ""}`}
        >
          <div id="toast-message">{toast.message}</div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

// Default Toast component for use in App.js
const Toast = () => null;

export default Toast;
