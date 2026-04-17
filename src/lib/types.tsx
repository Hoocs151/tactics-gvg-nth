"use client";

export type UnitType = "defense" | "push" | "flex" | "supply";
export type Tool = "pointer" | "arrow" | "circle" | "line" | "brush" | "eraser" | "text" | "marker";
export type LineStyle = "straight" | "dashed";
export type MarkerShape = "circle" | "icon";

export interface IconMarkerType {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  icon: string;
}

export const ICON_MARKER_TYPES: IconMarkerType[] = [
  { id: "quanthien", name: "Quân Thiên Hạo Ý", nameVi: "Quân Thiên Hạo Ý", description: "kamekameha", icon: "/icons/quanthien.png" },
  { id: "thaicuc", name: "Thái Cực Đồ", nameVi: "Thái Cực Đồ", description: "tcd", icon: "/icons/thaicuc.png" },
  { id: "tkhh", name: "Tuyệt Kĩ Phái Huyết Hà", nameVi: "Tuyệt Kĩ Phái Huyết Hà", description: "úp lồng", icon: "/icons/tkhh.png" },
  { id: "tuongbang", name: "Tường Băng", nameVi: "Tường Băng", description: "?", icon: "/icons/tuongbang.png" },
  { id: "vankiem", name: "Vạn Kiếm Quyết", nameVi: "Vạn Kiếm Quyết", description: "van kiem ne", icon: "/icons/vankiem.png" },
  { id: "cuulinh", name: "Cửu Linh", nameVi: "Cửu Linh", description: "9l", icon: "/icons/cuulinh.png" },
  { id: "huyetha", name: "Huyết Hà", nameVi: "Huyết Hà", description: "Đại Đế", icon: "/icons/huyetha.png" },
  { id: "longngam", name: "Long Ngâm", nameVi: "Long Ngâm", description: "Run đất", icon: "/icons/longngam.png" },
  { id: "thantuong", name: "Thần Tương", nameVi: "Thần Tương", description: "Chiến thần", icon: "/icons/thantuong.png" },
  { id: "thiety", name: "Thiết Y", nameVi: "Thiết Y", description: "Bao cat", icon: "/icons/thiety.png" },
  { id: "toaimong", name: "Toái Mộng", nameVi: "Toái Mộng", description: "Toái lỏ", icon: "/icons/toaimong.png" },
  { id: "tovan", name: "Tố Vấn", nameVi: "Tố Vấn", description: "mom", icon: "/icons/tovan.png" },
];

export interface PixelPosition {
  x: number;
  y: number;
}

export interface Unit {
  id: string;
  type: UnitType;
  color: string;
  position: PixelPosition;
  label?: string;
  rotation?: number;
  size?: number;
  zIndex?: number;
}

export interface DrawingLine {
  id: string;
  from: PixelPosition;
  to: PixelPosition;
  color: string;
  thickness: number;
  style: LineStyle;
  arrowEnd: boolean;
  zIndex?: number;
}

export interface DrawingCircle {
  id: string;
  center: PixelPosition;
  radius: number;
  color: string;
  fill: boolean;
  thickness: number;
  dashed: boolean;
  zIndex?: number;
}

export interface DrawingMarker {
  id: string;
  position: PixelPosition;
  shape: MarkerShape;
  color: string;
  size: number;
  label?: string;
  iconSrc?: string;
  iconSize?: number;
  zIndex?: number;
}

export interface TextLabel {
  id: string;
  position: PixelPosition;
  text: string;
  color: string;
  fontSize: number;
  zIndex?: number;
}

export interface DrawingStroke {
  id: string;
  points: PixelPosition[];
  color: string;
  thickness: number;
  zIndex?: number;
}

export interface Tactic {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  mapName: string;
  units: Unit[];
  lines: DrawingLine[];
  circles: DrawingCircle[];
  markers: DrawingMarker[];
  strokes: DrawingStroke[];
  labels: TextLabel[];
}

export interface UnitConfig {
  type: UnitType;
  name: string;
  nameVi: string;
  description: string;
  color: string;
}

export const UNIT_CONFIGS: UnitConfig[] = [
  { type: "defense", name: "Đoàn Thủ", nameVi: "Đoàn Thủ", description: "Phòng thủ", color: "#e74c3c" },
  { type: "push", name: "Đoàn Đẩy", nameVi: "Đoàn Đẩy", description: "Tấn công", color: "#3498db" },
  { type: "flex", name: "Đoàn Linh Hoạt", nameVi: "Đoàn Linh Hoạt", description: "Linh hoạt", color: "#2ecc71" },
  { type: "supply", name: "Đoàn Vật Tư", nameVi: "Đoàn Vật Tư", description: "Hậu cần", color: "#f39c12" },
];
