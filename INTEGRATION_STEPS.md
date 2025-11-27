# Final Integration Steps

To complete the Juice & Charisma layer implementation, add these hookups to `GameContext.jsx`:

## 1. Add Imports (Top of File)

```javascript
import { juiceIntegration } from '../systems/JuiceIntegration';
import { eventBus, EVENT_TYPES } from '../systems/EventBus';
```

## 2. Initialize in GameProvider

Add inside the `GameProvider` function, after the `useReducer` line:

```javascript
useEffect(() => {
    juiceIntegration.init();
}, []);
```

## 3. Update TICK Case

In the `gameReducer`, inside the `case 'TICK':` block, add after line 45:

```javascript
newState = juiceIntegration.update(newState, dt);
juiceIntegration.recordInput(); // Track for idle detection
```

## 4. Add EventBus Emits

### In ADD_NODE case (around line 381):
```javascript
audioManager.playBuild();
eventBus.emit(EVENT_TYPES.NODE_BUILT, { x, y, nodeId: newNode.id });
juiceIntegration.emitGameEvent(EVENT_TYPES.NODE_BUILT, { x, y });
```

### In ADD_EDGE case (around line 435):
```javascript
audioManager.playConnect();
eventBus.emit(EVENT_TYPES.NODE_CONNECTED, { sourceId, targetId });
```

### In UNLOCK_UPGRADE case (around line 539):
```javascript
audioManager.playUpgrade();
eventBus.emit(EVENT_TYPES.UPGRADE_UNLOCK, { upgradeId });
```

### In DESTROY_OBSTACLE case (around line 777):
```javascript
eventBus.emit(EVENT_TYPES.OBSTACLE_DESTROYED, { x: rock.x, y: rock.y });
```

## 5. Add Diplomat y Reducer Cases

Add before `default:` case (around line 824):

```javascript
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

case 'HANDLE_COMET_CLICK': {
    const { x, y } = action.payload;
    // Create crater node with bonus resources
    const craterNode = {
        id: `crater-${crypto.randomUUID()}`,
        type: 'CRATER',
        x,
        y,
        pressure: 0,
    };
    return {
        ...state,
        nodes: [...state.nodes, craterNode],
        resources: {
            ...state.resources,
            stardust: state.resources.stardust + 500,
            flux: state.resources.flux + 100
        },
        particles: [...state.particles, ...createExplosion(x, y, '#FFD700', 50)]
    };
}
```

## 6. Test & Verify

Run the dev server (`npm run dev`) and test:

1. **Audio**: Click anywhere to init AudioContext, then build nodes/connections to hear sounds
2. **Gary**: Wait for initial greeting, then perform actions to see dialogue
3. **Diplomacy**: Destroy an obstacle and wait for mailbox notification
4. **Combo**: Build multiple nodes quickly (<2s apart) to see streak
5. **Fever Mode**: Max out flux and wait 60s to see golden theme
6. **Comets**: Wait 3 minutes for a comet to appear and click it

This completes the full integration!
