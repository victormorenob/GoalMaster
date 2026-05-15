# GoalMaster "Lo Medio" — Spec

## 1. controllerFactory Consistency

### Requirements
- `objectivesController.js` DEBE refactorizarse para usar `controllerFactory.createController()` como el resto
- Cada función de handler DEBE ser una función pura que recibe `(userId, params, query, body)` según necesidad
- El `getAuthUserId` duplicado en `objectivesController.js` DEBE eliminarse — ya existe en `controllerFactory.js`
- La respuesta JSON DEBE mantener el mismo formato: `{ status, data, results? }`

### Scenarios
- GET /objectives → devuelve lista formateada con status success
- GET /objectives/:id → devuelve un objetivo individual
- POST /objectives → crea objetivo, devuelve 201
- PUT /objectives/:id → actualiza objetivo
- DELETE /objectives/:id → devuelve 204
- PATCH /objectives/:id/unarchive → desarchiva objetivo
- Cuando falta userId → 401 AppError
- Cuando el servicio lanza error → next(error)

## 2. Shared Constants

### Requirements
- Archivo `backend/src/shared/constants.js` DEBE contener:
  - `CATEGORIES`: `['HEALTH', 'FINANCE', 'PERSONAL_DEV', 'RELATIONSHIPS', 'CAREER', 'OTHER']`
  - `STATUSES`: `['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED', 'FAILED']`
  - `ALLOWED_CATEGORIES` (alias, mismo array)
  - `ALLOWED_STATUSES` (alias, mismo array que STATUSES excluye ARCHIVED para previousStatus)
  - `STATUS_TRANSITIONS`: mapa de transiciones válidas
- Modelos DEBEN importar y usar `ALLOWED_CATEGORIES` y `ALLOWED_STATUSES` en lugar de strings hardcodeadas
- Middlewares de validación DEBEN importar los arrays para `isIn()` checks
- Frontend DEBE importar `CATEGORIES` y `STATUSES` desde `../../shared/constants` (o copia local)

### Scenarios
- Se importa CATEGORIES desde constants → es un array con los 6 valores
- Se importa ALLOWED_STATUSES → tiene los 5 valores, excluye ARCHIVED para previousStatus
- Modelo Objective usa el ENUM de constants → sync funciona igual
- Middleware valida categoría → usa ALLOWED_CATEGORIES en isIn

## 3. Language Unification → English

### Requirements
- TODOS los comentarios en español DEBEN pasar a inglés
- JSDoc annotations DEBEN estar en inglés
- Strings de console.error/log DEBEN estar en inglés
- NO debe cambiar: strings de usuario (i18n keys, UI text), mensajes de error al usuario (los maneja i18n/AppError)

### Scenarios
- `// Importar todas las rutas` → `// Import all routes`
- `@description Clase personalizada para manejar errores` → `@description Custom error class`
- Un comentario en español en models/user.js → traducido
- console.error('Error crítico...') → console.error('Critical error...')

## 4. package.json Fix

### Requirements
- `name` cambia de `"proyecto-web-tfg-root"` a `"goalmaster"`
- `description` se actualiza a `"GoalMaster - Personal Goal Management Web Application"`

## 5. Rename frontend/reactapp → frontend/app

### Requirements
- Mover directorio `/frontend/reactapp/` a `/frontend/app/`
- Actualizar TODAS las referencias a `frontend/reactapp` en:
  - `backend/app.js` (express.static si apunta a frontend)
  - Scripts en root `package.json`
  - `README.md` (instrucciones de instalación)
  - Cualquier configuración de CI/CD
  - `cypress.config.js`
- NO debe romper: build, tests, o dev server

### Scenarios
- README.md actualizado con nueva ruta
- npm start funciona desde frontend/app

## 6. Progress & ActivityLog Repositories

### Requirements
- `progressRepository.js`: CRUD para Progress model (create, findByObjectiveId, findById, delete)
- `activityLogRepository.js`: CRUD para ActivityLog model (create, findByUserId, findById)
- Seguir el MISMO patrón que `objectiveRepository.js` (clase con constructor que asigna `this.model`)
- Servicios DEBEN importar y usar los repos en lugar de `Progress.create()` y `ActivityLog.create()` directos
- `objectivesService.js` DEBE ser actualizado: inyectar dependencias de repos en el constructor
- Los tests unitarios mockean los repos, no los modelos directamente

### Scenarios
- `progressRepository.create(data, options)` → crea registro en Progress
- `activityLogRepository.create(data, options)` → crea registro en ActivityLog
- ObjectivesService usa repos → tests pasan con mocks

## 7. Frontend Tests

### Requirements
- Tests con React Testing Library + Jest (ya configurado)
- Componente `Button`: testear renderizado con variantes, onClick handler, disabled state
- Componente `StatsCard`: testear renderizado con datos, formato de números, empty state
- Tests DEBEN estar al lado del componente (ej. `Button.test.js` junto a `Button.js`)
- Usar `@testing-library/react` y `@testing-library/jest-dom`

### Scenarios
- Button hace click → llama al handler
- Button disabled → no llama al handler
- StatsCard recibe datos → renderiza valores formateados
- StatsCard sin datos → renderiza estado vacío o 0
