"use client";

import React from "react";
import {
  Shield, Zap, RefreshCw, Package,
  MousePointer2, ArrowRight, Circle, Minus,
  Eraser, Type, MapPin, Pencil,
} from "lucide-react";
import type { Tool, UnitType } from "./types";

export const UNIT_ICONS: Record<UnitType, React.ReactNode> = {
  defense: <Shield className="w-5 h-5" />,
  push: <Zap className="w-5 h-5" />,
  flex: <RefreshCw className="w-5 h-5" />,
  supply: <Package className="w-5 h-5" />,
};

export const TOOL_ICONS: Record<Tool, React.ReactNode> = {
  pointer: <MousePointer2 className="w-4 h-4" />,
  arrow: <ArrowRight className="w-4 h-4" />,
  circle: <Circle className="w-4 h-4" />,
  line: <Minus className="w-4 h-4" />,
  brush: <Pencil className="w-4 h-4" />,
  eraser: <Eraser className="w-4 h-4" />,
  text: <Type className="w-4 h-4" />,
  marker: <MapPin className="w-4 h-4" />,
};

export const TOOL_LABELS: Record<Tool, string> = {
  pointer: "Chọn",
  arrow: "Mũi Tên",
  circle: "Vòng Tròn",
  line: "Đường",
  brush: "Brush",
  eraser: "Xóa",
  text: "Text",
  marker: "Marker",
};

export const TOOL_KEYS: Record<string, Tool> = {
  "1": "pointer",
  "2": "arrow",
  "3": "circle",
  "4": "line",
  "5": "brush",
  "6": "eraser",
  "7": "text",
  "8": "marker",
};

export const TOOLS: Tool[] = ["pointer", "arrow", "circle", "line", "brush", "eraser", "text", "marker"];

export const GRID_SIZE = 20;

export const PALETTE_COLORS = [
  "#ffffff", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ef4444", "#6366f1", "#14b8a6", "#a855f7",
];

export const SELECTION_Z_OFFSET = 500;
export const DEFAULT_UNIT_SIZE = 48;
export const DEFAULT_ICON_SIZE = 48;
export const MIN_ICON_SIZE = 16;
export const MAX_ICON_SIZE = 128;

export const MAP_WIDTH = 1200;
export const MAP_HEIGHT = 900;
