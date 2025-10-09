
import { Object as FabricObject } from "fabric";

class FabricCommand {
  public receiver: FabricObject
  public state: Record<string, any>
  public prevState: Record<string, any>
  public stateProperties: string[]
  
  constructor(receiver: FabricObject) {
    this.receiver = receiver;
    this._initStateProperties();
    this.state = {};
    this.prevState = {};
    this._saveState();
    this._savePrevState();
  }
  
  /**
   * Execute the command (applies state)
   */
  execute() {
    this._restoreState();
    this.receiver.setCoords();
  }
  
  /**
   * Undo the command (reverts to previous state)
   */
  undo() {
    this._restorePrevState();
    this.receiver.setCoords();
  }
  
  /**
   * Initialize the state properties to track
   */
  _initStateProperties() {
    if (this.receiver._stateProperties) {
      this.stateProperties = Object.keys(this.receiver._stateProperties);
    } else {
      // Fallback to common properties if _stateProperties is not available
      this.stateProperties = [
        'left', 'top', 'width', 'height', 'scaleX', 'scaleY',
        'flipX', 'flipY', 'angle', 'opacity', 'fill', 'stroke',
        'strokeWidth', 'text'
      ];
    }
  }
  
  /**
   * Restore the command state
   */
  _restoreState() {
    this._restore(this.state);
  }
  
  /**
   * Restore previous state (for undo)
   */
  _restorePrevState() {
    this._restore(this.prevState);
  }
  
  /**
   * Apply a state to the receiver object
   */
  _restore(state: Record<string, any>) {
    this.stateProperties.forEach(prop => {
      if (prop in state) {
        this.receiver.set(prop, state[prop]);
      }
    });
  }
  
  /**
   * Save the current state of the receiver object
   */
  _saveState() {
    this.stateProperties.forEach(prop => {
      if (typeof this.receiver.get === 'function') {
        const value = this.receiver.get(prop);
        if (value !== undefined) {
          this.state[prop] = value;
        }
      }
    });
  }
  
  /**
   * Save the previous state from _stateProperties
   */
  _savePrevState() {
    if (this.receiver._stateProperties) {
      this.stateProperties.forEach(prop => {
        if (prop in this.receiver._stateProperties) {
          this.prevState[prop] = this.receiver._stateProperties[prop];
        }
      });
    }
  }
}

export default FabricCommand;
