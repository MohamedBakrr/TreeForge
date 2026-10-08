export type TreeType = 'general' | 'binary' | 'bst' | 'avl';

export type NodeId = string;

export interface BaseNode<T = number> {
    id: NodeId;
    value: T;
}

export interface GeneralTreeNode<T = number> extends BaseNode<T> {
    parentId: NodeId | null;
    childrenIds: NodeId[];
}

export interface BinaryTreeNode<T = number> extends BaseNode<T> {
    parentId: NodeId | null;
    leftId: NodeId | null;
    rightId: NodeId | null;
    height?: number; // For AVL
    balanceFactor?: number; // For AVL
}

export interface Point {
    x: number;
    y: number;
}
