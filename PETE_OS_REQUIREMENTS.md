# Pete OS - Web Desktop Environment Requirements

## Project Overview
Building a web-based desktop environment that provides fundamental windowing and application systems, implemented as a Next.js page component with portfolio content integration.

## Process Guidelines
- Each requirement = ~1 PR worth of work
- Each subtask = ~1 commit worth of work
- Requirements serve as both specification and todo checklist
- Progress tracked via checkboxes
- Document updated continuously for session continuity

## LLM Collaboration Guidelines
- **Always check "Active Requirement" section first** - This shows current work
- **Update checkboxes immediately** after completing subtasks
- **Add session notes** with date, work completed, and key decisions
- **Never skip ahead** - Complete requirements in order unless directed
- **Ask before major decisions** - Don't assume architectural changes

---

## Phase 1: Foundation & Core Desktop

### Requirement 1: Core Window System Architecture
**Status:** ✅ Completed  
**Estimated Effort:** 1 PR (3-5 commits)

**Subtasks:**
- [x] Create viewport container and coordinate system
- [x] Implement base window component with position/size state
- [x] Build window manager service for window lifecycle
- [x] Create focus management and z-order system
- [x] Add window state persistence layer

**Acceptance Criteria:**
- Windows exist as independent entities with position/size
- Window manager handles creation, destruction, focus
- Z-order system properly layers windows
- Window state can be serialized/restored
- System is agnostic to specific UI implementations

---

### Requirement 2: Application Framework & Registry
**Status:** ✅ Completed  
**Estimated Effort:** 1 PR (3-4 commits)

**Subtasks:**
- [x] Create application registry system
- [x] Build application lifecycle manager
- [x] Implement inter-application communication
- [x] Create application manifest structure
- [x] Add application state management

**Acceptance Criteria:**
- Applications can register with the system ✓
- Apps can be launched, suspended, terminated ✓
- Apps can communicate via defined protocols ✓
- Each app has isolated state management ✓
- System supports different app types/behaviors ✓

---

### Requirement 3: Input & Interaction System
**Status:** ✅ Completed  
**Estimated Effort:** 1 PR (3-4 commits)

**Subtasks:**
- [x] Create unified input event handling system
- [x] Build gesture recognition framework
- [x] Implement keyboard shortcut registry
- [x] Add context-aware interaction handling
- [x] Create interaction event bus

**Acceptance Criteria:**
- All input events flow through central system ✓
- Gestures can be defined and recognized ✓
- Keyboard shortcuts are configurable ✓
- Context determines available interactions ✓
- Events can be intercepted/modified by components ✓

---

## Phase 2: UI Component Systems

### Requirement 4: Layout & Composition System
**Status:** ⏳ Not Started  
**Estimated Effort:** 1 PR (3-4 commits)

**Subtasks:**
- [ ] Create flexible layout engine
- [ ] Build component composition framework
- [ ] Implement constraint-based positioning
- [ ] Add responsive breakpoint system
- [ ] Create layout persistence layer

**Acceptance Criteria:**
- Components can define layout constraints
- Layouts adapt to viewport changes
- Multiple layout paradigms supported
- Layout state can be saved/restored
- System remains UI framework agnostic

---

### Requirement 5: Navigation & Launcher Framework
**Status:** ⏳ Not Started  
**Estimated Effort:** 1 PR (3-4 commits)

**Subtasks:**
- [ ] Create abstract launcher interface
- [ ] Build navigation state management
- [ ] Implement app switching protocols
- [ ] Add launcher plugin system
- [ ] Create navigation history tracking

**Acceptance Criteria:**
- Multiple launcher types can be implemented
- Navigation between apps is tracked
- App switching is handled consistently
- Launchers can be swapped/customized
- History enables back/forward navigation

---

## Phase 3: Core Applications

### Requirement 6: File Browser Application
**Status:** ⏳ Not Started  
**Estimated Effort:** 1 PR (4-5 commits)

**Subtasks:**
- [ ] Create abstract file system interface
- [ ] Build file browser component framework
- [ ] Implement virtual file system for portfolio data
- [ ] Add file preview system
- [ ] Create file operation protocols

**Acceptance Criteria:**
- File browser can navigate hierarchical data
- Multiple view modes supported (grid, list, etc.)
- Preview system handles various content types
- File operations are abstracted from UI
- Portfolio data maps to virtual file system

---

### Requirement 7: Profile/About Application
**Status:** ⏳ Not Started  
**Estimated Effort:** 1 PR (3-4 commits)

**Subtasks:**
- [ ] Create profile data display framework
- [ ] Build timeline visualization system
- [ ] Implement content section management
- [ ] Add data filtering/sorting capabilities
- [ ] Create export/share functionality

**Acceptance Criteria:**
- Profile data displays in flexible layouts
- Timeline can show various data types
- Sections are modular and reorderable
- Data can be filtered and searched
- Content is shareable via multiple formats

---

### Requirement 8: Terminal/CLI Application
**Status:** ⏳ Not Started  
**Estimated Effort:** 1 PR (4-5 commits)

**Subtasks:**
- [ ] Create terminal emulator framework
- [ ] Build command parsing system
- [ ] Implement command registry and execution
- [ ] Add output formatting system
- [ ] Create command history and completion

**Portfolio Commands:**
- System navigation and data querying
- File system operations
- Application launching
- Data export/transformation
- System configuration

**Acceptance Criteria:**
- Terminal provides consistent command interface
- Commands are extensible via plugins
- Output supports multiple formats
- History and completion work reliably
- Terminal can interact with all system components

---

## Phase 4: Extended Systems

### Requirement 9: Media & Gallery System
**Status:** ⏳ Not Started  
**Estimated Effort:** 1 PR (3-4 commits)

**Subtasks:**
- [ ] Create media handling framework
- [ ] Build gallery view components
- [ ] Implement media preview system
- [ ] Add media metadata handling
- [ ] Create playlist/collection support

**Acceptance Criteria:**
- System handles images, videos, other media
- Multiple gallery view modes available
- Preview supports various media types
- Metadata is extracted and searchable
- Collections can be created and managed

---

### Requirement 10: Notification & Event System
**Status:** ⏳ Not Started  
**Estimated Effort:** 1 PR (3-4 commits)

**Subtasks:**
- [ ] Create event bus architecture
- [ ] Build notification queue system
- [ ] Implement notification display framework
- [ ] Add event filtering and routing
- [ ] Create notification persistence

**Acceptance Criteria:**
- Events flow through central system
- Notifications can be queued and prioritized
- Display is flexible and customizable
- Events can be filtered by type/source
- Notification history is maintained

---

### Requirement 11: Theme & Customization System
**Status:** ⏳ Not Started  
**Estimated Effort:** 1 PR (3-4 commits)

**Subtasks:**
- [ ] Create theme engine with CSS variables
- [ ] Build theme switching mechanism
- [ ] Implement component style overrides
- [ ] Add user preference persistence
- [ ] Create theme creation tools

**Acceptance Criteria:**
- Themes can be switched dynamically
- All components respect theme variables
- Custom themes can be created
- User preferences persist across sessions
- Theme system is extensible

---

### Requirement 12: Performance & Optimization
**Status:** ⏳ Not Started  
**Estimated Effort:** 1 PR (3-4 commits)

**Subtasks:**
- [ ] Implement virtual window rendering
- [ ] Add lazy loading for applications
- [ ] Create memory management system
- [ ] Optimize render cycles
- [ ] Add performance monitoring

**Acceptance Criteria:**
- Large numbers of windows perform well
- Applications load on demand
- Memory usage is managed effectively
- Render performance is optimized
- Performance metrics are trackable

---

## Technical Architecture

See **`PETE_OS_ARCHITECTURE.md`** for:
- Core design principles and philosophy
- Technical patterns and conventions
- Code organization and directory structure
- Implementation guidelines
- Design decisions log

### Quick Architecture Summary
- **System-First**: Build systems, not UIs
- **Plugin-Based**: Everything is swappable
- **Event-Driven**: Loose coupling via events
- **Progressive**: Start simple, enhance iteratively
- **Type-Safe**: TypeScript throughout

---

## Current Focus & Active Development

### Active Requirement
**Phase 1, Requirement 3: Input & Interaction System - COMPLETED ✅**
- Core window system is complete ✓
- Application framework is complete ✓
- Input & interaction system is complete ✓
- Next: Begin Phase 2 (UI Component Systems) or Phase 3 (Core Applications)

### Key Decisions Made
1. **System-first approach** - Build flexible foundations, not specific UIs
2. **Portfolio as data source** - Not hardcoded assumptions
3. **Plugin architecture** - Everything swappable
4. **Start minimal** - Add complexity progressively

### Next Session Should
1. Open `PETE_OS_CONTEXT_BOOTSTRAP.md` for quick context
2. Check this section for current focus
3. Continue from active requirement subtasks

---

## Session Notes & Progress Log

### Session 1 - [December 2024]
- Created requirements document with OS-agnostic approach
- Established system-first architecture philosophy
- Created context bootstrap for session continuity
- Ready to begin Phase 1 implementation

### Session 2 - [December 2024]
- **Completed Requirement 1: Core Window System Architecture**
  - Implemented window management using React-idiomatic patterns
  - Created `windowManagerReducer` for predictable state updates
  - Built `createWindowManager` factory function as alternative pattern
  - Created React context provider for system-wide window state
  - Built flexible `BaseWindow` component without UI assumptions
  - Implemented `Viewport` container with render prop pattern
  - Added `useWindow` hook for easy window operations
  - Set up localStorage persistence for window state
  - Demo working at http://localhost:3001/pete-os
- **Key Design Decisions:**
  - Shifted from class-based to reducer pattern (more React-idiomatic)
  - No hardcoded window chrome or decorations
  - Actions/reducer pattern for predictable state updates
  - Constraint system for optional window behaviors
  - Metadata system for app-specific data
  - Z-order management without prescribing UI patterns

### Session 3 - [December 2024]
- **Completed Requirement 2: Application Framework & Registry**
  - Created comprehensive application type system (`application.types.ts`)
  - Built `ApplicationRegistry` for app registration and queries
  - Implemented `ApplicationLifecycleManager` for launch/terminate/suspend/resume
  - Created React context provider for application management
  - Built inter-application messaging system
  - Implemented `WindowApplicationBridge` to connect windows and apps
  - Created demo application with manifest to test the framework
  - Added `useApplication` hook for easy app management
  - Integrated application framework with existing window system
  - **Refactored to factory functions**: Replaced class-based implementations with factory functions for consistency
- **Key Design Decisions:**
  - Factory function pattern for all managers (consistent with window system)
  - Singleton pattern for registry and lifecycle manager
  - Implemented plugin-based application component interface
  - Each app instance has unique ID and isolated state
  - Apps can have multiple windows, tracked by the bridge
  - Inter-app communication via message passing
  - Apps define capabilities and window defaults in manifest
  - Lifecycle hooks (onMount, onUnmount, onSuspend, onResume)
- **Next Focus:**
  - Begin Phase 2 with Input & Interaction System
  - Or continue with more core applications

### Session 4 - [December 2024]
- **Completed Requirement 3: Input & Interaction System**
  - Created comprehensive input type system (`input.types.ts`)
  - Built unified input event handling system with native event conversion
  - Implemented keyboard shortcut registry with context-aware matching
  - Created interaction handler registry with priority-based routing
  - Built gesture recognition framework with multiple recognizers:
    - Tap, Drag, Swipe, Long Press gesture recognizers
    - Extensible system for custom gesture definitions
  - Created React context provider for input system integration
  - Added global event listeners for mouse, keyboard, and touch events
  - Implemented context-aware input handling (window/app/system contexts)
  - Created `useInput` hook for easy input system access
  - Added keyboard shortcuts to demo (Ctrl+N, Ctrl+W, Ctrl+M)
  - Integrated input system with existing window and application systems
- **Key Design Decisions:**
  - Factory function pattern consistent with other systems
  - Event-driven architecture with subscription model
  - Context-based priority system for input handling
  - Gesture recognizers as pluggable components
  - Native event conversion to unified InputEvent format
  - Global event capture with React context integration
- **Next Focus:**
  - Begin Phase 2 (UI Component Systems) or Phase 3 (Core Applications)
  - Consider Layout & Composition System or File Browser Application

---

## Future Considerations
- PWA capabilities for offline use
- File system persistence with localStorage/IndexedDB
- Integration with real file APIs
- Multiplayer/collaborative features
- Custom app development framework 