"use client";

import React, { memo } from "react";
import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmModal = memo(function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative rounded-xl p-5 w-80 max-w-[90vw] fade-in"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors"
          style={{ color: "var(--text-muted)" }}
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-sm font-semibold mb-2" style={{ color: "var(--gold)" }}>
          {title}
        </h3>
        <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              background: danger ? "rgba(199,74,74,0.2)" : "var(--gold)",
              color: danger ? "var(--red)" : "var(--background)",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
});
