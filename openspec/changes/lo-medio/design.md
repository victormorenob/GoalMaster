# GoalMaster "Lo Medio" — Technical Design

## 1. controllerFactory Refactor

### Current State
- `controllerFactory.createController(serviceFn, params)` es genérico pero solo lo usan algunos controllers
- `objectivesController.js` implementa todo manual: getAuthUserId duplicado, try/catch en cada handler, res.status manual

### Target State
```js
// objectivesController.js
const objectivesService = require('../services/objectivesService');
const { createController } = require('../../utils/controllerFactory');

exports.getObjectives = createController(
    (userId, query) => objectivesService.getAllObjectives(userId, query),
    ['userId', 'query']
);

exports.getObjectiveById = createController(
    (userId, params) => objectivesService.getObjectiveById(params.id, userId),
    ['userId', 'params']
);

exports.createObjective = createController(
    (userId, body) => objectivesService.createObjective(body, userId),
    ['userId', 'body']
);
```

### Files to modify
- `backend/src/api/controllers/objectivesController.js` — refactor completo
- `backend/src/utils/controllerFactory.js` — mantener como está

### Tests
- Los tests de integración existentes (`tests/backend/integration/objectivesRoutes.test.js`) NO deberían cambiar porque la interfaz HTTP es la misma
- Tests unitarios de objectivesService tampoco cambian

## 2. Shared Constants

### File: `backend/src/shared/constants.js`
```js
// backend/src/shared/constants.js

const CATEGORIES = Object.freeze(['HEALTH', 'FINANCE', 'PERSONAL_DEV', 'RELATIONSHIPS', 'CAREER', 'OTHER']);
const ALLOWED_CATEGORIES = CATEGORIES;

const STATUSES = Object.freeze(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED', 'FAILED']);
const ALLOWED_STATUSES = STATUSES;

// previousStatus no puede ser ARCHIVED
const PREVIOUS_STATUSES = Object.freeze(STATUSES.filter(s => s !== 'ARCHIVED'));

module.exports = { CATEGORIES, ALLOWED_CATEGORIES, STATUSES, ALLOWED_STATUSES, PREVIOUS_STATUSES };
```

### Files to modify
- CREATE `backend/src/shared/constants.js`
- `backend/src/api/models/objectives.js` — importar ALLOWED_CATEGORIES, ALLOWED_STATUSES, PREVIOUS_STATUSES
- `backend/src/middlewares/objectivesValidation.js` — importar ALLOWED_CATEGORIES, ALLOWED_STATUSES
- `frontend/app/src/pages/DashboardPage.js` — importar CATEGORIES, STATUSES para los maps (o mantener inline si es más simple)

### Race condition note
Este cambio DEBE hacerse primero porque controllers y middlewares lo necesitan.

## 3. Language Unification

### Approach
Buscar sistemáticamente patrones de español en:
- Comentarios `//` y `/* */`
- JSDoc (`@description`, `@param`)
- `console.log/error/warn` strings
- strings de error interno (NO los AppError al usuario)

Usar `grep` para encontrar `[áéíóúñ]` y traducir manualmente cada archivo afectado.

### Non-goals
- NO tocar mensajes de error que llegan al usuario vía AppError
- NO tocar keys de i18n
- NO tocar nombres de variables, funciones, o clases

## 4. package.json

Un solo cambio en root `package.json`:
```json
{
  "name": "goalmaster",
  "version": "1.0.0",
  "private": true,
  "description": "GoalMaster - Personal Goal Management Web Application",
```

## 5. Rename frontend/reactapp → frontend/app

### Strategy
1. Crear `frontend/app/` (mkdir)
2. Mover contenido de `frontend/reactapp/` a `frontend/app/` (mv)
3. Buscar TODAS las referencias a `frontend/reactapp` en el proyecto con grep
4. Actualizar cada referencia

### References to update
- `README.md` — instrucciones de instalación (cd frontend/reactapp → cd frontend/app)
- Root `package.json` — si hay scripts que referencian frontend/reactapp

### Risk mitigation
- Verificar que `frontend/app/package.json` existe después del rename
- Verificar que `npm start` funcionaría (sin ejecutarlo) revisando scripts

## 6. Progress & ActivityLog Repositories

### Pattern (sigue objectiveRepository.js)

```js
// progressRepository.js
class ProgressRepository {
    constructor() {
        this.model = db.Progress;
    }
    async create(data, options = {}) { return this.model.create(data, options); }
    async findByObjectiveId(objectiveId, userId, options = {}) {
        return this.model.findAll({ where: { objectiveId, userId }, ...options });
    }
    async findById(id, options = {}) { return this.model.findByPk(id, options); }
    async delete(id, options = {}) { return this.model.destroy({ where: { id }, ...options }); }
}
```

```js
// activityLogRepository.js
class ActivityLogRepository {
    constructor() { this.model = db.ActivityLog; }
    async create(data, options = {}) { return this.model.create(data, options); }
    async findByUserId(userId, options = {}) {
        return this.model.findAll({ where: { userId }, ...options });
    }
}
```

### Services to update
- `objectivesService.js` — inyectar `progressRepository` y `activityLogRepository` en constructor, reemplazar llamadas directas

### Constructor injection pattern
```js
class ObjectivesService {
    constructor(progressRepo, activityLogRepo) {
        this.progressRepository = progressRepo || new ProgressRepository();
        this.activityLogRepository = activityLogRepo || new ActivityLogRepository();
    }
    // ... métodos usan this.progressRepository.create() en vez de Progress.create()
}
```

### Tests
- Actualizar `tests/backend/unit/objectivesService.test.js` para mockear los repos en lugar de `Progress.create` y `ActivityLog.create`

## 7. Frontend Tests

### Button component test
```jsx
// Button.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

test('renders button text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
});

test('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
});

test('does not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).not.toHaveBeenCalled();
});
```

### StatsCard test
```jsx
// StatsCard.test.js
import { render, screen } from '@testing-library/react';
import StatsCard from './StatsCard';
```

## Implementation Order

```
Batch 1: constants (2) + package.json (4) + language (3) — paralelo, sin dependencias entre sí
Batch 2: controllers (1) — depende de constants
Batch 3: repositories (6) — independiente de 1-2
Batch 4: rename (5) — último cambio estructural
Batch 5: frontend tests (7) — después de todo estable
```
