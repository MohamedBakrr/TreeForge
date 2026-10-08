import { GeneralTreeNode, NodeId } from '../core/types';
import { TraceBuilder } from '../trace/events';
import { v4 as uuidv4 } from 'uuid';

export class GeneralTreeEngine {
    nodes: Map<NodeId, GeneralTreeNode<number>> = new Map();
    rootId: NodeId | null = null;

    insert(value: number, parentId: NodeId | null, trace: TraceBuilder): NodeId {
        trace.addEvent({ type: 'start', message: `Inserting ${value} into General Tree` });

        const newNode: GeneralTreeNode<number> = {
            id: uuidv4(),
            value,
            parentId,
            childrenIds: []
        };

        if (!parentId || !this.rootId) {
            this.rootId = newNode.id;
            trace.addEvent({ type: 'insert', nodeId: newNode.id, value, message: `Inserted ${value} as root` });
        } else {
            const parent = this.nodes.get(parentId);
            if (parent) {
                parent.childrenIds.push(newNode.id);
                trace.addEvent({ type: 'insert', nodeId: newNode.id, value, message: `Inserted ${value} as child of ${parent.value}` });
            }
        }

        this.nodes.set(newNode.id, newNode);
        trace.addEvent({ type: 'end', message: `Insertion complete.` });
        return newNode.id;
    }

    // Basic Preorder Traversal
    preorder(trace: TraceBuilder): number[] {
        const result: number[] = [];
        trace.addEvent({ type: 'start', message: `Starting Preorder Traversal` });

        const traverse = (nodeId: NodeId | null) => {
            if (!nodeId) return;
            const node = this.nodes.get(nodeId)!;
            trace.addEvent({ type: 'visit', nodeId, value: node.value, message: `Visiting ${node.value}` });
            result.push(node.value);

            for (const childId of node.childrenIds) {
                traverse(childId);
            }
        };

        traverse(this.rootId);
        trace.addEvent({ type: 'end', message: `Traversal complete: [${result.join(', ')}]` });
        return result;
    }
}
