# GoalMaster 2.0 — Phase 1 Tasks

## Batch A: Vite + TypeScript + Tailwind CSS Migration

- [x] A1. Install Vite + TypeScript deps
- [x] A2. Create config files (vite.config.ts, tsconfig.json, tailwind.config.js, postcss.config.js)
- [x] A3. Move index.html from public/ to root, update with module script
- [x] A4. Rename entry point: src/index.js → src/main.tsx
- [x] A5. Create type definitions (User.ts, Objective.ts, Progress.ts, ApiResponse.ts)
- [x] A6. Update apiService.js → apiService.ts with basic types
- [x] A7. Update AuthContext.js → AuthContext.tsx with User type
- [x] A8. Update SettingsContext.js → SettingsContext.tsx
- [x] A9. Replace REACT_APP_ with VITE_ across all frontend files
- [x] A10. Setup Tailwind directives in index.css
- [x] A11. Update package.json scripts for Vite
- [x] A12. Rename remaining .js files to .tsx (progressive, add @ts-nocheck)
