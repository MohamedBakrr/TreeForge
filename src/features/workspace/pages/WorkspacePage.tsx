import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Check, Pause, Play, RotateCcw, Trash2, X } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { SeoHead } from '../../../app/SeoHead';
import { RepositoryLink } from '../../../app/RepositoryLink';
import { AVLEngine } from '../../../trees/avl/engine';
import { BSTEngine } from '../../../trees/bst/engine';
import { BinaryTreeNode, NodeId } from '../../../trees/core/types';
import { TraceBuilder, TraceEvent } from '../../../trees/trace/events';
import { TreeCanvas } from '../../../visualization/TreeCanvas';

type WorkspaceEngine = BSTEngine | AVLEngine;
type TraversalOrder = 'inorder' | 'preorder' | 'postorder' | 'levelorder';

function createEngine(treeType: 'bst' | 'avl'): WorkspaceEngine {
    return treeType === 'avl' ? new AVLEngine() : new BSTEngine();
}

function createSeededEngine(treeType: 'bst' | 'avl'): WorkspaceEngine {
    const engine = createEngine(treeType);
    const values = treeType === 'avl'
        ? [30, 20, 40, 10, 25, 35, 50, 15, 27]
        : [50, 30, 70, 20, 40, 60, 80, 10, 25, 35, 65, 75];

    values.forEach((value) => engine.insert(value, new TraceBuilder()));
    return engine;
}

function WorkspaceEditor({ treeType }: { treeType: 'bst' | 'avl' }) {
    const [engine, setEngine] = useState<WorkspaceEngine>(() => createSeededEngine(treeType));
    const [nodes, setNodes] = useState<Map<NodeId, BinaryTreeNode<number>>>(() => new Map(engine.nodes));
    const [rootId, setRootId] = useState<NodeId | null>(engine.rootId);
    const [inputValue, setInputValue] = useState('');
    const [inputError, setInputError] = useState('');
    const [editValue, setEditValue] = useState('');
    const [nodeError, setNodeError] = useState('');
    const [traversalOrder, setTraversalOrder] = useState<TraversalOrder>('inorder');
    const [activeTrace, setActiveTrace] = useState<TraceEvent[]>([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);
    const [selectedNodeId, setSelectedNodeId] = useState<NodeId | null>(null);
    const [traversalResult, setTraversalResult] = useState<number[] | null>(null);
    const [isTraversalPlaying, setIsTraversalPlaying] = useState(false);
    const [resultNotice, setResultNotice] = useState<string | null>(null);
    const traversalResultRef = useRef<HTMLDivElement>(null);
    const attachTraversalResult = useCallback((element: HTMLDivElement | null) => {
        traversalResultRef.current = element;
        if (!element || traversalResult === null) return;

        window.requestAnimationFrame(() => {
            element.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
                block: 'center',
            });
        });
    }, [traversalResult]);

    useEffect(() => {
        const freshEngine = createSeededEngine(treeType);
        setEngine(freshEngine);
        setNodes(new Map(freshEngine.nodes));
        setRootId(freshEngine.rootId);
        setActiveTrace([]);
        setCurrentStepIndex(-1);
        setTraversalResult(null);
        setIsTraversalPlaying(false);
        setResultNotice(null);
        setSelectedNodeId(null);
        setInputValue('');
        setInputError('');
    }, [treeType]);

    const currentEvent = currentStepIndex >= 0 && currentStepIndex < activeTrace.length
        ? activeTrace[currentStepIndex]
        : null;
    const visitedNodes = useMemo(
        () => new Set(
            activeTrace
                .slice(0, currentStepIndex + 1)
                .filter((event) => event.type === 'visit' && event.nodeId)
                .map((event) => event.nodeId!)
        ),
        [activeTrace, currentStepIndex]
    );
    const selectedNode = selectedNodeId ? nodes.get(selectedNodeId) ?? null : null;
    const traceNode = currentEvent?.nodeId
        ? nodes.get(currentEvent.nodeId) ?? null
        : selectedNode;
    const inspectedNode = selectedNode ?? traceNode;

    const treeDepth = useMemo(() => {
        if (!rootId) return 0;
        const stack: Array<{ id: NodeId; depth: number }> = [{ id: rootId, depth: 1 }];
        let maxDepth = 0;

        while (stack.length) {
            const current = stack.pop()!;
            const node = nodes.get(current.id);
            if (!node) continue;
            maxDepth = Math.max(maxDepth, current.depth);
            if (node.leftId) stack.push({ id: node.leftId, depth: current.depth + 1 });
            if (node.rightId) stack.push({ id: node.rightId, depth: current.depth + 1 });
        }

        return maxDepth;
    }, [nodes, rootId]);

    const inspectedDepth = useMemo(() => {
        if (!inspectedNode) return null;
        let depth = 0;
        let parentId = inspectedNode.parentId;
        const seen = new Set<NodeId>([inspectedNode.id]);

        while (parentId && !seen.has(parentId)) {
            seen.add(parentId);
            depth += 1;
            parentId = nodes.get(parentId)?.parentId ?? null;
        }

        return depth;
    }, [inspectedNode, nodes]);

    const resetTrace = () => {
        setActiveTrace([]);
        setCurrentStepIndex(-1);
        setTraversalResult(null);
        setIsTraversalPlaying(false);
        setResultNotice(null);
    };

    const showTrace = (trace: TraceBuilder) => {
        setActiveTrace(trace.getEvents());
        setCurrentStepIndex(0);
        setTraversalResult(null);
        setIsTraversalPlaying(false);
        setResultNotice(null);
    };

    useEffect(() => {
        if (!isTraversalPlaying || currentStepIndex >= activeTrace.length - 1) {
            if (isTraversalPlaying && currentStepIndex >= activeTrace.length - 1) {
                setIsTraversalPlaying(false);
            }
            return;
        }

        const timer = window.setTimeout(() => setCurrentStepIndex((index) => index + 1), 650);
        return () => window.clearTimeout(timer);
    }, [activeTrace.length, currentStepIndex, isTraversalPlaying]);

    useEffect(() => {
        if (traversalResult === null || currentStepIndex !== activeTrace.length - 1) return;

        setResultNotice(`Traversal complete: [${traversalResult.join(', ')}]`);
        const noticeTimer = window.setTimeout(() => setResultNotice(null), 8000);
        return () => window.clearTimeout(noticeTimer);
    }, [activeTrace.length, currentStepIndex, traversalResult]);

    const handleInsert = () => {
        const value = Number(inputValue);
        if (!inputValue.trim() || !Number.isSafeInteger(value)) {
            setInputError('Enter a whole number to insert.');
            return;
        }

        if (Array.from(engine.nodes.values()).some((node) => node.value === value)) {
            setInputError(`Value ${value} is already in the tree.`);
            return;
        }

        const trace = new TraceBuilder();
        engine.insert(value, trace);
        setNodes(new Map(engine.nodes));
        setRootId(engine.rootId);
        setInputValue('');
        setInputError('');
        showTrace(trace);
        setSelectedNodeId(null);
    };

    const handleReset = () => {
        const freshEngine = createEngine(treeType);
        setEngine(freshEngine);
        setNodes(new Map(freshEngine.nodes));
        setRootId(freshEngine.rootId);
        setInputValue('');
        setInputError('');
        setEditValue('');
        setNodeError('');
        resetTrace();
        setSelectedNodeId(null);
    };

    const findNodeIdByValue = (value: number): NodeId | null => {
        for (const [nodeId, node] of engine.nodes) {
            if (node.value === value) return nodeId;
        }
        return null;
    };

    const handleEditNode = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedNode) return;

        const nextValue = Number(editValue);
        if (!editValue.trim() || !Number.isSafeInteger(nextValue)) {
            setNodeError('Enter a whole number for this node.');
            return;
        }
        if (nextValue !== selectedNode.value && Array.from(engine.nodes.values()).some((node) => node.value === nextValue)) {
            setNodeError(`Value ${nextValue} is already in the tree.`);
            return;
        }
        if (nextValue === selectedNode.value) {
            setNodeError('Enter a different value to reposition this node.');
            return;
        }

        const trace = new TraceBuilder();
        engine.remove(selectedNode.value, trace);
        engine.insert(nextValue, trace);
        const updatedNodes = new Map(engine.nodes);
        const updatedNodeId = findNodeIdByValue(nextValue);
        setNodes(updatedNodes);
        setRootId(engine.rootId);
        setSelectedNodeId(updatedNodeId);
        setEditValue(String(nextValue));
        setNodeError('');
        showTrace(trace);
    };

    const handleDeleteNode = () => {
        if (!selectedNode) return;

        const trace = new TraceBuilder();
        engine.remove(selectedNode.value, trace);
        setNodes(new Map(engine.nodes));
        setRootId(engine.rootId);
        setSelectedNodeId(null);
        setEditValue('');
        setNodeError('');
        showTrace(trace);
    };

    const handleTraversal = () => {
        const trace = new TraceBuilder();
        const values: number[] = [];
        const traversalNames: Record<TraversalOrder, string> = {
            inorder: 'inorder',
            preorder: 'preorder',
            postorder: 'postorder',
            levelorder: 'level-order',
        };
        trace.addEvent({ type: 'start', message: `Starting ${traversalNames[traversalOrder]} traversal.` });

        const visit = (nodeId: NodeId) => {
            const node = nodes.get(nodeId);
            if (!node) return;
            values.push(node.value);
            trace.addEvent({ type: 'visit', nodeId, value: node.value, message: `Visiting ${node.value}.` });
        };

        const traverse = (nodeId: NodeId | null) => {
            if (!nodeId) return;
            const node = nodes.get(nodeId);
            if (!node) return;

            trace.addEvent({
                type: 'compare',
                nodeId,
                value: node.value,
                message: traversalOrder === 'inorder'
                    ? `Inspect ${node.value}; visit it after its left subtree.`
                    : traversalOrder === 'preorder'
                        ? `Inspect ${node.value}; visit it before its subtrees.`
                        : `Inspect ${node.value}; visit it after both subtrees.`,
            });
            if (traversalOrder === 'preorder') visit(nodeId);
            traverse(node.leftId);
            if (traversalOrder === 'inorder') visit(nodeId);
            traverse(node.rightId);
            if (traversalOrder === 'postorder') visit(nodeId);
        };

        if (traversalOrder === 'levelorder') {
            const queue = rootId ? [rootId] : [];
            for (let index = 0; index < queue.length; index += 1) {
                const nodeId = queue[index];
                const node = nodes.get(nodeId);
                if (!node) continue;
                trace.addEvent({
                    type: 'compare',
                    nodeId,
                    value: node.value,
                    message: `Remove ${node.value} from the queue and visit it; enqueue its children.`,
                });
                visit(nodeId);
                if (node.leftId) queue.push(node.leftId);
                if (node.rightId) queue.push(node.rightId);
            }
        } else {
            traverse(rootId);
        }

        trace.addEvent({
            type: 'end',
            message: `${traversalNames[traversalOrder]} traversal complete: [${values.join(', ')}].`,
        });
        showTrace(trace);
        setTraversalResult(values);
        setIsTraversalPlaying(true);
        setResultNotice(null);
        setSelectedNodeId(null);
    };

    const moveTrace = (direction: -1 | 1) => {
        const nextIndex = Math.min(activeTrace.length - 1, Math.max(0, currentStepIndex + direction));
        if (nextIndex < 0) return;
        setCurrentStepIndex(nextIndex);
    };

    const getValue = (nodeId: NodeId | null) => {
        if (!nodeId) return '—';
        return String(nodes.get(nodeId)?.value ?? '—');
    };

    const handleNodeSelect = (nodeId: NodeId) => {
        const node = nodes.get(nodeId);
        if (!node) return;
        setSelectedNodeId(nodeId);
        setEditValue(String(node.value));
        setNodeError('');
    };

    return (
        <div className="flex min-h-screen flex-col bg-main-bg text-text-primary">
            {resultNotice && (
                <div
                    role="status"
                    aria-live="polite"
                    className="fixed inset-x-3 top-3 z-50 mx-auto flex max-w-xl items-start gap-3 border border-accent-lime/50 bg-[#101310] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.55)] sm:inset-x-auto sm:right-5 sm:top-5"
                >
                    <Check aria-hidden="true" className="mt-0.5 shrink-0 text-accent-lime" size={18} />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-text-primary">Traversal finished</p>
                        <p className="mt-1 wrap-break-word font-mono text-xs leading-5 text-accent-lime">
                            {resultNotice}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setResultNotice(null)}
                        aria-label="Dismiss traversal result notification"
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center text-text-secondary hover:text-text-primary"
                    >
                        <X aria-hidden="true" size={16} />
                    </button>
                </div>
            )}
            <SeoHead
                title={`Interactive ${treeType.toUpperCase()} Tree Workspace | TreeForge`}
                description={`Build and explore an interactive ${treeType.toUpperCase()} tree. Insert, edit, and remove nodes, then trace traversals step by step.`}
                path={`/workspace/${treeType}`}
                noIndex
            />
            <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-main bg-[#0c0e0d] px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                    <Link to="/" aria-label="Back to TreeForge home" className="inline-flex h-9 w-9 shrink-0 items-center justify-center border border-border-main text-text-secondary transition-colors hover:text-text-primary">
                        <ArrowLeft aria-hidden="true" size={16} />
                    </Link>
                    <span className="hidden text-xs font-semibold tracking-[0.18em] sm:inline">TREEFORGE</span>
                    <span className="h-5 w-px bg-border-main" />
                    <h1 className="truncate text-sm font-medium tracking-tight sm:text-base">Tree workspace</h1>
                    <span className="border-l border-border-main pl-3 font-mono text-xs uppercase text-text-muted">{treeType}</span>
                </div>
                <nav aria-label="Main navigation" className="flex shrink-0 items-center gap-3 sm:gap-5">
                    <Link to="/learn" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Learning guide</Link>
                    <RepositoryLink />
                </nav>
            </header>

            <main className="grid flex-1 grid-cols-1 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[220px_minmax(0,1fr)_240px]">
                <aside className="order-2 grid grid-cols-1 gap-6 border-t border-border-main bg-[#0c0e0d] p-4 sm:grid-cols-2 lg:order-1 lg:block lg:border-r lg:border-t-0 lg:p-5">
                    <section aria-labelledby="workspace-controls-title">
                        <p className="tf-eyebrow">TREE OPERATIONS</p>
                        <h2 id="workspace-controls-title" className="mt-2 text-lg font-medium">Build the tree</h2>
                        <p className="mt-2 text-sm leading-5 text-text-secondary">
                            {treeType === 'avl'
                                ? 'Insert a value. The tree will rebalance when required.'
                                : 'Insert a value to follow the search-tree ordering rule.'}
                        </p>

                        <form
                            className="mt-5"
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleInsert();
                            }}
                        >
                            <label htmlFor="node-value" className="mb-2 block text-sm text-text-secondary">Node value</label>
                            <input
                                id="node-value"
                                type="number"
                                step="1"
                                value={inputValue}
                                onChange={(event) => {
                                    setInputValue(event.target.value);
                                    if (inputError) setInputError('');
                                }}
                                placeholder="e.g. 42"
                                aria-describedby={inputError ? 'node-value-error' : undefined}
                                aria-invalid={Boolean(inputError)}
                                className="h-11 w-full border border-border-main bg-main-bg px-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-lime focus:outline-none"
                            />
                            {inputError && (
                                <p id="node-value-error" role="alert" className="mt-2 text-sm text-error">{inputError}</p>
                            )}
                            <button type="submit" className="tf-button tf-button-primary mt-3 w-full">
                                Insert node <ArrowRight aria-hidden="true" size={15} />
                            </button>
                        </form>

                        <button type="button" onClick={handleReset} className="tf-button tf-button-secondary mt-2 w-full">
                            <RotateCcw aria-hidden="true" size={14} /> Reset tree
                        </button>
                    </section>

                    <section aria-labelledby="workspace-traversal-title" className="border-t border-border-main pt-5 lg:mt-7">
                        <p className="tf-eyebrow">TRAVERSAL</p>
                        <h2 id="workspace-traversal-title" className="mt-2 text-base font-medium">Traversal order</h2>
                        <label htmlFor="traversal-order" className="sr-only">Choose traversal order</label>
                        <select
                            id="traversal-order"
                            value={traversalOrder}
                            onChange={(event) => setTraversalOrder(event.target.value as TraversalOrder)}
                            className="mt-3 h-11 w-full border border-border-main bg-main-bg px-3 text-sm text-text-primary focus:border-accent-lime focus:outline-none"
                        >
                            <option value="inorder">Inorder · left, node, right</option>
                            <option value="preorder">Preorder · node, left, right</option>
                            <option value="postorder">Postorder · left, right, node</option>
                            <option value="levelorder">Level order · breadth-first</option>
                        </select>
                        <button
                            type="button"
                            onClick={handleTraversal}
                            disabled={!rootId}
                            className="tf-button tf-button-secondary mt-3 w-full disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Run selected traversal
                        </button>
                    </section>

                    <section className="border-t border-border-main pt-5 sm:col-span-2 lg:mt-7">
                        <p className="tf-eyebrow">STRUCTURE</p>
                        <dl className="mt-3 divide-y divide-border-main text-sm">
                            <div className="flex justify-between gap-3 py-2">
                                <dt className="text-text-secondary">Nodes</dt>
                                <dd className="font-mono text-text-primary">{nodes.size}</dd>
                            </div>
                            <div className="flex justify-between gap-3 py-2">
                                <dt className="text-text-secondary">Levels</dt>
                                <dd className="font-mono text-text-primary">{treeDepth}</dd>
                            </div>
                        </dl>
                    </section>
                </aside>

                <section aria-label="Tree visualization" className="order-1 flex min-w-0 flex-col bg-main-bg lg:order-2">
                    <div className="flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-border-main px-4 py-3 sm:px-5">
                        <div>
                            <h2 className="text-sm font-medium">{treeType === 'avl' ? 'AVL search tree' : 'Binary search tree'}</h2>
                            <p className="mt-0.5 text-xs text-text-muted">
                                Select a node to inspect it · {nodes.size} nodes · {treeDepth} levels
                            </p>
                        </div>
                        <span className="font-mono text-[11px] text-text-muted">
                            {traversalOrder === 'inorder'
                                ? 'INORDER / LEFT → NODE → RIGHT'
                                : traversalOrder === 'preorder'
                                    ? 'PREORDER / NODE → LEFT → RIGHT'
                                    : traversalOrder === 'postorder'
                                        ? 'POSTORDER / LEFT → RIGHT → NODE'
                                        : 'LEVEL ORDER / BREADTH-FIRST'}
                        </span>
                    </div>

                    <div className="p-3 sm:p-5">
                        <div className="relative aspect-square min-h-75 max-h-160 w-full border border-border-main bg-[#0b0d0c] sm:aspect-[1.45] sm:min-h-65">
                            <TreeCanvas
                                nodes={nodes}
                                rootId={rootId}
                                activeNodeId={currentEvent ? currentEvent.nodeId : selectedNodeId}
                                selectedNodeId={selectedNodeId}
                                visitedNodes={visitedNodes}
                                onNodeSelect={handleNodeSelect}
                                width={1000}
                                height={650}
                            />
                        </div>
                    </div>

                    <details open={activeTrace.length > 0} className="mt-auto border-t border-border-main">
                        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium sm:px-5 [&::-webkit-details-marker]:hidden">
                            <span>Operation trace</span>
                            <span className="font-mono text-xs text-text-muted">
                                {activeTrace.length ? `${currentStepIndex + 1} / ${activeTrace.length}` : 'No active operation'}
                            </span>
                        </summary>
                        {activeTrace.length > 0 && (
                            <div className="border-t border-border-main px-4 py-3 sm:px-5">
                                <p role="status" aria-live="polite" className="mb-3 text-sm leading-6 text-text-secondary">
                                    {currentEvent?.message ?? ''}
                                </p>
                                <div className="mb-3 flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => moveTrace(-1)}
                                        disabled={currentStepIndex <= 0}
                                        aria-label="Previous trace step"
                                        className="tf-button tf-button-secondary min-h-9 px-3 disabled:opacity-40"
                                    >
                                        <ArrowLeft aria-hidden="true" size={14} /> Previous
                                    </button>
                                    {traversalResult !== null && currentStepIndex < activeTrace.length - 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setIsTraversalPlaying((playing) => !playing)}
                                            aria-label={isTraversalPlaying ? 'Pause traversal' : 'Resume traversal'}
                                            className="tf-button tf-button-secondary min-h-9 px-3"
                                        >
                                            {isTraversalPlaying
                                                ? <><Pause aria-hidden="true" size={14} /> Pause</>
                                                : <><Play aria-hidden="true" size={14} /> Continue</>}
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => moveTrace(1)}
                                        disabled={currentStepIndex >= activeTrace.length - 1}
                                        aria-label="Next trace step"
                                        className="tf-button tf-button-secondary min-h-9 px-3 disabled:opacity-40"
                                    >
                                        Next <ArrowRight aria-hidden="true" size={14} />
                                    </button>
                                    <span className="ml-auto font-mono text-xs text-text-muted">
                                        {currentEvent?.type ?? 'ready'}
                                    </span>
                                </div>
                                <ol aria-live="polite" aria-relevant="additions text" className="max-h-36 space-y-1 overflow-y-auto">
                                    {activeTrace.map((event, index) => (
                                        <li
                                            key={`${index}-${event.type}`}
                                            aria-current={index === currentStepIndex ? 'step' : undefined}
                                            className={`grid grid-cols-[2rem_5rem_1fr] gap-2 border-l-2 py-1 pl-3 font-mono text-xs leading-5 ${index === currentStepIndex
                                                    ? 'border-accent-lime text-text-primary'
                                                    : index < currentStepIndex
                                                        ? 'border-border-main text-text-muted'
                                                        : 'border-transparent text-text-secondary'
                                                }`}
                                        >
                                            <span>{String(index + 1).padStart(2, '0')}</span>
                                            <span>{event.type}</span>
                                            <span className="font-sans">{event.message}</span>
                                        </li>
                                    ))}
                                </ol>
                                {traversalResult !== null && currentStepIndex >= activeTrace.length - 1 && (
                                    <div ref={attachTraversalResult} tabIndex={-1} className="mt-4 scroll-mt-4 border-t border-border-main pt-4">
                                        <p className="tf-eyebrow">TRAVERSAL RESULT</p>
                                        <p className="mt-2 wrap-break-word font-mono text-sm leading-6 text-accent-lime" aria-label="Traversal result">
                                            [{traversalResult.join(', ')}]
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </details>
                </section>

                <aside className="order-3 border-t border-border-main bg-[#0c0e0d] p-4 lg:border-l lg:border-t-0 lg:p-5">
                    <p className="tf-eyebrow">INSPECTOR</p>
                    <h2 className="mt-2 text-lg font-medium">Node details</h2>

                    {inspectedNode ? (
                        <>
                            <p className="mt-6 font-mono text-4xl tracking-tight text-text-primary">{inspectedNode.value}</p>
                            <p className="mt-1 text-sm text-text-secondary">
                                {selectedNode ? 'Selected node' : 'Current trace node'}
                            </p>
                            {selectedNode && (
                                <div className="mt-6 border-b border-border-main pb-5">
                                    <form onSubmit={handleEditNode}>
                                        <label htmlFor="edit-node-value" className="mb-2 block text-sm text-text-secondary">
                                            Change value
                                        </label>
                                        <input
                                            id="edit-node-value"
                                            type="number"
                                            step="1"
                                            value={editValue}
                                            onChange={(event) => {
                                                setEditValue(event.target.value);
                                                if (nodeError) setNodeError('');
                                            }}
                                            aria-describedby={nodeError ? 'edit-node-error' : undefined}
                                            aria-invalid={Boolean(nodeError)}
                                            className="h-11 w-full border border-border-main bg-main-bg px-3 text-sm text-text-primary focus:border-accent-lime focus:outline-none"
                                        />
                                        {nodeError && (
                                            <p id="edit-node-error" role="alert" className="mt-2 text-sm text-error">{nodeError}</p>
                                        )}
                                        <button type="submit" className="tf-button tf-button-secondary mt-3 w-full">
                                            Update and reposition
                                        </button>
                                    </form>

                                    <button
                                        type="button"
                                        onClick={handleDeleteNode}
                                        className="tf-button mt-2 w-full border border-border-main bg-transparent text-text-secondary transition-colors hover:border-error hover:text-error"
                                    >
                                        <Trash2 aria-hidden="true" size={14} /> Delete node
                                    </button>
                                    <p className="mt-2 text-xs leading-5 text-text-muted">
                                        Changing the value removes this node and inserts the new value to restore tree ordering.
                                    </p>
                                </div>
                            )}
                            <dl className="mt-6 divide-y divide-border-main border-y border-border-main text-sm">
                                <div className="flex justify-between gap-3 py-3">
                                    <dt className="text-text-secondary">Parent</dt>
                                    <dd className="font-mono">{getValue(inspectedNode.parentId)}</dd>
                                </div>
                                <div className="flex justify-between gap-3 py-3">
                                    <dt className="text-text-secondary">Left child</dt>
                                    <dd className="font-mono">{getValue(inspectedNode.leftId)}</dd>
                                </div>
                                <div className="flex justify-between gap-3 py-3">
                                    <dt className="text-text-secondary">Right child</dt>
                                    <dd className="font-mono">{getValue(inspectedNode.rightId)}</dd>
                                </div>
                                <div className="flex justify-between gap-3 py-3">
                                    <dt className="text-text-secondary">Depth</dt>
                                    <dd className="font-mono">{inspectedDepth}</dd>
                                </div>
                                {treeType === 'avl' && (
                                    <>
                                        <div className="flex justify-between gap-3 py-3">
                                            <dt className="text-text-secondary">Height</dt>
                                            <dd className="font-mono">{inspectedNode.height ?? 0}</dd>
                                        </div>
                                        <div className="flex justify-between gap-3 py-3">
                                            <dt className="text-text-secondary">Balance factor</dt>
                                            <dd className="font-mono">{inspectedNode.balanceFactor ?? 0}</dd>
                                        </div>
                                    </>
                                )}
                            </dl>
                            <p className="mt-5 text-sm leading-6 text-text-muted">
                                {treeType === 'avl'
                                    ? 'AVL balance is maintained by keeping left and right subtree heights within one.'
                                    : 'Every value in the left subtree is smaller; every value in the right subtree is larger.'}
                            </p>
                        </>
                    ) : (
                        <p className="mt-4 text-sm leading-6 text-text-secondary">
                            Select a node in the canvas or step through an operation to inspect its relationships.
                        </p>
                    )}
                </aside>
            </main>
        </div>
    );
}

export function WorkspacePage() {
    const { treeType } = useParams<{ treeType: string }>();

    if (treeType !== 'bst' && treeType !== 'avl') {
        return <Navigate to={treeType ? `/learn/${treeType}` : '/learn'} replace />;
    }

    return <WorkspaceEditor treeType={treeType} />;
}
