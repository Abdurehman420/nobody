/**
 * NEON MYCELIUM - Keyboard Navigation System
 * 
 * Provides keyboard shortcuts for accessibility and power users.
 */

export class KeyboardNavigation {
    constructor() {
        this.keys = new Set();
        this.dispatch = null;
        this.state = null;
        this.enabled = true;

        this.shortcuts = {
            // Building & Actions
            'Space': () => this.buildNode(),
            'b': () => this.buildNode(),

            // Camera Pan (WASD)
            'w': () => this.pan(0, 50),
            'a': () => this.pan(50, 0),
            's': () => this.pan(0, -50),
            'd': () => this.pan(-50, 0),

            // UI Toggles
            'Escape': () => this.closeAllModals(),
            'Tab': () => this.toggleSettings(),
            'm': () => this.toggleStarMap(),
            'i': () => this.toggleBureaucrat(),
            'p': () => this.togglePermitOffice(),
            'g': () => this.togglePinealGland(),

            // Utility
            '+': () => this.zoom(-100),
            '-': () => this.zoom(100),
            '0': () => this.resetZoom(),
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    init(dispatch, getState) {
        this.dispatch = dispatch;
        this.getState = getState;

        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
    }

    handleKeyDown(e) {
        if (!this.enabled) return;

        // Ignore if typing in input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        this.keys.add(e.key);

        const handler = this.shortcuts[e.key];
        if (handler) {
            e.preventDefault();
            handler();
        }
    }

    handleKeyUp(e) {
        this.keys.delete(e.key);
    }

    buildNode() {
        if (!this.dispatch) return;

        // Build node at center of viewport
        this.dispatch({
            type: 'BUILD_NODE_AT',
            payload: { x: 0, y: 0 } // Will be adjusted by floating origin
        });
    }

    pan(dx, dy) {
        if (!this.dispatch) return;
        this.dispatch({ type: 'PAN_CAMERA', payload: { dx, dy } });
    }

    zoom(delta) {
        if (!this.dispatch) return;
        this.dispatch({ type: 'ZOOM', payload: delta });
    }

    resetZoom() {
        if (!this.dispatch) return;
        this.dispatch({ type: 'RESET_ZOOM' });
    }

    closeAllModals() {
        if (!this.dispatch) return;
        this.dispatch({ type: 'CLOSE_ALL_MODALS' });
    }

    toggleSettings() {
        if (!this.dispatch) return;
        this.dispatch({ type: 'TOGGLE_SETTINGS' });
    }

    toggleStarMap() {
        if (!this.dispatch) return;
        this.dispatch({ type: 'TOGGLE_STAR_MAP' });
    }

    toggleBureaucrat() {
        if (!this.dispatch) return;
        this.dispatch({ type: 'TOGGLE_BUREAUCRAT' });
    }

    togglePermitOffice() {
        if (!this.dispatch) return;
        this.dispatch({ type: 'TOGGLE_PERMIT_OFFICE' });
    }

    togglePinealGland() {
        if (!this.dispatch) return;
        this.dispatch({ type: 'TOGGLE_PINEAL_GLAND' });
    }

    isKeyPressed(key) {
        return this.keys.has(key);
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

export const keyboardNav = new KeyboardNavigation();
