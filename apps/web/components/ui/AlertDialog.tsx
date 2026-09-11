"use client";

import React, { useEffect } from "react";

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export default function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
  icon,
  children,
}: AlertDialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: "bg-red-100 text-red-600",
      buttonBg: "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white focus:ring-red-500",
    },
    warning: {
      iconBg: "bg-amber-100 text-amber-600",
      buttonBg: "bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white focus:ring-amber-500",
    },
    default: {
      iconBg: "bg-blue-100 text-blue-600",
      buttonBg: "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white focus:ring-blue-500",
    },
  }[variant];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      onClick={() => {
        if (!isLoading) onClose();
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 transition-all transform flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${variantStyles.iconBg}`}
            >
              {icon || (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3
                id="alert-dialog-title"
                className="text-lg font-bold text-gray-900 leading-6"
              >
                {title}
              </h3>
              {description && (
                <div
                  id="alert-dialog-description"
                  className="mt-2 text-sm text-gray-600 space-y-2 leading-relaxed"
                >
                  {typeof description === "string" ? (
                    <p>{description}</p>
                  ) : (
                    description
                  )}
                </div>
              )}
            </div>
          </div>

          {children && <div className="mt-4">{children}</div>}
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${variantStyles.buttonBg}`}
          >
            {isLoading && (
              <svg
                className="animate-spin -ml-1 mr-1.5 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
