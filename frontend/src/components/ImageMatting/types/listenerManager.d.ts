export interface MouseListenerContext {
	/** Target DOM that triggers mouse events */
mouseTarget: HTMLElement;
/** mousemove listener */
move: (ev: MouseEvent) => void;
/** mousedown listener */
down?: (ev: MouseEvent) => void | boolean;
/** mouseup listener */
up?: (ev: MouseEvent) => void;
}

/** Configuration object for unbinding mousedown listener and mouseup listener callbacks */
export interface UnbindDownUpConfig {
/** Unbind mousedown listener callback */
unbindDown: VoidFunction;
/** Unbind mouseup listener callback */
unbindUp: VoidFunction;
}

/** Event listener configuration object */
export interface ListenerConfig {
/** Event type */
eventType: string;
/** Event listener */
listener: EventListener;
stop?: boolean;
prevent?: boolean;
}

export interface WheelListenerContext {
/** Input (left) drawing board */
mattingBoards: HTMLCanvasElement[];
/** Listener for sliding start */
wheel: (ev: WheelEvent) => void;
}

/** Container for storing UnbindDownUpConfig objects */
export type UnbindDownUpCache = WeakMap<HTMLElement, UnbindDownUpConfig>;

/** Container for storing callbacks for unbinding mousemove listeners */
export type UnbindMoveCache = WeakMap<HTMLElement, VoidFunction>;

/** Container for unbinding callbacks for Wheel listeners */
export type UnbindWheelCache = Set<VoidFunction>;
