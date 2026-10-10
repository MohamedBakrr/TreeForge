import type { BinaryTreeNode, NodeId } from '../../trees/core/types';

const STORAGE_VERSION = 1;

export interface WorkspaceSnapshot {
    nodes: BinaryTreeNode<number>[];
    rootId: NodeId | null;
}

interface StoredWorkspaceSnapshot extends WorkspaceSnapshot {
    version: number;
}

interface KeyValueStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

function storageKey(treeType: 'bst' | 'avl') {
    return `treeforge:workspace:v${STORAGE_VERSION}:${treeType}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNullableNodeId(value: unknown): value is NodeId | null {
    return value === null || (typeof value === 'string' && value.length > 0);
}

function validateSnapshot(
    value: unknown,
    treeType: 'bst' | 'avl'
): WorkspaceSnapshot | null {
    if (!isRecord(value) || value.version !== STORAGE_VERSION ||
        !Array.isArray(value.nodes) || !isNullableNodeId(value.rootId)) {
        return null;
    }

    const nodes: BinaryTreeNode<number>[] = [];
    const ids = new Set<NodeId>();
    const values = new Set<number>();

    for (const entry of value.nodes) {
        if (!isRecord(entry) ||
            typeof entry.id !== 'string' || !entry.id ||
            !Number.isSafeInteger(entry.value) ||
            !isNullableNodeId(entry.parentId) ||
            !isNullableNodeId(entry.leftId) ||
            !isNullableNodeId(entry.rightId)) {
            return null;
        }

        if (ids.has(entry.id) || values.has(entry.value as number)) return null;
        ids.add(entry.id);
        values.add(entry.value as number);

        const node: BinaryTreeNode<number> = {
            id: entry.id,
            value: entry.value as number,
            parentId: entry.parentId,
            leftId: entry.leftId,
            rightId: entry.rightId,
        };

        if (treeType === 'avl') {
            if (!Number.isSafeInteger(entry.height) || !Number.isSafeInteger(entry.balanceFactor)) {
                return null;
            }
            node.height = entry.height as number;
            node.balanceFactor = entry.balanceFactor as number;
        }
        nodes.push(node);
    }

    const nodesById = new Map(nodes.map((node) => [node.id, node]));
    if (nodes.length === 0) return value.rootId === null ? { nodes, rootId: null } : null;
    if (!value.rootId || !nodesById.has(value.rootId)) return null;

    for (const node of nodes) {
        if ((node.parentId !== null && !nodesById.has(node.parentId)) ||
            (node.leftId !== null && !nodesById.has(node.leftId)) ||
            (node.rightId !== null && !nodesById.has(node.rightId)) ||
            node.leftId === node.id || node.rightId === node.id) {
            return null;
        }
        if (node.leftId && nodesById.get(node.leftId)?.parentId !== node.id) return null;
        if (node.rightId && nodesById.get(node.rightId)?.parentId !== node.id) return null;
        if (node.parentId) {
            const parent = nodesById.get(node.parentId);
            if (parent?.leftId !== node.id && parent?.rightId !== node.id) return null;
        }
    }

    if (nodesById.get(value.rootId)?.parentId !== null) return null;

    const visited = new Set<NodeId>();
    const inspect = (nodeId: NodeId, minimum: number, maximum: number): number | null => {
        if (visited.has(nodeId)) return null;
        visited.add(nodeId);
        const node = nodesById.get(nodeId);
        if (!node || node.value <= minimum || node.value >= maximum) return null;

        const leftHeight = node.leftId ? inspect(node.leftId, minimum, node.value) : -1;
        const rightHeight = node.rightId ? inspect(node.rightId, node.value, maximum) : -1;
        if (leftHeight === null || rightHeight === null) return null;

        const height = Math.max(leftHeight, rightHeight) + 1;
        if (treeType === 'avl' &&
            (node.height !== height ||
                node.balanceFactor !== leftHeight - rightHeight ||
                Math.abs(leftHeight - rightHeight) > 1)) {
            return null;
        }
        return height;
    };

    if (inspect(value.rootId, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY) === null ||
        visited.size !== nodes.length) {
        return null;
    }

    return { nodes, rootId: value.rootId };
}

export function readWorkspaceSnapshot(
    treeType: 'bst' | 'avl',
    providedStorage?: KeyValueStorage
): { snapshot: WorkspaceSnapshot | null; error: string | null } {
    try {
        const storage = providedStorage ?? window.localStorage;
        const serialized = storage.getItem(storageKey(treeType));
        if (serialized === null) return { snapshot: null, error: null };

        const snapshot = validateSnapshot(JSON.parse(serialized) as unknown, treeType);
        return snapshot
            ? { snapshot, error: null }
            : { snapshot: null, error: 'Saved workspace data is invalid. The example tree has been restored.' };
    } catch {
        return {
            snapshot: null,
            error: 'Saved workspace data could not be read. The example tree has been restored.',
        };
    }
}

export function writeWorkspaceSnapshot(
    treeType: 'bst' | 'avl',
    snapshot: WorkspaceSnapshot,
    providedStorage?: KeyValueStorage
): string | null {
    try {
        const storage = providedStorage ?? window.localStorage;
        const storedSnapshot: StoredWorkspaceSnapshot = {
            version: STORAGE_VERSION,
            ...snapshot,
        };
        storage.setItem(storageKey(treeType), JSON.stringify(storedSnapshot));
        return null;
    } catch {
        return 'Workspace changes could not be saved in this browser.';
    }
}
