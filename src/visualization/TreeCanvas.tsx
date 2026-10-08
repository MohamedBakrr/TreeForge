import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { BinaryTreeNode, NodeId } from '../trees/core/types';
import { calculateBinaryTreeLayout } from './layout/tree-layout';

interface TreeCanvasProps {
    nodes: Map<NodeId, BinaryTreeNode<number>>;
    rootId: NodeId | null;
    activeNodeId?: NodeId | null;
    selectedNodeId?: NodeId | null;
    visitedNodes?: Set<NodeId>;
    onNodeSelect?: (nodeId: NodeId) => void;
    width?: number;
    height?: number;
}

export function TreeCanvas({
    nodes,
    rootId,
    activeNodeId,
    selectedNodeId,
    visitedNodes,
    onNodeSelect,
    width = 800,
    height = 600,
}: TreeCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ pointerId: number; x: number; y: number; panX: number; panY: number } | null>(null);
    const nodeDragRef = useRef<{
        pointerId: number;
        nodeId: NodeId;
        x: number;
        y: number;
        offsetX: number;
        offsetY: number;
    } | null>(null);
    const touchPointersRef = useRef(new Map<number, { x: number; y: number }>());
    const pinchRef = useRef<{
        distance: number;
        zoom: number;
        anchorX: number;
        anchorY: number;
    } | null>(null);
    const [viewport, setViewport] = useState({ width, height });
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [nodeOffsets, setNodeOffsets] = useState<Map<NodeId, { x: number; y: number }>>(() => new Map());
    const [isDragging, setIsDragging] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateSize = () => {
            const bounds = container.getBoundingClientRect();
            if (bounds.width > 0 && bounds.height > 0) {
                setViewport({
                    width: Math.round(bounds.width),
                    height: Math.round(bounds.height),
                });
            }
        };

        const observer = new ResizeObserver(updateSize);
        observer.observe(container);
        updateSize();
        return () => observer.disconnect();
    }, []);

    const layout = useMemo(
        () => calculateBinaryTreeLayout(nodes, rootId, viewport.width, 50, 80, viewport.height),
        [nodes, rootId, viewport]
    );
    const positionedLayout = useMemo(() => {
        const positioned = new Map(layout);
        for (const [nodeId, offset] of nodeOffsets) {
            const node = positioned.get(nodeId);
            if (node) positioned.set(nodeId, { ...node, x: node.x + offset.x, y: node.y + offset.y });
        }
        return positioned;
    }, [layout, nodeOffsets]);

    useEffect(() => {
        setNodeOffsets((current) => {
            const next = new Map(current);
            let changed = false;
            for (const nodeId of next.keys()) {
                if (!nodes.has(nodeId)) {
                    next.delete(nodeId);
                    changed = true;
                }
            }
            return changed ? next : current;
        });
    }, [nodes]);

    const constrainNodeOffset = (nodeId: NodeId, offset: { x: number; y: number }) => {
        const node = layout.get(nodeId);
        if (!node) return offset;

        const radius = 22;
        const minX = radius + 4;
        const maxX = Math.max(minX, viewport.width - radius - 4);
        const minY = radius + 4;
        const maxY = Math.max(minY, viewport.height - radius - 4);
        const horizontalGap = Math.min(50, Math.max(24, viewport.width / 12));
        const verticalGap = Math.min(52, Math.max(32, viewport.height / 8));
        const parent = node.parentId ? positionedLayout.get(node.parentId) : undefined;

        let left = minX;
        let right = maxX;
        let top = minY;

        if (parent) {
            top = Math.max(top, parent.y + verticalGap);
            if (parent.leftId === nodeId) {
                right = Math.min(right, parent.x - horizontalGap);
            } else if (parent.rightId === nodeId) {
                left = Math.max(left, parent.x + horizontalGap);
            }
        }

        const x = node.x + offset.x;
        const y = node.y + offset.y;
        return {
            x: Math.max(left, Math.min(right, x)) - node.x,
            y: Math.max(top, Math.min(maxY, y)) - node.y,
        };
    };

    const viewBoxWidth = viewport.width / zoom;
    const viewBoxHeight = viewport.height / zoom;
    const viewBoxX = (viewport.width - viewBoxWidth) / 2 - pan.x / zoom;
    const viewBoxY = (viewport.height - viewBoxHeight) / 2 - pan.y / zoom;

    if (!rootId || layout.size === 0) {
        return (
            <div ref={containerRef} className="flex h-full min-h-65 items-center justify-center px-6 text-center">
                <div>
                    <p className="font-display text-xl text-text-primary">The tree is empty.</p>
                    <p className="mt-2 text-sm text-text-secondary">Insert a value to begin building its structure.</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="absolute inset-0">
            <svg
                aria-label="Interactive binary tree visualization"
                className="absolute inset-0 h-full w-full"
                height="100%"
                preserveAspectRatio="none"
                role="group"
                style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab' }}
                onPointerDownCapture={(event) => {
                    if (event.pointerType !== 'touch') return;
                    touchPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
                    if (touchPointersRef.current.size !== 2) return;

                    const [first, second] = Array.from(touchPointersRef.current.values());
                    const distance = Math.hypot(second.x - first.x, second.y - first.y);
                    if (!distance) return;
                    const bounds = containerRef.current?.getBoundingClientRect();
                    if (!bounds) return;
                    const centerX = (first.x + second.x) / 2 - bounds.left;
                    const centerY = (first.y + second.y) / 2 - bounds.top;
                    pinchRef.current = {
                        distance,
                        zoom,
                        anchorX: viewBoxX + centerX / zoom,
                        anchorY: viewBoxY + centerY / zoom,
                    };
                    nodeDragRef.current = null;
                    dragRef.current = null;
                    setIsDragging(true);
                }}
                onPointerMoveCapture={(event) => {
                    if (touchPointersRef.current.has(event.pointerId)) {
                        touchPointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
                    }
                }}
                onPointerUpCapture={(event) => {
                    touchPointersRef.current.delete(event.pointerId);
                    if (touchPointersRef.current.size < 2 && pinchRef.current) {
                        pinchRef.current = null;
                        setIsDragging(false);
                    }
                }}
                onPointerDown={(event) => {
                    if (event.pointerType === 'touch' && touchPointersRef.current.size > 1) return;
                    if (event.button !== 0 || (event.target as Element).closest('[role="button"]')) return;
                    dragRef.current = {
                        pointerId: event.pointerId,
                        x: event.clientX,
                        y: event.clientY,
                        panX: pan.x,
                        panY: pan.y,
                    };
                    setIsDragging(true);
                    event.currentTarget.setPointerCapture(event.pointerId);
                }}
                onPointerMove={(event) => {
                    const pinch = pinchRef.current;
                    if (pinch && touchPointersRef.current.size > 1) {
                        const [first, second] = Array.from(touchPointersRef.current.values());
                        const bounds = containerRef.current?.getBoundingClientRect();
                        if (!bounds) return;
                        const distance = Math.hypot(second.x - first.x, second.y - first.y);
                        const nextZoom = Math.max(0.65, Math.min(2.5, pinch.zoom * distance / pinch.distance));
                        const centerX = (first.x + second.x) / 2 - bounds.left;
                        const centerY = (first.y + second.y) / 2 - bounds.top;
                        setZoom(nextZoom);
                        setPan({
                            x: (nextZoom * viewport.width - viewport.width) / 2 + centerX - nextZoom * pinch.anchorX,
                            y: (nextZoom * viewport.height - viewport.height) / 2 + centerY - nextZoom * pinch.anchorY,
                        });
                        return;
                    }

                    const nodeDrag = nodeDragRef.current;
                    if (nodeDrag && nodeDrag.pointerId === event.pointerId) {
                        const offset = constrainNodeOffset(nodeDrag.nodeId, {
                            x: nodeDrag.offsetX + (event.clientX - nodeDrag.x) / zoom,
                            y: nodeDrag.offsetY + (event.clientY - nodeDrag.y) / zoom,
                        });
                        setNodeOffsets((current) => new Map(current).set(nodeDrag.nodeId, offset));
                        return;
                    }

                    const drag = dragRef.current;
                    if (!drag || drag.pointerId !== event.pointerId) return;
                    setPan({
                        x: drag.panX + event.clientX - drag.x,
                        y: drag.panY + event.clientY - drag.y,
                    });
                }}
                onPointerUp={(event) => {
                    const nodeDrag = nodeDragRef.current;
                    if (nodeDrag?.pointerId === event.pointerId) {
                        nodeDragRef.current = null;
                        setIsDragging(false);
                    }
                    if (dragRef.current?.pointerId === event.pointerId) {
                        dragRef.current = null;
                        setIsDragging(false);
                    }
                }}
                onPointerCancel={() => {
                    nodeDragRef.current = null;
                    dragRef.current = null;
                    touchPointersRef.current.clear();
                    pinchRef.current = null;
                    setIsDragging(false);
                }}
                viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
                width="100%"
            >
                <title>Tree diagram. Select a node to inspect its relationships.</title>

                <g aria-hidden="true">
                    <text
                        id="tree-canvas-drag-hint"
                        x={viewBoxX + 16}
                        y={viewBoxY + 24}
                        fill="#737871"
                        fontFamily="ui-sans-serif, system-ui, sans-serif"
                        fontSize="12"
                        pointerEvents="none"
                    >
                        Drag nodes to rearrange · drag canvas to pan · arrow keys to fine-tune
                    </text>

                    {Array.from(positionedLayout.values()).flatMap((node) => {
                        const edges = [];

                        if (node.leftId) {
                            const child = positionedLayout.get(node.leftId);
                            if (child) {
                                edges.push(
                                    <motion.line
                                        key={`${node.id}-${child.id}`}
                                        x1={node.x}
                                        y1={node.y}
                                        x2={child.x}
                                        y2={child.y}
                                        stroke="#737871"
                                        strokeOpacity="0.82"
                                        strokeWidth="1.5"
                                        initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                                    />
                                );
                            }
                        }

                        if (node.rightId) {
                            const child = positionedLayout.get(node.rightId);
                            if (child) {
                                edges.push(
                                    <motion.line
                                        key={`${node.id}-${child.id}`}
                                        x1={node.x}
                                        y1={node.y}
                                        x2={child.x}
                                        y2={child.y}
                                        stroke="#737871"
                                        strokeOpacity="0.82"
                                        strokeWidth="1.5"
                                        initial={shouldReduceMotion ? false : { pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                                    />
                                );
                            }
                        }

                        return edges;
                    })}
                </g>

                {Array.from(positionedLayout.values()).map((node) => {
                    const isActive = activeNodeId === node.id;
                    const isSelected = selectedNodeId === node.id;
                    const isVisited = visitedNodes?.has(node.id) ?? false;
                    const stroke = isActive || isSelected
                        ? '#c4ff68'
                        : isVisited
                            ? '#8ab4ff'
                            : '#737871';

                    return (
                        <motion.g
                            key={node.id}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                x: node.x,
                                y: node.y,
                            }}
                            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.94, x: node.x, y: node.y }}
                            transition={{
                                duration: shouldReduceMotion ? 0 : 0.18,
                                ease: 'easeOut',
                            }}
                            role={onNodeSelect ? 'button' : undefined}
                            tabIndex={onNodeSelect ? 0 : undefined}
                            aria-label={onNodeSelect ? `Select node ${node.value}` : undefined}
                            aria-pressed={onNodeSelect ? isSelected : undefined}
                            onClick={onNodeSelect ? () => onNodeSelect(node.id) : undefined}
                            onPointerDown={(event) => {
                                if (event.button !== 0) return;
                                if (event.pointerType === 'touch' && touchPointersRef.current.size > 1) return;
                                event.stopPropagation();
                                onNodeSelect?.(node.id);
                                const offset = nodeOffsets.get(node.id) ?? { x: 0, y: 0 };
                                nodeDragRef.current = {
                                    pointerId: event.pointerId,
                                    nodeId: node.id,
                                    x: event.clientX,
                                    y: event.clientY,
                                    offsetX: offset.x,
                                    offsetY: offset.y,
                                };
                                event.currentTarget.setPointerCapture(event.pointerId);
                                setIsDragging(true);
                            }}
                            onKeyDown={onNodeSelect ? (event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    onNodeSelect(node.id);
                                } else if (event.key.startsWith('Arrow')) {
                                    event.preventDefault();
                                    const step = event.shiftKey ? 20 : 8;
                                    const movements: Record<string, { x: number; y: number }> = {
                                        ArrowLeft: { x: -step, y: 0 },
                                        ArrowRight: { x: step, y: 0 },
                                        ArrowUp: { x: 0, y: -step },
                                        ArrowDown: { x: 0, y: step },
                                    };
                                    const movement = movements[event.key];
                                    if (movement) {
                                        setNodeOffsets((current) => {
                                            const next = new Map(current);
                                            const offset = next.get(node.id) ?? { x: 0, y: 0 };
                                            next.set(
                                                node.id,
                                                constrainNodeOffset(node.id, {
                                                    x: offset.x + movement.x,
                                                    y: offset.y + movement.y,
                                                })
                                            );
                                            return next;
                                        });
                                    }
                                }
                            } : undefined}
                            aria-describedby={onNodeSelect ? 'tree-canvas-drag-hint' : undefined}
                            className={onNodeSelect ? 'cursor-pointer outline-none focus-visible:drop-shadow-[0_0_3px_rgba(196,255,104,0.8)]' : undefined}
                        >
                            <circle
                                r="22"
                                fill={isActive ? '#252b1c' : isSelected ? '#20251a' : isVisited ? '#17202a' : '#171918'}
                                stroke={stroke}
                                strokeWidth={isActive || isSelected ? 2.5 : 1.5}
                            />
                            <text
                                textAnchor="middle"
                                dy="0.35em"
                                fill="#f2f3ee"
                                fontFamily="ui-monospace, SFMono-Regular, monospace"
                                fontSize="13"
                                fontWeight="600"
                                pointerEvents="none"
                            >
                                {node.value}
                            </text>
                        </motion.g>
                    );
                })}
            </svg>
            <div aria-label="Canvas controls" className="absolute bottom-3 right-3 z-20 flex border border-border-main bg-main-bg">
                <button
                    type="button"
                    title="Zoom out"
                    aria-label="Zoom out"
                    disabled={zoom <= 0.65}
                    onClick={() => setZoom((current) => Math.max(0.65, Number((current - 0.15).toFixed(2))))}
                    className="inline-flex h-10 w-10 items-center justify-center border-r border-border-main text-text-secondary transition-colors hover:bg-surface hover:text-text-primary disabled:opacity-40"
                >
                    <ZoomOut aria-hidden="true" size={16} />
                </button>
                <button
                    type="button"
                    title="Reset canvas view"
                    aria-label="Reset canvas view"
                    onClick={() => {
                        setZoom(1);
                        setPan({ x: 0, y: 0 });
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center border-r border-border-main text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                >
                    <Maximize2 aria-hidden="true" size={15} />
                </button>
                <button
                    type="button"
                    title="Zoom in"
                    aria-label="Zoom in"
                    disabled={zoom >= 2.5}
                    onClick={() => setZoom((current) => Math.min(2.5, Number((current + 0.15).toFixed(2))))}
                    className="inline-flex h-10 w-10 items-center justify-center text-text-secondary transition-colors hover:bg-surface hover:text-text-primary disabled:opacity-40"
                >
                    <ZoomIn aria-hidden="true" size={16} />
                </button>
            </div>
        </div>
    );
}
