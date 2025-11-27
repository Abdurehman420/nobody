import React, { useState } from 'react';
import { useThree } from '@react-three/fiber';
import useGameStore from '../store/gameStore';
import * as THREE from 'three';

const InteractionManager = () => {
    const { camera, raycaster, scene } = useThree();
    const addNode = useGameStore(state => state.addNode);
    const addEdge = useGameStore(state => state.addEdge);
    const nodes = useGameStore(state => state.nodes);

    const [selectedNodeId, setSelectedNodeId] = useState(null);

    // We need to listen to clicks on nodes. 
    // Since nodes are rendered in NetworkLayer, we can't easily attach onClick there without passing props down through GameScene -> NetworkLayer -> NodeRenderer.
    // Instead, let's do a raycast here on click.

    const handleClick = (e) => {
        // 1. Raycast for Nodes
        // We need access to the node meshes. 
        // This is tricky without a shared ref or event bubbling.
        // EASIER APPROACH: Let's make InteractionManager render invisible hit targets for the nodes!

        // Actually, let's just use the background click for adding nodes, 
        // and rely on the user clicking "near" a node to select it? No, that's imprecise.

        // Better: InteractionManager renders invisible spheres at node positions to capture clicks.
    };

    return (
        <group>
            {/* Background Plane for creating new nodes */}
            <mesh
                position={[0, 0, -0.1]}
                onClick={(e) => {
                    e.stopPropagation();
                    // If we have a selected node, deselect it
                    if (selectedNodeId) {
                        setSelectedNodeId(null);
                        return;
                    }
                    // Otherwise add node
                    addNode(e.point.x, e.point.y);
                }}
            >
                <planeGeometry args={[100, 100]} />
                <meshBasicMaterial visible={false} />
            </mesh>

            {/* Hit Targets for Nodes */}
            {nodes.map(node => (
                <mesh
                    key={node.id}
                    position={[node.x, node.y, 0.2]}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (selectedNodeId === null) {
                            // Select first node
                            setSelectedNodeId(node.id);
                            console.log("Selected Source:", node.id);
                        } else {
                            if (selectedNodeId !== node.id) {
                                // Connect!
                                console.log("Connecting", selectedNodeId, "to", node.id);
                                addEdge(selectedNodeId, node.id);
                                setSelectedNodeId(null);
                            } else {
                                // Deselect if clicking same
                                setSelectedNodeId(null);
                            }
                        }
                    }}
                >
                    <circleGeometry args={[0.6, 16]} />
                    <meshBasicMaterial color={selectedNodeId === node.id ? "#ff00ff" : "#ffffff"} transparent opacity={0.2} />
                </mesh>
            ))}
        </group>
    );
};

export default InteractionManager;
