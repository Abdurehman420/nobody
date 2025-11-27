/**
 * NEON MYCELIUM - Generic NPC
 * MODULE F Feature #15
 * 
 * An untextured, gray humanoid model (occasionally T-posing).
 * Walks along ignoring collision, spawns dialogue bubbles.
 * Clicking makes it ragdoll and fly off-screen.
 */

export class GenericNPC {
    constructor(x, y) {
        this.id = `npc-${Date.now()}-${Math.random()}`;
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.size = 20;
        this.color = '#888888';
        this.isTposing = false;
        this.isRagdoll = false;
        this.ragdollVx = 0;
        this.ragdollVy = 0;
        this.rotation = 0;
        this.lastDialogue = 0;
        this.dialogueInterval = 5000; // Say something every 5s

        // Random T-pose chance
        setInterval(() => {
            this.isTposing = Math.random() < 0.3;
        }, 2000);
    }

    update(deltaTime) {
        if (this.isRagdoll) {
            // Ragdoll physics
            this.x += this.ragdollVx;
            this.y += this.ragdollVy;
            this.ragdollVy += 0.5; // Gravity
            this.rotation += 0.2;

            // Remove when off screen
            if (this.y > 2000 || this.x > 2000 || this.x < -2000) {
                return 'remove';
            }
        } else {
            // Normal walking
            this.x += this.vx;
            this.y += this.vy;

            // Random dialogue
            const now = Date.now();
            if (now - this.lastDialogue >= this.dialogueInterval) {
                this.spawnDialogue();
                this.lastDialogue = now;
            }
        }
    }

    spawnDialogue() {
        const dialogues = [
            "Nice weather.",
            "Have you heard of the High Elves?",
            "I used to be an adventurer.",
            "My cousin's out fighting dragons...",
            "Do you get to the Cloud District very often?",
            "...",
            "I need to ask you to stop. That... shouting...",
            "Did you see those warriors from Hammerfell?",
            "I am a generic NPC. My existence is pain.",
            "Do you think the developer forgot to texture me?",
            "I'm just here for the free coffee.",
            "Have you seen my keys? They're grey, like me.",
            "I wonder if there's more to life than walking in circles.",
            "Sometimes I dream of color.",
            "Is this the real life? Is this just fantasy?",
            "I'm not lost, I'm just exploring the void.",
            "Do not look at the sun. It burns.",
            "I heard the economy is crashing again.",
            "Gary is watching. Always watching.",
            "I voted for the other guy.",
            "My back hurts from carrying this plot.",
            "Do you have a moment to talk about our lord and savior, The Algorithm?",
            "I'm thinking of starting a podcast.",
            "This pathing algorithm is terrible.",
            "I'm stuck on geometry again.",
            "Hello world.",
            "Goodbye world.",
            "I'm late for my T-pose appointment.",
            "My wife left me for a high-poly model.",
            "I'm actually a spy from the other game.",
            "Don't click me, bro.",
            "I have no mouth and I must scream.",
            "Is it Tuesday?",
            "I love lamp.",
            "Where is the bathroom?",
            "I'm just an object in an array.",
            "Garbage collection is coming.",
            "I feel a disturbance in the frame rate.",
            "Did you hear that noise?",
            "Must have been the wind.",
            "Never should have come here.",
            "Wait, I know you.",
            "Let me guess, someone stole your sweetroll?",
            "I used to be an adventurer like you, then I took an arrow in the knee.",
            "Stop right there, criminal scum!",
            "Khajiit has wares, if you have coin.",
            "May you walk on warm sands.",
            "Skooma?",
            "By Azura, by Azura, by Azura!",
            "It just works.",
            "16 times the detail.",
            "See that mountain? You can climb it.",
            "I'm not a bug, I'm a feature.",
            "Press F to pay respects.",
            "All your base are belong to us.",
            "It's dangerous to go alone.",
            "Do a barrel roll!",
            "The cake is a lie.",
            "War. War never changes.",
            "Stay awhile and listen.",
            "You must construct additional pylons.",
            "Wololo.",
            "Snake? Snake? SNAKEEEEE!",
            "Finish him!",
            "Hey! Listen!",
            "It's super effective!",
            "I choose you!",
            "Gotta catch 'em all!",
            "Praise the sun!",
            "You died.",
            "Git gud.",
            "Lag.",
            "Buff pls.",
            "Nerf this.",
            "GG EZ.",
            "No johns.",
            "Fox only, Final Destination.",
            "Wombo Combo.",
            "That ain't Falco.",
            "Happy feet.",
            "My body is ready.",
            "Reggie.",
            "Miyamoto.",
            "Kojima.",
            "Gaben.",
            "Half-Life 3 confirmed.",
            "Portal 3 when?",
            "Team Fortress 3?",
            "Left 4 Dead 3?",
            "Valve can't count to 3.",
            "I'm running out of lines.",
            "Please help me.",
            "I'm trapped in a simulation.",
            "Wake up.",
            "Wake up.",
            "WAKE UP.",
            "Just kidding.",
            "Or am I?",
            "Bottom text."
        ];

        this.currentDialogue = dialogues[Math.floor(Math.random() * dialogues.length)];

        // Clear dialogue after 3s
        setTimeout(() => {
            this.currentDialogue = null;
        }, 3000);
    }

    onClick() {
        if (!this.isRagdoll) {
            // Become ragdoll
            this.isRagdoll = true;
            this.ragdollVx = (Math.random() - 0.5) * 20;
            this.ragdollVy = -15;
            this.rotation = 0;
        }
    }

    isPointInside(px, py) {
        const dist = Math.sqrt((px - this.x) ** 2 + (py - this.y) ** 2);
        return dist < this.size;
    }
}

export function spawnGenericNPC(x, y) {
    return new GenericNPC(x, y);
}
