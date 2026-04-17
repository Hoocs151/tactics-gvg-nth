"use client";

import React, { memo, useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface TextInputModalProps {
  isOpen: boolean;
  title: string;
  initialValue?: string;
  placeholder?: string;
  confirmText?: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export const TextInputModal = memo(function TextInputModal({
  isOpen,
  title,
  initialValue = "",
  placeholder = "",
  confirmText = "OK",
  onConfirm,
  onCancel,
}: TextInputModalProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (value.trim()) onConfirm(value.trim());
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

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

        <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--gold)" }}>
          {title}
        </h3>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
          style={{
            background: "var(--secondary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
          }}
        />

        <div className="flex gap-2 justify-end mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}
          >
            Hủy
          </button>
          <button
            onClick={() => {
              if (value.trim()) onConfirm(value.trim());
            }}
            disabled={!value.trim()}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            style={{ background: "var(--gold)", color: "var(--background)" }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
});
