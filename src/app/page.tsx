"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useTacticsStore } from "@/store/tacticsStore";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import { UNIT_CONFIGS, ICON_MARKER_TYPES, type PixelPosition, type Unit, type Tool, type TextLabel, type UnitType } from "@/lib/types";
import { TOOL_ICONS, TOOL_LABELS, TOOL_KEYS, GRID_SIZE, UNIT_ICONS, PALETTE_COLORS } from "@/lib/constants";
import { cn, sanitizeText, generateId } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ColorPicker } from "@/components/ColorPicker";
import { FloatingToolbar } from "@/components/FloatingToolbar";
import { TextEditor } from "@/components/TextEditor";
import { TextInputModal } from "@/components/TextInputModal";
import { LayersPanel } from "@/components/LayersPanel";
import {
  Undo2, Redo2, Trash2, Download,
  RotateCcw, ChevronDown, Plus, Save, FolderOpen,
  Copy, ClipboardPaste,
  ArrowUp, ArrowDown,
  Layers,
  Minus,
} from "lucide-react";

function dist(a: PixelPosition, b: PixelPosition) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function pointToLineDist(p: PixelPosition, a: PixelPosition, b: PixelPosition) {
  const A = p.x - a.x, B = p.y - a.y;
  const C = b.x - a.x, D = b.y - a.y;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  if (lenSq === 0) return dist(p, a);
  const param = Math.max(0, Math.min(1, dot / lenSq));
  return dist(p, { x: a.x + param * C, y: a.y + param * D });
}

function snapToGrid(pos: PixelPosition, enabled: boolean): PixelPosition {
  if (!enabled) return pos;
  return {
    x: Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
    y: Math.round(pos.y / GRID_SIZE) * GRID_SIZE,
  };
}

function getObjectsAtPos(
  pos: PixelPosition,
  units: Unit[],
  lines: ReturnType<typeof useTacticsStore.getState>["lines"],
  circles: ReturnType<typeof useTacticsStore.getState>["circles"],
  markers: ReturnType<typeof useTacticsStore.getState>["markers"],
  strokes: ReturnType<typeof useTacticsStore.getState>["strokes"],
  labels: TextLabel[],
) {
  const u = units.filter(u => dist(pos, u.position) <= 24).pop() ?? null;
  const l = lines.find(l => pointToLineDist(pos, l.from, l.to) < 10) ?? null;
  const c = circles.find(c => Math.abs(dist(pos, c.center) - c.radius) < 12) ?? null;
  const m = markers.find(m => dist(pos, m.position) < 20) ?? null;
  const s = strokes.find(s => s.points.some(p => dist(pos, p) < 8)) ?? null;
  const lb = labels.find(l => dist(pos, l.position) < 25) ?? null;
  return { unit: u, line: l, circle: c, marker: m, stroke: s, label: lb };
}

function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 px-3 pt-4 pb-2">
      {icon && <span className="text-[var(--gold)] opacity-70">{icon}</span>}
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>{title}</span>
    </div>
  );
}

function Sidebar({
  selectedTool, selectedUnitType, selectedIconMarkerType, selectedColor,
  onTool, onUnit, onIconMarker, onColor,
  onUndo, onRedo, canUndo, canRedo,
  onSave, onLoad, onClear, onExport, onDelete, onDuplicate, onCopy, onPaste,
  tactics,
}: {
  selectedTool: Tool;
  selectedUnitType: UnitType | null;
  selectedIconMarkerType: string | null;
  selectedColor: string;
  onTool: (t: Tool) => void;
  onUnit: (u: UnitType | null) => void;
  onIconMarker: (id: string | null) => void;
  onColor: (c: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onSave: () => void;
  onLoad: (id: string) => void;
  onClear: () => void;
  onExport: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onCopy: () => void;
  onPaste: () => void;
  hasClipboard: boolean;
  tactics: { id: string; name: string; createdAt: string; units: unknown[] }[];
}) {
  const [savedOpen, setSavedOpen] = useState(true);

  return (
    <div className="w-60 flex flex-col shrink-0 h-full"
      style={{ background: "linear-gradient(180deg, var(--surface) 0%, var(--primary) 100%)", borderRight: "1px solid var(--border)" }}>

      <div className="px-4 pt-4 pb-3 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <img src="/bonlang.png" alt="Bôn Làng" className="w-10 h-10 object-contain" />
        <div>
          <h1 className="text-sm font-bold tracking-[0.12em]" style={{ color: "var(--gold)" }}>BÔN LÀNG</h1>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Chiến Thuật Bang</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <SectionHeader title="Đoàn Quân" />
        <div className="px-3 pb-2">
          <div className="grid grid-cols-4 gap-1">
            {UNIT_CONFIGS.map(unit => (
              <button key={unit.type}
                onClick={() => { onUnit(unit.type); onIconMarker(null); onTool("pointer"); }}
                aria-label={`Chọn ${unit.nameVi}`}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1",
                  selectedUnitType === unit.type ? "scale-105" : "hover:scale-[1.02]"
                )}
                style={{
                  background: selectedUnitType === unit.type ? `${unit.color}18` : "transparent",
                  border: selectedUnitType === unit.type ? `1px solid ${unit.color}40` : "1px solid transparent",
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ background: `linear-gradient(135deg, ${unit.color}, ${unit.color}aa)` }}>
                  {UNIT_ICONS[unit.type]}
                </div>
                <span className="text-[9px] truncate w-full text-center" style={{ color: "var(--foreground)" }}>{unit.nameVi}</span>
              </button>
            ))}
          </div>
        </div>

        <SectionHeader title="Icon" />
        <div className="px-3 pb-2">
          <div className="grid grid-cols-4 gap-1">
            {ICON_MARKER_TYPES.map(icon => (
              <div key={icon.id} className="relative group">
                <button
                onClick={() => { onIconMarker(icon.id); onUnit(null); onTool("pointer"); }}
                aria-label={`Chọn ${icon.nameVi}`}
                className={cn(
                  "w-full flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1",
                  selectedIconMarkerType === icon.id ? "scale-105" : "hover:scale-[1.02]"
                )}
                style={{
                  background: selectedIconMarkerType === icon.id ? "var(--glow-gold)" : "transparent",
                  border: selectedIconMarkerType === icon.id ? "1px solid var(--border-active)" : "1px solid transparent",
                }}>
                  <img src={icon.icon} alt={icon.nameVi} className="w-7 h-7 object-contain" />
                  <span className="text-[8px] truncate w-full text-center" style={{ color: "var(--text-muted)" }}>{icon.nameVi}</span>
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 hidden group-hover:block pointer-events-none">
                  <div className="bg-black/90 border border-amber-500/40 rounded-lg px-2 py-1.5 whitespace-nowrap shadow-xl">
                    <div className="text-[10px] font-semibold" style={{ color: "var(--gold)" }}>{icon.nameVi}</div>
                    <div className="text-[9px] mt-0.5" style={{ color: "var(--text-muted)" }}>{icon.description}</div>
                  </div>
                  <div className="w-2 h-2 bg-black/90 border-r border-b border-amber-500/40 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <SectionHeader title="Công Cụ" />
        <div className="px-3 pb-2">
          <div className="grid grid-cols-4 gap-1">
            {Object.entries(TOOL_ICONS).map(([tool, icon]) => (
              <button key={tool} onClick={() => onTool(tool as Tool)}
                title={`${TOOL_LABELS[tool as Tool]} (${Object.keys(TOOL_KEYS).find(k => TOOL_KEYS[k] === tool) ?? "?"})`}
                aria-label={TOOL_LABELS[tool as Tool]}
                aria-pressed={selectedTool === tool}
                className="flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{
                  background: selectedTool === tool ? "var(--glow-gold)" : "transparent",
                  color: selectedTool === tool ? "var(--gold)" : "var(--text-secondary)",
                  border: selectedTool === tool ? "1px solid var(--border-active)" : "1px solid transparent",
                }}>
                {icon}
                <span className="text-[9px]">{TOOL_LABELS[tool as Tool]}</span>
              </button>
            ))}
          </div>
        </div>

        <SectionHeader title="Màu Sắc" />
        <div className="px-3 pb-2">
          <ColorPicker selectedColor={selectedColor} onColorChange={onColor} presets={PALETTE_COLORS} />
          <div className="flex items-center gap-2 px-1 mt-1.5">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: selectedColor, border: "1px solid rgba(255,255,255,0.15)" }} />
            <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{selectedColor.toUpperCase()}</span>
          </div>
        </div>

        <SectionHeader title="Thao Tác" />
        <div className="px-3 pb-2 space-y-1">
          <button onClick={onCopy}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-30"
            style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}>
            <Copy className="w-3.5 h-3.5" /> Copy (Ctrl+C)
          </button>
          <button onClick={onPaste}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-30"
            style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}>
            <ClipboardPaste className="w-3.5 h-3.5" /> Paste (Ctrl+V)
          </button>
        </div>

        <div style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => setSavedOpen(v => !v)}
            aria-expanded={savedOpen}
            className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-inset"
            style={{ color: "var(--text-muted)" }}>
            <div className="flex items-center gap-2">
              <FolderOpen className="w-3.5 h-3.5" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em]">Đã Lưu</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "var(--glow-gold)", color: "var(--gold)" }}>
                {tactics.length}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 transition-transform" style={{ transform: savedOpen ? "rotate(180deg)" : "none" }} />
          </button>
          {savedOpen && (
            <div className="px-2 pb-2">
              {tactics.length === 0 ? (
                <p className="text-[11px] text-center py-4" style={{ color: "var(--text-muted)" }}>Chưa có chiến thuật</p>
              ) : (
                <div className="space-y-0.5 max-h-60 overflow-y-auto">
                  {tactics.map(t => (
                    <div key={t.id}
                      className="group flex items-center justify-between p-2 rounded-lg transition-all hover:bg-white/5">
                      <button onClick={() => onLoad(t.id)} className="flex-1 text-left min-w-0">
                        <div className="text-xs truncate" style={{ color: "var(--foreground)" }}>{t.name}</div>
                        <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                          {new Date(t.createdAt).toLocaleDateString()} · {t.units.length} đoàn
                        </div>
                      </button>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => onDuplicate(t.id)} className="p-1 rounded hover:bg-white/10 transition-all" aria-label="Nhân bản">
                          <Copy className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onDelete(t.id); }} className="p-1 rounded hover:bg-red-500/20 transition-all" aria-label="Xóa">
                          <Trash2 className="w-3 h-3" style={{ color: "var(--red)" }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-3 space-y-1" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex gap-1">
          <button onClick={onUndo} disabled={!canUndo} aria-label="Hoàn tác (Z)"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all text-[11px] disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}>
            <Undo2 className="w-3.5 h-3.5" /> Hoàn tác
          </button>
          <button onClick={onRedo} disabled={!canRedo} aria-label="Làm lại (Shift+Z)"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all text-[11px] disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}>
            <Redo2 className="w-3.5 h-3.5" /> Làm lại
          </button>
        </div>
        <div className="flex gap-1">
          <button onClick={onClear} aria-label="Xóa bảng"
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all text-[11px] focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ background: "rgba(199,74,74,0.1)", color: "var(--red)" }}>
            <Trash2 className="w-3.5 h-3.5" /> Xóa
          </button>
          <button onClick={onExport} aria-label="Xuất PNG"
            className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg transition-all text-[11px] focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}>
            <Download className="w-3.5 h-3.5" /> PNG
          </button>
          <button onClick={onSave} aria-label="Lưu"
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dark))", color: "var(--background)" }}>
            <Save className="w-3.5 h-3.5" /> Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TacticsBoard() {
  const store = useTacticsStore();
  const {
    units, lines, circles, markers, strokes, labels, hiddenIds,
    selectedTool, selectedUnitType, selectedIconMarkerType, selectedColor,
    selectedMarkerId, tactics, history, historyIndex,
    selectedIds, clipboard,
    setTool, setSelectedUnitType, setSelectedIconMarkerType, setSelectedColor, setSelectedMarkerId,
    addUnit, removeUnit, moveUnit,
    addLine, removeLine, addCircle, removeCircle,
    addMarker, removeMarker, updateMarkerSize,
    addStroke, removeStroke,
    addLabel, removeLabel, updateLabel,
    undo, redo, clearBoard, saveTactic, loadTactic, deleteTactic, duplicateTactic,
    copySelection, pasteSelection, deleteSelected, setSelectedIds, addToSelection,
    clearSelection, bringToFront, sendToBack, saveToHistory,
  } = store;

  const containerRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [boardSize, setBoardSize] = useState({ width: 1200, height: 900 });
  const [mapLoaded, setMapLoaded] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOrigin, setPanOrigin] = useState({ x: 0, y: 0 });
  const [dragUnitId, setDragUnitId] = useState<string | null>(null);
  const [dragStartPos, setDragStartPos] = useState<PixelPosition | null>(null);
  const [lineStart, setLineStart] = useState<PixelPosition | null>(null);
  const [linePreview, setLinePreview] = useState<{ from: PixelPosition; to: PixelPosition } | null>(null);
  const [circleStart, setCircleStart] = useState<PixelPosition | null>(null);
  const [circlePreview, setCirclePreview] = useState<{ center: PixelPosition; radius: number } | null>(null);
  const [markerStart, setMarkerStart] = useState<PixelPosition | null>(null);
  const [markerPreview, setMarkerPreview] = useState<PixelPosition | null>(null);
  const [brushStroke, setBrushStroke] = useState<PixelPosition[]>([]);
  const [isBrushDrawing, setIsBrushDrawing] = useState(false);
  const [hoverPos, setHoverPos] = useState<PixelPosition | null>(null);
  const [isSpaceDown, setIsSpaceDown] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [editingLabel, setEditingLabel] = useState<{ id: string; position: PixelPosition; text: string; color: string; fontSize: number } | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPos, setTextInputPos] = useState<PixelPosition | null>(null);

  const [tabletMode, setTabletMode] = useState(false);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [showLayersPanel, setShowLayersPanel] = useState(false);
  const { isRegistered } = useServiceWorker();

  useEffect(() => {
    setTabletMode("ontouchstart" in window || navigator.maxTouchPoints > 0);
    setShowFloatingToolbar("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (tabletMode && (isBrushDrawing || lineStart || circleStart)) {
      setShowFloatingToolbar(false);
    } else if (tabletMode) {
      timer = setTimeout(() => setShowFloatingToolbar(true), 2000);
    }
    return () => clearTimeout(timer);
  }, [tabletMode, isBrushDrawing, lineStart, circleStart]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (containerSize.width && containerSize.height && boardSize.width && boardSize.height && mapLoaded) {
      const zoomToFit = Math.max(1, containerSize.height / boardSize.height);
      setZoom(zoomToFit);
      const scaledWidth = boardSize.width * zoomToFit;
      const offsetX = (containerSize.width - scaledWidth) / 2;
      setPan({ x: offsetX, y: 0 });
    }
  }, [containerSize.width, containerSize.height, boardSize.width, boardSize.height, mapLoaded]);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      setBoardSize({ width: img.naturalWidth || 1200, height: img.naturalHeight || 900 });
      setMapLoaded(true);
    };
    img.src = "/map.jpg";
  }, []);

  const getBoardPos = useCallback((clientX: number, clientY: number): PixelPosition => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [zoom, pan]);

  const cursor = useMemo(() => {
    if (isSpaceDown || isPanning) return "grab";
    if (["eraser", "brush"].includes(selectedTool)) return "crosshair";
    if (["arrow", "line", "circle"].includes(selectedTool)) return "crosshair";
    if (["text", "marker"].includes(selectedTool)) return "cell";
    return "default";
  }, [isSpaceDown, isPanning, selectedTool]);

  const handlePointerDown = useCallback((clientX: number, clientY: number, button: number, ctrlKey: boolean, altKey: boolean) => {
    if (button === 1 || (isSpaceDown && button === 0)) {
      setIsPanning(true);
      setPanStart({ x: clientX, y: clientY });
      setPanOrigin({ x: pan.x, y: pan.y });
      return;
    }
    if (button !== 0) return;

    const pos = getBoardPos(clientX, clientY);
    const snapped = snapToGrid(pos, false);
    const objs = getObjectsAtPos(pos, units, lines, circles, markers, strokes, labels);

    if (selectedTool === "pointer") {
      if (objs.unit) {
        if (ctrlKey) {
          addToSelection(objs.unit.id);
        } else {
          if (altKey) {
            const newId = generateId();
            saveToHistory();
            useTacticsStore.setState({
              units: [...useTacticsStore.getState().units, { ...objs.unit, id: newId, position: { x: objs.unit.position.x + 15, y: objs.unit.position.y + 15 }, zIndex: (objs.unit.zIndex || 0) + 1 }],
              selectedIds: [newId],
              isDirty: true,
            });
          }
          setDragUnitId(objs.unit.id);
          setDragStartPos(objs.unit.position);
          setSelectedMarkerId(objs.unit.id);
          if (!selectedIds.includes(objs.unit.id) && selectedIds.length > 0) {
            clearSelection();
          }
          addToSelection(objs.unit.id);
        }
      } else if (selectedUnitType) {
        addUnit(snapped);
      } else if (selectedIconMarkerType) {
        const iconType = ICON_MARKER_TYPES.find(i => i.id === selectedIconMarkerType);
        if (iconType) {
          addMarker({ position: snapped, shape: "icon", color: selectedColor, size: 48, iconSrc: iconType.icon, iconSize: 48 });
        }
      } else {
        clearSelection();
        setSelectedMarkerId(null);
      }
    } else if (selectedTool === "arrow" || selectedTool === "line") {
      if (!lineStart) { setLineStart(snapped); setLinePreview({ from: snapped, to: snapped }); }
      else {
        addLine({ from: lineStart, to: snapped, color: selectedColor, thickness: 2.5, style: selectedTool === "arrow" ? "dashed" : "straight", arrowEnd: selectedTool === "arrow" });
        setLineStart(null); setLinePreview(null);
      }
    } else if (selectedTool === "circle") {
      if (!circleStart) { setCircleStart(snapped); setCirclePreview({ center: snapped, radius: 0 }); }
      else {
        const r = dist(circleStart, snapped);
        if (r > 5) { addCircle({ center: circleStart, radius: r, color: selectedColor, fill: false, thickness: 2, dashed: false }); }
        setCircleStart(null); setCirclePreview(null);
      }
    } else if (selectedTool === "marker") {
      if (!markerStart) { setMarkerStart(snapped); setMarkerPreview(snapped); }
      else { addMarker({ position: markerStart, shape: "circle", color: selectedColor, size: 24 }); setMarkerStart(null); setMarkerPreview(null); }
    } else if (selectedTool === "brush") {
      setIsBrushDrawing(true);
      setBrushStroke([snapped]);
    } else if (selectedTool === "eraser") {
      if (objs.unit) removeUnit(objs.unit.id);
      else if (objs.line) removeLine(objs.line.id);
      else if (objs.circle) removeCircle(objs.circle.id);
      else if (objs.marker) removeMarker(objs.marker.id);
      else if (objs.stroke) removeStroke(objs.stroke.id);
      else if (objs.label) removeLabel(objs.label.id);
    } else if (selectedTool === "text") {
      setTextInputPos(snapped);
      setShowTextInput(true);
    }
  }, [selectedTool, selectedUnitType, selectedIconMarkerType, selectedColor, lineStart, circleStart, markerStart, units, lines, circles, markers, strokes, labels, isSpaceDown, getBoardPos, selectedIds, addUnit, removeUnit, addLine, removeLine, addCircle, removeCircle, addMarker, removeMarker, addStroke, removeStroke, addLabel, removeLabel, setSelectedMarkerId, addToSelection, clearSelection, store]);

  const handlePointerMove = useCallback((clientX: number, clientY: number) => {
    const pos = getBoardPos(clientX, clientY);
    setHoverPos(pos);
    if (isPanning) { setPan({ x: panOrigin.x + (clientX - panStart.x), y: panOrigin.y + (clientY - panStart.y) }); return; }
    if (dragUnitId) {
      const snapped = snapToGrid(pos, false);
      moveUnit(dragUnitId, snapped);
      if (selectedIds.includes(dragUnitId)) {
        const dx = snapped.x - pos.x;
        const dy = snapped.y - pos.y;
        selectedIds.forEach(id => {
          if (id !== dragUnitId) {
            const u = units.find(u => u.id === id);
            if (u) moveUnit(id, { x: u.position.x + dx, y: u.position.y + dy });
          }
        });
      }
      return;
    }
    if (linePreview) setLinePreview(prev => prev ? { ...prev, to: pos } : null);
    if (circleStart) setCirclePreview({ center: circleStart, radius: dist(circleStart, pos) });
    if (isBrushDrawing && selectedTool === "brush") setBrushStroke(prev => [...prev, pos]);
  }, [isPanning, dragUnitId, selectedIds, linePreview, circleStart, isBrushDrawing, selectedTool, panStart, panOrigin, getBoardPos, moveUnit, units]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
    if (dragUnitId && dragStartPos) {
      const u = units.find(u => u.id === dragUnitId);
      if (u && (u.position.x !== dragStartPos.x || u.position.y !== dragStartPos.y)) {
        store.saveToHistory();
      }
    }
    setDragUnitId(null);
    setDragStartPos(null);
    if (isBrushDrawing && brushStroke.length > 1) addStroke({ points: brushStroke, color: selectedColor, thickness: 2 });
    setIsBrushDrawing(false);
    setBrushStroke([]);
  }, [isBrushDrawing, brushStroke, selectedColor, addStroke, dragUnitId, dragStartPos, units, store]);

  const handleWheel = useCallback((deltaY: number) => {
    const delta = deltaY > 0 ? -0.1 : 0.1;
    setZoom(z => Math.min(5, Math.max(0.05, z + delta)));
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      if (e.code === "Space") { e.preventDefault(); setIsSpaceDown(true); }

      if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.key === "z" && e.shiftKey) || e.key === "y") { e.preventDefault(); redo(); }

      if ((e.ctrlKey || e.metaKey) && e.key === "c") { e.preventDefault(); if (selectedIds.length > 0) copySelection(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "v") { e.preventDefault(); pasteSelection(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "a") { e.preventDefault(); setSelectedIds([...units.map(u => u.id), ...lines.map(l => l.id), ...circles.map(c => c.id), ...markers.map(m => m.id), ...strokes.map(s => s.id), ...labels.map(lb => lb.id)]); }

      if (e.key === "Escape") {
        setLineStart(null); setLinePreview(null);
        setCircleStart(null); setCirclePreview(null);
        setMarkerStart(null); setMarkerPreview(null);
        setBrushStroke([]); setIsBrushDrawing(false);
        clearSelection();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedIds.length > 0) deleteSelected();
        else if (selectedMarkerId) { removeUnit(selectedMarkerId); setSelectedMarkerId(null); }
      }

      const tool = TOOL_KEYS[e.key];
      if (tool) setTool(tool);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setIsSpaceDown(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => { window.removeEventListener("keydown", onKeyDown); window.removeEventListener("keyup", onKeyUp); };
  }, [undo, redo, selectedIds, selectedMarkerId, removeUnit, setSelectedMarkerId, setTool, copySelection, pasteSelection, deleteSelected, clearSelection, bringToFront, sendToBack, units, lines, circles, markers, strokes, labels, setSelectedIds]);

  useEffect(() => {
    let lastTouchDistance = 0;
    let initialZoom = 1;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
        initialZoom = zoom;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (lastTouchDistance > 0) {
          const scale = dist / lastTouchDistance;
          setZoom(z => Math.min(5, Math.max(0.05, initialZoom * scale)));
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("touchstart", onTouchStart, { passive: false });
      container.addEventListener("touchmove", onTouchMove, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener("touchstart", onTouchStart);
        container.removeEventListener("touchmove", onTouchMove);
      }
    };
  }, [zoom]);

  const resetView = useCallback(() => { setZoom(1); setPan({ x: 0, y: 0 }); }, []);

  const handleExport = async () => {
    if (!boardRef.current) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(boardRef.current, { backgroundColor: "#080810", scale: 2 });
      const link = document.createElement("a");
      link.download = `bonlang-tactics-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) { console.error("Export failed:", err); }
  };

  const handleSave = () => {
    if (saveName.trim()) {
      saveTactic(saveName.trim(), "Bôn Làng");
      setSaveName("");
      setShowSaveModal(false);
    }
  };

  const handleLabelDoubleClick = useCallback((label: TextLabel) => {
    setEditingLabel({ id: label.id, position: label.position, text: label.text, color: label.color, fontSize: label.fontSize });
  }, []);

  const handleSaveLabel = useCallback((text: string) => {
    if (editingLabel) {
      updateLabel(editingLabel.id, { text: sanitizeText(text) });
      setEditingLabel(null);
    }
  }, [editingLabel, updateLabel]);

  const selectedUnitConfig = useMemo(() =>
    selectedUnitType ? UNIT_CONFIGS.find(c => c.type === selectedUnitType) : null,
    [selectedUnitType]
  );

  const selectedIconConfig = useMemo(() =>
    selectedIconMarkerType ? ICON_MARKER_TYPES.find(i => i.id === selectedIconMarkerType) : null,
    [selectedIconMarkerType]
  );

  const selectedIconMarker = useMemo(() => {
    if (selectedIds.length !== 1) return null;
    const m = markers.find(x => x.id === selectedIds[0]);
    if (!m || m.shape !== "icon") return null;
    return m;
  }, [selectedIds, markers]);

  return (
    <div className="flex h-screen overflow-hidden select-none" style={{ background: "var(--background)" }}>
      <ErrorBoundary>
        {showLayersPanel && <LayersPanel onClose={() => setShowLayersPanel(false)} />}

        {!tabletMode && (
          <Sidebar
            selectedTool={selectedTool} selectedUnitType={selectedUnitType} selectedIconMarkerType={selectedIconMarkerType} selectedColor={selectedColor}
            onTool={setTool} onUnit={setSelectedUnitType} onIconMarker={setSelectedIconMarkerType} onColor={setSelectedColor}
            onUndo={undo} onRedo={redo} canUndo={historyIndex >= 0} canRedo={historyIndex < history.length - 1}
            onSave={() => setShowSaveModal(true)} onLoad={loadTactic}
            onClear={() => { if (confirm("Xóa toàn bộ?")) clearBoard(); }}
            onExport={handleExport} onDelete={id => { if (confirm("Xóa chiến thuật này?")) deleteTactic(id); }}
            onDuplicate={duplicateTactic}
            onCopy={copySelection} onPaste={pasteSelection} hasClipboard={!!clipboard}
            tactics={tactics}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-10 flex items-center justify-between px-4 shrink-0 z-10"
            style={{ background: "var(--primary)", borderBottom: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowLayersPanel(v => !v)}
                className={cn("p-1.5 rounded-lg transition-colors", showLayersPanel ? "bg-amber-500/20" : "hover:bg-white/10")}
                style={{ color: "var(--gold)" }} title="Layers Panel">
                <Layers className="w-4 h-4" />
              </button>
              <h2 className="text-[11px] font-semibold tracking-[0.12em]" style={{ color: "var(--gold)" }}>BẢN ĐỒ CHIẾN TRƯỜNG</h2>
              {hoverPos && (
                <span className="font-mono text-[10px]" style={{ color: "var(--text-muted)" }}>
                  {Math.round(hoverPos.x)}, {Math.round(hoverPos.y)}
                </span>
              )}
              {selectedUnitConfig && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${selectedUnitConfig.color}18`, color: selectedUnitConfig.color }}>
                  {selectedUnitConfig.nameVi}
                </span>
              )}
              {selectedIconConfig && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                  style={{ background: "var(--glow-gold)", color: "var(--gold)" }}>
                  <img src={selectedIconConfig.icon} alt="" className="w-4 h-4 object-contain" />
                  {selectedIconConfig.nameVi}
                </span>
              )}
              {selectedIconMarker && (
                <div className="flex items-center gap-1.5 ml-1" style={{ borderLeft: "1px solid var(--border)", paddingLeft: "6px" }}>
                  <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>Size</span>
                  <input
                    type="range" min={16} max={128} step={4} value={selectedIconMarker.iconSize || 48}
                    onChange={e => updateMarkerSize(selectedIconMarker.id, Number(e.target.value))}
                    className="w-20 h-1 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "var(--gold)", background: "var(--secondary)" }}
                    title="Icon size"
                  />
                  <span className="text-[9px] font-mono w-7 text-right" style={{ color: "var(--text-muted)" }}>
                    {selectedIconMarker.iconSize || 48}
                  </span>
                  <button onClick={() => updateMarkerSize(selectedIconMarker.id, 48)}
                    title="Reset to default" className="text-[9px] px-1 rounded hover:bg-white/10"
                    style={{ color: "var(--text-muted)" }}>
                    ↺
                  </button>
                </div>
              )}
              {selectedIds.length > 1 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: "var(--glow-gold)", color: "var(--gold)" }}>
                  {selectedIds.length} objects
                </span>
              )}
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-0.5 ml-2" style={{ borderLeft: "1px solid var(--border)", paddingLeft: "8px" }}>
                  <button onClick={() => selectedIds.forEach(id => {
                    const u = units.find(x => x.id === id); if (u) bringToFront(id, "unit");
                    const l = lines.find(x => x.id === id); if (l) bringToFront(id, "line");
                    const c = circles.find(x => x.id === id); if (c) bringToFront(id, "circle");
                    const m = markers.find(x => x.id === id); if (m) bringToFront(id, "marker");
                    const s = strokes.find(x => x.id === id); if (s) bringToFront(id, "stroke");
                    const lb = labels.find(x => x.id === id); if (lb) bringToFront(id, "label");
                  })} title="Bring Forward"
                    className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: "var(--text-muted)" }}>
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => selectedIds.forEach(id => {
                    const u = units.find(x => x.id === id); if (u) sendToBack(id, "unit");
                    const l = lines.find(x => x.id === id); if (l) sendToBack(id, "line");
                    const c = circles.find(x => x.id === id); if (c) sendToBack(id, "circle");
                    const m = markers.find(x => x.id === id); if (m) sendToBack(id, "marker");
                    const s = strokes.find(x => x.id === id); if (s) sendToBack(id, "stroke");
                    const lb = labels.find(x => x.id === id); if (lb) sendToBack(id, "label");
                  })} title="Send Backward"
                    className="p-1 rounded transition-colors hover:bg-white/10" style={{ color: "var(--text-muted)" }}>
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {lineStart && <span className="text-[10px] pulse-glow" style={{ color: "var(--gold)" }}>Click điểm cuối...</span>}
              {circleStart && <span className="text-[10px] pulse-glow" style={{ color: "var(--gold)" }}>Click cạnh...</span>}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setZoom(z => Math.min(5, z + 0.15))} aria-label="Zoom in"
                className="p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1" style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] w-12 text-center" style={{ color: "var(--text-muted)" }}>{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.max(0.05, z - 0.15))} aria-label="Zoom out"
                className="p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1" style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}>
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button onClick={resetView} title="Reset view" aria-label="Reset view"
                className="p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1" style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}>
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 mx-1" style={{ background: "var(--border)" }} />
              <button onClick={() => setShowShortcuts(s => !s)} aria-label="Phím tắt"
                className="px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1" style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}>
                ?
              </button>
            </div>
          </div>

          {showShortcuts && (
            <div className="absolute top-12 right-16 z-50 rounded-xl p-4 shadow-2xl w-56"
              style={{ background: "var(--surface)", border: "1px solid var(--border-active)" }}
              onMouseLeave={() => setShowShortcuts(false)}>
              <div className="text-[11px] font-semibold mb-3" style={{ color: "var(--gold)" }}>Phím Tắt</div>
              {[
                ["Space + Kéo", "Di chuyển bản đồ"],
                ["Cuộn chuột", "Zoom"],
                ["Z", "Hoàn tác"], ["Shift+Z", "Làm lại"],
                ["Del", "Xóa đã chọn"],
                ["Esc", "Hủy / Bỏ chọn"],
                ["1-8", "Chuyển công cụ"],
                ["Ctrl+A", "Chọn tất cả"],
                ["Ctrl+C", "Copy"],
                ["Ctrl+V", "Paste"],
                ["Alt+Kéo", "Nhân bản unit"],
                ["Ctrl+Click", "Thêm vào selection"],
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between items-center py-1 text-[10px]">
                  <kbd className="px-1.5 py-0.5 rounded" style={{ background: "var(--secondary)", color: "var(--text-muted)" }}>{key}</kbd>
                  <span style={{ color: "var(--text-muted)" }}>{desc}</span>
                </div>
              ))}
            </div>
          )}

          <div
            ref={containerRef}
            className="flex-1 overflow-hidden relative"
            style={{ cursor, background: "linear-gradient(135deg, #06060e 0%, #0c0c18 50%, #080812 100%)" }}
            onMouseDown={e => { if (e.button === 0) handlePointerDown(e.clientX, e.clientY, e.button, e.ctrlKey, e.altKey); }}
            onMouseMove={e => handlePointerMove(e.clientX, e.clientY)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onWheel={e => { e.preventDefault(); handleWheel(e.deltaY); }}
            onContextMenu={e => e.preventDefault()}
          >
            <div
              ref={boardRef}
              className="absolute"
              style={{
                left: 0, top: 0,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                width: boardSize.width, height: boardSize.height,
              }}
            >
              <img src="/map.jpg" alt="Battle Map" className="block select-none" draggable={false}
                onLoad={e => {
                  const img = e.currentTarget;
                  setBoardSize({ width: img.naturalWidth || 1200, height: img.naturalHeight || 900 });
                  setMapLoaded(true);
                }} />

              {mapLoaded && (
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible">
                  <defs>
                    <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                      <polygon points="0 0, 8 3, 0 6" fill="var(--gold)" />
                    </marker>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>

                  {lines.filter(l => !hiddenIds.includes(l.id)).map(line => (
                    <g key={line.id} filter="url(#glow)" className={selectedIds.includes(line.id) ? "pointer-events-auto cursor-pointer" : ""}
                      style={{ zIndex: (line.zIndex || 0) + (selectedIds.includes(line.id) ? 500 : 0) }}
                      onClick={e => { e.stopPropagation(); if (!selectedIds.includes(line.id)) addToSelection(line.id); }}>
                      <path d={`M ${line.from.x} ${line.from.y} L ${line.to.x} ${line.to.y}`}
                        fill="none" stroke={selectedIds.includes(line.id) ? "var(--gold)" : line.color}
                        strokeWidth={selectedIds.includes(line.id) ? line.thickness + 1 : line.thickness}
                        strokeDasharray={line.style === "dashed" ? "8,4" : "none"}
                        markerEnd={line.arrowEnd ? "url(#arrow)" : undefined}
                        className={line.style === "dashed" ? "dash-flow" : ""} />
                      <circle cx={line.from.x} cy={line.from.y} r="3" fill={line.color} />
                      {selectedIds.includes(line.id) && <circle cx={line.to.x} cy={line.to.y} r="4" fill="var(--gold)" />}
                    </g>
                  ))}

                  {linePreview && (
                    <path d={`M ${linePreview.from.x} ${linePreview.from.y} L ${linePreview.to.x} ${linePreview.to.y}`}
                      fill="none" stroke="var(--gold)" strokeWidth={2} strokeDasharray="5,3" opacity="0.7"
                      markerEnd={selectedTool === "arrow" ? "url(#arrow)" : undefined} />
                  )}

                  {circles.filter(c => !hiddenIds.includes(c.id)).map(c => (
                    <circle key={c.id} cx={c.center.x} cy={c.center.y} r={c.radius}
                      fill={c.fill ? c.color + "22" : "none"}
                      stroke={selectedIds.includes(c.id) ? "var(--gold)" : c.color}
                      strokeWidth={selectedIds.includes(c.id) ? c.thickness + 1 : c.thickness}
                      strokeDasharray={c.dashed ? "6,3" : "none"}
                      filter="url(#glow)"
                      style={{ zIndex: (c.zIndex || 0) + (selectedIds.includes(c.id) ? 500 : 0) }}
                      className={selectedIds.includes(c.id) ? "pointer-events-auto cursor-pointer" : ""}
                      onClick={e => { e.stopPropagation(); if (!selectedIds.includes(c.id)) addToSelection(c.id); }} />
                  ))}

                  {circlePreview && circlePreview.radius > 2 && (
                    <circle cx={circlePreview.center.x} cy={circlePreview.center.y} r={circlePreview.radius}
                      fill="none" stroke="var(--gold)" strokeWidth={2} strokeDasharray="5,3" opacity="0.7" />
                  )}

                  {strokes.filter(s => !hiddenIds.includes(s.id)).map(stroke => (
                    <path key={stroke.id}
                      d={stroke.points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                      fill="none" stroke={selectedIds.includes(stroke.id) ? "var(--gold)" : stroke.color}
                      strokeWidth={stroke.thickness}
                      strokeLinecap="round" strokeLinejoin="round"
                      filter="url(#glow)"
                      style={{ zIndex: (stroke.zIndex || 0) + (selectedIds.includes(stroke.id) ? 500 : 0) }}
                      className={selectedIds.includes(stroke.id) ? "pointer-events-auto cursor-pointer" : ""}
                      onClick={e => { e.stopPropagation(); if (!selectedIds.includes(stroke.id)) addToSelection(stroke.id); }} />
                  ))}

                  {brushStroke.length > 1 && (
                    <path
                      d={brushStroke.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")}
                      fill="none" stroke={selectedColor} strokeWidth={2}
                      strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
                  )}
                </svg>
              )}

              {labels.filter(l => !hiddenIds.includes(l.id)).map(label => (
                <div key={label.id}
                  className={cn(
                    "absolute -translate-x-1/2 select-none",
                    selectedIds.includes(label.id) ? "pointer-events-auto cursor-pointer" : "pointer-events-none"
                  )}
                  style={{ left: label.position.x, top: label.position.y, zIndex: (label.zIndex || 0) + (selectedIds.includes(label.id) ? 500 : 0) }}
                  onDoubleClick={e => { e.stopPropagation(); handleLabelDoubleClick(label); }}
                  onClick={e => { e.stopPropagation(); if (!selectedIds.includes(label.id)) addToSelection(label.id); }}>
                  <div className={cn("px-2 py-0.5 rounded text-white text-xs whitespace-nowrap transition-all",
                    selectedIds.includes(label.id) ? "ring-2 ring-amber-400" : "")}
                    style={{ background: "rgba(8,8,16,0.85)", borderLeft: `3px solid ${label.color}`, fontSize: label.fontSize }}>
                    {label.text}
                  </div>
                </div>
              ))}

              {markers.filter(m => !hiddenIds.includes(m.id)).map(marker => (
                <div key={marker.id}
                  className={cn("absolute -translate-x-1/2 -translate-y-1/2 transition-all pointer-events-auto")}
                  style={{ left: marker.position.x, top: marker.position.y, zIndex: (marker.zIndex || 0) + (selectedIds.includes(marker.id) ? 500 : 0) }}
                  onClick={e => { e.stopPropagation(); if (!selectedIds.includes(marker.id)) addToSelection(marker.id); }}
                  onWheel={e => {
                    if (marker.shape === "icon") {
                      e.preventDefault();
                      e.stopPropagation();
                      const delta = e.deltaY > 0 ? -4 : 4;
                      const newSize = Math.max(16, Math.min(128, (marker.iconSize || 48) + delta));
                      updateMarkerSize(marker.id, newSize);
                    }
                  }}>
                  {marker.shape === "icon" && marker.iconSrc ? (
                    <div className="relative" style={{ width: marker.iconSize || 48, height: marker.iconSize || 48 }}>
                      <img src={marker.iconSrc} alt="" className="w-full h-full object-contain" draggable={false} />
                      {selectedIds.includes(marker.id) && (
                        <div className="absolute -inset-1 rounded-lg border-2 border-amber-400/60 pointer-events-none" />
                      )}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                      style={{ borderColor: marker.color, backgroundColor: marker.color + "33" }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: marker.color }} />
                    </div>
                  )}
                  {selectedIds.includes(marker.id) && marker.shape !== "icon" && (
                    <div className="absolute inset-0 rounded-full ring-2 ring-amber-400" />
                  )}
                </div>
              ))}

              {markerPreview && (
                <div className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-2 border-dashed pointer-events-none z-40"
                  style={{ left: markerPreview.x, top: markerPreview.y, borderColor: selectedColor, backgroundColor: selectedColor + "22" }}>
                  <div className="w-2 h-2 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ backgroundColor: selectedColor }} />
                </div>
              )}

              {units.filter(u => !hiddenIds.includes(u.id)).map(unit => {
                const config = UNIT_CONFIGS.find(c => c.type === unit.type);
                const isSelected = selectedIds.includes(unit.id);
                const isDragging = dragUnitId === unit.id;
                const zIndex = unit.zIndex || 0;
                return (
                  <div key={unit.id}
                    className={cn(
                      "absolute -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center transition-all duration-75",
                      isDragging ? "scale-110 marker-dragging" : "",
                      "pointer-events-auto"
                    )}
                    style={{ left: unit.position.x, top: unit.position.y, width: unit.size || 48, height: unit.size || 48, zIndex: isDragging ? 1000 : isSelected ? zIndex + 500 : zIndex + 100 }}
                    onMouseDown={e => { e.stopPropagation(); if (!isSpaceDown) { setDragUnitId(unit.id); setDragStartPos(unit.position); setSelectedMarkerId(unit.id); if (!isSelected) addToSelection(unit.id); } }}
                    onClick={e => { e.stopPropagation(); if (!isSpaceDown) { if (!isSelected) addToSelection(unit.id); } }}>
                    <div className={cn("absolute inset-0 rounded-full transition-all", isSelected ? "selection-ring" : "")}
                      style={{ borderColor: `${config?.color}80`, borderWidth: "2px" }} />
                    <div className="absolute inset-[3px] rounded-full flex items-center justify-center text-white"
                      style={{ background: `linear-gradient(135deg, ${config?.color}, ${config?.color}aa)` }}>
                      {UNIT_ICONS[unit.type]}
                    </div>
                    {unit.label && (
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white px-1 py-0.5 rounded whitespace-nowrap"
                        style={{ background: "rgba(8,8,16,0.85)" }}>
                        {unit.label}
                      </div>
                    )}
                  </div>
                );
              })}

              {lineStart && mapLoaded && (
                <div className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full pulse-glow pointer-events-none z-40"
                  style={{ left: lineStart.x, top: lineStart.y, background: "var(--gold)" }} />
              )}

              {circleStart && mapLoaded && (
                <div className="absolute w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-40"
                  style={{ left: circleStart.x, top: circleStart.y, background: "white", border: "2px solid var(--gold)" }} />
              )}

              {hoverPos && mapLoaded && !isPanning && (
                <div className="absolute pointer-events-none z-40 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: hoverPos.x, top: hoverPos.y }}>
                  <div className="absolute w-5 h-px -translate-x-1/2 opacity-40" style={{ background: "var(--gold)" }} />
                  <div className="absolute h-5 w-px -translate-y-1/2 opacity-40" style={{ background: "var(--gold)" }} />
                </div>
              )}
            </div>
          </div>
        </div>

        <FloatingToolbar
          selectedTool={selectedTool} onTool={setTool}
          onUndo={undo} onRedo={redo} canUndo={historyIndex >= 0} canRedo={historyIndex < history.length - 1}
          onSave={() => setShowSaveModal(true)} onExport={handleExport} onClear={() => { if (confirm("Xóa toàn bộ?")) clearBoard(); }}
          visible={showFloatingToolbar && tabletMode}
        />

        {editingLabel && containerRef.current && (
          <TextEditor
            position={editingLabel.position}
            initialText={editingLabel.text}
            color={editingLabel.color}
            fontSize={editingLabel.fontSize}
            zoom={zoom} pan={pan}
            containerRect={containerRef.current.getBoundingClientRect()}
            onSave={handleSaveLabel}
            onCancel={() => setEditingLabel(null)}
          />
        )}

        <TextInputModal
          isOpen={showTextInput}
          title="Thêm Text"
          placeholder="Nhập text..."
          confirmText="Thêm"
          onConfirm={(text) => {
            if (textInputPos) {
              addLabel({ position: textInputPos, text: sanitizeText(text), color: selectedColor, fontSize: 14 });
            }
            setShowTextInput(false);
            setTextInputPos(null);
          }}
          onCancel={() => {
            setShowTextInput(false);
            setTextInputPos(null);
          }}
        />

        {showSaveModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 modal-backdrop" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setShowSaveModal(false)}>
            <div className="rounded-xl p-6 w-80 shadow-2xl fade-in" style={{ background: "var(--surface)", border: "1px solid var(--border-active)" }} onClick={e => e.stopPropagation()}>
              <h3 className="text-[13px] font-semibold mb-4" style={{ color: "var(--gold)" }}>Lưu Chiến Thuật</h3>
              <input type="text" value={saveName} onChange={e => setSaveName(e.target.value)}
                placeholder="Tên chiến thuật..." autoFocus
                className="w-full px-4 py-2.5 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-offset-1"
                style={{ background: "var(--secondary)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                onKeyDown={e => e.key === "Enter" && handleSave()} />
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowSaveModal(false)}
                  className="flex-1 py-2 rounded-lg text-[12px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1" style={{ background: "var(--secondary)", color: "var(--text-secondary)" }}>
                  Hủy
                </button>
                <button onClick={handleSave}
                  className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
                  style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-dark))", color: "var(--background)" }}>
                  Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </ErrorBoundary>
    </div>
  );
}
