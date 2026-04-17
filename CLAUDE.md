# Bôn Làng - Chiến Thuật Bang

Công cụ lập kế hoạch chiến thuật bang hội cho game Nghịch Thuỷ Hàn.

## Công nghệ

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Zustand** (state management)
- **Lucide React** (icons)
- **Sharp** (PWA icon generation)
- **PWA** (Service Worker + Manifest)

## Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Main tactics board component
│   ├── layout.tsx          # Root layout + metadata
│   └── globals.css         # Global styles + theme variables
├── components/             # React components
│   ├── ColorPicker.tsx
│   ├── ConfirmModal.tsx
│   ├── ErrorBoundary.tsx
│   ├── FloatingToolbar.tsx # Tablet-only toolbar
│   ├── LayersPanel.tsx
│   ├── TextEditor.tsx
│   └── TextInputModal.tsx
├── hooks/                  # Custom React hooks
│   └── useServiceWorker.ts # PWA service worker management
├── lib/                    # Shared logic
│   ├── constants.tsx       # Icons, tool labels, grid, palette, magic numbers
│   ├── types.tsx           # TypeScript types and data models
│   └── utils.ts           # Utility functions (cn, generateId, sanitizeText)
└── store/                 # Zustand state management
    └── tacticsStore.ts     # All board state + persistence
public/
├── icons/                  # PWA icons + game marker icons
├── sw.js                   # Service worker
├── manifest.json           # PWA manifest
└── map.jpg                 # Background map
scripts/
└── generate-icons.js      # Generates PWA icons from SVG
```

## Các quy tắc quan trọng

- **Icon marker types**: Thêm icon mới vào `ICON_MARKER_TYPES` trong `src/lib/types.tsx`
- **Unit types**: Thêm unit type mới vào `UNIT_CONFIGS` trong `src/lib/types.tsx`
- **Tool icons**: Thêm tool mới vào `TOOL_ICONS` trong `src/lib/constants.tsx`
- **Magic numbers**: Dùng `SELECTION_Z_OFFSET`, `DEFAULT_UNIT_SIZE`, `DEFAULT_ICON_SIZE`, `MIN_ICON_SIZE`, `MAX_ICON_SIZE` từ `src/lib/constants.tsx`
- **Constants trùng lặp**: Chỉ định nghĩa `PALETTE_COLORS`, `UNIT_ICONS`, `TOOLS`, `MAP_WIDTH`, `MAP_HEIGHT` trong `constants.tsx` -- KHÔNG định nghĩa trong `types.tsx`
