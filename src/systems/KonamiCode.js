/**
 * NEON MYCELIUM - Konami Code Detector
 * 
 * Classic easter egg: ↑↑↓↓←→←→BA
 * Unlocks ASCII renderer mode
 */

export class KonamiCode {
    constructor() {
        this.sequence = [
            'ArrowUp',
            'ArrowUp',
            'ArrowDown',
            'ArrowDown',
            'ArrowLeft',
            'ArrowRight',
            'ArrowLeft',
            'ArrowRight',
            'b',
            'a'
        ];
        this.userInput = [];
        this.activated = false;
        this.onActivate = null;

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    init(onActivate) {
        this.onActivate = onActivate;
        window.addEventListener('keydown', this.handleKeyDown);
    }

    cleanup() {
        window.removeEventListener('keydown', this.handleKeyDown);
    }

    handleKeyDown(e) {
        // Add key to user input buffer
        this.userInput.push(e.key);

        // Keep only last N keys where N = sequence length
        if (this.userInput.length > this.sequence.length) {
            this.userInput.shift();
        }

        // Check if current input matches the Konami sequence
        if (this.checkSequence()) {
            if (!this.activated) {
                this.activated = true;
                this.triggerActivation();
            }
        }
    }

    checkSequence() {
        if (this.userInput.length !== this.sequence.length) {
            return false;
        }

        for (let i = 0; i < this.sequence.length; i++) {
            if (this.userInput[i] !== this.sequence[i]) {
                return false;
            }
        }

        return true;
    }

    triggerActivation() {
        console.log('🎮 KONAMI CODE ACTIVATED!');

        // Visual feedback
        document.body.style.animation = 'konamiFlash 0.5s';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);

        if (this.onActivate) {
            this.onActivate();
        }
    }

    reset() {
        this.userInput = [];
        this.activated = false;
    }
}

export const konamiCode = new KonamiCode();

// Add CSS animation for activation flash
const style = document.createElement('style');
style.textContent = `
    @keyframes konamiFlash {
        0%, 100% { filter: brightness(1); }
        25% { filter: brightness(2) hue-rotate(90deg); }
        50% { filter: brightness(3) hue-rotate(180deg); }
        75% { filter: brightness(2) hue-rotate(270deg); }
    }
`;
document.head.appendChild(style);
