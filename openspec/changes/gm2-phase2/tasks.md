# GM2 Phase 2 — UI/UX Redesign Tasks

## Priority 1: Layout Foundation
- [x] Install Framer Motion
- [x] Redesign Sidebar (Tailwind + Framer Motion AnimatePresence, dark theme, HiOutline icons, mobile collapsible)
- [x] Redesign AppHeader (Tailwind, sticky top with backdrop-blur, hamburger menu on mobile)
- [x] Redesign App.jsx (Tailwind layout, Sidebar + content area, AnimatePresence page transitions)

## Priority 2: Shared Components
- [x] Redesign Button (Tailwind variants: primary/secondary/outline/ghost/danger, sizes sm/md/lg, loading spinner, Framer Motion tap animation)
- [x] Redesign Input (Tailwind, error state, textarea/select support, action icon)
- [x] Redesign LoadingSpinner (Tailwind, size + color variants)
- [x] Redesign ProgressBar (Tailwind, status-based colors)
- [x] Redesign FullPageLoader (Tailwind, backdrop blur)
- [x] Redesign FormGroup (Tailwind, required indicator, error message)
- [x] Redesign ConfirmationDialog (Tailwind + Framer Motion scale animation, AnimatePresence)

## Priority 3: Dashboard Page
- [x] Redesign DashboardPage (Tailwind grid layout: 1/2/4 col responsive, Framer Motion stagger animation, loading/error states)
- [x] Redesign StatsCard (Tailwind card with hover lift via Framer Motion, icon + title + value + trend)

## Priority 4: Other Pages
- [x] Redesign MyObjectivesPage (Tailwind layout, filter sidebar, responsive grid, mobile filter overlay)
- [x] Redesign LoginPage / RegistroPage (Tailwind card containers)
- [x] Redesign ObjetivoCard (Tailwind + Framer Motion hover lift, progress bar, status badge)
- [x] Redesign RecentActivityFeed (Tailwind list, activity icons)
- [x] Redesign RecentObjectivesList (Tailwind list, progress indicators)
- [x] Redesign AuthLayout (Tailwind centered layout)

## Infrastructure
- [x] Configure Vite (vite.config.js with @vitejs/plugin-react)
- [x] Configure Tailwind CSS (tailwind.config.cjs + postcss.config.cjs)
- [x] Create Vite-compatible index.html entry point
- [x] Rename .js to .jsx for JSX files (Vite requirement)
- [x] Remove unused .module.css files (17 files deleted)

## Priority 5: CSS Modules → Tailwind Conversion
- [x] Convert AnalysisPage (tabs, charts grid, stats row, section cards)
- [x] Convert CreateGoalPage (page container + form wrapper)
- [x] Convert EditGoalPage (page container + states)
- [x] Convert GoalDetailPage (header, cards grid, progress chart, history)
- [x] Convert ProfilePage (header, info grid, stats card, form)
- [x] Convert SettingsPage (settings cards, toggle sections, action rows)
- [x] Convert UpdateProgressPage (progress card, form, non-quantitative message)
- [x] Convert CategoryObjectivesCard (category card, progress bars)
- [x] Convert RankedObjectivesList (ranked list, progress bars)
- [x] Convert GoalProgressChart (circular progress bar via buildStyles)
- [x] Convert ObjetivosForm (form layout, grid fields, checkbox, buttons)

## Animations Added
- Sidebar: Spring-based slide-in/out with AnimatePresence overlay
- App: Framer Motion page transitions (fade + slide Y)
- Button: whileTap scale(0.97) spring animation
- ConfirmationDialog: Scale-in spring animation with AnimatePresence
- StatsCard: Hover lift (y: -3) spring animation
- DashboardPage: Stagger children animation on mount
- ObjetivoCard: Hover lift (y: -2) spring animation
- Tailwind: Custom keyframes for fade-in, slide-in, scale-in
