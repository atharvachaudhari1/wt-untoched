# Lanyard (React Three Fiber) app

3D lanyard + card using **three**, **meshline**, **@react-three/fiber**, **@react-three/drei**, **@react-three/rapier**.

## Run

```bash
npm install
npm run dev
```

Then open: **http://localhost:5173/lanyard.html**

(Because the repo root uses `index.html` for the mentoring dashboard, the Lanyard app is at `lanyard.html`.)

## Build

```bash
npm run build
```

Output will include `lanyard.html` and assets.

## Assets (optional)

1. **card.glb** and **lanyard.png**  
   Place in **`public/lanyard/`** (or in `src/assets/lanyard/` and import; see `src/assets/lanyard/README.md`).

2. **card.glb**  
   Edit at: https://modelviewer.dev/editor/

3. **lanyard.png**  
   Texture for the lanyard band (any image editor).

Without these, the app still runs (card = blue box, band = solid color).

## Config

- **vite.config.js**: `assetsInclude: ['**/*.glb']` so `.glb` files are loaded.
- **TypeScript**: See `src/global.d.ts` and `src/vite-env.d.ts` for `*.glb`, `*.png`, and `meshline` declarations.

## Usage in your app

```jsx
import Lanyard from './components/Lanyard';

<Lanyard position={[0, 0, 20]} gravity={[0, -40, 0]} />
```
