# GoalMaster "Lo Medio" — SDD Proposal

## Intent

Elevar la calidad del código del proyecto GoalMaster corrigiendo inconsistencias arquitectónicas, mejorando la organización del código, y agregando cobertura de tests en el frontend.

## Scope — 7 Items

### 1. controllerFactory Consistency
- **Qué**: Hacer que TODOS los controladores usen `controllerFactory.createController()` consistente
- **Por qué**: Ahora `objectivesController.js` define sus propios handlers con try/catch repetitivo mientras el factory existe infrautilizado
- **Archivos**: `backend/src/api/controllers/objectivesController.js`, `analysisController.js`, `dashboardController.js`, `profileController.js`, `settingsController.js`, `userController.js`
- **Patrón**: Crear handler functions puras, exportarlas envueltas con el factory

### 2. Shared Constants
- **Qué**: Mover `ALLOWED_CATEGORIES`, `ALLOWED_STATUSES` y `CATEGORY_MAP`/`STATUS_MAP` a un archivo compartido `backend/src/shared/constants.js`
- **Por qué**: Definiciones duplicadas en modelos, middlewares de validación y frontend
- **Archivos**: Crear `backend/src/shared/constants.js`, actualizar modelos, middlewares, y frontend

### 3. Codebase Language Unification → English
- **Qué**: Unificar comentarios, JSDoc, y strings de logging a inglés
- **Por qué**: Mezcla español/inglés actualmente; consistencia es más profesional

### 4. package.json Fix
- **Qué**: Renombrar root package de `proyecto-web-tfg-root` a `goalmaster`
- **Archivos**: `package.json`

### 5. Rename frontend/reactapp → frontend/app
- **Qué**: Eliminar el nesting innecesario `frontend/reactapp/` → `frontend/app/`
- **Por qué**: Simplicidad. Ajustar paths en scripts, configs, y referencias
- **Riesgo**: ALTO — puede romper imports, scripts de build, y referencias en CI

### 6. Progress & ActivityLog Repositories
- **Qué**: Crear repositorios faltantes, actualizar servicios para usarlos
- **Por qué**: El patrón repositorio está incompleto; consistency
- **Archivos**: Crear `backend/src/api/repositories/progressRepository.js`, `activityLogRepository.js`. Actualizar `objectivesService.js`, y otros servicios que los usen

### 7. Frontend Tests (React Testing Library)
- **Qué**: Tests unitarios para componentes clave
- **Targets**: `Button`, `StatsCard` (ui components), al menos 2 tests cada uno
- **Archivos**: Crear `*.test.js` junto a los componentes

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Rename reactapp rompe paths | High | Buscar TODAS las referencias antes de mover |
| Repos no alineados con servicios | Medium | Revisar cada servicio que use Progress/ActivityLog directamente |
| Tests rotos por refactor de controladores | Low | Los tests usan mocks; deberían seguir funcionando si la interfaz no cambia |

## Dependencies

```
constants (2) ──> controllers (1)
                ──> models (indirect)
                ──> frontend maps (indirect)

repositories (6) ──> services (indirect)

rename (5) ──> all frontend scripts

package.json (4) ──> independent
language (3) ──> independent, can be last
tests (7) ──> after all code changes
```

## Approach

Ejecutar en este orden por dependencias:
1. Shared constants (2) + package.json (4) + Language (3) — paralelizables
2. controllerFactory (1) — depende de constants para los values
3. Repositories (6) — independiente
4. Rename frontend/app (5) — último cambio estructural
5. Frontend tests (7) — al final, con todo estable

## Estimated Effort
~4-6 horas total, distribuidas en 5 batches de implementación.
