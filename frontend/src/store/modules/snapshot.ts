import { defineStore, storeToRefs } from "pinia";
import { IndexableTypeArray } from "dexie";
import { useTemplatesStore, useStudioStore, useMainStore } from "@/store";
import { classRegistry, FabricObject, SerializedObjectProps } from "fabric";
import { db } from "@/utils/database";
import { Snapshot, SnapshotType } from "@/types/history";
import useCanvas from "@/views/Canvas/useCanvas";
import { ElementNames } from "@/types/elements";
import { debounce } from "lodash-es";

const FabricInstance = async (object: SerializedObjectProps) => {
  return (await (
    classRegistry.getClass(object.type) as typeof FabricObject
  ).fromObject(object)) as FabricObject;
};

export interface ScreenState {
  snapshotCursor: number;
  snapshotLength: number;
  processing: boolean;
  layering: boolean;
  batchOperation: boolean;
  batchSnapshots: Snapshot[];
}

export const useSnapshotStore = defineStore("snapshot", {
  state: (): ScreenState => ({
    snapshotCursor: -1, // Historical snapshot pointer
    snapshotLength: 0, // Historical snapshot length
    processing: false,
    layering: false,
    batchOperation: false, // Flag for batch operations
    batchSnapshots: [], // Snapshots to be added in batch
  }),

  getters: {
    canUndo(state) {
      return state.snapshotCursor >= 0;
    },
    canRedo(state) {
      return state.snapshotCursor < state.snapshotLength - 1;
    },
  },

  actions: {
    setSnapshotCursor(cursor: number) {
      this.snapshotCursor = cursor;
    },

    setSnapshotLength(length: number) {
      this.snapshotLength = length;
    },

    setProcessing(status: boolean) {
      this.processing = status;
    },

    async initSnapshotDatabase() {
      try {
        // Clear previous snapshots to start fresh
        const allKeys = await db.snapshots.orderBy("id").keys();
        await db.snapshots.bulkDelete(allKeys as number[]);
        this.setSnapshotCursor(-1);
        this.setSnapshotLength(0);
        this.batchSnapshots = [];
      } catch (error) {
        console.error("Error initializing snapshot database:", error);
      }
    },

    // Begin batch operation - used when multiple related operations should be grouped
    startBatch() {
      this.batchOperation = true;
      this.batchSnapshots = [];
    },

    // End batch operation and commit all snapshots as a group
    async endBatch() {
      if (!this.batchOperation || this.batchSnapshots.length === 0) {
        this.batchOperation = false;
        return;
      }

      try {
        // Add first snapshot to history, this will handle future truncation if needed
        await this.addSnapshot(this.batchSnapshots[0]);

        // Add the rest without truncating future
        if (this.batchSnapshots.length > 1) {
          for (let i = 1; i < this.batchSnapshots.length; i++) {
            await this._addSnapshotWithoutTruncating(this.batchSnapshots[i]);
          }
        }
      } catch (error) {
        console.error("Error ending batch operation:", error);
      } finally {
        this.batchOperation = false;
        this.batchSnapshots = [];
      }
    },

    // Add a snapshot to the batch or directly to history
    async addSnapshot(data?: Snapshot) {
      if (!data) return;

      try {
        // If in batch mode, add to batch collection
        if (this.batchOperation) {
          // Add timestamp to track order
          data.timestamp = Date.now();
          this.batchSnapshots.push(JSON.parse(JSON.stringify(data)));
          return;
        }

        // Get all snapshots sorted by ID
        const allKeys = await db.snapshots.orderBy("id").keys();
        let needDeleteKeys: IndexableTypeArray = [];

        // If we're not at the end of history, delete all snapshots after current position
        // This handles the case when user does undo and then a new action
        if (
          this.snapshotCursor >= 0 &&
          this.snapshotCursor < allKeys.length - 1
        ) {
          needDeleteKeys = allKeys.slice(this.snapshotCursor + 1);
        }

        // Add timestamp if not present
        if (!data.timestamp) {
          data.timestamp = Date.now();
        }

        // Add the new snapshot
        await db.snapshots.add(JSON.parse(JSON.stringify(data)));

        // Calculate new snapshot length
        let snapshotLength = allKeys.length - needDeleteKeys.length + 1;

        // Limit the number of snapshots stored
        const snapshotLengthLimit = 50; // Increased from 20 for better history
        if (snapshotLength > snapshotLengthLimit) {
          // Remove the oldest snapshot
          needDeleteKeys.push(allKeys[0]);
          snapshotLength--;
        }

        // Delete snapshots that need to be removed
        if (needDeleteKeys.length > 0) {
          await db.snapshots.bulkDelete(needDeleteKeys as number[]);
        }

        // Update cursor to point to the latest snapshot
        this.setSnapshotCursor(snapshotLength - 1);
        this.setSnapshotLength(snapshotLength);
      } catch (error) {
        console.error("Error adding snapshot:", error);
      }
    },

    // Internal method to add a snapshot without truncating future history
    // Used for batch operations where we want to preserve the sequence
    async _addSnapshotWithoutTruncating(data: Snapshot) {
      if (!data) return;

      try {
        // Add timestamp if not present
        if (!data.timestamp) {
          data.timestamp = Date.now();
        }

        // Add the new snapshot
        await db.snapshots.add(JSON.parse(JSON.stringify(data)));

        // Increment snapshot length and cursor
        const newLength = this.snapshotLength + 1;
        this.setSnapshotCursor(newLength - 1);
        this.setSnapshotLength(newLength);
      } catch (error) {
        console.error("Error adding snapshot without truncating:", error);
      }
    },

    async unDo() {
      if (!this.canUndo) return;

      // Set processing flag to prevent capturing the undo operation itself as a new history item
      this.processing = true;

      try {
        const [canvas] = useCanvas();
        if (!canvas) {
          console.error("Canvas not available for undo operation");
          this.processing = false;
          return;
        }

        const templatesStore = useTemplatesStore();
        const { templateId } = storeToRefs(templatesStore);
        const { isEditTextDialogVisible, stagedTextValue } = storeToRefs(
          useStudioStore()
        );
        const { canvasObject } = storeToRefs(useMainStore());
        const handleElement = computed(() => canvasObject.value);

        // Get current snapshot based on cursor
        const snapshots: Snapshot[] = await db.snapshots
          .orderBy("id")
          .toArray();
        const snapshotCursor = this.snapshotCursor;
        const snapshot = snapshots[snapshotCursor];

        if (!snapshot) {
          console.warn("No snapshot found at cursor position for undo");
          this.processing = false;
          return;
        }

        const {
          type,
          index,
          transform,
          action,
          target,
          objects,
          tid,
          property,
          oldValue,
        } = snapshot;

        // Skip if target is undefined (can happen with generic snapshots)
        if (!target) {
          this.setSnapshotCursor(snapshotCursor - 1);
          this.processing = false;
          return;
        }

        // Enhanced object finding with multiple fallback strategies
        let findIndex = -1;

        // Strategy 1: Find by ID if available
        if (target.id) {
          findIndex = canvas._objects.findIndex(
            (item) => item.id === target.id
          );
        }

        // Strategy 2: If ID search failed, try to find by snapshot index
        if (
          findIndex === -1 &&
          typeof index === "number" &&
          index >= 0 &&
          index < canvas._objects.length
        ) {
          const objectAtIndex = canvas._objects[index];
          // Verify it's likely the same object by checking some properties
          if (
            objectAtIndex &&
            objectAtIndex.type === target.type &&
            Math.abs(objectAtIndex.left - target.left) < 1 &&
            Math.abs(objectAtIndex.top - target.top) < 1
          ) {
            findIndex = index;
          }
        }

        // Strategy 3: Find by type and position as last resort
        if (findIndex === -1) {
          findIndex = canvas._objects.findIndex(
            (item) =>
              item.type === target.type &&
              Math.abs(item.left - target.left) < 1 &&
              Math.abs(item.top - target.top) < 1
          );
        }

        // Apply the appropriate operation based on snapshot type
        switch (type) {
          case SnapshotType.ADD:
            // For ADD type, we need to remove the object during undo
            if (findIndex !== -1) {
              canvas.remove(canvas._objects[findIndex]);
            }
            break;

          case SnapshotType.DELETE:
            // For DELETE type, we need to restore the object during undo
            await this.addTarget(target, findIndex > -1 ? findIndex : index);
            break;

          case SnapshotType.GROUP:
            // For GROUP type, we need to ungroup during undo
            const group = findIndex !== -1 ? canvas._objects[findIndex] : null;
            if (!objects || !group) break;

            // Add back individual objects and remove the group
            for (const item of objects) {
              item.left += group.left + group.width / 2;
              item.top += group.top + group.height / 2;
              const element = await FabricInstance(item);
              canvas.add(element);
            }
            canvas.remove(group);
            break;

          case SnapshotType.MODIFY:
            // For MODIFY type, revert the object to its previous state
            this.layering = true;

            // Create a copy of the target object with the previous properties
            const obj = {
              ...target,
              ...transform,
              ...transform?.original,
              originX: target.originX,
              originY: target.originY,
            };

            // Create a new Fabric object instance
            const _obj = await FabricInstance(obj);

            // Replace the modified object with the original one
            if (findIndex !== -1) {
              canvas.remove(canvas._objects[findIndex]);
              canvas.insertAt(findIndex, _obj);
            } else {
              canvas.add(_obj);
            }

            this.layering = false;
            break;

          case SnapshotType.PROPERTY:
            // For PROPERTY type, revert just the specific property
            if (findIndex !== -1 && property) {
              const obj = canvas._objects[findIndex];
              if (obj) {
                obj.set(property, oldValue);
                obj.setCoords();
              }
            }
            break;

          case SnapshotType.LOCK:
          case SnapshotType.UNLOCK:
            // Toggle lock state
            if (findIndex !== -1) {
              const obj = canvas._objects[findIndex];
              const lockState = type === SnapshotType.UNLOCK;
              obj.set({
                lockMovementX: lockState,
                lockMovementY: lockState,
                hasControls: !lockState,
                lockRotation: lockState,
                lockScalingX: lockState,
                lockScalingY: lockState,
              });
              obj.hoverCursor = lockState ? "not-allowed" : "default";
            }
            break;
        }

        // Render the canvas with changes and update cursor
        canvas.requestRenderAll();
        this.setSnapshotCursor(snapshotCursor - 1);

        // Re-attach text editing handlers to all textboxes
        const objs = canvas.getObjects();
        objs
          .filter((obj) => obj.name == ElementNames.TEXTBOX)
          .forEach((textBox) => {
            textBox.on("editing:entered", function () {
              isEditTextDialogVisible.value = true;
              stagedTextValue.value = handleElement.value?.text || "";
            });
          });
      } catch (error) {
        console.error("Error during undo operation:", error);
      } finally {
        // Always ensure processing flag is reset
        setTimeout(() => {
          this.processing = false;
        }, 10);
      }
    },

    async reDo() {
      if (!this.canRedo) return;

      // Set processing flag to prevent capturing the redo operation itself as a new history item
      this.processing = true;

      try {
        const [canvas] = useCanvas();
        if (!canvas) {
          console.error("Canvas not available for redo operation");
          this.processing = false;
          return;
        }

        const { isEditTextDialogVisible, stagedTextValue } = storeToRefs(
          useStudioStore()
        );
        const { canvasObject } = storeToRefs(useMainStore());
        const handleElement = computed(() => canvasObject.value);

        // Move cursor forward for redo
        const snapshotCursor = this.snapshotCursor + 1;

        // Get the snapshot we need to redo from memory
        const snapshots: Snapshot[] = await db.snapshots
          .orderBy("id")
          .toArray();
        const snapshot = snapshots[snapshotCursor];

        if (!snapshot) {
          console.warn("No snapshot found at cursor position for redo");
          this.processing = false;
          return;
        }

        const {
          type,
          index,
          transform,
          action,
          target,
          objects,
          tid,
          property,
          newValue,
        } = snapshot;

        // Skip if target is undefined (can happen with generic snapshots)
        if (!target) {
          this.setSnapshotCursor(snapshotCursor);
          this.processing = false;
          return;
        }

        // Enhanced object finding with multiple fallback strategies (same as undo)
        let findIndex = -1;

        if (target.id) {
          findIndex = canvas._objects.findIndex(
            (item) => item.id === target.id
          );
        }

        if (
          findIndex === -1 &&
          typeof index === "number" &&
          index >= 0 &&
          index < canvas._objects.length
        ) {
          const objectAtIndex = canvas._objects[index];
          if (
            objectAtIndex &&
            objectAtIndex.type === target.type &&
            Math.abs(objectAtIndex.left - target.left) < 1 &&
            Math.abs(objectAtIndex.top - target.top) < 1
          ) {
            findIndex = index;
          }
        }

        if (findIndex === -1) {
          findIndex = canvas._objects.findIndex(
            (item) =>
              item.type === target.type &&
              Math.abs(item.left - target.left) < 1 &&
              Math.abs(item.top - target.top) < 1
          );
        }

        // Apply the appropriate operation based on snapshot type
        switch (type) {
          case SnapshotType.ADD:
            // For ADD type, we need to add the object back during redo
            await this.addTarget(target, findIndex > -1 ? findIndex : index);
            break;

          case SnapshotType.DELETE:
            // For DELETE type, remove the object during redo
            if (findIndex !== -1) {
              canvas.remove(canvas._objects[findIndex]);
            }
            break;

          case SnapshotType.GROUP:
            // For GROUP type, re-create the group during redo
            if (!objects || objects.length === 0) break;

            // Remove individual objects that are part of the group
            const objectsToRemove = [];
            for (const item of objects) {
              const objIndex = canvas._objects.findIndex(
                (obj) => obj.id === item.id
              );
              if (objIndex !== -1) {
                objectsToRemove.push(canvas._objects[objIndex]);
              }
            }

            if (objectsToRemove.length > 0) {
              canvas.remove(...objectsToRemove);
            }

            // Add back the group
            await this.addTarget(target, index);
            break;

          case SnapshotType.MODIFY:
            // For MODIFY type, apply the modifications again
            this.layering = true;

            // Get the object with its modified properties
            const obj = {
              ...target,
              ...transform,
              ...transform?.original.id,
              originX: target.originX,
              originY: target.originY,
            };

            // Create a new Fabric object instance with the changes
            const _obj = await FabricInstance(obj);

            // Replace the current object with the modified one
            if (findIndex !== -1) {
              canvas.remove(canvas._objects[findIndex]);
              canvas.insertAt(findIndex, _obj);
            } else {
              canvas.add(_obj);
            }

            this.layering = false;
            break;

          case SnapshotType.PROPERTY:
            // For PROPERTY type, apply just the specific property change
            if (findIndex !== -1 && property) {
              const obj = canvas._objects[findIndex];
              if (obj) {
                obj.set(property, newValue);
                obj.setCoords();
              }
            }
            break;

          case SnapshotType.LOCK:
          case SnapshotType.UNLOCK:
            // Apply lock state
            if (findIndex !== -1) {
              const obj = canvas._objects[findIndex];
              const lockState = type === SnapshotType.LOCK;
              obj.set({
                lockMovementX: lockState,
                lockMovementY: lockState,
                hasControls: !lockState,
                lockRotation: lockState,
                lockScalingX: lockState,
                lockScalingY: lockState,
              });
              obj.hoverCursor = lockState ? "not-allowed" : "default";
            }
            break;
        }

        // Update the snapshot cursor and render canvas
        this.setSnapshotCursor(snapshotCursor);
        canvas.requestRenderAll();

        // Re-attach text editing handlers to all textboxes
        const objs = canvas.getObjects();
        objs
          .filter((obj) => obj.name == ElementNames.TEXTBOX)
          .forEach((textBox) => {
            textBox.on("editing:entered", function () {
              isEditTextDialogVisible.value = true;
              stagedTextValue.value = handleElement.value?.text || "";
            });
          });
      } catch (error) {
        console.error("Error during redo operation:", error);
      } finally {
        // Always ensure processing flag is reset
        setTimeout(() => {
          this.processing = false;
        }, 10);
      }
    },

    async clear() {
      try {
        const allKeys = await db.snapshots.orderBy("id").keys();
        await db.snapshots.bulkDelete(allKeys as number[]);
        this.setSnapshotCursor(-1);
        this.setSnapshotLength(0);
        this.batchSnapshots = [];
      } catch (error) {
        console.error("Error clearing snapshots:", error);
      }
    },

    async addTarget(target: SerializedObjectProps, findIndex: number) {
      const [canvas] = useCanvas();
      if (!canvas) return;

      try {
        const element = await FabricInstance(target);
        if (findIndex >= 0 && findIndex <= canvas._objects.length) {
          canvas.insertAt(findIndex, element);
        } else {
          canvas.add(element);
        }
      } catch (error) {
        console.error("Error adding target:", error);
      }
    },
  },
});
