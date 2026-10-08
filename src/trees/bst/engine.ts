import { BinaryTreeNode, NodeId } from '../core/types';
import { TraceBuilder } from '../trace/events';
import { v4 as uuidv4 } from 'uuid';

export class BSTEngine {
  nodes: Map<NodeId, BinaryTreeNode<number>> = new Map();
  rootId: NodeId | null = null;

  constructor() {}

  // Pure data insertion for loading state
  load(nodes: BinaryTreeNode<number>[], rootId: NodeId | null) {
    this.nodes.clear();
    nodes.forEach(n => this.nodes.set(n.id, { ...n }));
    this.rootId = rootId;
  }

  clear() {
    this.nodes.clear();
    this.rootId = null;
  }

  insert(value: number, trace: TraceBuilder): NodeId | null {
    trace.addEvent({ type: 'start', message: `Starting insertion for value ${value}` });

    const newNode: BinaryTreeNode<number> = {
      id: uuidv4(),
      value,
      parentId: null,
      leftId: null,
      rightId: null,
    };

    if (!this.rootId) {
      this.rootId = newNode.id;
      this.nodes.set(newNode.id, newNode);
      trace.addEvent({ type: 'insert', nodeId: newNode.id, value, message: `Tree is empty. Inserted ${value} as root.` });
      trace.addEvent({ type: 'end', message: `Insertion complete.` });
      return newNode.id;
    }

    let currentId = this.rootId;
    while (true) {
      const current = this.nodes.get(currentId)!;
      trace.addEvent({ type: 'compare', nodeId: currentId, value: current.value, comparedValue: value, message: `Comparing ${value} with ${current.value}` });

      if (value === current.value) {
        trace.addEvent({ type: 'end', message: `Value ${value} already exists. Duplicates rejected.` });
        return null;
      }

      if (value < current.value) {
        if (!current.leftId) {
          newNode.parentId = currentId;
          current.leftId = newNode.id;
          this.nodes.set(newNode.id, newNode);
          trace.addEvent({ type: 'insert', nodeId: newNode.id, value, message: `Inserted ${value} as left child of ${current.value}` });
          break;
        }
        currentId = current.leftId;
      } else {
        if (!current.rightId) {
          newNode.parentId = currentId;
          current.rightId = newNode.id;
          this.nodes.set(newNode.id, newNode);
          trace.addEvent({ type: 'insert', nodeId: newNode.id, value, message: `Inserted ${value} as right child of ${current.value}` });
          break;
        }
        currentId = current.rightId;
      }
    }

    trace.addEvent({ type: 'end', message: `Insertion complete.` });
    return newNode.id;
  }

  search(value: number, trace: TraceBuilder): NodeId | null {
    trace.addEvent({ type: 'start', message: `Searching for ${value}` });
    let currentId = this.rootId;

    while (currentId) {
      const current = this.nodes.get(currentId)!;
      trace.addEvent({ type: 'compare', nodeId: currentId, value: current.value, comparedValue: value, message: `Comparing with ${current.value}` });

      if (value === current.value) {
        trace.addEvent({ type: 'found', nodeId: currentId, message: `Found value ${value}!` });
        trace.addEvent({ type: 'end', message: `Search complete.` });
        return currentId;
      }
      
      if (value < current.value) {
        trace.addEvent({ type: 'visit', message: `${value} is less than ${current.value}, moving to left child.` });
        currentId = current.leftId;
      } else {
        trace.addEvent({ type: 'visit', message: `${value} is greater than ${current.value}, moving to right child.` });
        currentId = current.rightId;
      }
    }

    trace.addEvent({ type: 'not_found', message: `Reached leaf without finding ${value}.` });
    trace.addEvent({ type: 'end', message: `Search complete.` });
    return null;
  }

  remove(value: number, trace: TraceBuilder): boolean {
    trace.addEvent({ type: 'start', message: `Starting deletion for value ${value}.` });
    let targetId = this.rootId;

    while (targetId) {
      const target = this.nodes.get(targetId);
      if (!target) break;
      if (target.value === value) break;

      trace.addEvent({
        type: 'compare',
        nodeId: targetId,
        value: target.value,
        comparedValue: value,
        message: `Comparing ${value} with ${target.value}.`,
      });
      targetId = value < target.value ? target.leftId : target.rightId;
    }

    if (!targetId) {
      trace.addEvent({ type: 'not_found', message: `Value ${value} is not in the tree.` });
      trace.addEvent({ type: 'end', message: 'Deletion complete; the tree was unchanged.' });
      return false;
    }

    const target = this.nodes.get(targetId)!;
    let removedId = targetId;

    if (target.leftId && target.rightId) {
      removedId = target.rightId;
      while (this.nodes.get(removedId)!.leftId) {
        removedId = this.nodes.get(removedId)!.leftId!;
      }
      const successor = this.nodes.get(removedId)!;
      trace.addEvent({
        type: 'compare',
        nodeId: removedId,
        value: successor.value,
        message: `Replacing ${target.value} with its inorder successor ${successor.value}.`,
      });
      target.value = successor.value;
    }

    const removedNode = this.nodes.get(removedId)!;
    const childId = removedNode.leftId ?? removedNode.rightId;
    const parentId = removedNode.parentId;

    if (parentId === null) {
      this.rootId = childId;
    } else {
      const parent = this.nodes.get(parentId)!;
      if (parent.leftId === removedId) {
        parent.leftId = childId;
      } else {
        parent.rightId = childId;
      }
    }

    if (childId) {
      this.nodes.get(childId)!.parentId = parentId;
    }
    this.nodes.delete(removedId);

    trace.addEvent({
      type: 'delete',
      nodeId: targetId,
      value,
      message: `Removed value ${value} from the tree.`,
    });
    trace.addEvent({ type: 'end', message: 'Deletion complete.' });
    return true;
  }

  inorder(trace: TraceBuilder): number[] {
    const result: number[] = [];
    trace.addEvent({ type: 'start', message: `Starting inorder traversal` });

    const traverse = (nodeId: NodeId | null) => {
      if (!nodeId) return;
      const node = this.nodes.get(nodeId)!;
      
      traverse(node.leftId);
      
      trace.addEvent({ type: 'visit', nodeId, value: node.value, message: `Visiting ${node.value}` });
      result.push(node.value);
      
      traverse(node.rightId);
    };

    traverse(this.rootId);
    trace.addEvent({ type: 'end', message: `Inorder traversal complete: [${result.join(', ')}]` });
    return result;
  }
}
