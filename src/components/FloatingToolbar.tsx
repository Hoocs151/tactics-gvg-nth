"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import type { Tool } from "@/lib/types";
import { TOOL_ICONS, TOOL_LABELS, TOOLS } from "@/lib/constants";
import {
  Undo2, Redo2, Trash2, Save, Download,
} from "lucide-react";

interface FloatingToolbarProps {
  selectedTool: Tool;
  onTool: (t: Tool) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onExport: () => void;
  onClear: () => void;
  visible: boolean;
}

export const FloatingToolbar = memo(function FloatingToolbar({
  selectedTool, onTool,
  onUndo, onRedo, canUndo, canRedo,
  onSave, onExport, onClear,
  visible,
}: FloatingToolbarProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <div
        className="flex items-center gap-1 px-3 py-2 rounded-2xl shadow-2xl"
        style={{
          background: "rgba(18, 20, 31, 0.95)",
          border: "1px solid var(--border-active)",
          backdropFilter: "blur(16px)",
        }}
      >
        {TOOLS.map(tool => (
          <button
            key={tool}
            onClick={() => onTool(tool)}
            aria-label={TOOL_LABELS[tool]}
            aria-pressed={selectedTool === tool}
            className={cn(
              "w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150",
              selectedTool === tool ? "scale-105" : "hover:scale-[1.02]"
            )}
            style={{
              background: selectedTool === tool ? "var(--glow-gold)" : "transparent",
              color: selectedTool === tool ? "var(--gold)" : "var(--text-secondary)",
              border: selectedTool === tool ? "1px solid var(--border-active)" : "1px solid transparent",
            }}
          >
            {TOOL_ICONS[tool]}
            <span className="text-[8px] leading-none">{TOOL_LABELS[tool]}</span>
          </button>
        ))}

        <div className="w-px h-8 mx-1" style={{ background: "var(--border)" }} />

        <button onClick={onUndo} disabled={!canUndo} aria-label="Hoàn tác"
          className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all disabled:opacity-30"
          style={{ background: "transparent", color: "var(--text-secondary)" }}>
          <Undo2 className="w-5 h-5" />
          <span className="text-[8px] leading-none">Undo</span>
        </button>
        <button onClick={onRedo} disabled={!canRedo} aria-label="Làm lại"
          className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all disabled:opacity-30"
          style={{ background: "transparent", color: "var(--text-secondary)" }}>
          <Redo2 className="w-5 h-5" />
          <span className="text-[8px] leading-none">Redo</span>
        </button>

        <div className="w-px h-8 mx-1" style={{ background: "var(--border)" }} />

        <button onClick={onClear} aria-label="Xóa bảng"
          className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-[1.02]"
          style={{ background: "rgba(199,74,74,0.1)", color: "var(--red)" }}>
          <Trash2 className="w-5 h-5" />
          <span className="text-[8px] leading-none">Xóa</span>
        </button>
        <button onClick={onExport} aria-label="Xuất PNG"
          className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-[1.02]"
          style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}>
          <Download className="w-5 h-5" />
          <span className="text-[8px] leading-none">PNG</span>
        </button>
        <button onClick={onSave} aria-label="Lưu"
          className="w-11 h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all hover:scale-[1.02]"
          style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dark))", color: "var(--background)" }}>
          <Save className="w-5 h-5" />
          <span className="text-[8px] leading-none">Lưu</span>
        </button>
      </div>
    </div>
  );
});
