"use client";

import { useState, useEffect, useRef } from "react";
import type { PixelPosition } from "@/lib/types";

interface TextEditorProps {
  position: PixelPosition;
  initialText: string;
  color: string;
  fontSize: number;
  zoom: number;
  pan: PixelPosition;
  containerRect: DOMRect;
  onSave: (text: string) => void;
  onCancel: () => void;
}

export function TextEditor({
  position, initialText, color, fontSize,
  zoom, pan, containerRect, onSave, onCancel,
}: TextEditorProps) {
  const [text, setText] = useState(initialText);
  const inputRef = useRef<HTMLInputElement>(null);

  const screenX = position.x * zoom + pan.x;
  const screenY = position.y * zoom + pan.y;

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSave(text);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    if (text.trim()) onSave(text);
    else onCancel();
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={text}
      onChange={e => setText(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="fixed pointer-events-auto z-[100] px-2 py-0.5 rounded text-white text-xs whitespace-nowrap focus:outline-none"
      style={{
        left: containerRect.left + screenX,
        top: containerRect.top + screenY,
        background: "rgba(8,8,16,0.9)",
        borderLeft: `3px solid ${color}`,
        fontSize: fontSize * zoom,
        minWidth: "120px",
      }}
    />
  );
}
