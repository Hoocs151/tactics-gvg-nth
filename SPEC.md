# Bôn Làng - Chiến Thuật Bang

## 1. Concept & Vision

Website bàn chiến thuật bang hội cho game **Nghịch Thuỷ Hàn**. Giao diện mang phong cách Đông Á cổ đại - "Bôn Làng" với logo riêng, cho phép lãnh đạo bang hội bàn chiến, đặt đoàn quân, vẽ đường tiến công và lưu trữ chiến thuật.

## 2. Design Language

### Aesthetic Direction
- **Theme**: Võ hiệp cổ đại - Chiến trường bang hội
- **Branding**: Logo Bôn Làng (bonlang.png)
- **Mood**: Trang nghiêm, chiến lược, quân sự

### Color Palette
```
Primary:        #1a1a2e (Đen hoàng gia)
Secondary:      #16213e (Xanh đêm)
Accent Gold:    #c9a227 (Vàng hoàng kim)
Accent Red:     #e74c3c (Đỏ chiến trường)
Accent Blue:    #3498db (Xanh thiên thanh)
Background:     #0f0f1a (Nền đen sâu)
Surface:        #1e1e32 (Bề mặt)
Text Primary:   #e8e8e8 (Trắng ngà)
Text Secondary: #a0a0a0 (Xám bạc)
Grid Line:      rgba(201, 162, 39, 0.15)
```

### Typography
- **Headings**: Cinzel - font Latin phong cách cổ điển
- **Body/UI**: Noto Sans SC, Noto Sans VN
- **Coordinates**: JetBrains Mono

### Visual Assets
- **Logo**: bonlang.png (logo chính của bang Bôn Làng)
- **Icons**: Lucide React
- **Map**: map.jpg làm nền chiến trường
- **Units**: Shield, Zap, RefreshCw, Package icons

## 3. Layout & Structure

```
┌─────────────────────────────────────────────────────────────┐
│ HEADER: Logo Bôn Làng + "Chiến Thuật Bang"                 │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   SIDEBAR    │           TACTICS BOARD                      │
│   (256px)    │           (Flexible)                        │
│              │                                              │
│  COLORS      │   ┌──────────────────────────────────────┐ │
│  [12 màu]   │   │                                      │ │
│              │   │     MAP + GRID OVERLAY + MARKERS     │ │
│  TOOLS       │   │                                      │ │
│  [8 tools]   │   │                                      │ │
│              │   └──────────────────────────────────────┘ │
│  UNITS       │                                              │
│  [4 đoàn]   │   Bảng điều khiển: Zoom, Reset, Shortcuts │
│              │                                              │
│  SAVED       │                                              │
│  [tactics]   │                                              │
│              │                                              │
│  ACTIONS     │                                              │
│  [Undo/Redo] │                                              │
│  [Clear/Save]│                                              │
└──────────────┴──────────────────────────────────────────────┘
```

## 4. Features & Interactions

### 4.1 Tools
| Tool | Phím | Mô tả |
|------|-------|--------|
| Pointer | 1 | Chọn & di chuyển units |
| Arrow | 2 | Vẽ mũi tên chỉ hướng |
| Circle | 3 | Vẽ vòng tròn bao vây |
| Line | 4 | Vẽ đường thẳng |
| Brush | 5 | Vẽ tự do (freehand) |
| Eraser | 6 | Xóa objects |
| Text | 7 | Thêm nhãn text |
| Marker | 8 | Đánh dấu vị trí |

### 4.2 Units (Đoàn quân)
- **Đoàn Thủ** (Defense) - Màu đỏ - Phòng thủ
- **Đoàn Đẩy** (Push) - Màu xanh - Tấn công
- **Đoàn Linh Hoạt** (Flex) - Màu xanh lá - Linh hoạt
- **Đoàn Vật Tư** (Supply) - Màu cam - Hậu cần

### 4.3 Colors Palette
12 màu: trắng, cam, vàng, xanh lá, xanh ngọc, xanh dương, tím, hồng, đỏ, chàm, xanh biển, tím đậm

### 4.4 Drawing Objects
- **Lines**: Đường thẳng / mũi tên với màu và độ dày
- **Circles**: Vòng tròn bao vây
- **Brush Strokes**: Nét vẽ tự do
- **Markers**: Điểm đánh dấu tròn
- **Labels**: Nhãn text với border màu

### 4.5 Pan & Zoom
- **Space + Drag**: Pan map
- **Scroll**: Zoom in/out (10% - 500%)
- **Reset**: Về view mặc định

### 4.6 Tactic Management
- **Save**: Lưu tactics vào localStorage
- **Load**: Tải tactics đã lưu
- **Delete**: Xóa tactics
- **Export PNG**: Xuất hình ảnh board
- **Clear**: Xóa toàn bộ objects

### 4.7 Undo/Redo
- Phím tắt: Z / Shift+Z
- Tối đa 100 steps

## 5. Technical Stack

### Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables
- **State**: Zustand
- **Icons**: Lucide React

### Data Model
```typescript
type UnitType = "defense" | "push" | "flex" | "supply";
type Tool = "pointer" | "arrow" | "circle" | "line" | "brush" | "eraser" | "text" | "marker";

interface PixelPosition { x: number; y: number; }

interface Unit {
  id: string; type: UnitType; color: string;
  position: PixelPosition; label?: string; size?: number;
}

interface DrawingLine {
  id: string; from: PixelPosition; to: PixelPosition;
  color: string; thickness: number;
  style: "straight" | "curved" | "dashed";
  arrowEnd: boolean;
}

interface DrawingCircle {
  id: string; center: PixelPosition; radius: number;
  color: string; fill: boolean; thickness: number; dashed: boolean;
}

interface DrawingStroke {
  id: string; points: PixelPosition[];
  color: string; thickness: number;
}

interface DrawingMarker {
  id: string; position: PixelPosition;
  shape: "circle" | "triangle" | "square";
  color: string; size: number; label?: string;
}

interface TextLabel {
  id: string; position: PixelPosition;
  text: string; color: string; fontSize: number;
}

interface Tactic {
  id: string; name: string; createdAt: string; updatedAt: string;
  mapName: string;
  units: Unit[]; lines: DrawingLine[]; circles: DrawingCircle[];
  markers: DrawingMarker[]; strokes: DrawingStroke[]; labels: TextLabel[];
}
```

## 6. File Structure
```
src/
├── app/
│   ├── layout.tsx      # Root layout + metadata + fonts
│   ├── page.tsx        # Main TacticsBoard page
│   └── globals.css     # CSS variables + animations
├── store/
│   └── tacticsStore.ts # Zustand state management
├── lib/
│   ├── utils.ts        # Utility functions (cn, generateId, etc)
│   └── types.ts        # TypeScript interfaces + constants
└── public/
    ├── map.jpg         # Battle map background
    └── bonlang.png     # Bôn Làng logo
```
