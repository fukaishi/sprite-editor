# Sprite Editor for Godot

A web-based 2D sprite and animation editor specifically designed for Godot 4 game development.

## Features

### Core Editing
- **Multi-layer editing**: Create and manage multiple layers per frame with opacity control
- **Drawing tools**: Pen, eraser, bucket fill, eyedropper, rectangle, line, and selection tools
- **Brush size control**: Adjustable brush sizes (1-20px)
- **Color palette**: Customizable color palette with RGB picker and opacity control
- **Zoom & pan**: Smooth canvas zoom (1x-32x) with grid overlay

### Animation
- **Frame management**: Add, delete, duplicate, and reorder frames
- **Animation system**: Create multiple named animations with custom FPS
- **Timeline playback**: Real-time animation preview with play/pause controls
- **Frame-based workflow**: Visual timeline with frame thumbnails

### Game Development Features
- **Pivot point editing**: Set custom pivot points for each frame (for rotation/positioning in Godot)
- **Hitbox/Hurtbox system**:
  - Visual editor for collision boxes
  - Separate hitbox (attack) and hurtbox (damage) types
  - Per-frame hitbox definitions
  - Color-coded visualization (red for hitbox, green for hurtbox)

### Import/Export
- **Godot-ready export**:
  - PNG spritesheet (horizontal/vertical/grid layout)
  - JSON metadata with frame info, animations, hitboxes, and pivot points
  - Direct compatibility with Godot's `AnimatedSprite2D` and `SpriteFrames`
- **PNG import**: Import existing spritesheets and split them into frames
- **Project save/load**: Save and load projects as JSON files

### Productivity
- **Undo/Redo**: Full history support (up to 50 steps)
- **Auto-save**: Automatic saving to localStorage every 30 seconds
- **Keyboard shortcuts**:
  - `Ctrl+Z`: Undo
  - `Ctrl+Y` / `Ctrl+Shift+Z`: Redo

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`).

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Usage

### Creating a New Project

1. Click **New** in the menu bar
2. Enter project name and canvas dimensions (or use presets: 16x16, 32x32, 48x48, 64x64)
3. Click **Create**

### Drawing

1. Select a tool from the toolbar (pen, eraser, bucket, etc.)
2. Choose a color from the palette
3. Draw on the canvas

### Working with Layers

- **Add Layer**: Click "+ Add Layer" in the Layers panel
- **Toggle Visibility**: Click the eye icon
- **Adjust Opacity**: Use the opacity slider
- **Reorder**: Use ↑↓ buttons
- **Delete**: Click the trash icon

### Creating Animations

1. Add multiple frames using the Timeline panel
2. Go to Properties → Animation tab
3. Select frames for the animation
4. Set name and FPS
5. Click "Create Animation"
6. Use the playback controls in the Timeline to preview

### Adding Hitboxes

1. Go to Properties → Hitboxes tab
2. Click "+ Hitbox" or "+ Hurtbox"
3. Adjust position and size using the input fields
4. Hitboxes will be color-coded on the canvas (toggle with "Hitboxes" button in menu bar)

### Exporting for Godot

1. Click **Export** in the menu bar
2. Two files will be downloaded:
   - `[project-name]_spritesheet.png`: The sprite sheet image
   - `[project-name]_metadata.json`: Animation and hitbox data

### Using in Godot

The exported JSON follows this structure:

```json
{
  "meta": {
    "version": "1.0",
    "image": "spritesheet.png",
    "frame_width": 32,
    "frame_height": 32
  },
  "frames": [
    {
      "index": 0,
      "rect": { "x": 0, "y": 0, "width": 32, "height": 32 },
      "pivot": { "x": 16, "y": 16 },
      "hitboxes": [
        { "type": "hurtbox", "x": 8, "y": 8, "w": 16, "h": 24 }
      ],
      "tags": ["idle"]
    }
  ],
  "animations": [
    {
      "name": "idle",
      "frames": [0, 1],
      "loop": true,
      "fps": 6
    }
  ]
}
```

You can write a GDScript tool to import this data into your Godot project and automatically set up `AnimatedSprite2D` nodes with the correct animations and collision shapes.

## Project Structure

```
sprite-editor/
├── src/
│   ├── components/       # React components
│   │   ├── Canvas/       # Drawing canvas
│   │   ├── ColorPalette/ # Color selection
│   │   ├── LayerPanel/   # Layer management
│   │   ├── Properties/   # Frame properties (pivot, hitboxes, animations)
│   │   ├── Timeline/     # Frame timeline and playback
│   │   ├── Toolbar/      # Drawing tools
│   │   └── common/       # Shared UI components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state management
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
│       ├── canvas.ts     # Canvas drawing utilities
│       ├── color.ts      # Color conversion utilities
│       ├── export.ts     # Export functionality
│       └── import.ts     # Import functionality
├── dist/                 # Production build output
└── public/               # Static assets
```

## Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Zustand**: State management
- **Tailwind CSS**: Styling
- **HTML5 Canvas**: 2D rendering

## Features Not Yet Implemented

- Tileset mode (FR-40-42 from spec)
- Additional keyboard shortcuts for tools
- Eyedropper tool functionality
- Rectangle and line drawing tools
- Selection tool

## Contributing

This is a project specifically designed for Godot game development workflows. Contributions are welcome!

## License

MIT

## Acknowledgments

Built for the Godot game development community.
