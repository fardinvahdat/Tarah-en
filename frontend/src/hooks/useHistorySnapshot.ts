
import { debounce, throttle } from 'lodash-es'
import { useSnapshotStore } from '@/store'
import { Snapshot, SnapshotType } from '@/types/history'
import useCanvas from '@/views/Canvas/useCanvas'
import { useMainStore } from '@/store'
import { storeToRefs } from 'pinia'
import { collectHistory } from '@/app/attribute/collect'

export default () => {
  const snapshotStore = useSnapshotStore()
  const mainStore = useMainStore();
  const { canvasObject } = storeToRefs(mainStore);
  const [canvas] = useCanvas();

  // Add historical snapshots with debounce to prevent too many snapshots
  const addHistorySnapshot = debounce(function(data?: Snapshot) {
    // Only proceed if data is provided or if we're capturing a generic snapshot
    if (!data && !canvas) return;
    if (!data.target?.id) return;
    
    // If data is not provided but canvas exists, we're taking a generic snapshot
    if (!data && canvas) {
      // This is intentionally empty - just adding a timestamp marker in history
      snapshotStore.addSnapshot({
        type: SnapshotType.CANVAS,
        index: -1,
        target: null,
        timestamp: Date.now()
      } as Snapshot);
      return;
    }
    
    // Add timestamp to snapshot if not already present
    if (!data.timestamp) {
      data.timestamp = Date.now();
    }
    
    snapshotStore.addSnapshot(data as Snapshot);
  }, 50, { trailing: true, leading: false });

  // Redo with throttle and improved error handling
  const redo = throttle(function() {
    if (!snapshotStore.canRedo) {
      console.log('Cannot redo - no forward history available');
      return;
    }
    
    // Set processing flag to true before operation
    snapshotStore.setProcessing(true);
    
    try {
      snapshotStore.reDo();
    } catch (error) {
      console.error('Error during redo operation:', error);
    } finally {
      // Ensure processing flag is reset even if an error occurs
      setTimeout(() => {
        snapshotStore.setProcessing(false);
        
        // Force canvas to update
        if (canvas) {
          canvas.requestRenderAll();
        }
      }, 150); // Increased timeout for better stability
    }
  }, 400, { leading: true, trailing: false }); // Increased throttle time

  // Undo with throttle and improved error handling
  const undo = throttle(function() {
    if (!snapshotStore.canUndo) {
      console.log('Cannot undo - no history available');
      return;
    }
    
    // Set processing flag to true before operation
    snapshotStore.setProcessing(true);
    
    try {
      snapshotStore.unDo();
    } catch (error) {
      console.error('Error during undo operation:', error);
    } finally {
      // Ensure processing flag is reset even if an error occurs
      setTimeout(() => {
        snapshotStore.setProcessing(false);
        
        // Force canvas to update
        if (canvas) {
          canvas.requestRenderAll();
        }
      }, 150); // Increased timeout for better stability
    }
  }, 400, { leading: true, trailing: false }); // Increased throttle time

  // Initialize the history tracking system
  const initHistoryTracking = (templateId: string) => {
    if (!canvas) return;
    
    // Reset snapshot store to ensure clean state
    snapshotStore.clear();
    
    // Ensure the canvas is ready, then setup history tracking events
    setTimeout(() => {
      collectHistory.setupEventListeners(canvas, templateId);
    }, 500);
  };

  // Clear history
  const clearHistorySnapshot = throttle(function() {
    snapshotStore.clear();
  }, 300, { leading: true, trailing: false });

  return {
    addHistorySnapshot,
    redo,
    undo,
    clearHistorySnapshot,
    initHistoryTracking
  }
}
