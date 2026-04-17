"use client";

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  presets?: string[];
}

const DEFAULT_PRESETS = [
  "#ffffff", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#ef4444", "#6366f1", "#14b8a6", "#a855f7",
];

export function ColorPicker({ selectedColor, onColorChange, presets = DEFAULT_PRESETS }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={selectedColor}
        onChange={e => onColorChange(e.target.value)}
        className="w-7 h-7 rounded-lg cursor-pointer border-0 p-0 overflow-hidden"
        style={{ background: "none" }}
        title="Chọn màu tự do"
        aria-label="Color picker"
      />
      <div className="grid grid-cols-6 gap-1">
        {presets.map(c => (
          <button
            key={c}
            onClick={() => onColorChange(c)}
            className="w-6 h-6 rounded-md transition-all duration-150 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{
              backgroundColor: c,
              boxShadow: selectedColor === c
                ? `0 0 0 2px var(--background), 0 0 0 4px ${c}60`
                : "none",
              transform: selectedColor === c ? "scale(1.1)" : "scale(1)",
            }}
            aria-label={`Select color ${c}`}
            aria-pressed={selectedColor === c}
          />
        ))}
      </div>
    </div>
  );
}
