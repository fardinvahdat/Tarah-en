import { useSnapshotStore } from "@/store";
import { SnapshotType } from "@/types/history";
import { WorkSpaceCommonType } from "@/configs/canvas";
import useCanvas from "@/views/Canvas/useCanvas";
import useHistorySnapshot from "@/hooks/useHistorySnapshot";
export function useEditorEventHandlers() {
  const snapshotStore = useSnapshotStore();
  const { addHistorySnapshot } = useHistorySnapshot();

  const setupFabricEventListeners = () => {
    const [canvas] = useCanvas();
    if (!canvas) return;

    



    // Object removed - capture history snapshot
    canvas.on("object:removed", (e: any) => {
      if (snapshotStore.processing) return;
      const target = e.target;
      if (target && !WorkSpaceCommonType.includes(target.id)) {
        const serializedTarget = target.toObject();
        const index = canvas._objects.indexOf(target);
        addHistorySnapshot({
          type: SnapshotType.DELETE,
          index: index,
          target: serializedTarget,
        });
      }

      const id = target.id.replace("original_", "").replace("masked_", "");
      const original = canvas
        .getObjects()
        .filter((item: any) => item.id == `original_${id}`);
      const masked = canvas
        .getObjects()
        .filter((item: any) => item.id == `masked_${id}`);

      if (target.id.includes("masked_") && original.length) {
        original[0].set("id", original[0].id.replace("original_", ""));
      }
      if (target.id.includes("original_") && masked.length) {
        masked[0].set("id", masked[0].id.replace("masked_", ""));
        masked[0].set("clipPath", null);
      }
    });

    canvas.on("mouse:down", (e) => {
      if (e.target) {
        // If this is a new selection (not already selected)
        if (!e.target.selected) {
          // Select the object but prevent immediate dragging
          e.target.set({ selectable: true, evented: false });
          canvas.setActiveObject(e.target);
          canvas.requestRenderAll();

          // Enable dragging after delay
          setTimeout(() => {
            e.target.set({ evented: true });
            // canvas.requestRenderAll();
          }, 500);
        }
      }
    });
  };

  return {
    setupFabricEventListeners,
  };
}
