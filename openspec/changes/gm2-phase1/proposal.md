# GoalMaster 2.0 — Phase 1: Foundation

## Intent
Migrar el frontend de CRA (Create React App) + JavaScript + CSS Modules a Vite + TypeScript + Tailwind CSS, manteniendo la funcionalidad existente intacta. Setup de integración con Ollama para IA local.

## Scope

### A. Stack Migration (CRA → Vite + TS + Tailwind)
- Reemplazar CRA (react-scripts) por Vite + @vitejs/plugin-react
- Agregar TypeScript, renombrar .js/.jsx → .ts/.tsx con tipos progresivos
- Agregar Tailwind CSS, mantener CSS Modules para componentes legacy
- Migrar variables de entorno REACT_APP_* → VITE_*
- Migrar index.html de public/ a raíz (requisito de Vite)
- Migrar entry point src/index.js → src/main.tsx

### B. TypeScript Progresivo
- Tipar servicios (apiService.js)
- Tipar contextos (AuthContext, SettingsContext)
- Tipar modelos de datos (User, Objective, Progress)
- El resto queda con `any` o tipos básicos — se refina en fases posteriores

### C. Setup Ollama + Integración
- Instalar Ollama
- Descargar modelo (Mistral o Llama 3, ~4GB)
- Crear capa de integración backend: `/api/ai/chat`, `/api/ai/suggest`
- Crear servicio frontend: `aiService.ts`
- Componente base: ChatPanel (sidebar flotante)

### D. Tailwind + Diseño Base
- Configurar Tailwind con colores/temas existentes
- Migrar layout principal (AppHeader, Sidebar) a Tailwind
- Dejar componentes internos con CSS Modules para Fase 3

## Dependencias
```
A (Vite setup) ──> B (TypeScript) ──> D (Tailwind layout)
C (Ollama) ──> independiente de A/B/D
```

## Riesgos
- CRA tiene config implícita que Vite no — pueden romperse imports
- TypeScript progresivo deja consistencia a medias (intencional)
- Ollama requiere ~4GB de descarga y RAM para correr
