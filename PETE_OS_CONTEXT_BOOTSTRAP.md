# Pete OS - LLM Development Context

## Quick Context
Building a web-based desktop environment in Next.js. Think "portfolio site as an OS" - system-first, UI-agnostic, plugin-based architecture.

## Document Map
1. **This file** - Quick context & navigation
2. **`PETE_OS_REQUIREMENTS.md`** - Master requirements, progress tracking, session logs
3. **`PETE_OS_ARCHITECTURE.md`** - Technical decisions, patterns, code locations

## Current State
- **Phase 1, Requirement 1** ✅ Core Window System - DONE
- **Phase 1, Requirement 2** ✅ Application Framework - DONE
- **Phase 1, Requirement 3** ✅ Input & Interaction System - DONE
- **Phase 2/3** ⏳ UI Systems or Core Apps - NEXT
- **Dev Server**: http://localhost:3000/pete-os

## Key Code Locations
```
app/pete-os/
├── core/
│   ├── window-manager/              # Window lifecycle (✅ Done)
│   │   ├── create-window-manager.ts # Factory function implementation
│   │   └── window-manager-context.tsx # React integration
│   ├── application-manager/         # Application system (✅ Done)
│   │   ├── application-registry.ts  # App registration
│   │   ├── application-lifecycle.ts # App lifecycle management
│   │   ├── window-application-bridge.ts # Window-app integration
│   │   └── application-manager-context.tsx # React integration
│   └── types/                       # System interfaces
│       ├── window.types.ts          # Window system types
│       └── application.types.ts     # Application system types
├── components/
│   ├── window/                      # Window rendering
│   └── viewport/                    # Desktop container
├── lib/
│   └── hooks/                       # Custom hooks
│       ├── use-window.ts            # Window operations
│       └── use-application.ts       # App operations
├── apps/                            # Applications
│   └── demo-app/                    # Demo application
└── page.tsx                         # Entry point
```

## LLM Instructions
1. **Start here** for context
2. **Check requirements** for what to build (see "Active Requirement")
3. **Follow architecture** for how to build it
4. **Update requirements** after completing work (checkboxes + session notes)
5. **Keep commits small** - one subtask = one commit

## Quick Status Check
- ✅ Window System - COMPLETE
- ✅ Application Framework - COMPLETE  
- ✅ Input System - COMPLETE
- ⏳ UI Systems or Core Apps - NEXT
- [ ] Everything else - TODO

## Key Principles (Details in Architecture Doc)
- System-first (no UI assumptions)
- Plugin-based (everything swappable)
- React-idiomatic (factory functions, contexts, hooks)
- Progressive enhancement

## Recent Accomplishments (Session 4)
- ✅ Completed Input & Interaction System
- ✅ Built unified input event handling with gesture recognition
- ✅ Implemented keyboard shortcut registry with context awareness
- ✅ Created interaction handler system with priority routing
- ✅ Added global event capture and React integration
- ✅ Integrated keyboard shortcuts into demo (Ctrl+N/W/M)

## Next Session Focus
- Begin Phase 2: UI Component Systems (Layout, Navigation)
- OR begin Phase 3: Core Applications (File Browser, Profile/About, Terminal)
- Consider which provides more immediate value for the demo