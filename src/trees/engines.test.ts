import { describe, expect, it } from 'vitest';
import { AVLEngine } from './avl/engine';
import { BSTEngine } from './bst/engine';
import { NodeId } from './core/types';
import { TraceBuilder } from './trace/events';

function insertValues(engine: BSTEngine | AVLEngine, values: number[]) {
    values.forEach((value) => engine.insert(value, new TraceBuilder()));
}

function assertBinarySearchTree(engine: BSTEngine | AVLEngine): number[] {
    const values: number[] = [];
    const visit = (
        nodeId: NodeId | null,
        minimum: number,
        maximum: number,
        parentId: NodeId | null
    ) => {
        if (!nodeId) return;
        const node = engine.nodes.get(nodeId);
        expect(node).toBeDefined();
        expect(node!.parentId).toBe(parentId);
        expect(node!.value).toBeGreaterThan(minimum);
        expect(node!.value).toBeLessThan(maximum);
        visit(node!.leftId, minimum, node!.value, nodeId);
        values.push(node!.value);
        visit(node!.rightId, node!.value, maximum, nodeId);
    };

    visit(engine.rootId, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, null);
    expect(values).toHaveLength(engine.nodes.size);
    return values;
}

function assertAvlBalance(engine: AVLEngine) {
    const inspect = (nodeId: NodeId | null): number => {
        if (!nodeId) return -1;
        const node = engine.nodes.get(nodeId)!;
        const leftHeight = inspect(node.leftId);
        const rightHeight = inspect(node.rightId);
        const height = Math.max(leftHeight, rightHeight) + 1;
        expect(node.height).toBe(height);
        expect(node.balanceFactor).toBe(leftHeight - rightHeight);
        expect(Math.abs(leftHeight - rightHeight)).toBeLessThanOrEqual(1);
        return height;
    };

    inspect(engine.rootId);
}

describe('tree engine deletion and clearing', () => {
    it('removes a BST root with two children and repairs parent links', () => {
        const engine = new BSTEngine();
        insertValues(engine, [5, 3, 7, 2, 4, 6, 8]);

        expect(engine.remove(5, new TraceBuilder())).toBe(true);
        expect(assertBinarySearchTree(engine)).toEqual([2, 3, 4, 6, 7, 8]);
        expect(engine.remove(5, new TraceBuilder())).toBe(false);
    });

    it('clears all nodes and the root', () => {
        const engine = new BSTEngine();
        insertValues(engine, [2, 1, 3]);

        engine.clear();

        expect(engine.nodes.size).toBe(0);
        expect(engine.rootId).toBeNull();
    });

    it('rebalances AVL trees after deleting and reinserting edited values', () => {
        const engine = new AVLEngine();
        insertValues(engine, [30, 20, 40, 10, 25, 35, 50, 15, 27]);

        expect(engine.remove(30, new TraceBuilder())).toBe(true);
        engine.remove(20, new TraceBuilder());
        engine.insert(45, new TraceBuilder());

        expect(assertBinarySearchTree(engine)).toEqual([10, 15, 25, 27, 35, 40, 45, 50]);
        assertAvlBalance(engine);
    });

    it('handles removing every node in an AVL tree', () => {
        const engine = new AVLEngine();
        insertValues(engine, [2, 1, 3]);

        expect(engine.remove(2, new TraceBuilder())).toBe(true);
        expect(engine.remove(1, new TraceBuilder())).toBe(true);
        expect(engine.remove(3, new TraceBuilder())).toBe(true);

        expect(engine.nodes.size).toBe(0);
        expect(engine.rootId).toBeNull();
    });
});
