import { 
  GestureRecognizer, 
  GestureEvent, 
  InputEvent, 
  InputPosition 
} from '../types/input.types';

// Utility functions
const distance = (p1: InputPosition, p2: InputPosition): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

const angle = (p1: InputPosition, p2: InputPosition): number => {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
};

const generateId = (): string => {
  return `gesture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Tap Gesture Recognizer
export function createTapGestureRecognizer(maxDistance = 10, maxDuration = 300): GestureRecognizer {
  let startEvent: InputEvent | null = null;

  return {
    recognize(events: InputEvent[]): GestureEvent | null {
      if (events.length === 0) return null;

      const lastEvent = events[events.length - 1];

      // Start tracking on mouse/touch down
      if ((lastEvent.type === 'mouse.down' || lastEvent.type === 'touch.start') && !startEvent) {
        startEvent = lastEvent;
        return {
          id: generateId(),
          type: 'tap',
          state: 'start',
          timestamp: lastEvent.timestamp,
          position: lastEvent.position || { x: 0, y: 0 },
          data: {},
          context: lastEvent.context
        };
      }

      // Complete tap on mouse/touch up
      if ((lastEvent.type === 'mouse.up' || lastEvent.type === 'touch.end') && startEvent) {
        const duration = lastEvent.timestamp - startEvent.timestamp;
        const dist = lastEvent.position && startEvent.position 
          ? distance(startEvent.position, lastEvent.position)
          : 0;

        const isValidTap = duration <= maxDuration && dist <= maxDistance;
        
        const gesture: GestureEvent = {
          id: generateId(),
          type: 'tap',
          state: isValidTap ? 'end' : 'cancel',
          timestamp: lastEvent.timestamp,
          position: lastEvent.position || { x: 0, y: 0 },
          data: {
            duration,
            distance: dist,
            startPosition: startEvent.position
          },
          context: lastEvent.context
        };

        startEvent = null; // Reset
        return isValidTap ? gesture : null;
      }

      return null;
    },

    reset(): void {
      startEvent = null;
    }
  };
}

// Drag Gesture Recognizer
export function createDragGestureRecognizer(minDistance = 10): GestureRecognizer {
  let startEvent: InputEvent | null = null;
  let isDragging = false;

  return {
    recognize(events: InputEvent[]): GestureEvent | null {
      if (events.length === 0) return null;

      const lastEvent = events[events.length - 1];

      // Start tracking on mouse/touch down
      if ((lastEvent.type === 'mouse.down' || lastEvent.type === 'touch.start') && !startEvent) {
        startEvent = lastEvent;
        isDragging = false;
        return null;
      }

      // Track movement
      if ((lastEvent.type === 'mouse.move' || lastEvent.type === 'touch.move') && startEvent) {
        const dist = lastEvent.position && startEvent.position 
          ? distance(startEvent.position, lastEvent.position)
          : 0;

        if (!isDragging && dist >= minDistance) {
          // Start dragging
          isDragging = true;
          return {
            id: generateId(),
            type: 'drag',
            state: 'start',
            timestamp: lastEvent.timestamp,
            position: lastEvent.position || { x: 0, y: 0 },
            data: {
              startPosition: startEvent.position,
              distance: dist
            },
            context: lastEvent.context
          };
        } else if (isDragging) {
          // Continue dragging
          return {
            id: generateId(),
            type: 'drag',
            state: 'update',
            timestamp: lastEvent.timestamp,
            position: lastEvent.position || { x: 0, y: 0 },
            data: {
              startPosition: startEvent.position,
              distance: dist,
              deltaX: lastEvent.position && startEvent.position 
                ? lastEvent.position.x - startEvent.position.x 
                : 0,
              deltaY: lastEvent.position && startEvent.position 
                ? lastEvent.position.y - startEvent.position.y 
                : 0
            },
            context: lastEvent.context
          };
        }
      }

      // End dragging
      if ((lastEvent.type === 'mouse.up' || lastEvent.type === 'touch.end') && startEvent && isDragging) {
        const dist = lastEvent.position && startEvent.position 
          ? distance(startEvent.position, lastEvent.position)
          : 0;

        const gesture: GestureEvent = {
          id: generateId(),
          type: 'drag',
          state: 'end',
          timestamp: lastEvent.timestamp,
          position: lastEvent.position || { x: 0, y: 0 },
          data: {
            startPosition: startEvent.position,
            endPosition: lastEvent.position,
            totalDistance: dist,
            duration: lastEvent.timestamp - startEvent.timestamp
          },
          context: lastEvent.context
        };

        startEvent = null; // Reset
        isDragging = false;
        return gesture;
      }

      return null;
    },

    reset(): void {
      startEvent = null;
      isDragging = false;
    }
  };
}

// Swipe Gesture Recognizer
export function createSwipeGestureRecognizer(minDistance = 50, maxDuration = 500, minVelocity = 0.1): GestureRecognizer {
  let startEvent: InputEvent | null = null;

  return {
    recognize(events: InputEvent[]): GestureEvent | null {
      if (events.length === 0) return null;

      const lastEvent = events[events.length - 1];

      // Start tracking on mouse/touch down
      if ((lastEvent.type === 'mouse.down' || lastEvent.type === 'touch.start') && !startEvent) {
        startEvent = lastEvent;
        return null;
      }

      // Complete swipe on mouse/touch up
      if ((lastEvent.type === 'mouse.up' || lastEvent.type === 'touch.end') && startEvent) {
        const duration = lastEvent.timestamp - startEvent.timestamp;
        const dist = lastEvent.position && startEvent.position 
          ? distance(startEvent.position, lastEvent.position)
          : 0;
        
        const velocity = duration > 0 ? dist / duration : 0;
        const swipeAngle = lastEvent.position && startEvent.position 
          ? angle(startEvent.position, lastEvent.position)
          : 0;

        const isValidSwipe = duration <= maxDuration && 
                            dist >= minDistance && 
                            velocity >= minVelocity;

        if (isValidSwipe) {
          // Determine swipe direction
          let direction = 'unknown';
          if (swipeAngle >= -45 && swipeAngle <= 45) direction = 'right';
          else if (swipeAngle >= 45 && swipeAngle <= 135) direction = 'down';
          else if (swipeAngle >= 135 || swipeAngle <= -135) direction = 'left';
          else if (swipeAngle >= -135 && swipeAngle <= -45) direction = 'up';

          const gesture: GestureEvent = {
            id: generateId(),
            type: 'swipe',
            state: 'end',
            timestamp: lastEvent.timestamp,
            position: lastEvent.position || { x: 0, y: 0 },
            data: {
              direction,
              distance: dist,
              duration,
              velocity,
              angle: swipeAngle,
              startPosition: startEvent.position,
              endPosition: lastEvent.position
            },
            context: lastEvent.context
          };

          startEvent = null; // Reset
          return gesture;
        }

        startEvent = null; // Reset
      }

      return null;
    },

    reset(): void {
      startEvent = null;
    }
  };
}

// Long Press Gesture Recognizer
export function createLongPressGestureRecognizer(duration = 500, maxDistance = 10): GestureRecognizer {
  let startEvent: InputEvent | null = null;
  let timeoutId: NodeJS.Timeout | null = null;
  let triggered = false;

  const reset = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    startEvent = null;
    triggered = false;
  };

  return {
    recognize(events: InputEvent[]): GestureEvent | null {
      if (events.length === 0) return null;

      const lastEvent = events[events.length - 1];

      // Start tracking on mouse/touch down
      if ((lastEvent.type === 'mouse.down' || lastEvent.type === 'touch.start') && !startEvent) {
        startEvent = lastEvent;
        triggered = false;
        
        // Set timeout for long press
        timeoutId = setTimeout(() => {
          if (startEvent && !triggered) {
            triggered = true;
            // Note: This would need to be handled differently in a real implementation
            // as we can't return a gesture from a timeout callback
          }
        }, duration);
        
        return null;
      }

      // Check for movement (cancel long press if moved too much)
      if ((lastEvent.type === 'mouse.move' || lastEvent.type === 'touch.move') && startEvent) {
        const dist = lastEvent.position && startEvent.position 
          ? distance(startEvent.position, lastEvent.position)
          : 0;

        if (dist > maxDistance) {
          reset();
          return null;
        }
      }

      // Handle release
      if ((lastEvent.type === 'mouse.up' || lastEvent.type === 'touch.end') && startEvent) {
        const wasTriggered = triggered;
        const gestureDuration = lastEvent.timestamp - startEvent.timestamp;
        
        const gesture: GestureEvent | null = wasTriggered ? {
          id: generateId(),
          type: 'long-press',
          state: 'end',
          timestamp: lastEvent.timestamp,
          position: lastEvent.position || { x: 0, y: 0 },
          data: {
            duration: gestureDuration,
            startPosition: startEvent.position
          },
          context: lastEvent.context
        } : null;

        reset();
        return gesture;
      }

      return null;
    },

    reset
  };
} 