import React from "react";
import { useToastStore } from "../store/useToastStore";
export const Toast: React.FC = () => {
  const message = useToastStore((s) => s.message);
  const isError = useToastStore((s) => s.isError);
  const visible = useToastStore((s) => s.visible);

  return (
    <div className={`toast ${visible ? "show" : ""} ${isError ? "err" : ""}`}>
      {message}
    </div>
  );
};