import React from "react";

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const Overlay: React.FC<OverlayProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  return (
    <div
      className={`overlay ${isOpen ? "open" : ""}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`overlay-content ${className}`}>{children}</div>
    </div>
  );
};
