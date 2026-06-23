# GoalMaster 2.0 — Phase 1 Design

## Migration Strategy: In-Place

No crear proyecto nuevo. Migrar CRA → Vite en el mismo directorio `frontend/app/`. Esto preserva el historial de git y evita tener que reconfigurar todo desde cero.

### Steps

1. **Install Vite deps:**
   ```
   npm install --save-dev vite @vitejs/plugin-react typescript @types/react @types/react-dom
   npm uninstall react-scripts
   ```

2. **Create vite.config.ts:**
   ```ts
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   export default defineConfig({
     plugins: [react()],
     server: { port: 3000 },
   });
   ```

3. **Move index.html** from `public/` to root, add `<script type="module" src="/src/main.tsx">`

4. **Create tsconfig.json** with strict mode, jsx: react-jsx

5. **Rename entry:** `src/index.js` → `src/main.tsx`

6. **Create types/ dir** with User.ts, Objective.ts, Progress.ts, ApiResponse.ts

7. **Update package.json scripts:**
   ```json
   { "start": "vite", "build": "vite build", "preview": "vite preview" }
   ```

8. **Tailwind setup:**
   ```
   npm install --save-dev tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

9. **Env vars:** Replace REACT_APP_ with VITE_ across all files

## Ollama Integration

### Backend (`backend/src/api/routes/aiRoutes.js`)
```js
const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  exec(`ollama run mistral "${message}"`, (err, stdout) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ response: stdout.trim() });
  });
});
```

Register in app.js: `app.use('/api/ai', aiRoutes);`

## File Structure After Migration
```
frontend/app/
├── index.html          ← moved from public/
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx        ← renamed from index.js
│   ├── types/
│   │   ├── User.ts
│   │   ├── Objective.ts
│   │   ├── Progress.ts
│   │   └── ApiResponse.ts
│   ├── services/
│   │   ├── apiService.ts
│   │   └── aiService.ts  ← new
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── SettingsContext.tsx
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   └── styles/
│       └── index.css    ← tailwind directives here
```
