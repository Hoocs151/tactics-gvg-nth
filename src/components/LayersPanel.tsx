"use client";

import React, { memo, useCallback } from "react";
import { useTacticsStore } from "@/store/tacticsStore";
import { UNIT_CONFIGS } from "@/lib/types";
import {
  Eye, EyeOff, ArrowUp, ArrowDown,
  Trash2, ChevronRight, ChevronDown, Shield, Minus,
  Circle as CircleIcon, Pencil, Type, MapPin
} from "lucide-react";

interface LayersPanelProps {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  onClose?: () => void;
}

interface LayerItemProps {
  id: string;
  type: "unit" | "line" | "circle" | "marker" | "stroke" | "label";
  name: string;
  color: string;
  zIndex: number;
  isSelected: boolean;
  isVisible: boolean;
  isLocked: boolean;
  icon: React.ReactNode;
  onSelect: () => void;
  onToggleVisibility: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onDelete: () => void;
}

const LayerItem = memo(function LayerItem({
  id: _id, type: _type, name, color, zIndex, isSelected, isVisible, isLocked: _isLocked, icon,
  onSelect, onToggleVisibility, onBringToFront, onSendToBack, onDelete
}: LayerItemProps) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-[11px]
        ${isSelected ? "bg-amber-500/20 ring-1 ring-amber-500/50" : "hover:bg-white/5"}`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
        className="p-0.5 rounded hover:bg-white/10 shrink-0"
        title={isVisible ? "Ẩn" : "Hiện"}
      >
        {isVisible ? (
          <Eye className="w-3.5 h-3.5" style={{ color: "var(--text-muted)" }} />
        ) : (
          <EyeOff className="w-3.5 h-3.5 text-gray-600" />
        )}
      </button>

      <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: color + "33" }}>
        <div className="w-3 h-3" style={{ color }}>{icon}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="truncate" style={{ color: "var(--text-secondary)" }}>{name}</div>
        <div className="text-[9px]" style={{ color: "var(--text-muted)" }}>z: {zIndex}</div>
      </div>

      {isSelected && (
        <div className="flex items-center gap-0.5 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onBringToFront(); }}
            className="p-1 rounded hover:bg-white/10" title="Lên trên">
            <ArrowUp className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onSendToBack(); }}
            className="p-1 rounded hover:bg-white/10" title="Xuống dưới">
            <ArrowDown className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded hover:bg-red-500/20" title="Xóa">
            <Trash2 className="w-3 h-3" style={{ color: "var(--red)" }} />
          </button>
        </div>
      )}
    </div>
  );
});

export const LayersPanel = memo(function LayersPanel() {
  const {
    units, lines, circles, markers, strokes, labels, hiddenIds,
    selectedIds, addToSelection, clearSelection,
    bringToFront, sendToBack, removeUnit, removeLine, removeCircle,
    removeMarker, removeStroke, removeLabel, toggleVisibility
  } = useTacticsStore();

  const [visibleTypes, setVisibleTypes] = React.useState({
    unit: true, line: true, circle: true, marker: true, stroke: true, label: true
  });

  const toggleType = useCallback((type: keyof typeof visibleTypes) => {
    setVisibleTypes(v => ({ ...v, [type]: !v[type] }));
  }, []);

  const handleSelect = useCallback((id: string) => {
    if (!selectedIds.includes(id)) {
      clearSelection();
      addToSelection(id);
    }
  }, [selectedIds, clearSelection, addToSelection]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "unit": return <Shield className="w-3 h-3" />;
      case "line": return <Minus className="w-3 h-3" />;
      case "circle": return <CircleIcon className="w-3 h-3" />;
      case "marker": return <MapPin className="w-3 h-3" />;
      case "stroke": return <Pencil className="w-3 h-3" />;
      case "label": return <Type className="w-3 h-3" />;
      default: return null;
    }
  };

  const getTypeName = (item: { id: string; type?: string; label?: string; text?: string; shape?: string }) => {
    if ("label" in item && item.label) return item.label;
    if ("text" in item && item.text) return item.text;
    if ("type" in item && item.type) {
      const config = UNIT_CONFIGS.find(c => c.type === item.type);
      return config?.nameVi || item.type;
    }
    if ("shape" in item) return item.shape || "marker";
    return item.id.slice(0, 8);
  };

  const allItems = [
    ...units.filter(u => visibleTypes.unit).map((u, _i) => ({
      id: u.id, type: "unit" as const, name: getTypeName(u),
      color: u.color || UNIT_CONFIGS.find(c => c.type === u.type)?.color || "#888",
      zIndex: u.zIndex || 0, item: u
    })),
    ...lines.filter(l => visibleTypes.line).map((l, _i) => ({
      id: l.id, type: "line" as const, name: getTypeName(l),
      color: l.color, zIndex: l.zIndex || 0, item: l
    })),
    ...circles.filter(c => visibleTypes.circle).map((c, _i) => ({
      id: c.id, type: "circle" as const, name: getTypeName(c),
      color: c.color, zIndex: c.zIndex || 0, item: c
    })),
    ...markers.filter(m => visibleTypes.marker).map((m, _i) => ({
      id: m.id, type: "marker" as const, name: getTypeName(m),
      color: m.color, zIndex: m.zIndex || 0, item: m
    })),
    ...strokes.filter(s => visibleTypes.stroke).map((s, _i) => ({
      id: s.id, type: "stroke" as const, name: getTypeName(s),
      color: s.color, zIndex: s.zIndex || 0, item: s
    })),
    ...labels.filter(l => visibleTypes.label).map((l, _i) => ({
      id: l.id, type: "label" as const, name: getTypeName(l),
      color: l.color, zIndex: l.zIndex || 0, item: l
    })),
  ].sort((a, b) => b.zIndex - a.zIndex);

  const deleteHandlers: Record<string, (id: string) => void> = {
    unit: (id) => { removeUnit(id); clearSelection(); },
    line: (id) => { removeLine(id); clearSelection(); },
    circle: (id) => { removeCircle(id); clearSelection(); },
    marker: (id) => { removeMarker(id); clearSelection(); },
    stroke: (id) => { removeStroke(id); clearSelection(); },
    label: (id) => { removeLabel(id); clearSelection(); },
  };

  return (
    <div className="w-56 flex flex-col h-full shrink-0"
      style={{ background: "linear-gradient(180deg, var(--surface) 0%, var(--primary) 100%)", borderRight: "1px solid var(--border)" }}>
      <div className="px-3 py-2 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
        <h3 className="text-xs font-semibold" style={{ color: "var(--gold)" }}>LAYERS</h3>
        <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>{allItems.length} items</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {(["unit", "line", "circle", "marker", "stroke", "label"] as const).map(type => {
          const typeItems = allItems.filter(i => i.type === type);
          if (typeItems.length === 0) return null;
          return (
            <div key={type}>
              <button
                onClick={() => toggleType(type)}
                className="flex items-center gap-1 w-full px-2 py-1 rounded hover:bg-white/5 text-[10px] font-medium transition-colors"
                style={{ color: "var(--text-muted)" }}
              >
                {visibleTypes[type] ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                {type.toUpperCase()} ({typeItems.length})
              </button>
              {visibleTypes[type] && (
                <div className="mt-1 space-y-1">
                  {typeItems.map(item => (
                    <LayerItem
                      key={item.id}
                      id={item.id}
                      type={item.type}
                      name={item.name}
                      color={item.color}
                      zIndex={item.zIndex}
                      isSelected={selectedIds.includes(item.id)}
                      isVisible={!hiddenIds.includes(item.id)}
                      isLocked={false}
                      icon={getTypeIcon(item.type)}
                      onSelect={() => handleSelect(item.id)}
                      onToggleVisibility={() => toggleVisibility(item.id)}
                      onBringToFront={() => bringToFront(item.id, item.type)}
                      onSendToBack={() => sendToBack(item.id, item.type)}
                      onDelete={() => deleteHandlers[item.type]?.(item.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
