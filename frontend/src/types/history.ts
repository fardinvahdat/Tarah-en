
import type { SerializedObjectProps, Transform, FabricObject } from "fabric"

export interface Snapshot {
  index: number             // Index of the affected object in canvas._objects
  target: SerializedObjectProps  // Serialized object data
  type: SnapshotType        // Type of operation (add, delete, modify, etc.)
  tid?: string              // Template ID (optional)
  objects?: SerializedObjectProps[]  // For group operations (optional)
  id?: number               // Snapshot ID (optional, used in database)
  action?: string           // Action performed (e.g., 'scale', 'rotate')
  transform?: Transform     // Transformation data (for modify operations)
  move?: number             // For ordering operations (optional)
  timestamp?: number        // When the snapshot was created
  property?: string         // Specific property that was changed (for property changes)
  oldValue?: any            // Previous value (for property changes)
  newValue?: any            // New value (for property changes)
}

export enum SnapshotType {
  ADD = 1,       // Object was added
  DELETE = 2,    // Object was deleted
  MODIFY = 3,    // Object was modified (moved, resized, etc.)
  ORDER = 4,     // Object order was changed
  GROUP = 5,     // Objects were grouped
  UNGROUP = 6,   // Group was ungrouped
  LOCK = 7,      // Object was locked
  UNLOCK = 8,    // Object was unlocked
  PROPERTY = 9,  // A specific property was changed
  STYLE = 10,    // Style properties were changed
  CANVAS = 11,   // Canvas-level changes
}

export interface HistoryState {
  past: Snapshot[];
  future: Snapshot[];
  present: Snapshot | null;
  processing: boolean;
}

export enum HistoryEventType {
  OBJECT_ADDED = 'object:added',
  OBJECT_REMOVED = 'object:removed',
  OBJECT_MODIFIED = 'object:modified',
  OBJECT_MOVED = 'object:moved',
  OBJECT_ROTATED = 'object:rotated',
  OBJECT_SCALED = 'object:scaled',
  PROPERTY_CHANGED = 'property:changed',
  SELECTION_CREATED = 'selection:created',
  SELECTION_UPDATED = 'selection:updated',
  SELECTION_CLEARED = 'selection:cleared',
  PATH_CREATED = 'path:created',
  CANVAS_CLEARED = 'canvas:cleared',
}
