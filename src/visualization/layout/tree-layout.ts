import { NodeId, BinaryTreeNode } from '../../trees/core/types';

export interface LayoutNode extends BinaryTreeNode<number> {
    x: number;
    y: number;
}

export function calculateBinaryTreeLayout(
    nodes: Map<NodeId, BinaryTreeNode<number>>,
    rootId: NodeId | null,
    width: number,
    startY = 50,
    levelHeight = 80,
    height = 600
): Map<NodeId, LayoutNode> {
    const layout = new Map<NodeId, LayoutNode>();
    if (!rootId) return layout;

    const findMaxDepth = (nodeId: NodeId, depth: number): number => {
        const node = nodes.get(nodeId);
        if (!node) return depth;

        const leftDepth = node.leftId ? findMaxDepth(node.leftId, depth + 1) : depth;
        const rightDepth = node.rightId ? findMaxDepth(node.rightId, depth + 1) : depth;
        return Math.max(leftDepth, rightDepth);
    };

    const maxDepth = findMaxDepth(rootId, 0);
    const nodeRadius = 22;
    const availableLevelHeight = maxDepth > 0
        ? (height - nodeRadius * 2 - 32) / maxDepth
        : levelHeight;
    const safeLevelHeight = Math.min(levelHeight, Math.max(36, availableLevelHeight));
    const topY = Math.max(
        nodeRadius + 6,
        startY,
        (height - maxDepth * safeLevelHeight) / 2
    );

    const traverse = (nodeId: NodeId, depth: number, x: number, offset: number) => {
        const node = nodes.get(nodeId);
        if (!node) return;

        layout.set(nodeId, {
            ...node,
            x,
            y: topY + depth * safeLevelHeight
        });

        if (node.leftId) {
            traverse(node.leftId, depth + 1, x - offset, offset / 2);
        }
        if (node.rightId) {
            traverse(node.rightId, depth + 1, x + offset, offset / 2);
        }
    };

    const horizontalMargin = nodeRadius + 8;
    const initialOffset = Math.max(0, (width - horizontalMargin * 2) / 4);
    traverse(rootId, 0, width / 2, initialOffset);
    return layout;
}
