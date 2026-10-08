import { BinaryTreeNode, NodeId } from '../core/types';
import { TraceBuilder } from '../trace/events';
import { v4 as uuidv4 } from 'uuid';

export class AVLEngine {
    nodes: Map<NodeId, BinaryTreeNode<number>> = new Map();
    rootId: NodeId | null = null;

    constructor() { }

    clear() {
        this.nodes.clear();
        this.rootId = null;
    }

    getHeight(nodeId: NodeId | null): number {
        if (!nodeId) return -1;
        return this.nodes.get(nodeId)?.height ?? -1;
    }

    getBalanceFactor(nodeId: NodeId | null): number {
        if (!nodeId) return 0;
        const node = this.nodes.get(nodeId)!;
        return this.getHeight(node.leftId) - this.getHeight(node.rightId);
    }

    updateHeight(nodeId: NodeId) {
        const node = this.nodes.get(nodeId)!;
        node.height = Math.max(this.getHeight(node.leftId), this.getHeight(node.rightId)) + 1;
    }

    private rightRotate(yId: NodeId, trace: TraceBuilder): NodeId {
        trace.addEvent({ type: 'rotate', message: `Performing Right Rotation (LL Case) on node ${this.nodes.get(yId)?.value}` });
        const y = this.nodes.get(yId)!;
        const xId = y.leftId!;
        const x = this.nodes.get(xId)!;
        const T2Id = x.rightId;

        x.rightId = yId;
        y.leftId = T2Id;

        if (T2Id) this.nodes.get(T2Id)!.parentId = yId;
        x.parentId = y.parentId;
        y.parentId = xId;

        this.updateHeight(yId);
        this.updateHeight(xId);
        y.balanceFactor = this.getBalanceFactor(yId);
        x.balanceFactor = this.getBalanceFactor(xId);

        return xId;
    }

    private leftRotate(xId: NodeId, trace: TraceBuilder): NodeId {
        trace.addEvent({ type: 'rotate', message: `Performing Left Rotation (RR Case) on node ${this.nodes.get(xId)?.value}` });
        const x = this.nodes.get(xId)!;
        const yId = x.rightId!;
        const y = this.nodes.get(yId)!;
        const T2Id = y.leftId;

        y.leftId = xId;
        x.rightId = T2Id;

        if (T2Id) this.nodes.get(T2Id)!.parentId = xId;
        y.parentId = x.parentId;
        x.parentId = yId;

        this.updateHeight(xId);
        this.updateHeight(yId);
        x.balanceFactor = this.getBalanceFactor(xId);
        y.balanceFactor = this.getBalanceFactor(yId);

        return yId;
    }

    private rebalance(nodeId: NodeId, trace: TraceBuilder): NodeId {
        const node = this.nodes.get(nodeId)!;
        this.updateHeight(nodeId);
        node.balanceFactor = this.getBalanceFactor(nodeId);
        const parentId = node.parentId;

        if (node.balanceFactor > 1) {
            const leftId = node.leftId!;
            if (this.getBalanceFactor(leftId) < 0) {
                node.leftId = this.leftRotate(leftId, trace);
            }
            const newRootId = this.rightRotate(nodeId, trace);
            this.nodes.get(newRootId)!.parentId = parentId;
            return newRootId;
        }

        if (node.balanceFactor < -1) {
            const rightId = node.rightId!;
            if (this.getBalanceFactor(rightId) > 0) {
                node.rightId = this.rightRotate(rightId, trace);
            }
            const newRootId = this.leftRotate(nodeId, trace);
            this.nodes.get(newRootId)!.parentId = parentId;
            return newRootId;
        }

        return nodeId;
    }

    insert(value: number, trace: TraceBuilder) {
        trace.addEvent({ type: 'start', message: `Starting AVL insertion for value ${value}` });
        this.rootId = this._insertNode(this.rootId, value, null, trace);
        trace.addEvent({ type: 'end', message: `AVL Insertion complete.` });
    }

    remove(value: number, trace: TraceBuilder): boolean {
        trace.addEvent({ type: 'start', message: `Starting AVL deletion for value ${value}.` });
        const result = { removed: false };
        this.rootId = this._deleteNode(this.rootId, value, null, trace, true, result);
        if (this.rootId) {
            this.nodes.get(this.rootId)!.parentId = null;
        }

        if (!result.removed) {
            trace.addEvent({ type: 'not_found', message: `Value ${value} is not in the tree.` });
            trace.addEvent({ type: 'end', message: 'Deletion complete; the tree was unchanged.' });
            return false;
        }

        trace.addEvent({ type: 'end', message: 'AVL deletion and rebalancing complete.' });
        return true;
    }

    private _deleteNode(
        nodeId: NodeId | null,
        value: number,
        parentId: NodeId | null,
        trace: TraceBuilder,
        reportDeletion: boolean,
        result: { removed: boolean }
    ): NodeId | null {
        if (!nodeId) return null;

        const node = this.nodes.get(nodeId)!;
        trace.addEvent({
            type: 'compare',
            nodeId,
            value: node.value,
            comparedValue: value,
            message: `Comparing ${value} with ${node.value}.`,
        });

        if (value < node.value) {
            node.leftId = this._deleteNode(node.leftId, value, nodeId, trace, reportDeletion, result);
            if (node.leftId) this.nodes.get(node.leftId)!.parentId = nodeId;
        } else if (value > node.value) {
            node.rightId = this._deleteNode(node.rightId, value, nodeId, trace, reportDeletion, result);
            if (node.rightId) this.nodes.get(node.rightId)!.parentId = nodeId;
        } else {
            if (reportDeletion) {
                result.removed = true;
                trace.addEvent({
                    type: 'delete',
                    nodeId,
                    value,
                    message: `Removed value ${value}; restoring AVL balance on the path to the root.`,
                });
            }

            if (!node.leftId || !node.rightId) {
                const childId = node.leftId ?? node.rightId;
                if (childId) this.nodes.get(childId)!.parentId = parentId;
                this.nodes.delete(nodeId);
                return childId;
            }

            let successorId = node.rightId;
            while (this.nodes.get(successorId)!.leftId) {
                successorId = this.nodes.get(successorId)!.leftId!;
            }
            const successorValue = this.nodes.get(successorId)!.value;
            node.value = successorValue;
            node.rightId = this._deleteNode(
                node.rightId,
                successorValue,
                nodeId,
                trace,
                false,
                result
            );
            if (node.rightId) this.nodes.get(node.rightId)!.parentId = nodeId;
        }

        if (!result.removed) return nodeId;
        const rebalancedRootId = this.rebalance(nodeId, trace);
        this.nodes.get(rebalancedRootId)!.parentId = parentId;
        return rebalancedRootId;
    }

    private _insertNode(nodeId: NodeId | null, value: number, parentId: NodeId | null, trace: TraceBuilder): NodeId | null {
        if (!nodeId) {
            const newNode: BinaryTreeNode<number> = {
                id: uuidv4(),
                value,
                parentId,
                leftId: null,
                rightId: null,
                height: 0,
                balanceFactor: 0
            };
            this.nodes.set(newNode.id, newNode);
            trace.addEvent({ type: 'insert', nodeId: newNode.id, value, message: `Inserted ${value}` });
            return newNode.id;
        }

        const node = this.nodes.get(nodeId)!;
        trace.addEvent({ type: 'compare', nodeId: nodeId, value: node.value, comparedValue: value, message: `Comparing ${value} with ${node.value}` });

        if (value < node.value) {
            node.leftId = this._insertNode(node.leftId, value, nodeId, trace);
        } else if (value > node.value) {
            node.rightId = this._insertNode(node.rightId, value, nodeId, trace);
        } else {
            trace.addEvent({ type: 'end', message: `Value ${value} already exists.` });
            return nodeId; // Duplicates not allowed
        }

        this.updateHeight(nodeId);
        const balance = this.getBalanceFactor(nodeId);
        node.balanceFactor = balance;

        // Balancing
        // LL Case
        if (balance > 1 && value < this.nodes.get(node.leftId!)!.value) {
            trace.addEvent({ type: 'imbalance', nodeId: nodeId, message: `Imbalance detected (LL Case) at node ${node.value}` });
            return this.rightRotate(nodeId, trace);
        }
        // RR Case
        if (balance < -1 && value > this.nodes.get(node.rightId!)!.value) {
            trace.addEvent({ type: 'imbalance', nodeId: nodeId, message: `Imbalance detected (RR Case) at node ${node.value}` });
            return this.leftRotate(nodeId, trace);
        }
        // LR Case
        if (balance > 1 && value > this.nodes.get(node.leftId!)!.value) {
            trace.addEvent({ type: 'imbalance', nodeId: nodeId, message: `Imbalance detected (LR Case) at node ${node.value}` });
            node.leftId = this.leftRotate(node.leftId!, trace);
            return this.rightRotate(nodeId, trace);
        }
        // RL Case
        if (balance < -1 && value < this.nodes.get(node.rightId!)!.value) {
            trace.addEvent({ type: 'imbalance', nodeId: nodeId, message: `Imbalance detected (RL Case) at node ${node.value}` });
            node.rightId = this.rightRotate(node.rightId!, trace);
            return this.leftRotate(nodeId, trace);
        }

        return nodeId;
    }
}
