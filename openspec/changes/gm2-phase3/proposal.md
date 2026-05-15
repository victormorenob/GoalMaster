# GoalMaster 2.0 — Phase 3: Features + Gamification

## Scope

### D1. PWA + Tags
- PWA: manifest.json, service worker, offline support, install prompt
- Tags: create/edit/delete custom tags, assign to objectives, filter by tag
- Backend: tags table + CRUD routes + objectives_tags relation
- Frontend: TagManager component, tag selector in objective form, tag filter in list

### D2. Gamification + Notifications
- Streaks: consecutive days logging progress, streak counter in dashboard
- Levels: XP system based on objectives completed, streak milestones
- Achievements: "First Goal", "7-Day Streak", "Category Master", etc.
- Push notifications: Browser Push API for reminders
- Backend: streaks + achievements + notifications tables + routes
- Frontend: GamificationPanel, AchievementBadge, StreakIndicator

### D3. Export + Templates + Drag & Drop
- Export: CSV + PDF of objectives and progress
- Templates: predefined goal templates (health, finance, career categories)
- Drag & drop: reorder dashboard widgets, reorder objectives list
- Backend: export routes, templates table
- Frontend: ExportDialog, TemplateSelector, @dnd-kit for drag & drop
