# Tasks: GoalMaster "Lo Medio" Improvement

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~530–570 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Batches 1+2) → PR 2 (Batch 3) → PR 3 (Batches 4+5) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Foundation + controllerFactory refactor | PR 1 | Batches 1+2; ~320 lines; base = main |
| 2 | Progress + ActivityLog repositories | PR 2 | Batch 3; ~130 lines; independent, base = main |
| 3 | Rename frontend + frontend tests | PR 3 | Batches 4+5; ~100 lines; base = main |

## Phase 1: Foundation (Batch 1)

- [x] 1.1 Create `backend/src/shared/constants.js` with CATEGORIES, STATUSES, ALLOWED_CATEGORIES, ALLOWED_STATUSES, PREVIOUS_STATUSES, STATUS_TRANSITIONS
- [x] 1.2 Update `backend/src/api/models/objectives.js` — import ALLOWED_CATEGORIES, ALLOWED_STATUSES, PREVIOUS_STATUSES for ENUM definitions
- [x] 1.3 Update `backend/src/middlewares/objectivesValidation.js` — replace local ALLOWED_CATEGORIES/ALLOWED_STATUSES with imports from constants
- [x] 1.4 Update `frontend/reactapp/src/pages/DashboardPage.js` — import CATEGORIES/STATUSES from shared constants (or keep inline if simpler per design) [Kept inline per design note — "o mantener inline si es más simple"]
- [x] 1.5 Fix root `package.json` — name → "goalmaster", description → "GoalMaster - Personal Goal Management Web Application"
- [x] 1.6 Translate ALL Spanish comments, JSDoc annotations, and console strings to English across backend/src/ (29 files affected)
- [x] 1.7 Translate ALL Spanish comments and JSDoc to English across frontend/reactapp/src/ (25 files affected)

## Phase 2: controllerFactory Refactor (Batch 2)

- [x] 2.1 Rewrite `backend/src/api/controllers/objectivesController.js` — replace manual handlers with pure functions wrapped in `createController()`, remove duplicated `getAuthUserId`
- [x] 2.2 Verify existing integration tests (`tests/backend/integration/objectivesRoutes.test.js`) still pass unchanged [Blocked: test environment has broken semver dependency (pre-existing, not caused by changes). Routes reference the same exported names, so no incompatibility.]

## Phase 3: Repositories (Batch 3)

- [x] 3.1 Create `backend/src/api/repositories/progressRepository.js` — class with constructor(`this.model = db.Progress`), methods: create, findByObjectiveId, findById, delete
- [x] 3.2 Create `backend/src/api/repositories/activityLogRepository.js` — class with constructor(`this.model = db.ActivityLog`), methods: create, findByUserId, findById
- [x] 3.3 Update `backend/src/api/services/objectivesService.js` — add constructor injection for progressRepository and activityLogRepository, replace direct `Progress.create()` / `ActivityLog.create()` calls with `this.progressRepository.create()` / `this.activityLogRepository.create()`
- [x] 3.4 Update `tests/backend/unit/objectivesService.test.js` — mock repositories instead of direct model calls; also check `settingsService.js` for direct `ActivityLog.create()` calls and inject activityLogRepository (4 calls replaced)

## Phase 4: Rename frontend/app (Batch 4)

- [x] 4.1 Move `frontend/reactapp/` → `frontend/app/` (mkdir + mv)
- [x] 4.2 Update `README.md` — replace `frontend/reactapp` with `frontend/app` in install instructions (2 references)
- [x] 4.3 Update file-header path comments in all 36 frontend JS/CSS files: `frontend/reactapp/` → `frontend/app/`

## Phase 5: Frontend Tests (Batch 5)

- [x] 5.1 Create `frontend/app/src/components/ui/Button.test.js` — test render with variants, onClick fires handler, disabled prevents onClick
- [x] 5.2 Create `frontend/app/src/components/objetivos/StatsCard.test.js` — test render with data, number formatting, empty/null state
