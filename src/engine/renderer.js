/**
 * NEON MYCELIUM - Renderer
 * 
 * Handles the "Cosmic Garbage" visual style.
 */

const drawWobblyLine = (ctx, x1, y1, x2, y2, color, width, time) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';

    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const segments = Math.max(2, Math.floor(dist / 10)); // Segment every 10px

    ctx.moveTo(x1, y1);

    for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;

        // Add wobble
        const wobbleX = Math.sin(t * 10 + time * 0.005) * 2;
        const wobbleY = Math.cos(t * 15 + time * 0.003) * 2;

        ctx.lineTo(x + wobbleX, y + wobbleY);
    }

    ctx.stroke();
};

import { GAME_CONFIG } from './config';

const drawPortalNode = (ctx, x, y, size, mouseX, mouseY, time, pressure, isBlob) => {
    const { COLORS } = GAME_CONFIG.VISUALS;

    // Breathing pulse effect - nodes inhale/exhale
    const breathPhase = Math.sin(time * 0.001) * 0.5 + 0.5; // 0 to 1
    const breathScale = 1.0 + (breathPhase * 0.15); // 1.0 to 1.15
    const pulsingSize = size * breathScale;

    // 1. Glowing Aura (Pulsating)
    const pulse = Math.sin(time * 0.005) * 0.5 + 0.5; // 0 to 1
    let auraMultiplier = isBlob ? 3.0 : 1.2;

    const auraSize = Math.max(0, pulsingSize * (auraMultiplier + pulse * 0.2 + (pressure / 100) * 0.5));
    const innerRadius = Math.max(0, pulsingSize * 0.5);

    if (auraSize <= innerRadius) return; // Skip if invalid

    // Gradient from center outwards
    const gradient = ctx.createRadialGradient(x, y, innerRadius, x, y, auraSize);

    // Color shift during pulse - more intense when breathing in
    const colorIntensity = 0.6 + (breathPhase * 0.4); // 0.6 to 1.0
    gradient.addColorStop(0, `rgba(148, 0, 211, ${0.8 * colorIntensity})`);     // Deep purple core
    gradient.addColorStop(0.5, `rgba(75, 0, 130, ${0.4 * colorIntensity})`);   // Indigo middle
    gradient.addColorStop(1, 'rgba(148, 0, 211, 0)');                          // Fade to transparent

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, auraSize, 0, Math.PI * 2);
    ctx.fill();

    // 2. Main Node Body (pulsing)
    ctx.fillStyle = COLORS.NODE;
    ctx.beginPath();
    ctx.arc(x, y, pulsingSize, 0, Math.PI * 2);
    ctx.fill();

    // 3. Inner Core Glow (breathes opposite to outer pulse)
    const corePhase = 1.0 - breathPhase; // Inverse breathing
    const coreGlow = ctx.createRadialGradient(x, y, 0, x, y, pulsingSize * 0.7);
    coreGlow.addColorStop(0, `rgba(255, 255, 255, ${0.3 * corePhase})`);
    coreGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(x, y, pulsingSize * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 4. Pressure Ripples (if under pressure)
    if (pressure > 50) {
        const rippleCount = Math.floor(pressure / 25);
        for (let i = 0; i < rippleCount; i++) {
            const ripplePhase = (time * 0.003 + i * 0.5) % 1;
            const rippleRadius = pulsingSize + ripplePhase * pulsingSize * 2;
            const rippleAlpha = (1 - ripplePhase) * 0.3;

            ctx.strokeStyle = `rgba(148, 0, 211, ${rippleAlpha})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, rippleRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // 5. Orbital Rings (Rotating) - Original section, adapted to pulsingSize
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(time * 0.002);
    ctx.beginPath();
    ctx.strokeStyle = COLORS.NODE_RING_1;
    ctx.lineWidth = 1;
    ctx.ellipse(0, 0, pulsingSize * 1.5, pulsingSize * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(time * 0.003);
    ctx.beginPath();
    ctx.strokeStyle = COLORS.NODE_RING_2;
    ctx.ellipse(0, 0, pulsingSize * 1.8, pulsingSize * 0.6, Math.PI / 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 6. Liquid Core (Morphing Blob with Directional Bias) - Original section, adapted to pulsingSize
    const points = 16;
    const baseRadius = pulsingSize * 0.8;

    // Calculate angle to mouse for directional stretching
    const dx = mouseX - x;
    const dy = mouseY - y;
    const angleToMouse = Math.atan2(dy, dx);
    const distToMouse = Math.sqrt(dx * dx + dy * dy);
    const stretchFactor = Math.min(distToMouse / 200, 1.0) * 15; // Max stretch 15px

    // Dynamic Color Calculation
    const angleDeg = (angleToMouse * 180 / Math.PI + 360) % 360; // 0-360
    const distNorm = Math.min(distToMouse / 300, 1.0); // 0-1

    // Base hue is Cyan (180), shift by angle (+- 60 deg)
    const hue = 180 + Math.sin(angleToMouse) * 60;
    // Saturation increases with distance (50% -> 100%)
    const saturation = 50 + distNorm * 50;
    // Lightness pulses with pressure
    const lightness = 50 + (pressure / 100) * 20;

    const dynamicColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

    ctx.beginPath();
    // Let's make the core dark but tinted
    ctx.fillStyle = `hsl(${hue}, ${saturation}%, 10%)`; // Very dark version of the color

    // Draw blob shape
    for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;

        // Multi-frequency noise simulation
        const noise = Math.sin(angle * 3 + time * 0.01) * 0.1 +
            Math.cos(angle * 5 - time * 0.02) * 0.1 +
            Math.sin(angle * 2 + time * 0.03) * 0.1;

        // Directional Bias: Bulge towards mouse
        let angleDiff = angle - angleToMouse;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        const directionalBulge = Math.max(0, Math.cos(angleDiff)) * stretchFactor;

        const r = baseRadius * (1 + noise) + directionalBulge;
        const px = x + Math.cos(angle) * r;
        const py = y + Math.sin(angle) * r;

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    // Upgrade: The Great Blob (Visual Merge / Thicker)
    // We can't access state here easily without passing it.
    // But we can assume if 'pressure' is high or some other param.
    // Let's just make it wobble MORE.

    // Actually, let's just use the existing blob logic but make it bigger?
    // The current logic IS the blob logic.

    ctx.closePath();
    ctx.fill();

    // Inner swirling vortex (Liquid)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-time * 0.01);

    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = dynamicColor; // Use the dynamic color for the swirl
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;

    // Draw swirling spirals inside
    for (let i = 0; i < 3; i++) {
        const spiralOffset = (i / 3) * Math.PI * 2;
        ctx.beginPath();
        for (let j = 0; j < 20; j++) {
            const t = j / 20;
            const angle = t * Math.PI * 4 + spiralOffset + time * 0.02;
            const r = (size * 0.6) * t;
            const px = Math.cos(angle) * r;
            const py = Math.sin(angle) * r;
            if (j === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
    }
    ctx.restore();
};

const drawElectricLine = (ctx, x1, y1, x2, y2, color, width, time, flow) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = 'round';
    ctx.shadowBlur = 5; // Reduced glow
    ctx.shadowColor = color;

    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const segments = Math.max(2, Math.floor(dist / 15));

    ctx.moveTo(x1, y1);

    for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const x = x1 + (x2 - x1) * t;
        const y = y1 + (y2 - y1) * t;

        // Electric Jitter
        const jitter = (Math.random() - 0.5) * 5;

        // Flow Particles
        const particleT = (time * 0.001 * (1 + flow * 5)) % 1; // Moving particle
        const particleSize = 3;

        // Draw main line with jitter
        ctx.lineTo(x + jitter, y + jitter);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Flow Particles
    if (flow > 0.1) {
        const particleCount = Math.floor(dist / 50);
        for (let p = 0; p < particleCount; p++) {
            const offset = p / particleCount;
            const t = (time * 0.0005 * (1 + flow * 2) + offset) % 1;
            const px = x1 + (x2 - x1) * t;
            const py = y1 + (y2 - y1) * t;

            ctx.beginPath();
            ctx.fillStyle = '#FFFFFF';
            ctx.arc(px, py, 2 + flow * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
};

const drawParticles = (ctx, particles, worldOffset, centerX, centerY, state, zoom) => {
    // === 13. PARTICLES ===
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.translate(-worldOffset.x, -worldOffset.y);

    // Cheat: Turbo Dismount - 10x gravity
    particles.forEach(p => {
        // Ensure state is defined before accessing properties
        if (!p || !state) return;

        // Apply gravity effect for Turbo Dismount
        let adjustedVY = p.vy + 0.05; // Default gravity
        if (state.activeCheats && state.activeCheats.turbo_dismount) {
            adjustedVY = p.vy + (0.05 * 10); // 10x gravity for turbo dismount
        }

        ctx.fillStyle = p.color || '#FFFFFF';
        ctx.globalAlpha = p.life || 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y + (adjustedVY - p.vy) * 5, p.size || 2, 0, Math.PI * 2);
        ctx.fill();
    });

    ctx.globalAlpha = 1;
    ctx.restore();
};

export const renderGame = (ctx, state, mousePos, width, height, selectedNodeId, screenShake = 0, uiState) => {
    const { nodes, edges, tick, worldOffset, resources, zoom, particles = [] } = state;
    const { COLORS } = GAME_CONFIG.VISUALS;
    const centerX = width / 2;
    const centerY = height / 2;

    // Apply screen shake
    if (screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
    }

    // === CHEAT EFFECTS ===

    // Disco Floor: BPM color cycle
    if (state.activeCheats?.disco_floor) {
        const hue = (tick * 2) % 360; // 2 degrees per tick
        ctx.save();
        ctx.globalCompositeOperation = 'overlay';
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.15)`;
        ctx.fillRect(0, 0, width, height);
    }

    // Melting Factor based on Flux (High flow = melt)
    const meltFactor = Math.min(resources.flux / 500, 1.0);

    // Apply World Transform
    ctx.save();
    // Apply Zoom centered on screen
    ctx.translate(centerX, centerY);
    ctx.scale(zoom, zoom);
    ctx.translate(-centerX, -centerY);

    // === MODULE F: Render Fake Nodes ===
    if (state.fakeNodes && state.fakeNodes.length > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.translate(-worldOffset.x, -worldOffset.y);

        state.fakeNodes.forEach(fakeNode => {
            if (fakeNode.revealed) {
                // Show brick wall
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(fakeNode.x - 30, fakeNode.y - 30, 60, 60);
                ctx.strokeStyle = '#654321';
                ctx.lineWidth = 2;
                // Draw brick pattern
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.moveTo(fakeNode.x - 30, fakeNode.y - 30 + i * 20);
                    ctx.lineTo(fakeNode.x + 30, fakeNode.y - 30 + i * 20);
                    ctx.stroke();
                }
            } else {
                // Draw massive gold prism
                const pulse = Math.sin(tick * 0.05) * 0.2 + 1.0;
                ctx.save();
                ctx.shadowColor = '#FFD700';
                ctx.shadowBlur = 30 * pulse;
                ctx.fillStyle = '#FFD700';
                ctx.globalAlpha = 0.9;

                ctx.beginPath();
                ctx.arc(fakeNode.x, fakeNode.y, 25 * pulse, 0, Math.PI * 2);
                ctx.fill();

                // Inner glow
                ctx.fillStyle = '#FFF';
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(fakeNode.x, fakeNode.y, 15 * pulse, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        });

        ctx.restore();
    }

    // === MODULE F: Render Emotional Baggage ===
    if (state.emotionalBaggage && state.emotionalBaggage.length > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.translate(-worldOffset.x, -worldOffset.y);

        state.emotionalBaggage.forEach(baggage => {
            ctx.fillStyle = baggage.color;
            ctx.globalAlpha = 0.8;

            // Draw suitcase shape
            ctx.fillRect(baggage.x - 4, baggage.y - 3, 8, 6);

            // Handle
            ctx.strokeStyle = baggage.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(baggage.x, baggage.y - 5, 3, Math.PI, 0);
            ctx.stroke();

            // Sad face if not repressed
            if (!baggage.isRepressed) {
                ctx.fillStyle = '#000';
                ctx.fillRect(baggage.x - 2, baggage.y - 1, 1, 1); // Left eye
                ctx.fillRect(baggage.x + 1, baggage.y - 1, 1, 1); // Right eye
                ctx.beginPath(); // Sad mouth
                ctx.arc(baggage.x, baggage.y + 1, 2, 0, Math.PI);
                ctx.stroke();
            }
        });

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    // === MODULE F: Render Generic NPCs ===
    if (state.genericNPCs && state.genericNPCs.length > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.translate(-worldOffset.x, -worldOffset.y);

        state.genericNPCs.forEach(npc => {
            ctx.save();
            ctx.translate(npc.x, npc.y);

            if (npc.isRagdoll) {
                ctx.rotate(npc.rotation);
            }

            // Draw untextured humanoid (simple stick figure)
            ctx.strokeStyle = npc.color;
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';

            // Head
            ctx.beginPath();
            ctx.arc(0, -15, 5, 0, Math.PI * 2);
            ctx.stroke();

            // Body
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(0, 5);
            ctx.stroke();

            if (npc.isTposing) {
                // T-pose arms
                ctx.beginPath();
                ctx.moveTo(-12, -5);
                ctx.lineTo(12, -5);
                ctx.stroke();
            } else {
                // Normal arms
                ctx.beginPath();
                ctx.moveTo(-8, 0);
                ctx.lineTo(0, -5);
                ctx.lineTo(8, 0);
                ctx.stroke();
            }

            // Legs
            ctx.beginPath();
            ctx.moveTo(-5, 15);
            ctx.lineTo(0, 5);
            ctx.lineTo(5, 15);
            ctx.stroke();

            // Draw dialogue bubble if present
            if (npc.currentDialogue && !npc.isRagdoll) {
                ctx.save();
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';

                // Draw text with wrapping
                ctx.fillStyle = '#FFFFFF';
                const words = npc.currentDialogue.split(' ');
                let line = '';
                let lines = [];
                const maxWidth = 150; // Max bubble width

                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    const testWidth = metrics.width;
                    if (metrics.width > maxWidth && n > 0) {
                        lines.push(line);
                        line = words[n] + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);

                // Recalculate bubble size based on lines
                const npcSize = 20;
                const lineHeight = 14;
                const bubbleHeight = lines.length * lineHeight + 10;
                const bubbleWidth = Math.min(ctx.measureText(npc.currentDialogue).width + 16, maxWidth + 16);
                const bubbleX = -bubbleWidth / 2;
                const bubbleY = -npcSize - 15 - bubbleHeight;

                // Draw speech bubble background
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 2;

                ctx.beginPath();
                ctx.roundRect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 4);
                ctx.fill();
                ctx.stroke();

                // Draw lines
                ctx.fillStyle = '#FFFFFF';
                lines.forEach((l, i) => {
                    ctx.fillText(l, 0, bubbleY + 15 + (i * lineHeight));
                });

                ctx.restore();
            }

            ctx.restore();
        });

        ctx.restore();
    }

    // === MODULE F: Render Schrödinger's Catboxes ===
    if (state.schrodingerBoxes && state.schrodingerBoxes.length > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.translate(-worldOffset.x, -worldOffset.y);

        state.schrodingerBoxes.forEach(box => {
            if (!box.observed) {
                // Vibrating box
                const vibration = Math.sin(tick * 0.1) * 2;

                ctx.save();
                ctx.translate(box.x + vibration, box.y);

                // Draw cardboard box
                ctx.fillStyle = '#C19A6B';
                ctx.fillRect(-15, -15, 30, 30);
                ctx.strokeStyle = '#8B7355';
                ctx.lineWidth = 2;
                ctx.strokeRect(-15, -15, 30, 30);

                // Draw tape lines
                ctx.strokeStyle = '#F5DEB3';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-15, 0);
                ctx.lineTo(15, 0);
                ctx.stroke();

                // Question marks
                ctx.fillStyle = '#000';
                ctx.font = 'bold 20px monospace';
                ctx.fillText('?', -6, 8);

                ctx.restore();
            }
        });

        ctx.restore();
    }

    // === MODULE F: Render Wet Floor Zones ===
    if (state.wetFloorZones && state.wetFloorZones.length > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.translate(-worldOffset.x, -worldOffset.y);

        state.wetFloorZones.forEach(zone => {
            // Draw yellow caution zone
            ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#FFFF00';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw caution sign
            ctx.save();
            ctx.translate(zone.x, zone.y - zone.radius - 20);
            ctx.fillStyle = '#FFFF00';
            ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('⚠ WET FLOOR', 0, 0);
            ctx.restore();
        });

        ctx.restore();
    }

    // === MODULE F: Render Spaghetti Code Tangles ===
    if (state.spaghettiTangles && state.spaghettiTangles.length > 0) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.translate(-worldOffset.x, -worldOffset.y);

        state.spaghettiTangles.forEach(tangle => {
            // Draw glitchy wireframe
            const glitchOffset = Math.sin(tick * 0.1) * 5;

            ctx.strokeStyle = `hsl(${(tick * 2) % 360}, 100%, 50%)`;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.7 + Math.sin(tick * 0.05) * 0.3;

            // Draw chaotic neon lines
            for (let i = 0; i < 8; i++) {
                const angle1 = (i / 8) * Math.PI * 2 + tick * 0.01;
                const angle2 = ((i + 1) / 8) * Math.PI * 2 + tick * 0.01;
                const r = tangle.radius + glitchOffset;

                ctx.beginPath();
                ctx.moveTo(
                    tangle.x + Math.cos(angle1) * r,
                    tangle.y + Math.sin(angle1) * r
                );
                ctx.lineTo(
                    tangle.x + Math.cos(angle2) * r,
                    tangle.y + Math.sin(angle2) * r
                );
                ctx.stroke();
            }

            // Draw center
            ctx.fillStyle = `hsl(${(tick * 3) % 360}, 100%, 50%)`;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(tangle.x, tangle.y, 10, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;
        });

        ctx.restore();
    }

    // Draw Edges (Hyphae)
    edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        if (!source || !target) return;

        // Apply melt offset
        const meltY = Math.sin(tick * 0.01 + source.x * 0.1) * 10 * meltFactor;

        const x1 = centerX + source.x - worldOffset.x;
        const y1 = centerY + source.y - worldOffset.y + meltY;
        const x2 = centerX + target.x - worldOffset.x;
        const y2 = centerY + target.y - worldOffset.y + meltY;

        // Pulse width based on flow
        const flowWidth = 0.5 + Math.abs(edge.flow || 0) * 3;
        const color = edge.flow > 0 ? COLORS.CONNECTION_FLOW : COLORS.CONNECTION_STAGNANT;

        // Always use Electric Line for better visuals
        drawElectricLine(ctx, x1, y1, x2, y2, color, flowWidth, tick, Math.abs(edge.flow || 0));
    });

    // Draw Nodes (Portals)
    nodes.forEach((node, index) => {
        // Apply melt offset
        const meltY = Math.sin(tick * 0.01 + node.x * 0.1) * 10 * meltFactor;

        const x = centerX + node.x - worldOffset.x;
        const y = centerY + node.y - worldOffset.y + meltY;

        const isBlob = node.type === 'BLOB' || (state.unlockedUpgrades?.includes('blob_mode') && node.level >= 3);

        // Cheat: Big Head Mode - 3x node size
        const sizeMultiplier = state.activeCheats?.big_head_mode ? 3 : 1;
        const nodeRadius = GAME_CONFIG.VISUALS.NODE_RADIUS * sizeMultiplier;

        drawPortalNode(ctx, x, y, nodeRadius, (mousePos.x - centerX) / zoom + centerX, (mousePos.y - centerY) / zoom + centerY, tick, node.pressure || 0, isBlob);

        // Selection Highlight
        if (node.id === selectedNodeId) {
            ctx.beginPath();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.arc(x, y, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Draw connection line to mouse (Inverse transform for mouse pos)
            const mouseWorldX = (mousePos.x - centerX) / zoom + centerX;
            const mouseWorldY = (mousePos.y - centerY) / zoom + centerY;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(mouseWorldX, mouseWorldY);
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 2;
            ctx.setLineDash([]);
            ctx.stroke();
        }

        // Gluten-Free Sticker (Source Node Only)
        if (state.glutenFreeMode && index === 0) {
            ctx.save();
            ctx.translate(x + 15, y - 15);
            ctx.rotate(Math.PI / 6);

            // Sticker Background
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fillStyle = '#00FF00';
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Text
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('GF', 0, 0);

            ctx.restore();
        }
    });

    // Draw Obstacles (Rocks)
    if (state.obstacles) {
        state.obstacles.forEach(rock => {
            const x = centerX + rock.x - worldOffset.x;
            const y = centerY + rock.y - worldOffset.y;

            ctx.beginPath();
            ctx.fillStyle = '#444';
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;

            // Draw rough polygon
            const sides = 7;
            for (let i = 0; i < sides; i++) {
                const angle = (i / sides) * Math.PI * 2;
                const r = rock.radius * (0.8 + Math.sin(i * 132.1) * 0.2);
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    }

    // Draw Enemies
    if (state.enemies) {
        state.enemies.forEach(enemy => {
            const x = centerX + enemy.x - worldOffset.x;
            const y = centerY + enemy.y - worldOffset.y;

            ctx.beginPath();
            ctx.fillStyle = '#FF0000';
            ctx.strokeStyle = '#FF4444';
            ctx.lineWidth = 2;

            // Draw spiky shape
            const spikes = 5;
            for (let i = 0; i < spikes * 2; i++) {
                const angle = (i / (spikes * 2)) * Math.PI * 2 + tick * 0.05;
                const r = enemy.radius * (i % 2 === 0 ? 1.5 : 0.5);
                const px = x + Math.cos(angle) * r;
                const py = y + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        });
    }

    // Draw Desks
    if (state.desks) {
        state.desks.forEach(desk => {
            const x = centerX + desk.x - worldOffset.x;
            const y = centerY + desk.y - worldOffset.y;

            ctx.fillStyle = desk.compliant ? '#32CD32' : '#4B0082'; // Green if compliant, Indigo if not
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;

            // Draw Desk (Rectangle)
            ctx.fillRect(x - desk.width / 2, y - desk.height / 2, desk.width, desk.height);
            ctx.strokeRect(x - desk.width / 2, y - desk.height / 2, desk.width, desk.height);

            // Label
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(desk.compliant ? 'OK' : desk.department.split('_').map(w => w[0].toUpperCase()).join(''), x, y + 5);
        });
    }

    // Draw Repair Bots
    if (state.repairBots) {
        state.repairBots.forEach(bot => {
            const x = centerX + bot.x - worldOffset.x;
            const y = centerY + bot.y - worldOffset.y;

            // Draw bot body (orange circle)
            ctx.beginPath();
            ctx.fillStyle = bot.color || '#FFA500';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.arc(x, y, bot.size || 15, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw bot eyes
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(x - 5, y - 3, 2, 0, Math.PI * 2);
            ctx.arc(x + 5, y - 3, 2, 0, Math.PI * 2);
            ctx.fill();

            // Draw alert indicator if in ALERT or REPAIR state
            if (bot.state !== 'IDLE') {
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(x, y, bot.size + 5, 0, Math.PI * 2);
                ctx.stroke();
            }
        });
    }

    // Draw Comets
    if (state.comets) {
        state.comets.forEach(comet => {
            const x = centerX + comet.x - worldOffset.x;
            const y = centerY + comet.y - worldOffset.y;

            // Draw comet body
            ctx.beginPath();
            ctx.fillStyle = comet.color || '#FFD700';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.arc(x, y, comet.size || 30, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Draw glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = comet.color || '#FFD700';
            ctx.stroke();
            ctx.shadowBlur = 0;

            // Draw tail particles
            if (comet.tail && Array.isArray(comet.tail)) {
                comet.tail.forEach(particle => {
                    const px = centerX + particle.x - worldOffset.x;
                    const py = centerY + particle.y - worldOffset.y;

                    ctx.globalAlpha = particle.life;
                    ctx.fillStyle = comet.color || '#FFD700';
                    ctx.beginPath();
                    ctx.arc(px, py, 3, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1.0;
            }
        });
    }

    // Draw Time-Traveler's Regrets (backwards-moving temporal particles)
    if (state.timeTravelerRegrets && state.timeTravelerRegrets.length > 0) {
        state.timeTravelerRegrets.forEach(regret => {
            const x = centerX + regret.x - worldOffset.x;
            const y = centerY + regret.y - worldOffset.y;

            ctx.save();

            // Draw trail
            if (regret.trail && regret.trail.length > 1) {
                ctx.strokeStyle = 'rgba(255, 0, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                regret.trail.forEach((point, i) => {
                    const trailX = centerX + point.x - worldOffset.x;
                    const trailY = centerY + point.y - worldOffset.y;
                    if (i === 0) {
                        ctx.moveTo(trailX, trailY);
                    } else {
                        ctx.lineTo(trailX, trailY);
                    }
                });
                ctx.stroke();
            }

            // Draw main particle (magenta glow)
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#FF00FF';
            ctx.fillStyle = '#FF00FF';
            ctx.globalAlpha = regret.life || 1;
            ctx.beginPath();
            ctx.arc(x, y, regret.size || 4, 0, Math.PI * 2);
            ctx.fill();

            // Inner glow
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = (regret.life || 1) * 0.6;
            ctx.beginPath();
            ctx.arc(x, y, (regret.size || 4) * 0.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });
    }

    // Apply cheat-specific visual effects
    if (state.activeCheats?.rainbow_mode) {
        state.civilizations.forEach(civ => {
            const x = centerX + civ.x - worldOffset.x;
            const y = centerY + civ.y - worldOffset.y;

            // Determine color based on relationship
            let civColor = `hsl(${tick * 5 + civ.x}, 100%, 50%)`; // Rainbow effect
            if (civ.isVassal) {
                civColor = `hsl(${tick * 5 + civ.x + 120}, 100%, 50%)`; // Greenish rainbow for vassals
            } else if (civ.relationship < -30) {
                civColor = `hsl(${tick * 5 + civ.x + 240}, 100%, 50%)`; // Reddish rainbow for hostile
            } else if (civ.relationship > 30) {
                civColor = `hsl(${tick * 5 + civ.x + 60}, 100%, 50%)`; // Cyanish rainbow for friendly
            }

            // Draw settlement (small cluster of shapes)
            ctx.fillStyle = civColor;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;

            // Main building (triangle)
            ctx.beginPath();
            ctx.moveTo(x, y - 15);
            ctx.lineTo(x - 8, y + 5);
            ctx.lineTo(x + 8, y + 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Side buildings (smaller squares)
            ctx.fillRect(x - 15, y + 2, 5, 5);
            ctx.strokeRect(x - 15, y + 2, 5, 5);
            ctx.fillRect(x + 10, y + 2, 5, 5);
            ctx.strokeRect(x + 10, y + 2, 5, 5);

            // Vassal indicator (crown icon)
            if (civ.isVassal) {
                ctx.fillStyle = '#FFD700';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('♔', x, y - 20);
            }
        });
    } else if (state.civilizations) { // Original drawing logic if rainbow_mode is not active
        state.civilizations.forEach(civ => {
            const x = centerX + civ.x - worldOffset.x;
            const y = centerY + civ.y - worldOffset.y;

            // Determine color based on relationship
            let civColor = '#CCCCCC'; // Neutral
            if (civ.isVassal) {
                civColor = '#00FF00'; // Green for vassals
            } else if (civ.relationship < -30) {
                civColor = '#FF0000'; // Red for hostile
            } else if (civ.relationship > 30) {
                civColor = '#00FFFF'; // Cyan for friendly
            }

            // Draw settlement (small cluster of shapes)
            ctx.fillStyle = civColor;
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;

            // Main building (triangle)
            ctx.beginPath();
            ctx.moveTo(x, y - 15);
            ctx.lineTo(x - 8, y + 5);
            ctx.lineTo(x + 8, y + 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Side buildings (smaller squares)
            ctx.fillRect(x - 15, y + 2, 5, 5);
            ctx.strokeRect(x - 15, y + 2, 5, 5);
            ctx.fillRect(x + 10, y + 2, 5, 5);
            ctx.strokeRect(x + 10, y + 2, 5, 5);

            // Vassal indicator (crown icon)
            if (civ.isVassal) {
                ctx.fillStyle = '#FFD700';
                ctx.font = '12px monospace';
                ctx.textAlign = 'center';
                ctx.fillText('♔', x, y - 20);
            }
        });
    }

    // Draw Particles
    drawParticles(ctx, particles, worldOffset, centerX, centerY);

    // --- FOG OF WAR ---
    // Check if Fog is cleared globally (Active Skill: Third Eye Squeegee)
    const isFogCleared = state.activeEffects && state.activeEffects.third_eye_squeegee;

    if (!isFogCleared) {
        // Initialize offscreen canvas if needed
        if (!window.fogCanvas) {
            window.fogCanvas = document.createElement('canvas');
        }
        if (window.fogCanvas.width !== width || window.fogCanvas.height !== height) {
            window.fogCanvas.width = width;
            window.fogCanvas.height = height;
        }

        const fCtx = window.fogCanvas.getContext('2d');
        fCtx.clearRect(0, 0, width, height);

        // 1. Fill offscreen with darkness
        fCtx.fillStyle = 'rgba(0, 0, 0, 0.95)'; // Very dark fog
        fCtx.fillRect(0, 0, width, height);

        // 2. Cut out holes around nodes
        fCtx.globalCompositeOperation = 'destination-out';

        const fogRadius = state.unlockedUpgrades.includes('bio_luminescence') ? GAME_CONFIG.VISUALS.FOG_RADIUS_UPGRADED : GAME_CONFIG.VISUALS.FOG_RADIUS;

        nodes.forEach(node => {
            // Apply melt offset
            const meltY = Math.sin(tick * 0.01 + node.x * 0.1) * 10 * meltFactor;

            // Calculate Screen Coordinates
            // Since we are drawing to an overlay that matches the screen 1:1, we need the screen coordinates of the nodes.
            // ScreenX = (NodeX - WorldOffsetX) * Zoom + CenterX
            const screenX = (node.x - worldOffset.x) * zoom + centerX;
            const screenY = (node.y - worldOffset.y + meltY) * zoom + centerY;

            // Draw gradient for soft edges
            const r = fogRadius * zoom;
            const gradient = fCtx.createRadialGradient(screenX, screenY, r * 0.5, screenX, screenY, r);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)'); // Opaque (cuts fully)
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent (leaves fog)

            fCtx.beginPath();
            fCtx.fillStyle = gradient;
            fCtx.arc(screenX, screenY, r, 0, Math.PI * 2);
            fCtx.fill();
        });

        fCtx.globalCompositeOperation = 'source-over'; // Reset

        // 3. Draw Fog Overlay to Main Canvas
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to screen space
        ctx.drawImage(window.fogCanvas, 0, 0);
        ctx.restore();
    }

    // Draw Prisms (Floating Trash) - MOVED AFTER FOG TO GLOW THROUGH
    if (state.prisms && Array.isArray(state.prisms)) {
        state.prisms.forEach(prism => {
            const x = centerX + prism.x - worldOffset.x;
            const y = centerY + prism.y - worldOffset.y;

            ctx.beginPath();
            ctx.fillStyle = '#32CD32'; // Stardust Green
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;

            // Draw a jagged crystal shape
            ctx.moveTo(x, y - 10);
            ctx.lineTo(x + 8, y - 5);
            ctx.lineTo(x + 6, y + 8);
            ctx.lineTo(x - 6, y + 8);
            ctx.lineTo(x - 8, y - 5);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();

            // Glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#32CD32';
            ctx.stroke();
            ctx.shadowBlur = 0;
        });
    }

    // Upgrade: Simulation Hypothesis (Matrix Code Overlay)
    if (state.unlockedUpgrades.includes('simulation_hypothesis')) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0); // Screen space
        ctx.fillStyle = '#00FF00';
        ctx.font = '12px monospace';
        ctx.globalAlpha = 0.3;
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * width;
            const y = (tick * 2 + Math.random() * height) % height;
            ctx.fillText(String.fromCharCode(0x30A0 + Math.random() * 96), x, y);
        }
        ctx.restore();
    }

    ctx.restore();

    // Upgrade: Jerry Rigged Sensors (Show Values)
    if (state.unlockedUpgrades.includes('jerry_rigged_sensors')) {
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        nodes.forEach(node => {
            const x = centerX + node.x - worldOffset.x;
            const y = centerY + node.y - worldOffset.y;
            // Apply melt (simplified)
            ctx.fillText(Math.floor(node.pressure || 0), x, y - 25);
        });
        ctx.restore();
    }

    // Upgrade: Kaleidoscope Eyes (Split Screen / Invert)
    if (state.unlockedUpgrades.includes('kaleidoscope_eyes')) {
        ctx.save();
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = '#FFFFFF';
        // Invert top-left and bottom-right quadrants
        ctx.fillRect(0, 0, centerX, centerY);
        ctx.fillRect(centerX, centerY, width / 2, height / 2);
        ctx.restore();

        // Draw crosshair
        ctx.beginPath();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
    }

    // Upgrade: Color Shift (Hue Rotate)
    if (state.unlockedUpgrades.includes('color_shift')) {
        // We can use CSS filter on the canvas element itself!
        // But here in renderer we can't access DOM style easily.
        // We can use globalCompositeOperation 'hue'?
        // Or just fill a rect with a color and use 'hue' blend mode.
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'hue';
        ctx.fillStyle = `hsl(${tick % 360}, 100%, 50%)`;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();
    }
};
