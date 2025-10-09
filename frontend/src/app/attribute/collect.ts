
import { Canvas, IEvent, FabricObject } from 'fabric';
import { SnapshotType } from '@/types/history';
import { propertiesToInclude } from '@/configs/canvas';
import { useSnapshotStore } from '@/store';
import { WorkSpaceCommonType } from '@/configs/canvas';
import { debounce } from 'lodash-es';

class CollectHistory {
  private _lastOperation: string | null = null;
  private _operationTimeout: any = null;
  private _canvas: Canvas | null = null;
  private _templateId: string | null = null;
  private _isProcessingEvent = false;
  
  // Setup fabric event listeners for history tracking
  setupEventListeners(canvas: Canvas, templateId: string) {
    if (!canvas) {
      console.error('Canvas is not available for history tracking');
      return;
    }
    
    this._canvas = canvas;
    this._templateId = templateId;
    
    // Clear any existing event listeners
    canvas.off('object:added', this._objectAddedHandler);
    canvas.off('object:modified', this._objectModifiedHandler);
    canvas.off('object:removed', this._objectRemovedHandler);
    canvas.off('property:modified', this._propertyModifiedHandler);
    
    // Add new event listeners
    canvas.on('object:added', this._objectAddedHandler);
    canvas.on('object:modified', this._objectModifiedHandler);
    canvas.on('object:removed', this._objectRemovedHandler);
    
    console.log('History tracking initialized for template:', templateId);
  }
  
  // Debounced handler for object added events
  private _objectAddedHandler = debounce((e: IEvent<MouseEvent>) => {
    if (this._isProcessingEvent || !e.target) return;
    this._isProcessingEvent = true;
    
    try {
      const target = e.target;
      const snapshotStore = useSnapshotStore();
      
      // Ignore workspace common elements
      if (target.id && WorkSpaceCommonType.includes(target.id)) {
        this._isProcessingEvent = false;
        return;
      }
      
      // Don't record if we're currently processing a snapshot
      if (snapshotStore.processing || snapshotStore.layering) {
        this._isProcessingEvent = false;
        return;
      }
            
      snapshotStore.addSnapshot({
        type: SnapshotType.ADD,
        tid: this._templateId || undefined,
        target: target.toObject(propertiesToInclude),
        index: this._canvas?._objects.indexOf(target) || 0
      });
      
      console.log('History: Object added', target.id);
      
    } catch (error) {
      console.error('Error in object:added handler', error);
    } finally {
      this._isProcessingEvent = false;
    }
  }, 100, { leading: true, trailing: true });
  
  // Debounced handler for object modified events
  private _objectModifiedHandler = debounce((e: IEvent<MouseEvent>) => {
    if (this._isProcessingEvent || !e.target) return;
    this._isProcessingEvent = true;
    
    try {
      const target = e.target;
      const transform = e.transform;
      const action = e.action;
      const snapshotStore = useSnapshotStore();
      
      // Ignore workspace common elements
      if (target.id && WorkSpaceCommonType.includes(target.id)) {
        this._isProcessingEvent = false;
        return;
      }
      
      // Don't record if we're currently processing a snapshot
      if (snapshotStore.processing || snapshotStore.layering) {
        this._isProcessingEvent = false;
        return;
      }

      snapshotStore.addSnapshot({
        type: SnapshotType.MODIFY,
        tid: this._templateId || undefined,
        target: target.toObject(propertiesToInclude),
        transform,
        action,
        index: this._canvas?._objects.indexOf(target) || 0
      });
      
      console.log('History: Object modified', target.id, action);
      
    } catch (error) {
      console.error('Error in object:modified handler', error);
    } finally {
      this._isProcessingEvent = false;
    }
  }, 1000, { trailing: true });
  
  // Debounced handler for object removed events
  private _objectRemovedHandler = debounce((e: IEvent<MouseEvent>) => {
    if (this._isProcessingEvent || !e.target) return;
    this._isProcessingEvent = true;
    
    try {
      const target = e.target;
      const snapshotStore = useSnapshotStore();
      
      // Ignore workspace common elements
      if (target.id && WorkSpaceCommonType.includes(target.id)) {
        this._isProcessingEvent = false;
        return;
      }
      
      // Don't record if we're currently processing a snapshot
      if (snapshotStore.processing || snapshotStore.layering) {
        this._isProcessingEvent = false;
        return;
      }
      
      snapshotStore.addSnapshot({
        type: SnapshotType.DELETE,
        tid: this._templateId || undefined,
        target: target.toObject(propertiesToInclude),
        index: this._canvas?._objects.indexOf(target) || 0
      });
      
      console.log('History: Object removed', target.id);
      
    } catch (error) {
      console.error('Error in object:removed handler', error);
    } finally {
      this._isProcessingEvent = false;
    }
  }, 100, { leading: true });
  
  // Handler for property modified events
  private _propertyModifiedHandler = (e: any) => {
    if (this._isProcessingEvent || !e.target) return;
    this._isProcessingEvent = true;
    
    try {
      const target = e.target;
      const property = e.property;
      const prevValue = e.prevValue;
      const newValue = e.newValue;
      const snapshotStore = useSnapshotStore();
      
      // Ignore workspace common elements
      if (target.id && WorkSpaceCommonType.includes(target.id)) {
        this._isProcessingEvent = false;
        return;
      }
      
      // Don't record if we're currently processing a snapshot
      if (snapshotStore.processing || snapshotStore.layering) {
        this._isProcessingEvent = false;
        return;
      }
      
      snapshotStore.addSnapshot({
        type: SnapshotType.PROPERTY,
        tid: this._templateId || undefined,
        target: target.toObject(propertiesToInclude),
        property,
        oldValue: prevValue,
        newValue,
        index: this._canvas?._objects.indexOf(target) || 0
      });
      
      console.log('History: Property modified', target.id, property, prevValue, newValue);
    } catch (error) {
      console.error('Error in property:modified handler', error);
    } finally {
      this._isProcessingEvent = false;
    }
  };
  
  // Method to track custom property changes
  trackPropertyChange(target: FabricObject, property: string, oldValue: any, newValue: any) {
    if (!target || !property) return;
    
    const snapshotStore = useSnapshotStore();
    
    // Don't record if we're currently processing a snapshot
    if (snapshotStore.processing || snapshotStore.layering) return;
    
    snapshotStore.addSnapshot({
      type: SnapshotType.PROPERTY,
      tid: this._templateId || undefined,
      target: target.toObject(propertiesToInclude),
      property,
      oldValue,
      newValue,
      index: this._canvas?._objects.indexOf(target) || 0
    });
    
    console.log('History: Custom property change tracked', target.id, property, oldValue, newValue);
  }
}

export const collectHistory = new CollectHistory();
