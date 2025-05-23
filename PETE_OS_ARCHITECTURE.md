# Pete OS - Architecture & Technical Decisions

## Core Architecture Philosophy

### React-Idiomatic Patterns
We prioritize React's established patterns over traditional OOP approaches. This means favoring hooks, reducers, and functional components over classes.

### System-First Design
We build **systems**, not UIs. Every component should work regardless of how it's presented visually.

**Example**: The window manager doesn't know about title bars, close buttons, or resize handles - it only manages window state and lifecycle.

### Plugin Architecture
Every major system should be replaceable without breaking others.

**Pattern**:
```typescript
// Bad: Hardcoded dependencies
const windowReducer = (state, action) => {
  // Mixing UI concerns with state management
  return { ...state, titleBarHTML: '<div>...' };
};

// Good: Pluggable rendering
const windowReducer = (state, action) => {
  // Just manages state
  return { ...state, position: action.position };
};
<Viewport renderWindow={customRenderer} />
```

### Event-Driven Communication
Systems communicate through events, not direct coupling.

**Pattern**:
```typescript
windowManager.subscribe((event) => {
  // React to window events
});
```

## Technical Patterns

### State Management
- **Global State**: React Context (can migrate to Zustand/Redux later)
- **Local State**: Component useState/useReducer
- **Persistence**: localStorage with JSON serialization
- **Side Effects**: Event subscriptions in useEffect

### Type System
- **Interfaces over Types** for extensibility
- **Discriminated Unions** for events
- **Generic Constraints** for flexibility
- **Metadata Pattern** for app-specific data

### Component Architecture
```
BaseComponent (Logic/State)
    ↓
Styled Wrapper (Optional UI)
    ↓
Consumer Component (Actual Usage)
```

## Code Organization

### Directory Structure
```
app/pete-os/
├── core/                    # System services
│   ├── [system-name]/      # e.g., window-manager
│   │   ├── index.ts        # Public exports
│   │   ├── [system]-reducer.ts    # State management
│   │   ├── create-[system].ts     # Factory function (optional)
│   │   └── [system]-context.tsx   # React integration
│   └── types/              # Shared type definitions
├── components/             # UI components
│   └── [component]/       # Self-contained components
├── lib/                   # Utilities
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Helper functions
└── applications/         # Future: Built-in apps
```

### Naming Conventions
- **Factory Functions**: camelCase with 'create' prefix (`createWindowManager`)
- **Reducers**: camelCase with 'Reducer' suffix (`windowManagerReducer`)
- **Hooks**: camelCase with 'use' prefix (`useWindow`)
- **Actions**: UPPER_SNAKE_CASE (`CREATE_WINDOW`)
- **Components**: PascalCase (`BaseWindow`)
- **Files**: kebab-case (`window-manager.ts`)

## Implementation Guidelines

### Creating a New System
1. Define types in `core/types/`
2. Create reducer in `core/[system]/[system]-reducer.ts`
3. Create factory function in `core/[system]/create-[system].ts` (if needed)
4. Add React context wrapper in `core/[system]/[system]-context.tsx`
5. Create hooks in `lib/hooks/`
6. Build minimal UI for testing

### Adding Features
1. Start with the type definitions
2. Add action types to the reducer
3. Implement reducer cases
4. Update context/hooks if needed
5. Test with minimal UI

### Performance Considerations
- **Virtual Rendering**: Only render visible windows
- **Event Debouncing**: Throttle high-frequency events
- **Lazy Loading**: Load apps on demand
- **State Updates**: Batch React updates

## Current Implementation Status

### ✅ Completed Systems
1. **Window Manager**
   - Full lifecycle management
   - Z-order handling
   - Focus management
   - State persistence
   - Event system

### 🚧 In Progress
2. **Application Framework**
   - App registry
   - Lifecycle management
   - Inter-app communication

### 📋 Planned Systems
3. **Input System**
   - Unified event handling
   - Gesture recognition
   - Keyboard shortcuts

4. **Layout Engine**
   - Constraint-based positioning
   - Multiple paradigms (floating, tiling)

## Key Design Decisions Log

### Window System (Session 2)
- **Decision**: Windows have no default chrome
- **Rationale**: Maximum flexibility for UI experimentation
- **Alternative**: Could have provided default chrome with override option

### State Management Pattern (Session 2 - Updated)
- **Decision**: useReducer pattern over classes
- **Rationale**: More React-idiomatic, better DevTools support, easier testing
- **Alternative**: Classes (less idiomatic), Zustand (external dependency)

### State Persistence
- **Decision**: localStorage with JSON serialization
- **Rationale**: Simple, works immediately, easy to debug
- **Alternative**: IndexedDB for more complex data

### Event System
- **Decision**: Actions through reducer instead of custom events
- **Rationale**: Predictable state updates, time-travel debugging
- **Alternative**: Custom event emitter (more complex)

## Common Patterns

### Reducer + Context + Hook Pattern (Recommended)
```typescript
// 1. Reducer (core logic)
const systemReducer = (state, action) => {
  switch (action.type) {
    case 'ACTION': return newState;
  }
};

// 2. Context (React integration)
const SystemContext = createContext();
const SystemProvider = ({ children }) => {
  const [state, dispatch] = useReducer(systemReducer, initialState);
  return <SystemContext.Provider value={{ state, dispatch }} />;
};

// 3. Hook (easy consumption)
const useSystem = () => {
  const { state, dispatch } = useContext(SystemContext);
  const doAction = useCallback(() => dispatch({ type: 'ACTION' }), []);
  return { state, doAction };
};
```

### Alternative: Factory Function Pattern
```typescript
// For non-React contexts or when you need more control
const createSystem = () => {
  let state = { /* private */ };
  return {
    method: () => { /* public API */ }
  };
};
```

### Metadata Extension Pattern
```typescript
interface WindowState {
  // Core fields...
  metadata?: Record<string, unknown>;
}
```

### Constraint Pattern
```typescript
interface Constraints {
  canResize?: boolean;
  minWidth?: number;
  // Optional constraints
}
```

## Debugging & Development

### Useful Dev Tools
- React DevTools - inspect context/state
- Window state in localStorage - `pete-os-windows`
- Console logging for events

### Testing Strategy
- Unit tests for services
- Integration tests for systems
- Visual tests for components
- Manual testing for interactions 