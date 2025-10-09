
import FabricCommand from './fabricCommand'

class FabricHistory {
  public index: number
  public commands: FabricCommand[]
  
  constructor() {
    this.commands = [];
    this.index = 0;
  }
  
  /**
   * Get the current history index
   */
  getIndex(): number {
    return this.index;
  }
  
  /**
   * Move back in history (undo)
   */
  back(): FabricHistory {
    if (this.index > 0) {
      const command = this.commands[--this.index];
      if (command) {
        command.undo();
      }
    }
    return this;
  }
  
  /**
   * Move forward in history (redo)
   */
  forward(): FabricHistory {
    if (this.index < this.commands.length) {
      const command = this.commands[this.index++];
      if (command) {
        command.execute();
      }
    }
    return this;
  }
  
  /**
   * Add a new command to the history
   * Truncates future commands if we're not at the end of history
   */
  add(command: FabricCommand): FabricHistory {
    // If we're not at the end of history, truncate
    if (this.index < this.commands.length) {
      this.commands.splice(this.index, this.commands.length - this.index);
    }
    
    // Add the new command
    this.commands.push(command);
    this.index++;
    
    // Limit history size
    const maxCommands = 30;
    if (this.commands.length > maxCommands) {
      this.commands.shift();
      this.index = Math.max(0, this.index - 1);
    }
    
    return this;
  }
  
  /**
   * Clear all history
   */
  clear(): FabricHistory {
    this.commands.length = 0;
    this.index = 0;
    return this;
  }
  
  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.index > 0;
  }
  
  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.index < this.commands.length;
  }
}

export default FabricHistory;
