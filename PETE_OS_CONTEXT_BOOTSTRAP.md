# Pete OS - LLM Development Context

## Quick Context
Building a web-based desktop environment in Next.js. Think "portfolio site as an OS" - system-first, UI-agnostic, plugin-based architecture.

## Document Map
1. **This file** - Quick context & navigation
2. **`PETE_OS_REQUIREMENTS.md`** - Master requirements, progress tracking, session logs
3. **`PETE_OS_ARCHITECTURE.md`** - Technical decisions, patterns, code locations (TO CREATE)

## Current State
- **Phase 1, Requirement 1** ✅ Core Window System - DONE
- **Phase 1, Requirement 2** 🚧 Application Framework - NEXT
- **Dev Server**: http://localhost:3001/pete-os

## Key Code Locations
```
app/pete-os/
├── core/
│   ├── window-manager/      # Window lifecycle (✅ Done)
│   │   ├── window-manager.ts          # Class-based (legacy)
│   │   ├── window-manager-reducer.ts  # Reducer pattern (preferred)
│   │   ├── create-window-manager.ts   # Factory pattern (alternative)
│   │   └── window-manager-context.tsx # React integration
│   ├── app-registry/        # Application system (🚧 Next)
│   └── types/               # System interfaces
├── components/
│   ├── window/              # Window rendering
│   └── viewport/            # Desktop container
└── page.tsx                 # Entry point
```

## LLM Instructions
1. **Start here** for context
2. **Check requirements** for what to build
3. **Follow architecture** for how to build it
4. **Update requirements** after completing work
5. **Keep commits small** - one subtask = one commit

## Key Principles (Details in Architecture Doc)
- System-first (no UI assumptions)
- Plugin-based (everything swappable)
- React-idiomatic (useReducer, contexts, hooks)
- Progressive enhancement