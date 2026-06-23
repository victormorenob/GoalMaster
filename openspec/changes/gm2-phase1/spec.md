# GoalMaster 2.0 — Phase 1 Spec

## A. Vite + TypeScript Migration

### Requirements
- CRA (react-scripts) DEBE ser reemplazado por Vite + @vitejs/plugin-react
- TypeScript DEBE agregarse con tsconfig.json
- index.html DEBE moverse de `public/` a raíz del proyecto frontend
- Entry point DEBE ser `src/main.tsx` en vez de `src/index.js`
- Variables de entorno REACT_APP_* DEBEN renombrarse a VITE_*
- Scripts DEBEN actualizarse: `start` → `vite`, `build` → `vite build`
- NO debe romperse la funcionalidad existente

### TypeScript Targets (progresivo)
- apiService.ts → tipado completo de respuestas de API
- AuthContext.tsx → tipado del user, login/register params
- SettingsContext.tsx → tipado de settings
- types/ → User.ts, Objective.ts, Progress.ts, ApiResponse.ts
- Resto de archivos: rename .js→.tsx con tipado básico

## B. Tailwind CSS

### Requirements
- Tailwind v3+ configurado con PostCSS
- Paleta de colores debe coincidir con las variables CSS existentes
- Layout principal (App, Sidebar, AppHeader) migrado a Tailwind
- Componentes legacy conservan CSS Modules (convivencia)

## C. Ollama Integration

### Requirements
- Ollama instalado localmente
- Modelo descargado (mistral o llama3.2)
- Backend: POST /api/ai/chat (recibe mensaje, devuelve respuesta)
- Backend: POST /api/ai/suggest (recibe historial de metas, devuelve sugerencias)
- Frontend: aiService.ts con métodos chat() y suggest()
- Frontend: ChatPanel componente flotante en sidebar
