import { BinaryTreeNode, NodeId } from '../core/types';
import { TraceBuilder } from '../trace/events';
import { v4 as uuidv4 } from 'uuid';

export class BinaryTreeEngine {
    nodes: Map<NodeId, BinaryTreeNode<number>> = new Map();
    rootId: NodeId | null = null;

    insertRoot(value: number, trace: TraceBuilder): NodeId {
        trace.addEvent({ type: 'start', message: `Creating root node with value ${value}` });
        const newNode: BinaryTreeNode<number> = {
            id: uuidv4(),
            value,
            parentId: null,
            leftId: null,
            rightId: null
        };
        this.rootId = newNode.id;
        this.nodes.set(newNode.id, newNode);
        trace.addEvent({ type: 'insert', nodeId: newNode.id, value, message: `Inserted root ${value}` });
        trace.addEvent({ type: 'end', message: `Complete.` });
        return newNode.id;
    }

    insertChild(parentId: NodeId, value: number, isLeft: boolean, trace: TraceBuilder): NodeId | null {
        trace.addEvent({ type: 'start', message: `Inserting child to node` });
        const parent = this.nodes.get(parentId);
        if (!parent) {
            trace.addEvent({ type: 'end', message: `Parent not found.` });
            return null;
        }

        if ((isLeft && parent.leftId) || (!isLeft && parent.rightId)) {
            trace.addEvent({ type: 'end', message: `Child position already occupied.` });
            return null;
        }

        const newNode: BinaryTreeNode<number> = {
            id: uuidv4(),
            value,
            parentId: parentId,
            leftId: null,
            rightId: null
        };

        if (isLeft) parent.leftId = newNode.id;
        else parent.rightId = newNode.id;

        this.nodes.set(newNode.id, newNode);
        trace.addEvent({ type: 'insert', nodeId: newNode.id, value, message: `Inserted ${value} as ${isLeft ? 'left' : 'right'} child.` });
        trace.addEvent({ type: 'end', message: `Complete.` });
        return newNode.id;
    }
}
