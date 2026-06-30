import React from "react";

interface ToastProps {
  message: string;
  isError: boolean;
  visible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isError, visible }) => {
  return (
    <div className={`toast ${visible ? "show" : ""} ${isError ? "err" : ""}`}>
      {message}
    </div>
  );
};
