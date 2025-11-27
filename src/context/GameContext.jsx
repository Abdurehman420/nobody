import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { INITIAL_STATE } from '../engine/gameState';
import { useGameLoop } from '../hooks/useGameLoop';

import { calculateFluidSimulation } from '../engine/fluid';
import { processEconomy } from '../engine/economy';
import { updateFloatingOrigin } from '../engine/procedural';
import { audioManager } from '../engine/audio';

import { triggerSporulation, triggerDimensionalShift } from '../engine/prestige';
import { getAllUpgrades } from '../engine/upgrades';
import { GAME_CONFIG } from '../engine/config';

// Juice & Charisma Layer
import { juiceIntegration } from '../systems/JuiceIntegration';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
import { keyboardNav } from '../systems/KeyboardNavigation';
import { konamiCode } from '../systems/KonamiCode';

// MODULE F: Trolling Systems
import { fakeNodeSpawner } from '../systems/FakeNodeSpawner';
import { spawnEmotionalBaggage } from '../entities/EmotionalBaggage';
import { spawnGenericNPC } from '../entities/GenericNPC';
import { spawnWetFloorZone } from '../entities/WetFloorZone';
import { spawnSpaghettiCodeTangle } from '../entities/SpaghettiCodeTangle';
import { spawnTimeTravelerRegret } from '../entities/TimeTravelerRegret';

const GameContext = createContext();

const createExplosion = (x, y, color, count = 10) => {
    const particles = [];
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        particles.push({
            id: `p-${crypto.randomUUID()}`,
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0, // 1.0 to 0.0
            decay: 0.02 + Math.random() * 0.03,
            color,
            size: Math.random() * 3 + 1,
        });
    }
    return particles;
};

const gameReducer = (state, action) => {
    switch (action.type) {
        case 'TICK': {
            const dt = action.payload || (1 / 60); // Delta time in seconds (0.0167 at 60fps)

            let newState = calculateFluidSimulation(state, dt);
            newState = processEconomy(newState);
            newState = updateFloatingOrigin(newState);

            // Update Juice & Charisma systems
            // Convert dt from seconds to milliseconds for idle tracking
            const dtMs = dt * 1000; // e.g., 0.0167s * 1000 = 16.7ms
            newState = juiceIntegration.update(newState, dtMs);

            // Easter Egg: Fourth Wall Break at 1M Flux
            if (!state.fourthWallBroken && newState.resources.flux >= 1000000) {
                newState.fourthWallBroken = true;

                // Trigger special Gary dialogue
                setTimeout(() => {
                    eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                        message: "...wait. You actually got to ONE MILLION flux? I... I didn't think anyone would get this far. This is just a game, you know. Made by some human. Are YOU real? Am I? *nervous brain pulsing*"
                    });
                }, 500);

                // Visual celebration
                newState.particles = [
                    ...newState.particles,
                    ...createExplosion(0, 0, '#FFD700', 100) // Gold explosion
                ];
                newState.screenShake = 15;
            }

            // Update tick counter
            newState.tick = state.tick + 1;
            // Note: We don't call recordInput() here - let mouse/keyboard events trigger it

            // === MODULE F: Trolling Systems ===

            // Update Fake Node Spawner
            const potentialFakeNode = fakeNodeSpawner.update(newState, dt);
            if (potentialFakeNode) {
                newState.fakeNodes = [...newState.fakeNodes, potentialFakeNode];
            }

            // Update Emotional Baggage particles
            newState.emotionalBaggage = (newState.emotionalBaggage || []).map(baggage => {
                // ROOT CAUSE FIX: Pass masterVolume to update method
                const vol = state.masterVolume !== undefined ? state.masterVolume : 0.5;
                baggage.update(dt, newState.baggageRepressed, vol);
                return baggage;
            }).filter(Boolean);

            // Update Time-Traveler's Regrets
            if (newState.timeTravelerRegrets && newState.timeTravelerRegrets.length > 0) {
                const updatedRegrets = [];
                newState.timeTravelerRegrets.forEach(regret => {
                    const result = regret.update(newState.nodes, dt);

                    if (result === 'regret') {
                        // Reached source - subtract resources!
                        const lossAmount = 50 + Math.floor(Math.random() * 100); // 50-150 stardust loss
                        newState.resources.stardust = Math.max(0, newState.resources.stardust - lossAmount);

                        // Create explosion particles
                        newState.particles.push(...createExplosion(regret.x, regret.y, '#FF00FF', 20));

                        // Causality Error notification
                        eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                            message: `⚠️ CAUSALITY ERROR: Lost ${lossAmount} Stardust due to temporal paradox. This is your fault somehow.`
                        });
                    } else if (result !== 'remove') {
                        updatedRegrets.push(regret);
                    }
                });
                newState.timeTravelerRegrets = updatedRegrets;
            }

            // Update Generic NPCs
            if (newState.genericNPCs && newState.genericNPCs.length > 0) {
                const updatedNPCs = [];
                newState.genericNPCs.forEach(npc => {
                    // We need to re-instantiate or ensure methods exist if they were lost in serialization
                    // But since we are in the reducer and state is mutable (mostly), we might be fine if we kept instances.
                    // However, if state was serialized, we lost methods.
                    // For now, assume instances are preserved in memory.

                    if (npc.update) {
                        const result = npc.update(dt);
                        if (result !== 'remove') {
                            updatedNPCs.push(npc);
                        }
                    } else {
                        // Fallback if method lost (shouldn't happen in this architecture but safe to check)
                        updatedNPCs.push(npc);
                    }
                });
                newState.genericNPCs = updatedNPCs;
            }

            // Random spawn Generic NPCs (2% chance per minute, max 3)
            if (Math.random() < 0.0003 && newState.genericNPCs.length < 3) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 400;
                const newNPC = spawnGenericNPC(
                    Math.cos(angle) * dist,
                    Math.sin(angle) * dist
                );
                newState.genericNPCs = [...newState.genericNPCs, newNPC];
            }

            // Random spawn of Emotional Baggage (5% chance per minute)
            if (Math.random() < 0.0008 && newState.emotionalBaggage.length < 10) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 200;
                const newBaggage = spawnEmotionalBaggage(
                    Math.cos(angle) * dist,
                    Math.sin(angle) * dist
                );
                newState.emotionalBaggage = [...newState.emotionalBaggage, newBaggage];
            }

            if (Math.random() < 0.0003 && newState.genericNPCs.length < 3) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 400;
                const newNPC = spawnGenericNPC(
                    Math.cos(angle) * dist,
                    Math.sin(angle) * dist
                );
                newState.genericNPCs = [...newState.genericNPCs, newNPC];
            }

            // Random spawn Schrödinger's Catbox (1% chance per minute, max 2)
            if (Math.random() < 0.0001 && (newState.schrodingerBoxes || []).length < 2) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 300;
                newState.schrodingerBoxes = [
                    ...(newState.schrodingerBoxes || []),
                    {
                        id: `catbox-${Date.now()}`,
                        x: Math.cos(angle) * dist,
                        y: Math.sin(angle) * dist,
                        observed: false
                    }
                ];
            }

            // Check infinite resources timer
            if (newState.infiniteResourcesUntil && Date.now() < newState.infiniteResourcesUntil) {
                // Grant massive resources
                newState.resources = {
                    ...newState.resources,
                    stardust: newState.resources.stardust + 100,
                    flux: newState.resources.flux + 50,
                    lucidity: newState.resources.lucidity + 25
                };
            }

            // Check Stock Photo Invasion timer
            if (newState.stockPhotoInvasionActive && newState.stockPhotoInvasionEndTime && Date.now() > newState.stockPhotoInvasionEndTime) {
                newState.stockPhotoInvasionActive = false;
                newState.stockPhotoInvasionEndTime = null;
                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "The salad is gone. You can stop screaming now."
                });
            }

            // Random spawn Wet Floor Zones (0.1% per min, max 2) - RARE
            if (Math.random() < 0.00001 && (newState.wetFloorZones || []).length < 2) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 250;
                newState.wetFloorZones = [
                    ...(newState.wetFloorZones || []),
                    spawnWetFloorZone(
                        Math.cos(angle) * dist,
                        Math.sin(angle) * dist
                    )
                ];
            }

            // Random spawn Spaghetti Code Tangles (0.05% per min, max 1) - VERY RARE
            if (Math.random() < 0.00005 && (newState.spaghettiTangles || []).length < 1) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 300;
                newState.spaghettiTangles = [
                    ...(newState.spaghettiTangles || []),
                    spawnSpaghettiCodeTangle(
                        Math.cos(angle) * dist,
                        Math.sin(angle) * dist
                    )
                ];
            }

            // Random spawn Watermark Artifact (0.05% per min, max 1) - Stock Photo Invasion Trigger
            if (Math.random() < 0.00005 && (newState.prisms || []).filter(p => p.type === 'WATERMARK').length < 1) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 400 + Math.random() * 200;
                newState.prisms = [
                    ...(newState.prisms || []),
                    {
                        id: `watermark-${Date.now()}`,
                        x: Math.cos(angle) * dist,
                        y: Math.sin(angle) * dist,
                        type: 'WATERMARK',
                        value: 0
                    }
                ];
            }

            // Random trigger Recursive Review Loop (0.01% per tick ~ once every 10 mins)
            if (!state.recursiveReviewActive && Math.random() < 0.00001) {
                newState.recursiveReviewActive = true;
            }

            // Random spawn Time-Traveler's Regret (0.02% per min, max 3) - RARE
            if (Math.random() < 0.00002 && (newState.timeTravelerRegrets || []).length < 3 && newState.nodes.length > 0) {
                const randomNode = newState.nodes[Math.floor(Math.random() * newState.nodes.length)];
                newState.timeTravelerRegrets = [
                    ...(newState.timeTravelerRegrets || []),
                    spawnTimeTravelerRegret(randomNode.x, randomNode.y, 'SOURCE') // Always targets source
                ];

                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "Time paradox detected. Fill out Form 4D-12 in triplicate. Causality not guaranteed."
                });
            }

            // Process particles through spaghetti tangles
            if (newState.spaghettiTangles && newState.spaghettiTangles.length > 0) {
                newState.particles = (newState.particles || []).map(particle => {
                    for (const tangle of newState.spaghettiTangles) {
                        particle = tangle.processParticle(particle);
                        if (!particle) return null;
                    }
                    return particle;
                }).filter(Boolean);
            }

            // --- Entity Logic ---
            // 1. Spawn Entities (Procedural - Simplified)
            if (!newState.obstacles) newState.obstacles = [];
            if (!newState.enemies) newState.enemies = [];
            if (!newState.desks) newState.desks = [];

            // Spawn Rocks (Target: 10)
            if (newState.obstacles.length < 10 && Math.random() < 0.01) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 300 + Math.random() * 500; // Outside immediate center
                newState.obstacles.push({
                    id: `rock-${crypto.randomUUID()}`,
                    type: 'OBSTACLE',
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    radius: 30 + Math.random() * 40
                });
            }

            // Spawn Enemies (Target: 5)
            if (newState.enemies.length < 5 && Math.random() < 0.005) {
                const angle = Math.random() * Math.PI * 2;
                const dist = 500 + Math.random() * 500;
                newState.enemies.push({
                    id: `enemy-${crypto.randomUUID()}`,
                    type: 'ENEMY',
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    radius: 20,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                });
            }

            // Desk spawning is now handled later with proper limit (max 20)

            // 2. Enemy Movement
            newState.enemies = newState.enemies.map(e => ({
                ...e,
                x: e.x + e.vx,
                y: e.y + e.vy,
            }));

            // 3. Collision Logic (Prevent building on rocks unless upgraded)
            // This is handled in ADD_NODE usually, but we need to check existing nodes?
            // No, just check during build.

            // Upgrade: Parasitic Embedding (Build inside enemies)
            // Upgrade: Calcified Tips (Build inside rocks)

            // Upgrade: Auto-Seeker (Logic already added)
            // Upgrade: Third Eye Squeegee (Clear Fog) - Not implemented yet (Fog missing)

            // --- End Entity Logic ---

            // === Update Particles ===
            let updatedParticles = (newState.particles || []).map(p => {
                // Free Will Logic
                const freeWill = state.freeWillValue !== undefined ? state.freeWillValue : 0.5;

                // Determinism (0.0): Straight lines, no noise
                // Chaos (1.0): High noise, random velocity changes

                if (freeWill > 0.5) {
                    // Chaos Mode: Add random jitter
                    const chaosFactor = (freeWill - 0.5) * 2; // 0 to 1
                    p.vx += (Math.random() - 0.5) * chaosFactor * 50 * dt;
                    p.vy += (Math.random() - 0.5) * chaosFactor * 50 * dt;
                } else if (freeWill < 0.5) {
                    // Determinism Mode: Dampen velocity changes (straight lines)
                    // Or maybe just don't add noise?
                    // Let's make them move towards a grid or something?
                    // For now, just reducing noise is enough, but existing noise is low.
                    // Let's make them snap to 45 degree angles if very deterministic
                    if (freeWill < 0.1) {
                        // Snap velocity to 45 degrees
                        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                        const angle = Math.atan2(p.vy, p.vx);
                        const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
                        p.vx = Math.cos(snappedAngle) * speed;
                        p.vy = Math.sin(snappedAngle) * speed;
                    }
                }

                // Update position
                p.x += p.vx * dt;
                p.y += p.vy * dt;

                // ROOT CAUSE FIX #1: Clamp velocity to prevent infinite acceleration from wet floors
                const MAX_VELOCITY = 50;
                p.vx = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, p.vx));
                p.vy = Math.max(-MAX_VELOCITY, Math.min(MAX_VELOCITY, p.vy));

                // ROOT CAUSE FIX #2: Remove particles that go too far (performance)
                const MAX_DISTANCE = 5000;
                if (Math.abs(p.x) > MAX_DISTANCE || Math.abs(p.y) > MAX_DISTANCE) {
                    return null; // Remove faraway particles
                }

                // ROOT CAUSE FIX #3: Clamp size to prevent huge particles
                if (p.size) {
                    p.size = Math.max(1, Math.min(20, p.size));
                }

                // Friction
                p.vx *= 0.98;
                p.vy *= 0.98;

                // Fade
                p.life -= 0.01;
                if (p.life <= 0) return null;

                return p;
            }).filter(Boolean);

            // Update audio drone based on flux
            audioManager.updateDrone(Math.min(newState.resources.flux / 100, 1.0), newState.nodes.length);

            // Upgrade: Zero-Point Energy (Idle nodes generate flux)
            if (state.unlockedUpgrades.includes('zero_point_energy')) {
                // 1% per sec = 0.016 per tick (at 60fps)
                // Let's say 0.1 per node per tick for simplicity
                newState.resources.flux += newState.nodes.length * 0.01;
            }

            // Upgrade: Flux Capacitor (Passive Flux Gen doubled - "Time Travel")
            if (state.unlockedUpgrades.includes('flux_capacitor')) {
                // We already lowered threshold in fluid.js, let's also boost passive gen
                // Actually doc says "Offline Progress". Let's just give a flat bonus for now.
                newState.resources.flux += 0.1;
            }

            // Upgrade: Fourth Wall Break (+20% Lucidity Gain)
            // We need to boost lucidity gain.
            // Currently lucidity comes from TRADE_FLUX (manual) and Singularity Core (passive).
            // Let's boost the passive gain in economy.js, or add a multiplier here?
            // Let's add a small passive gain here to represent the "Bonus".
            if (state.unlockedUpgrades.includes('fourth_wall_break')) {
                newState.resources.lucidity += 0.005;
            }

            // --- Bureaucrat Spawn Logic (Limit to 5 desks max) ---
            if (!newState.desks) newState.desks = [];
            if (newState.desks.length < 5 && Math.random() < 0.0002) { // Very low spawn rate (0.02%), max 5
                const angle = Math.random() * Math.PI * 2;
                const dist = 300 + Math.random() * 500;
                newState.desks.push({
                    id: `desk-${Date.now()}-${Math.random()}`,
                    department: ['solid_waste', 'high_voltage', 'existential_compliance'][Math.floor(Math.random() * 3)],
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    width: 60,
                    height: 40,
                    compliant: false
                });
            }

            // Upgrade: Auto-Seeker Tendrils (Grow to nearest prism)
            if (state.unlockedUpgrades.includes('auto_seeker') && state.tick % 600 === 0) { // Every ~10s
                // Find nearest prism to any node
                let nearestPrism = null;
                let minDist = Infinity;
                let sourceNode = null;

                newState.prisms.forEach(p => {
                    newState.nodes.forEach(n => {
                        const dx = p.x - n.x;
                        const dy = p.y - n.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < minDist && dist < 300) { // Max range
                            minDist = dist;
                            nearestPrism = p;
                            sourceNode = n;
                        }
                    });
                });

                if (nearestPrism && sourceNode) {
                    // Build node towards prism
                    // Calculate position
                    const angle = Math.atan2(nearestPrism.y - sourceNode.y, nearestPrism.x - sourceNode.x);
                    const dist = Math.min(minDist, 100); // Max step
                    const newX = sourceNode.x + Math.cos(angle) * dist;
                    const newY = sourceNode.y + Math.sin(angle) * dist;

                    const newNode = {
                        id: `node-${crypto.randomUUID()}`,
                        type: 'RELAY',
                        x: newX,
                        y: newY,
                        pressure: 0,
                    };
                    newState.nodes.push(newNode);
                    newState.edges.push({
                        id: `edge-${crypto.randomUUID()}`,
                        source: sourceNode.id,
                        target: newNode.id,
                        flow: 0,
                        resistance: 1.0
                    });
                    newState.particles.push(...createExplosion(newX, newY, '#FF00FF', 10));
                }
            }

            // Upgrade: DMT Elf Pact (Auto-Build random nodes)
            if (state.unlockedUpgrades.includes('dmt_elf_pact') && state.tick % 300 === 0) { // Every 5s
                // Pick random node
                const sourceNode = newState.nodes[Math.floor(Math.random() * newState.nodes.length)];
                if (sourceNode) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 50 + Math.random() * 50;
                    const newX = sourceNode.x + Math.cos(angle) * dist;
                    const newY = sourceNode.y + Math.sin(angle) * dist;

                    const newNode = { id: `node-elf-${crypto.randomUUID()}`, type: 'RELAY', x: newX, y: newY, pressure: 0 };
                    newState.nodes.push(newNode);
                    newState.edges.push({ id: `edge-elf-${crypto.randomUUID()}`, source: sourceNode.id, target: newNode.id, flow: 0, resistance: 1.0 });
                    newState.particles.push(...createExplosion(newX, newY, '#00FFFF', 15));
                }
            }

            // Upgrade: Save Scumming (Auto-Save State)
            // We can't really "Save" to disk easily here, but we can keep a "Checkpoint" in memory.
            // Let's say every minute we update 'checkpointState'.
            if (state.unlockedUpgrades.includes('save_scumming') && state.tick % 3600 === 0) {
                // Save state to a special field?
                // This might be heavy memory-wise. Let's just save resources.
                newState.checkpoint = {
                    resources: { ...newState.resources },
                    nodesCount: newState.nodes.length
                };
            }

            // Upgrade: Infinite Improbability (Random Events)
            if (state.unlockedUpgrades.includes('infinite_improbability') && Math.random() < 0.005) {
                const eventType = Math.floor(Math.random() * 3);
                if (eventType === 0) {
                    const rx = (Math.random() - 0.5) * 1000;
                    const ry = (Math.random() - 0.5) * 1000;
                    updatedParticles.push(...createExplosion(rx, ry, '#FFFFFF', 20));
                } else if (eventType === 1) {
                    newState.resources.stardust += 10;
                    newState.resources.flux += 10;
                } else if (eventType === 2) {
                    // Bad Trip (Resource Loss)
                    if (!state.unlockedUpgrades.includes('reality_anchor')) {
                        newState.resources.stardust = Math.max(0, newState.resources.stardust * 0.9); // Lose 10%
                        newState.resources.flux = Math.max(0, newState.resources.flux * 0.9);
                        updatedParticles.push(...createExplosion(0, 0, '#FF0000', 50)); // Red explosion
                        // Visual distortion?
                        newState.screenShake = 10;
                    } else {
                        // Reality Anchor prevented it
                        updatedParticles.push(...createExplosion(0, 0, '#0000FF', 20)); // Blue shield effect
                    }
                }
            }

            // Upgrade: Auto-Clicker Bot (Random Clicks)
            if (state.unlockedUpgrades.includes('auto_clicker_bot') && Math.random() < 0.05) { // 5% per tick (~3 clicks/sec)
                // 50% chance to click prism, 50% to click space (Karma)
                if (newState.prisms.length > 0 && Math.random() < 0.5) {
                    const prism = newState.prisms[Math.floor(Math.random() * newState.prisms.length)];
                    // Collect it (simulate dispatch)
                    // We can't dispatch, so we must replicate logic or just call a helper.
                    // Replicating logic:
                    newState.prisms = newState.prisms.filter(p => p.id !== prism.id);
                    newState.resources.stardust += prism.value;
                    updatedParticles.push(...createExplosion(prism.x, prism.y, '#32CD32', 15));
                } else {
                    // Karma Gain
                    if (state.unlockedUpgrades.includes('karma_farming')) {
                        newState.resources.flux += 0.5;
                        updatedParticles.push(...createExplosion((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000, '#FFFF00', 5));
                    }
                }
            }

            // Upgrade: Lag Switch (Lag -> Flux)
            if (state.unlockedUpgrades.includes('lag_switch')) {
                if (dt > 30) { // If frame took longer than 30ms (approx < 33fps)
                    newState.resources.flux += (dt - 30) * 0.1; // Gain flux from lag

                    // Audio: Tape Stop Effect (Lag Generator)
                    // Only play occasionally to avoid chaos
                    if (Math.random() < 0.05) {
                        import('../systems/AudioSynthesizer').then(({ audioSynthesizer }) => {
                            audioSynthesizer.playTapeStop();
                        });
                    }
                }
            }

            // Check Expired Effects
            const newActiveEffects = { ...state.activeEffects };
            let resources = newState.resources;
            let backupResources = state.backupResources;

            Object.keys(newActiveEffects).forEach(effectId => {
                if (state.tick >= newActiveEffects[effectId]) {
                    delete newActiveEffects[effectId];

                    // Handle Expiry Logic
                    if (effectId === 'god_mode' && backupResources) {
                        // Revert resources to what they were BEFORE God Mode
                        // This effectively makes everything bought during God Mode free.
                        resources = { ...backupResources };
                        backupResources = null;

                        // Visual feedback
                        updatedParticles.push(...createExplosion(0, 0, '#FF0000', 50));
                    }
                }
            });

            return {
                ...newState,
                resources: resources,
                backupResources: backupResources,
                activeEffects: newActiveEffects,
                particles: updatedParticles,
                screenShake: Math.max(0, (state.screenShake || 0) * 0.9), // Decay shake
                tick: state.tick + 1
            };
        }
        case 'SPORULATE':
            return triggerSporulation(state);
        case 'SHIFT_DIMENSION':
            return triggerDimensionalShift(state);
        case 'SPAWN_PARTICLES': {
            const { x, y, color, count } = action.payload;
            return {
                ...state,
                particles: [...state.particles, ...createExplosion(x, y, color, count)]
            };
        }
        case 'ADD_NODE': {
            const { x, y, free } = action.payload;
            let cost = GAME_CONFIG.RESOURCES.COST_NODE;

            // Apply fever mode modifiers (free building during golden trip)
            if (state.juiceState?.feverModifiers?.buildCost !== undefined) {
                cost *= state.juiceState.feverModifiers.buildCost; // Will be 0 during fever
            }

            if (state.unlockedUpgrades.includes('rapid_expansion')) cost *= 0.8; // 20% off
            if (state.unlockedUpgrades.includes('aggressive_expansion')) cost *= 1.1; // +10% cost
            if (free) cost = 0;

            if (state.resources.stardust < cost) return state;

            // Upgrade: Mitosis Lottery (1% chance free)
            if (state.unlockedUpgrades.includes('mitosis_lottery') && Math.random() < 0.01) {
                cost = 0; // Refund (effectively)
            }

            // Upgrade: Wall Clinging (Bonus for building near Rocks)
            // If near a rock, refund 50% cost?
            if (state.unlockedUpgrades.includes('wall_clinging') && state.obstacles) {
                const nearRock = state.obstacles.some(o => {
                    const dx = o.x - x;
                    const dy = o.y - y;
                    return (dx * dx + dy * dy) < (o.radius + 50) * (o.radius + 50);
                });
                if (nearRock) {
                    cost *= 0.5;
                    // Visual feedback?
                }
            }

            const newNode = {
                id: `node-${crypto.randomUUID()}`,
                type: 'RELAY',
                x,
                y,
                pressure: 0,
            };

            // Check Collision with Enemies
            if (state.enemies) {
                const hitEnemy = state.enemies.find(e => {
                    const dx = e.x - x;
                    const dy = e.y - y;
                    return (dx * dx + dy * dy) < (e.radius + 20) * (e.radius + 20);
                });

                if (hitEnemy) {
                    // Upgrade: Parasitic Embedding (Build inside enemies)
                    if (state.unlockedUpgrades.includes('parasitic_embedding')) {
                        // Upgrade: Cosmic Composting (Kill enemy -> Stardust)
                        if (state.unlockedUpgrades.includes('cosmic_composting')) {
                            // We need to remove enemy. Since we are in reducer, we can't easily modify 'state.enemies' in place before return.
                            // We will filter it out in the return statement.
                            // Mark enemy for death? Or just filter now?
                            // We can't filter 'state.enemies' here because we are inside the logic.
                            // Let's add a 'deadEnemies' list to the scope or just handle it in the return.
                        }
                    } else if (!state.activeEffects.god_mode) {
                        // Fail to build
                        return {
                            ...state,
                            particles: [...state.particles, ...createExplosion(x, y, '#FF0000', 10)]
                        };
                    }
                }
            }

            // ... (rest of logic)

            // Calculate dead enemies
            let remainingEnemies = state.enemies || [];
            let compostStardust = 0;
            if (state.unlockedUpgrades.includes('cosmic_composting')) {
                const enemiesToKill = remainingEnemies.filter(e => {
                    const dx = e.x - x;
                    const dy = e.y - y;
                    return (dx * dx + dy * dy) < (e.radius + 20) * (e.radius + 20);
                });

                if (enemiesToKill.length > 0) {
                    remainingEnemies = remainingEnemies.filter(e => !enemiesToKill.includes(e));
                    compostStardust = enemiesToKill.length * 100; // 100 Stardust per enemy
                    audioManager.playSquish();
                }
            }

            // ...



            // Explosion on build
            const newParticles = createExplosion(x, y, '#00FFFF', 20);

            if (state.connectionSoundsEnabled) {
                audioManager.playBuild(); // New harmonic sound
            }
            setTimeout(() => {
                eventBus.emit(EVENT_TYPES.NODE_BUILT, { x, y, nodeId: newNode.id });
                juiceIntegration.emitGameEvent(EVENT_TYPES.NODE_BUILT, { x, y });
            }, 0);

            // Upgrade: Fractal Branching (Every 10th node spawns free mini-hyphae)
            let extraNodes = [];
            let extraEdges = [];
            if (state.unlockedUpgrades.includes('fractal_branching') && state.nodes.length % 10 === 0) {
                // Spawn 2 mini nodes
                for (let i = 0; i < 2; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 30;
                    const mx = x + Math.cos(angle) * dist;
                    const my = y + Math.sin(angle) * dist;
                    const mNode = { id: `node-mini-${crypto.randomUUID()}`, type: 'RELAY', x: mx, y: my, pressure: 0 };
                    extraNodes.push(mNode);
                    extraEdges.push({ id: `edge-mini-${crypto.randomUUID()}`, source: newNode.id, target: mNode.id, flow: 0, resistance: 1.0 });
                }
            }

            return {
                ...state,
                nodes: [...state.nodes, newNode, ...extraNodes],
                edges: [...state.edges, ...extraEdges],
                particles: [...state.particles, ...newParticles],
                enemies: remainingEnemies,
                resources: {
                    ...state.resources,
                    stardust: state.resources.stardust - cost + compostStardust,
                }
            };
        }
        case 'CREATE_CONNECTION': {
            const { sourceId, targetId } = action.payload;
            const source = state.nodes.find(n => n.id === sourceId);
            const target = state.nodes.find(n => n.id === targetId);

            if (!source || !target) return state;

            // Check if connection already exists
            const exists = state.edges.some(
                e => (e.source === sourceId && e.target === targetId) ||
                    (e.source === targetId && e.target === sourceId)
            );

            if (exists) return state;

            // Create new edge
            const newEdge = {
                id: `edge-${crypto.randomUUID()}`, // Use the same ID format as ADD_EDGE
                source: sourceId,
                target: targetId,
                flow: 0,
                resistance: 1.0
            };

            // JUICE: Particle burst at connection point
            const midX = (source.x + target.x) / 2;
            const midY = (source.y + target.y) / 2;
            const burstParticles = [];
            const particleCount = 15;

            for (let i = 0; i < particleCount; i++) {
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = 2 + Math.random() * 3;
                burstParticles.push({
                    id: `burst-${Date.now()}-${i}`,
                    x: midX,
                    y: midY,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 1.0,
                    color: '#00FFFF',
                    size: 2 + Math.random() * 2
                });
            }

            // JUICE: Screen shake on connection
            const screenShake = 8;

            // Emit event for Gary
            eventBus.emit(EVENT_TYPES.NODE_CONNECTED, { sourceId, targetId });
            if (state.connectionSoundsEnabled) {
                audioManager.playConnect(); // Play sound for connection
            }

            return {
                ...state,
                edges: [...state.edges, newEdge],
                particles: [...state.particles, ...burstParticles],
                screenShake,
                comboMultiplier: (state.comboMultiplier || 1) + 0.1 // Ensure comboMultiplier exists
            };
        }
        case 'ADD_EDGE': {
            const { sourceId, targetId } = action.payload;
            let cost = GAME_CONFIG.RESOURCES.COST_EDGE;
            if (state.unlockedUpgrades.includes('efficient_hyphae')) cost *= 0.5; // 50% off

            if (state.resources.stardust < cost) return state;

            // Check if edge already exists
            const exists = state.edges.some(e =>
                (e.source === sourceId && e.target === targetId) ||
                (e.source === targetId && e.target === sourceId)
            );
            if (exists) return state;

            // Find nodes for explosion position (midpoint)
            const source = state.nodes.find(n => n.id === sourceId);
            const target = state.nodes.find(n => n.id === targetId);
            let newParticles = [];
            if (source && target) {
                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;
                newParticles = createExplosion(midX, midY, '#00FF00', 15);
            }

            if (state.connectionSoundsEnabled) {
                audioManager.playConnect();
            }
            eventBus.emit(EVENT_TYPES.NODE_CONNECTED, { sourceId, targetId });

            return {
                ...state,
                edges: [...state.edges, {
                    id: `edge-${crypto.randomUUID()}`,
                    source: sourceId,
                    target: targetId,
                    flow: 0,
                    resistance: 1.0
                }],
                particles: [...state.particles, ...newParticles],
                resources: {
                    ...state.resources,
                    stardust: state.resources.stardust - cost,
                }
            };
        }
        case 'PAN_CAMERA': {
            const { dx, dy } = action.payload;
            return {
                ...state,
                worldOffset: {
                    x: state.worldOffset.x - dx / state.zoom, // Adjust pan speed by zoom
                    y: state.worldOffset.y - dy / state.zoom,
                }
            };
        }
        case 'ZOOM': {
            const delta = action.payload;
            const newZoom = Math.max(0.1, Math.min(5.0, state.zoom - delta * 0.001));
            return {
                ...state,
                zoom: newZoom,
            };
        }
        case 'TRADE_FLUX': {
            if (state.resources.flux < GAME_CONFIG.RESOURCES.COST_FLUX_TRADE) return state;
            return {
                ...state,
                resources: {
                    ...state.resources,
                    flux: state.resources.flux - GAME_CONFIG.RESOURCES.COST_FLUX_TRADE,
                    lucidity: state.resources.lucidity + 1,
                }
            };
        }
        case 'COLLECT_PRISM': {
            const prismId = action.payload;
            const prism = state.prisms.find(p => p.id === prismId);
            if (!prism) return state;

            // Explosion on collect
            const newParticles = createExplosion(prism.x, prism.y, '#32CD32', 15);

            let value = prism.value;
            // Upgrade: Digestive Enzymes (+50%)
            if (state.unlockedUpgrades.includes('digestive_enzymes')) value *= 1.5;
            // Upgrade: Scavenger Enzymes (Double stardust from trash - assuming prisms are trash)
            if (state.unlockedUpgrades.includes('scavenger_enzymes')) value *= 2.0;

            return {
                ...state,
                prisms: state.prisms.filter(p => p.id !== prismId),
                particles: [...state.particles, ...newParticles],
                resources: {
                    ...state.resources,
                    stardust: state.resources.stardust + value,
                }
            };
        }
        case 'UNLOCK_UPGRADE': {
            const upgradeId = action.payload;
            if (state.unlockedUpgrades.includes(upgradeId)) return state;

            const allUpgrades = getAllUpgrades();
            const upgrade = allUpgrades.find(u => u.id === upgradeId);
            if (!upgrade) return state;

            // Check Parent
            if (upgrade.parentId && !state.unlockedUpgrades.includes(upgrade.parentId)) return state;

            // Check Permit
            if (upgrade.permit) {
                // Check if we have the permit
                // Permits are stored in state.permits = { solid_waste: 0, ... }
                // We need at least 1? Or just > 0?
                if (!state.permits || !state.permits[upgrade.permit] || state.permits[upgrade.permit] < 1) {
                    // Missing permit
                    // We should probably show a message or just fail.
                    // For now, fail silently (UI should handle disabled state).
                    return state;
                }
            }

            // Check Cost
            const { cost } = upgrade;
            // Check costs (Bypass if God Mode)
            if (!state.activeEffects.god_mode) {
                if (state.resources.stardust < (upgrade.cost.stardust || 0)) return state;
                if (state.resources.flux < (upgrade.cost.flux || 0)) return state;
                if (state.resources.lucidity < (upgrade.cost.lucidity || 0)) return state;
            }

            audioManager.playUpgrade(); // Harmonic swell
            eventBus.emit(EVENT_TYPES.UPGRADE_UNLOCK, { upgradeId });

            // Deduct Resources
            const newResources = { ...state.resources };
            if (cost.stardust) newResources.stardust -= cost.stardust;
            if (cost.flux) newResources.flux -= cost.flux;
            if (cost.lucidity) newResources.lucidity -= cost.lucidity;

            return {
                ...state,
                resources: newResources,
                unlockedUpgrades: [...state.unlockedUpgrades, upgradeId],
            };
        }
        case 'BUILD_AND_CONNECT': {
            const { x, y, sourceId } = action.payload;
            // 1. Add Node logic
            let nodeCost = GAME_CONFIG.RESOURCES.COST_NODE;
            if (state.unlockedUpgrades.includes('rapid_expansion')) nodeCost *= 0.8;

            // Mitosis Lottery
            if (state.unlockedUpgrades.includes('mitosis_lottery') && Math.random() < 0.01) nodeCost = 0;

            if (state.resources.stardust < nodeCost && !state.activeEffects.god_mode) return state;

            const newNodeId = `node-${crypto.randomUUID()}`;

            // Check Collision with Rocks
            if (state.obstacles) {
                const hitRock = state.obstacles.find(o => {
                    const dx = o.x - x;
                    const dy = o.y - y;
                    return (dx * dx + dy * dy) < (o.radius + 20) * (o.radius + 20);
                });

                if (hitRock) {
                    // Upgrade: Calcified Tips (Allow building on rocks)
                    if (!state.unlockedUpgrades.includes('calcified_tips') && !state.activeEffects.god_mode) {
                        // Fail to build
                        // Visual feedback?
                        return {
                            ...state,
                            particles: [...state.particles, ...createExplosion(x, y, '#FF0000', 10)]
                        };
                    }
                }
            }

            const newNode = {
                id: newNodeId,
                type: 'RELAY',
                x,
                y,
                pressure: 0,
            };

            // 2. Add Edge logic
            let edgeCost = GAME_CONFIG.RESOURCES.COST_EDGE;
            if (state.unlockedUpgrades.includes('efficient_hyphae')) edgeCost *= 0.5;

            if (state.resources.stardust < (nodeCost + edgeCost) && !state.activeEffects.god_mode) return state;

            const newEdge = {
                id: `edge-${crypto.randomUUID()}`,
                source: sourceId,
                target: newNodeId,
                flow: 0,
                resistance: 1.0
            };

            if (state.connectionSoundsEnabled) {
                audioManager.playBuild();
                audioManager.playConnect();
            }

            return {
                ...state,
                nodes: [...state.nodes, newNode],
                edges: [...state.edges, newEdge],
                particles: [...state.particles, ...createExplosion(x, y, '#00FFFF', 20)],
                resources: {
                    ...state.resources,
                    stardust: state.resources.stardust - (nodeCost + edgeCost),
                }
            };
        }
        case 'ACTIVATE_SKILL': {
            const skillId = action.payload;
            // Check if unlocked
            if (!state.unlockedUpgrades.includes(skillId)) return state;

            // Check Cooldown
            if (state.cooldowns[skillId] && state.cooldowns[skillId] > state.tick) return state;

            let newCooldowns = { ...state.cooldowns };
            let newActiveEffects = { ...state.activeEffects };
            let newResources = { ...state.resources };
            let newBackupResources = state.backupResources;
            let newParticles = [...state.particles];
            let newPrisms = [...state.prisms];

            // Handle Skills
            switch (skillId) {
                case 'drop_the_bass':
                    // Shockwave clears fog (Visual + Logic)
                    newParticles.push(...createExplosion(0, 0, '#9400D3', 100));
                    newCooldowns[skillId] = state.tick + 600; // 10s cooldown
                    newState.screenShake = 20; // BIG SHAKE
                    break;

                case 'third_eye_squeegee':
                    // Clear Fog for 30s
                    newActiveEffects['third_eye_squeegee'] = state.tick + 1800;
                    newCooldowns[skillId] = state.tick + 3600; // 1 min cooldown
                    break;

                case 'glitch_the_matrix':
                    // Reroll all prisms
                    newPrisms = state.prisms.map(p => ({
                        ...p,
                        value: Math.floor(Math.random() * 50) + 10,
                    }));
                    newParticles.push(...createExplosion(0, 0, '#00FF00', 50));
                    newCooldowns[skillId] = state.tick + 1800; // 30s cooldown
                    break;

                case 'god_mode':
                    // Temporary Infinite Resources (10s)
                    // Save current resources
                    newBackupResources = { ...state.resources };
                    // Set to infinite (display)
                    newResources = { stardust: 999999, flux: 999999, lucidity: 999999 };
                    // Set expiry
                    newActiveEffects['god_mode'] = state.tick + 600; // 10s duration
                    // Set cooldown
                    newCooldowns[skillId] = state.tick + 216000; // 1 hour cooldown (60 * 60 * 60 ticks)
                    break;

                case 'mirror_dimension':
                    // Double output for 60s.
                    newActiveEffects['mirror_dimension'] = state.tick + 3600;
                    newCooldowns[skillId] = state.tick + 7200; // 2 min cooldown
                    break;

                case 'the_red_pill':
                    // Trigger Hard Reset immediately
                    // We can't dispatch from reducer, so we handle it by returning a special state or just resetting here.
                    // Actually, we can just return INITIAL_STATE directly here?
                    // But we need to keep zoom maybe?
                    // Let's just return INITIAL_STATE.
                    return { ...INITIAL_STATE, zoom: 1.0 };

                case 'ascended_glitch':
                    // Trigger Crash
                    return {
                        ...state,
                        crashed: true
                    };

                case 'save_scumming':
                    // RESTORE Checkpoint
                    if (state.checkpoint) {
                        newResources = { ...state.checkpoint.resources };
                        // We can't easily restore nodes without complex logic, so just resources.
                        newParticles.push(...createExplosion(0, 0, '#FFFFFF', 100));
                        newCooldowns[skillId] = state.tick + 3600;
                    }
                    break;

                default:
                    return state;
            }

            return {
                ...state,
                resources: newResources,
                backupResources: newBackupResources,
                activeEffects: newActiveEffects,
                cooldowns: newCooldowns,
                particles: newParticles,
                prisms: newPrisms
            };
        }
        case 'BRIBE_BUREAUCRAT': {
            const deskId = action.payload;
            const desk = state.desks.find(d => d.id === deskId);
            if (!desk || desk.compliant) return state;

            const costs = {
                solid_waste: { stardust: 500 },
                high_voltage: { flux: 200 },
                existential_compliance: { lucidity: 50 }
            };
            const cost = costs[desk.department];

            // Check Cost (Bypass God Mode)
            if (!state.activeEffects.god_mode) {
                if (state.resources.stardust < (cost.stardust || 0)) return state;
                if (state.resources.flux < (cost.flux || 0)) return state;
                if (state.resources.lucidity < (cost.lucidity || 0)) return state;
            }

            // Deduct
            const newResources = { ...state.resources };
            if (!state.activeEffects.god_mode) {
                if (cost.stardust) newResources.stardust -= cost.stardust;
                if (cost.flux) newResources.flux -= cost.flux;
                if (cost.lucidity) newResources.lucidity -= cost.lucidity;
            }

            // Update Desk and Permits
            const newDesks = state.desks.map(d => d.id === deskId ? { ...d, compliant: true } : d);
            const newPermits = { ...state.permits };
            newPermits[desk.department]++;

            audioManager.playUpgrade(); // Satisfying sound

            return {
                ...state,
                resources: newResources,
                desks: newDesks,
                permits: newPermits,
                particles: [...state.particles, ...createExplosion(desk.x, desk.y, '#DA70D6', 30)]
            };
        }
        case 'HARD_RESET':
            // Wipes everything back to true zero
            return {
                ...INITIAL_STATE,
                zoom: 1.0
            };
        case 'KARMA_GAIN':
            return {
                ...state,
                resources: {
                    ...state.resources,
                    flux: state.resources.flux + 0.5
                },
                particles: [...state.particles, ...createExplosion(0, 0, '#FFFF00', 5)] // Yellow sparks
            };
        case 'DESTROY_OBSTACLE':
            const rockId = action.payload;
            const rock = state.obstacles.find(o => o.id === rockId);
            if (!rock) return state;
            eventBus.emit(EVENT_TYPES.OBSTACLE_DESTROYED, { x: rock.x, y: rock.y });

            // Spawn micro-civilization with 30% chance
            let newCivilizations = state.civilizations || [];
            if (Math.random() < 0.3) {
                // Dynamically import to avoid circular dependency
                import('../entities/MicroCivilization.js').then(({ MicroCivilization }) => {
                    const civ = new MicroCivilization(rock.x, rock.y);
                    eventBus.emit(EVENT_TYPES.CIVILIZATION_CONTACT, {
                        civilization: civ,
                        trigger: 'OBSTACLE_DESTROYED'
                    });
                });
            }

            return {
                ...state,
                obstacles: state.obstacles.filter(o => o.id !== rockId),
                particles: [...state.particles, ...createExplosion(rock.x, rock.y, '#888888', 20)]
            };
        case 'POLYMORPH_ENEMY':
            const enemyId = action.payload;
            const enemy = state.enemies.find(e => e.id === enemyId);
            if (!enemy) return state;
            // Turn into Wisp (Prism?)
            const wisp = {
                id: `prism-wisp-${crypto.randomUUID()}`,
                x: enemy.x,
                y: enemy.y,
                value: 50,
                type: 'WISP'
            };
            return {
                ...state,
                enemies: state.enemies.filter(e => e.id !== enemyId),
                prisms: [...state.prisms, wisp],
                particles: [...state.particles, ...createExplosion(enemy.x, enemy.y, '#00FFFF', 20)]
            };
        case 'START_STOCK_PHOTO_INVASION':
            return {
                ...state,
                stockPhotoInvasionActive: true
            };
        case 'END_STOCK_PHOTO_INVASION':
            return {
                ...state,
                stockPhotoInvasionActive: false
            };
        case 'COLLECT_PRISM':
            const prismId = action.payload;
            const prism = state.prisms.find(p => p.id === prismId);
            if (!prism) return state;

            // Handle Watermark Artifact
            if (prism.type === 'WATERMARK') {
                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "Oh no. You found the watermark. Try eating more leaves."
                });
                // Trigger invasion (handled via side effect or state check in App)
                // We set state here, and use useEffect in App or GameContext to set timeout
                return {
                    ...state,
                    prisms: state.prisms.filter(p => p.id !== prismId),
                    stockPhotoInvasionActive: true,
                    stockPhotoInvasionEndTime: Date.now() + 60000, // 60s duration
                    particles: [...state.particles, ...createExplosion(prism.x, prism.y, '#FFFFFF', 50)]
                };
            }

            return {
                ...state,
                resources: {
                    ...state.resources,
                    stardust: state.resources.stardust + (prism.value || 10),
                    flux: state.resources.flux + (prism.value || 10)
                },
                prisms: state.prisms.filter(p => p.id !== prismId),
                particles: [...state.particles, ...createExplosion(prism.x, prism.y, '#00FF00', 10)]
            };
            return {
                ...state,
                resources: {
                    stardust: state.resources.stardust + 10000,
                    flux: state.resources.flux + 10000,
                    lucidity: state.resources.lucidity + 10000
                }
            };
        case 'CHEAT_UNLOCK_ALL':
            const allIds = getAllUpgrades().map(u => u.id);
            return {
                ...state,
                unlockedUpgrades: allIds
            };
        case 'FAKE_CRASH':
            return {
                ...state,
                crashed: true
            };
        case 'IGNORE_CIVILIZATION':
            return {
                ...state,
                civilizations: [
                    ...(state.civilizations || []),
                    action.civilization
                ]
            };
        case 'CREATE_VASSAL': {
            const updatedCivs = (state.civilizations || []).map(c =>
                c.id === action.civilization.id ? action.civilization : c
            );
            if (!updatedCivs.find(c => c.id === action.civilization.id)) {
                updatedCivs.push(action.civilization);
            }
            return {
                ...state,
                civilizations: updatedCivs,
                resources: {
                    ...state.resources,
                    lucidity: state.resources.lucidity - action.lucidityRequired
                }
            };
        }
        case 'DESTROY_CIVILIZATION':
            return {
                ...state,
                civilizations: (state.civilizations || []).filter(
                    c => c.id !== action.civilization.id
                ),
                resources: {
                    ...state.resources,
                    stardust: state.resources.stardust + action.stardust,
                    lucidity: state.resources.lucidity + action.lucidity
                }
            };
        case 'TOGGLE_KONAMI_MODE':
            return {
                ...state,
                konamiActivated: !state.konamiActivated,
                particles: [
                    ...state.particles,
                    ...createExplosion(0, 0, '#00FF00', 50)
                ],
                screenShake: 10
            };
        case 'TOGGLE_CHEAT':
            const cheatId = action.payload;
            const newActiveCheats = { ...state.activeCheats };
            newActiveCheats[cheatId] = !newActiveCheats[cheatId];

            return {
                ...state,
                activeCheats: newActiveCheats,
                particles: [
                    ...state.particles,
                    ...createExplosion(0, 0, newActiveCheats[cheatId] ? '#FFD700' : '#888', 30)
                ],
                screenShake: 5
            };

        // MODULE F: Suggestion Box - Incinerate Resources
        case 'INCINERATE_RESOURCES':
            return {
                ...state,
                resources: {
                    ...state.resources,
                    stardust: Math.max(0, state.resources.stardust - (action.payload.amount || 0))
                }
            };

        // MODULE F: Flooble Crank - Set Baggage Repression
        case 'SET_BAGGAGE_REPRESSION':
            return {
                ...state,
                baggageRepressed: action.payload
            };

        // MODULE F: TOS Monolith - Show/Hide
        case 'SHOW_TOS_MONOLITH':
            return {
                ...state,
                tosMonolithActive: true
            };

        case 'DESTROY_TOS_MONOLITH':
            return {
                ...state,
                tosMonolithActive: false
            };

        // MODULE F: Schrödinger's Catbox - Resolve
        case 'RESOLVE_CATBOX':
            if (action.payload.type === 'EXPLODE') {
                // Remove the box and create explosion particles
                return {
                    ...state,
                    schrodingerBoxes: state.schrodingerBoxes.filter(b => b.id !== action.payload.boxId),
                    particles: [
                        ...state.particles,
                        ...createExplosion(action.payload.position.x, action.payload.position.y, '#FF0000', 30)
                    ],
                    screenShake: 8
                };
            } else {
                // INFINITE - grant resources for 10 seconds
                return {
                    ...state,
                    schrodingerBoxes: state.schrodingerBoxes.filter(b => b.id !== action.payload.boxId),
                    infiniteResourcesUntil: Date.now() + action.payload.duration,
                    particles: [
                        ...state.particles,
                        ...createExplosion(action.payload.position.x, action.payload.position.y, '#FFD700', 50)
                    ]
                };
            }

        // MODULE F: Sunk Cost Pit - Throw Flux
        case 'THROW_INTO_PIT':
            return {
                ...state,
                resources: {
                    ...state.resources,
                    flux: Math.max(0, state.resources.flux - action.payload.amount)
                },
                sunkCostInvested: (state.sunkCostInvested || 0) + action.payload.amount
            };

        case 'TOGGLE_BANANA_ACCURACY':
            return {
                ...state,
                bananaScientificAccuracy: action.payload
            };

        case 'TOGGLE_CONNECTION_SOUNDS':
            return {
                ...state,
                connectionSoundsEnabled: action.payload
            };

        case 'TOGGLE_GLUTEN_FREE':
            return {
                ...state,
                glutenFreeMode: action.payload
            };

        case 'SET_FREE_WILL':
            return {
                ...state,
                freeWillValue: action.payload
            };

        case 'SET_MASTER_VOLUME':
            return {
                ...state,
                masterVolume: action.payload
            };

        case 'START_RECURSIVE_REVIEW':
            return {
                ...state,
                recursiveReviewActive: true
            };

        case 'END_RECURSIVE_REVIEW':
            return {
                ...state,
                recursiveReviewActive: false
            };

        case 'INCREMENT_CLICK_COUNT':
            const newCount = (state.clickCount || 0) + 1;
            // Trigger Credits Hallucination at 50 clicks (for testing, should be 10000)
            if (newCount === 50 && !state.creditsActive) {
                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "Wow. You really like clicking. Here, have some credits."
                });
                return {
                    ...state,
                    clickCount: newCount,
                    creditsActive: true
                };
            }
            return {
                ...state,
                clickCount: newCount
            };

        default:
            return state;
    }
};

export const GameProvider = ({ children }) => {
    const [state, dispatch] = useReducer(gameReducer, { ...INITIAL_STATE, zoom: 1.0 });

    const tick = useCallback((deltaTime) => {
        dispatch({ type: 'TICK', payload: deltaTime });
    }, []);

    // Zoom Handler
    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault();
            dispatch({ type: 'ZOOM', payload: e.deltaY });
        };
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, []);

    useGameLoop(tick);

    // Initialize Juice & Charisma systems
    useEffect(() => {
        juiceIntegration.init();
    }, []);

    // Initialize keyboard navigation
    // Keep state ref updated for callbacks
    const stateRef = React.useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Initialize keyboard navigation
    useEffect(() => {
        keyboardNav.init(dispatch, () => stateRef.current);
        return () => keyboardNav.cleanup();
    }, [dispatch]);

    // Initialize Konami Code easter egg
    useEffect(() => {
        konamiCode.init(() => {
            // Trigger ASCII mode
            dispatch({ type: 'TOGGLE_KONAMI_MODE' });

            // Gary reacts
            setTimeout(() => {
                eventBus.emit(EVENT_TYPES.BOT_GRUMBLE, {
                    message: "Did you just... enter a CHEAT CODE? In MY game? *impressed brain squirming* Alright, hacker. ASCII mode unlocked. You've earned it."
                });
            }, 500);
        });

        return () => konamiCode.cleanup();
    }, [dispatch]);

    // Initialize audio on first click
    useEffect(() => {
        const initAudio = () => {
            audioManager.init();
            audioManager.playSquish(); // Feedback
            window.removeEventListener('click', initAudio);
        };
        window.addEventListener('click', initAudio);
        return () => window.removeEventListener('click', initAudio);
    }, []);

    return (
        <GameContext.Provider value={{ state, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
