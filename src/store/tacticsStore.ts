import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Unit, DrawingLine, DrawingCircle, DrawingMarker, TextLabel, DrawingStroke,
  Tool, UnitType, PixelPosition, Tactic
} from "@/lib/types";
import { generateId } from "@/lib/utils";

interface HistoryState {
  units: Unit[];
  lines: DrawingLine[];
  circles: DrawingCircle[];
  markers: DrawingMarker[];
  strokes: DrawingStroke[];
  labels: TextLabel[];
}

interface TacticsState {
  units: Unit[];
  lines: DrawingLine[];
  circles: DrawingCircle[];
  markers: DrawingMarker[];
  strokes: DrawingStroke[];
  labels: TextLabel[];

  selectedTool: Tool;
  selectedUnitType: UnitType | null;
  selectedIconMarkerType: string | null;
  selectedColor: string;
  selectedMarkerId: string | null;

  history: HistoryState[];
  historyIndex: number;
  maxHistorySize: number;

  tactics: Tactic[];
  isDirty: boolean;

  selectedIds: string[];
  clipboard: { units: Unit[]; lines: DrawingLine[]; circles: DrawingCircle[]; markers: DrawingMarker[]; strokes: DrawingStroke[]; labels: TextLabel[] } | null;

  hiddenIds: string[];
  toggleVisibility: (id: string) => void;

  addUnit: (position: PixelPosition) => void;
  removeUnit: (id: string) => void;
  moveUnit: (id: string, position: PixelPosition) => void;
  updateUnitLabel: (id: string, label: string) => void;
  updateUnit: (id: string, updates: Partial<Unit>) => void;

  addLine: (line: Omit<DrawingLine, "id">) => void;
  removeLine: (id: string) => void;
  updateLine: (id: string, updates: Partial<DrawingLine>) => void;

  addCircle: (circle: Omit<DrawingCircle, "id">) => void;
  removeCircle: (id: string) => void;
  updateCircle: (id: string, updates: Partial<DrawingCircle>) => void;

  addMarker: (marker: Omit<DrawingMarker, "id">) => void;
  removeMarker: (id: string) => void;
  updateMarker: (id: string, updates: Partial<DrawingMarker>) => void;
  updateMarkerSize: (id: string, size: number) => void;
  bringToFront: (id: string, type: "unit" | "line" | "circle" | "marker" | "stroke" | "label") => void;
  sendToBack: (id: string, type: "unit" | "line" | "circle" | "marker" | "stroke" | "label") => void;

  addStroke: (stroke: Omit<DrawingStroke, "id">) => void;
  removeStroke: (id: string) => void;
  updateStroke: (id: string, updates: Partial<DrawingStroke>) => void;

  addLabel: (label: Omit<TextLabel, "id">) => void;
  removeLabel: (id: string) => void;
  updateLabel: (id: string, updates: Partial<TextLabel>) => void;

  setTool: (tool: Tool) => void;
  setSelectedUnitType: (type: UnitType | null) => void;
  setSelectedIconMarkerType: (id: string | null) => void;
  setSelectedColor: (color: string) => void;
  setSelectedMarkerId: (id: string | null) => void;

  setSelectedIds: (ids: string[]) => void;
  addToSelection: (id: string) => void;
  removeFromSelection: (id: string) => void;
  clearSelection: () => void;
  copySelection: () => void;
  pasteSelection: (offsetX?: number, offsetY?: number) => void;
  deleteSelected: () => void;

  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  setMaxHistorySize: (size: number) => void;

  clearBoard: () => void;

  saveTactic: (name: string, mapName: string) => void;
  loadTactic: (id: string) => void;
  deleteTactic: (id: string) => void;
  duplicateTactic: (id: string) => void;

  getAllObjects: () => { units: Unit[]; lines: DrawingLine[]; circles: DrawingCircle[]; markers: DrawingMarker[]; strokes: DrawingStroke[]; labels: TextLabel[]; };
}

const initialState = {
  units: [],
  lines: [],
  circles: [],
  markers: [],
  strokes: [],
  labels: [],
  selectedTool: "pointer" as Tool,
  selectedUnitType: null,
  selectedIconMarkerType: null,
  selectedColor: "#e74c3c",
  selectedMarkerId: null,
  history: [],
  historyIndex: -1,
  maxHistorySize: 100,
  tactics: [],
  isDirty: false,
  selectedIds: [],
  clipboard: null,
  hiddenIds: [],
};

function cloneState(state: HistoryState): HistoryState {
  return structuredClone(state);
}

function makeEntry(state: Pick<TacticsState, "units" | "lines" | "circles" | "markers" | "strokes" | "labels">): HistoryState {
  return structuredClone({ units: state.units, lines: state.lines, circles: state.circles, markers: state.markers, strokes: state.strokes, labels: state.labels });
}

export const useTacticsStore = create<TacticsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setMaxHistorySize: (size) => set({ maxHistorySize: size }),

      saveToHistory: () => {
        const { units, lines, circles, markers, strokes, labels, history, historyIndex, maxHistorySize } = get();
        const entry = makeEntry({ units, lines, circles, markers, strokes, labels });
        let newHistory = [...history.slice(0, historyIndex + 1), entry];
        if (newHistory.length > maxHistorySize) {
          newHistory = newHistory.slice(newHistory.length - maxHistorySize);
        }
        set({ history: newHistory, historyIndex: newHistory.length - 1, isDirty: true });
      },

      addUnit: (position) => {
        const { selectedUnitType, selectedColor, units, saveToHistory } = get();
        if (!selectedUnitType) return;
        saveToHistory();
        set({
          units: [...units, { id: generateId(), type: selectedUnitType, color: selectedColor, position, size: 48 }],
          isDirty: true,
        });
      },

      removeUnit: (id) => {
        const { units, saveToHistory } = get();
        saveToHistory();
        set({ units: units.filter(u => u.id !== id), selectedIds: [], isDirty: true });
      },

      moveUnit: (id, position) => {
        const { units } = get();
        set({ units: units.map(u => u.id === id ? { ...u, position } : u), isDirty: true });
      },

      updateUnitLabel: (id, label) => {
        const { units, saveToHistory } = get();
        saveToHistory();
        set({ units: units.map(u => u.id === id ? { ...u, label } : u), isDirty: true });
      },

      updateUnit: (id, updates) => {
        const { units, saveToHistory } = get();
        saveToHistory();
        set({ units: units.map(u => u.id === id ? { ...u, ...updates } : u), isDirty: true });
      },

      addLine: (line) => {
        const { lines, saveToHistory } = get();
        saveToHistory();
        set({ lines: [...lines, { ...line, id: generateId() }], isDirty: true });
      },

      removeLine: (id) => {
        const { lines, saveToHistory } = get();
        saveToHistory();
        set({ lines: lines.filter(l => l.id !== id), selectedIds: [], isDirty: true });
      },

      updateLine: (id, updates) => {
        const { lines, saveToHistory } = get();
        saveToHistory();
        set({ lines: lines.map(l => l.id === id ? { ...l, ...updates } : l), isDirty: true });
      },

      addCircle: (circle) => {
        const { circles, saveToHistory } = get();
        saveToHistory();
        set({ circles: [...circles, { ...circle, id: generateId() }], isDirty: true });
      },

      removeCircle: (id) => {
        const { circles, saveToHistory } = get();
        saveToHistory();
        set({ circles: circles.filter(c => c.id !== id), selectedIds: [], isDirty: true });
      },

      updateCircle: (id, updates) => {
        const { circles, saveToHistory } = get();
        saveToHistory();
        set({ circles: circles.map(c => c.id === id ? { ...c, ...updates } : c), isDirty: true });
      },

      addMarker: (marker) => {
        const { markers, saveToHistory } = get();
        saveToHistory();
        set({ markers: [...markers, { ...marker, id: generateId() }], isDirty: true });
      },

      removeMarker: (id) => {
        const { markers, saveToHistory } = get();
        saveToHistory();
        set({ markers: markers.filter(m => m.id !== id), selectedIds: [], isDirty: true });
      },

      updateMarker: (id, updates) => {
        const { markers, saveToHistory } = get();
        saveToHistory();
        set({ markers: markers.map(m => m.id === id ? { ...m, ...updates } : m), isDirty: true });
      },

      updateMarkerSize: (id, size) => {
        const { markers, saveToHistory } = get();
        saveToHistory();
        set({ markers: markers.map(m => m.id === id ? { ...m, size, iconSize: size } : m), isDirty: true });
      },

      bringToFront: (id, type) => {
        const currentState = get();
        const { saveToHistory } = get();
        saveToHistory();
        let maxZ = 0;
        if (type === "unit") {
          currentState.units.forEach(u => { if ((u.zIndex || 0) > maxZ) maxZ = u.zIndex || 0; });
          set({ units: currentState.units.map(u => u.id === id ? { ...u, zIndex: maxZ + 1 } : u), isDirty: true });
        } else if (type === "line") {
          currentState.lines.forEach(l => { if ((l.zIndex || 0) > maxZ) maxZ = l.zIndex || 0; });
          set({ lines: currentState.lines.map(l => l.id === id ? { ...l, zIndex: maxZ + 1 } : l), isDirty: true });
        } else if (type === "circle") {
          currentState.circles.forEach(c => { if ((c.zIndex || 0) > maxZ) maxZ = c.zIndex || 0; });
          set({ circles: currentState.circles.map(c => c.id === id ? { ...c, zIndex: maxZ + 1 } : c), isDirty: true });
        } else if (type === "marker") {
          currentState.markers.forEach(m => { if ((m.zIndex || 0) > maxZ) maxZ = m.zIndex || 0; });
          set({ markers: currentState.markers.map(m => m.id === id ? { ...m, zIndex: maxZ + 1 } : m), isDirty: true });
        } else if (type === "stroke") {
          currentState.strokes.forEach(s => { if ((s.zIndex || 0) > maxZ) maxZ = s.zIndex || 0; });
          set({ strokes: currentState.strokes.map(s => s.id === id ? { ...s, zIndex: maxZ + 1 } : s), isDirty: true });
        } else if (type === "label") {
          currentState.labels.forEach(l => { if ((l.zIndex || 0) > maxZ) maxZ = l.zIndex || 0; });
          set({ labels: currentState.labels.map(l => l.id === id ? { ...l, zIndex: maxZ + 1 } : l), isDirty: true });
        }
      },

      sendToBack: (id, type) => {
        const currentState = get();
        const { saveToHistory } = get();
        saveToHistory();
        let minZ = 0;
        if (type === "unit") {
          currentState.units.forEach(u => { if ((u.zIndex || 0) < minZ) minZ = u.zIndex || 0; });
          set({ units: currentState.units.map(u => u.id === id ? { ...u, zIndex: minZ - 1 } : u), isDirty: true });
        } else if (type === "line") {
          currentState.lines.forEach(l => { if ((l.zIndex || 0) < minZ) minZ = l.zIndex || 0; });
          set({ lines: currentState.lines.map(l => l.id === id ? { ...l, zIndex: minZ - 1 } : l), isDirty: true });
        } else if (type === "circle") {
          currentState.circles.forEach(c => { if ((c.zIndex || 0) < minZ) minZ = c.zIndex || 0; });
          set({ circles: currentState.circles.map(c => c.id === id ? { ...c, zIndex: minZ - 1 } : c), isDirty: true });
        } else if (type === "marker") {
          currentState.markers.forEach(m => { if ((m.zIndex || 0) < minZ) minZ = m.zIndex || 0; });
          set({ markers: currentState.markers.map(m => m.id === id ? { ...m, zIndex: minZ - 1 } : m), isDirty: true });
        } else if (type === "stroke") {
          currentState.strokes.forEach(s => { if ((s.zIndex || 0) < minZ) minZ = s.zIndex || 0; });
          set({ strokes: currentState.strokes.map(s => s.id === id ? { ...s, zIndex: minZ - 1 } : s), isDirty: true });
        } else if (type === "label") {
          currentState.labels.forEach(l => { if ((l.zIndex || 0) < minZ) minZ = l.zIndex || 0; });
          set({ labels: currentState.labels.map(l => l.id === id ? { ...l, zIndex: minZ - 1 } : l), isDirty: true });
        }
      },

      addStroke: (stroke) => {
        const { strokes, saveToHistory } = get();
        saveToHistory();
        set({ strokes: [...strokes, { ...stroke, id: generateId() }], isDirty: true });
      },

      removeStroke: (id) => {
        const { strokes, saveToHistory } = get();
        saveToHistory();
        set({ strokes: strokes.filter(s => s.id !== id), selectedIds: [], isDirty: true });
      },

      updateStroke: (id, updates) => {
        const { strokes, saveToHistory } = get();
        saveToHistory();
        set({ strokes: strokes.map(s => s.id === id ? { ...s, ...updates } : s), isDirty: true });
      },

      addLabel: (label) => {
        const { labels, saveToHistory } = get();
        saveToHistory();
        set({ labels: [...labels, { ...label, id: generateId() }], isDirty: true });
      },

      removeLabel: (id) => {
        const { labels, saveToHistory } = get();
        saveToHistory();
        set({ labels: labels.filter(l => l.id !== id), selectedIds: [], isDirty: true });
      },

      updateLabel: (id, updates) => {
        const { labels, saveToHistory } = get();
        saveToHistory();
        set({ labels: labels.map(l => l.id === id ? { ...l, ...updates } : l), isDirty: true });
      },

      setTool: (tool) => set({ selectedTool: tool }),
      setSelectedUnitType: (type) => set({ selectedUnitType: type }),
      setSelectedIconMarkerType: (id) => set({ selectedIconMarkerType: id }),
      setSelectedColor: (color) => set({ selectedColor: color }),
      setSelectedMarkerId: (id) => set({ selectedMarkerId: id }),

      setSelectedIds: (ids) => set({ selectedIds: ids }),
      addToSelection: (id) => set(s => ({ selectedIds: s.selectedIds.includes(id) ? s.selectedIds : [...s.selectedIds, id] })),
      removeFromSelection: (id) => set(s => ({ selectedIds: s.selectedIds.filter(i => i !== id) })),
      clearSelection: () => set({ selectedIds: [], selectedMarkerId: null }),

      copySelection: () => {
        const { units, lines, circles, markers, strokes, labels, selectedIds } = get();
        const ids = new Set(selectedIds);
        set({
          clipboard: {
            units: units.filter(u => ids.has(u.id)),
            lines: lines.filter(l => ids.has(l.id)),
            circles: circles.filter(c => ids.has(c.id)),
            markers: markers.filter(m => ids.has(m.id)),
            strokes: strokes.filter(s => ids.has(s.id)),
            labels: labels.filter(l => ids.has(l.id)),
          }
        });
      },

      pasteSelection: (offsetX = 15, offsetY = 15) => {
        const { clipboard, units, lines, circles, markers, strokes, labels, saveToHistory } = get();
        if (!clipboard) return;
        saveToHistory();
        const idMap = new Map<string, string>();
        const newUnits = clipboard.units.map(u => { const id = generateId(); idMap.set(u.id, id); return { ...u, id, position: { x: u.position.x + offsetX, y: u.position.y + offsetY } }; });
        const newLines = clipboard.lines.map(l => { const id = generateId(); idMap.set(l.id, id); return { ...l, id, from: { x: l.from.x + offsetX, y: l.from.y + offsetY }, to: { x: l.to.x + offsetX, y: l.to.y + offsetY } }; });
        const newCircles = clipboard.circles.map(c => { const id = generateId(); idMap.set(c.id, id); return { ...c, id, center: { x: c.center.x + offsetX, y: c.center.y + offsetY } }; });
        const newMarkers = clipboard.markers.map(m => { const id = generateId(); idMap.set(m.id, id); return { ...m, id, position: { x: m.position.x + offsetX, y: m.position.y + offsetY } }; });
        const newStrokes = clipboard.strokes.map(s => { const id = generateId(); idMap.set(s.id, id); return { ...s, id, points: s.points.map(p => ({ x: p.x + offsetX, y: p.y + offsetY })) }; });
        const newLabels = clipboard.labels.map(l => { const id = generateId(); idMap.set(l.id, id); return { ...l, id, position: { x: l.position.x + offsetX, y: l.position.y + offsetY } }; });
        const newIds = [...newUnits, ...newLines, ...newCircles, ...newMarkers, ...newStrokes, ...newLabels].map(o => o.id);
        set({
          units: [...units, ...newUnits],
          lines: [...lines, ...newLines],
          circles: [...circles, ...newCircles],
          markers: [...markers, ...newMarkers],
          strokes: [...strokes, ...newStrokes],
          labels: [...labels, ...newLabels],
          selectedIds: newIds,
          isDirty: true,
        });
      },

      deleteSelected: () => {
        const { units, lines, circles, markers, strokes, labels, selectedIds, saveToHistory } = get();
        if (selectedIds.length === 0) return;
        saveToHistory();
        const ids = new Set(selectedIds);
        set({
          units: units.filter(u => !ids.has(u.id)),
          lines: lines.filter(l => !ids.has(l.id)),
          circles: circles.filter(c => !ids.has(c.id)),
          markers: markers.filter(m => !ids.has(m.id)),
          strokes: strokes.filter(s => !ids.has(s.id)),
          labels: labels.filter(l => !ids.has(l.id)),
          selectedIds: [],
          selectedMarkerId: null,
          isDirty: true,
        });
      },

      undo: () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
          const prev = history[historyIndex - 1];
          set({ ...cloneState(prev), historyIndex: historyIndex - 1, isDirty: true });
        } else if (historyIndex === 0) {
          set({ units: [], lines: [], circles: [], markers: [], strokes: [], labels: [], historyIndex: -1, isDirty: false });
        }
      },

      redo: () => {
        const { history, historyIndex } = get();
        if (historyIndex < history.length - 1) {
          const next = history[historyIndex + 1];
          set({ ...cloneState(next), historyIndex: historyIndex + 1 });
        }
      },

      clearBoard: () => {
        const { saveToHistory } = get();
        saveToHistory();
        set({ units: [], lines: [], circles: [], markers: [], strokes: [], labels: [], selectedMarkerId: null, selectedIds: [], isDirty: true });
      },

      saveTactic: (name, mapName) => {
        const { units, lines, circles, markers, strokes, labels, tactics } = get();
        const now = new Date().toISOString();
        set({
          tactics: [...tactics, {
            id: generateId(), name, mapName,
            createdAt: now, updatedAt: now,
            units: [...units],
            lines: [...lines],
            circles: [...circles],
            markers: [...markers],
            strokes: [...strokes],
            labels: [...labels],
          }],
          isDirty: false,
        });
      },

      loadTactic: (id) => {
        const { tactics, history, saveToHistory } = get();
        const tactic = tactics.find(t => t.id === id);
        if (tactic) {
          saveToHistory();
          set({
            units: [...tactic.units],
            lines: [...tactic.lines],
            circles: [...tactic.circles],
            markers: [...tactic.markers],
            strokes: [...tactic.strokes || []],
            labels: [...tactic.labels],
            history: [...history.slice(0, history.length)],
            historyIndex: -1,
            selectedMarkerId: null,
            selectedIds: [],
            isDirty: false,
          });
        }
      },

      deleteTactic: (id) => {
        const { tactics } = get();
        set({ tactics: tactics.filter(t => t.id !== id), isDirty: true });
      },

      duplicateTactic: (id) => {
        const { tactics, saveToHistory } = get();
        const tactic = tactics.find(t => t.id === id);
        if (tactic) {
          const now = new Date().toISOString();
          saveToHistory();
          set({
            tactics: [...tactics, {
              ...tactic,
              id: generateId(),
              name: `${tactic.name} (Copy)`,
              createdAt: now,
              updatedAt: now,
            }],
            isDirty: true,
          });
        }
      },

      getAllObjects: () => {
        const { units, lines, circles, markers, strokes, labels } = get();
        return { units, lines, circles, markers, strokes, labels };
      },

      toggleVisibility: (id) => {
        const { hiddenIds } = get();
        if (hiddenIds.includes(id)) {
          set({ hiddenIds: hiddenIds.filter(h => h !== id) });
        } else {
          set({ hiddenIds: [...hiddenIds, id] });
        }
      },
    }),
    {
      name: "tactics-storage-v2",
      partialize: (state) => ({
        tactics: state.tactics,
        selectedColor: state.selectedColor,
        maxHistorySize: state.maxHistorySize,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isDirty = false;
      },
    }
  )
);
