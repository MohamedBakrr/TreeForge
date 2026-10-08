import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { SeoHead } from '../../../app/SeoHead';
import { RepositoryLink } from '../../../app/RepositoryLink';

interface DiagramNode {
    value: string;
    x: number;
    y: number;
    root?: boolean;
}

interface TreeLesson {
    title: string;
    subtitle: string;
    concept: string;
    rule: string;
    nodes: DiagramNode[];
    edges: Array<[number, number, number, number]>;
    exampleNote: string;
    walkthrough: Array<{ step: string; title: string; detail: string }>;
    complexity: Array<{ operation: string; typical: string; worst: string }>;
    misconception: string;
    practice: string;
    workspace?: string;
}

const lessons: Record<string, TreeLesson> = {
    'general-tree': {
        title: 'General tree',
        subtitle: 'A hierarchy built from parent-child relationships, with no fixed limit on the number of children.',
        concept: 'A general tree represents nested relationships. Every node can have zero or more children; the root has no parent, and each other node has exactly one parent.',
        rule: 'A node may have any number of children.',
        nodes: [
            { value: 'A', x: 340, y: 72, root: true },
            { value: 'B', x: 150, y: 208 },
            { value: 'C', x: 340, y: 208 },
            { value: 'D', x: 530, y: 208 },
            { value: 'E', x: 100, y: 344 },
            { value: 'F', x: 200, y: 344 },
        ],
        edges: [[340, 72, 150, 208], [340, 72, 340, 208], [340, 72, 530, 208], [150, 208, 100, 344], [150, 208, 200, 344]],
        exampleNote: 'A has three children; B has two. The number of children is not fixed.',
        walkthrough: [
            { step: '01', title: 'Choose the root', detail: 'Begin at A, the node with no parent.' },
            { step: '02', title: 'Follow child links', detail: 'A may lead to B, C, and D; B may lead to E and F.' },
            { step: '03', title: 'Visit each node once', detail: 'A traversal processes all n nodes in O(n) time.' },
        ],
        complexity: [
            { operation: 'Find a value', typical: 'O(n)', worst: 'O(n)' },
            { operation: 'Traverse the tree', typical: 'O(n)', worst: 'O(n)' },
            { operation: 'Space for n nodes', typical: 'O(n)', worst: 'O(n)' },
        ],
        misconception: 'A tree is not necessarily binary. A general tree node may have three, ten, or no children.',
        practice: 'Starting at A, write the preorder sequence if children are visited from left to right.',
    },
    'binary-tree': {
        title: 'Binary tree',
        subtitle: 'A tree where each node has at most two child positions: left and right.',
        concept: 'The binary-tree property constrains shape, not value order. A left child is not automatically smaller than its parent.',
        rule: 'Each node has zero, one, or two children.',
        nodes: [
            { value: '8', x: 340, y: 72, root: true },
            { value: '14', x: 190, y: 222 },
            { value: '3', x: 490, y: 222 },
            { value: '11', x: 115, y: 360 },
        ],
        edges: [[340, 72, 190, 222], [340, 72, 490, 222], [190, 222, 115, 360]],
        exampleNote: '14 is on the left of 8 and 3 is on the right. This is a valid binary tree, but not a search tree.',
        walkthrough: [
            { step: '01', title: 'Start at the root', detail: 'The root has two distinct child positions.' },
            { step: '02', title: 'Follow a chosen order', detail: 'Preorder, inorder, and postorder visit the same nodes in different sequences.' },
            { step: '03', title: 'Do not assume sorting', detail: 'Finding a value may require checking every node: O(n).' },
        ],
        complexity: [
            { operation: 'Find a value', typical: 'O(n)', worst: 'O(n)' },
            { operation: 'Traverse the tree', typical: 'O(n)', worst: 'O(n)' },
            { operation: 'Space for n nodes', typical: 'O(n)', worst: 'O(n)' },
        ],
        misconception: '“Binary” only means at most two children. The values are not ordered unless another rule, such as the BST invariant, is added.',
        practice: 'For the example tree, compare preorder (root, left, right) with inorder (left, root, right).',
    },
    bst: {
        title: 'Binary search tree',
        subtitle: 'An ordering invariant turns each comparison into a choice of branch.',
        concept: 'For every node, all values in its left subtree are smaller and all values in its right subtree are larger. Searching follows one root-to-leaf path.',
        rule: 'Left subtree < node < right subtree.',
        nodes: [
            { value: '50', x: 340, y: 72, root: true },
            { value: '30', x: 190, y: 210 },
            { value: '70', x: 490, y: 210 },
            { value: '20', x: 115, y: 350 },
            { value: '40', x: 265, y: 350 },
            { value: '60', x: 415, y: 350 },
            { value: '80', x: 565, y: 350 },
        ],
        edges: [[340, 72, 190, 210], [340, 72, 490, 210], [190, 210, 115, 350], [190, 210, 265, 350], [490, 210, 415, 350], [490, 210, 565, 350]],
        exampleNote: 'Every value in the left branch is below 50; every value in the right branch is above 50.',
        walkthrough: [
            { step: '01', title: 'Compare at the root', detail: 'To find 60, compare it with 50.' },
            { step: '02', title: 'Choose one branch', detail: '60 is greater than 50, so continue right to 70.' },
            { step: '03', title: 'Repeat until found', detail: '60 is less than 70, so continue left. Each comparison discards the other branch.' },
        ],
        complexity: [
            { operation: 'Search / insert', typical: 'O(log n)', worst: 'O(n)' },
            { operation: 'Inorder traversal', typical: 'O(n)', worst: 'O(n)' },
            { operation: 'Space for n nodes', typical: 'O(n)', worst: 'O(n)' },
        ],
        misconception: 'A BST is not always balanced. Inserting sorted input can create a chain, making search O(n).',
        practice: 'Trace a search for 60. Record each compared value and the branch chosen.',
        workspace: 'bst',
    },
    avl: {
        title: 'AVL tree',
        subtitle: 'A self-balancing binary search tree that maintains short search paths.',
        concept: 'An AVL tree follows the BST ordering rule and keeps each node’s left and right subtree heights within one of each other. Rotations restore balance after insertion.',
        rule: 'BST ordering, and |balance factor| ≤ 1 at every node.',
        nodes: [
            { value: '30', x: 340, y: 72, root: true },
            { value: '20', x: 190, y: 210 },
            { value: '40', x: 490, y: 210 },
            { value: '10', x: 115, y: 350 },
            { value: '25', x: 265, y: 350 },
            { value: '35', x: 415, y: 350 },
            { value: '50', x: 565, y: 350 },
        ],
        edges: [[340, 72, 190, 210], [340, 72, 490, 210], [190, 210, 115, 350], [190, 210, 265, 350], [490, 210, 415, 350], [490, 210, 565, 350]],
        exampleNote: 'The search ordering is preserved while the tree’s height stays logarithmic.',
        walkthrough: [
            { step: '01', title: 'Insert as in a BST', detail: 'Place the new value according to left-smaller, right-larger ordering.' },
            { step: '02', title: 'Update heights', detail: 'Walk back toward the root and calculate each ancestor’s balance factor.' },
            { step: '03', title: 'Rotate if needed', detail: 'An LL, RR, LR, or RL imbalance is repaired with one or two rotations.' },
        ],
        complexity: [
            { operation: 'Search', typical: 'O(log n)', worst: 'O(log n)' },
            { operation: 'Insert', typical: 'O(log n)', worst: 'O(log n)' },
            { operation: 'Inorder traversal', typical: 'O(n)', worst: 'O(n)' },
        ],
        misconception: 'AVL balance is based on subtree heights, not on having identical numbers of nodes on each side.',
        practice: 'Insert 10, then 20, then 30 into an empty AVL tree. Identify the imbalance and the rotation that repairs it.',
        workspace: 'avl',
    },
};

function StructureDiagram({ lesson }: { lesson: TreeLesson }) {
    return (
        <svg
            aria-labelledby="lesson-diagram-title lesson-diagram-description"
            className="block h-auto w-full"
            viewBox="0 0 680 410"
            role="img"
        >
            <title id="lesson-diagram-title">{lesson.title} example</title>
            <desc id="lesson-diagram-description">{lesson.exampleNote}</desc>
            <g fill="none" stroke="#737871" strokeOpacity="0.8" strokeWidth="1.5">
                {lesson.edges.map(([x1, y1, x2, y2]) => (
                    <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />
                ))}
            </g>
            {lesson.nodes.map((node) => (
                <g key={`${node.value}-${node.x}-${node.y}`}>
                    <circle
                        cx={node.x}
                        cy={node.y}
                        r={node.root ? 24 : 21}
                        fill={node.root ? '#c4ff68' : '#171918'}
                        stroke={node.root ? '#c4ff68' : '#555a53'}
                        strokeWidth="1.5"
                    />
                    <text
                        x={node.x}
                        y={node.y + 5}
                        fill={node.root ? '#080909' : '#f2f3ee'}
                        fontFamily="ui-monospace, monospace"
                        fontSize="13"
                        fontWeight="600"
                        textAnchor="middle"
                    >
                        {node.value}
                    </text>
                </g>
            ))}
        </svg>
    );
}

export function TreeLessonPage() {
    const { treeType } = useParams<{ treeType: string }>();
    const lesson = treeType ? lessons[treeType] : undefined;

    if (!lesson) return <Navigate to="/learn" replace />;

    return (
        <div className="min-h-screen bg-main-bg text-text-primary">
            <SeoHead
                title={`${lesson.title}: Rules, Traversals & Complexity | TreeForge`}
                description={`${lesson.subtitle} Learn the key invariant, follow an operation walkthrough, and review time and space complexity.`}
                path={`/learn/${treeType}`}
            />
            <header className="mx-auto max-w-[1280px] px-[var(--page-gutter)]">
                <div className="flex h-[76px] items-center justify-between border-b border-border-main">
                    <Link to="/" className="text-xs font-semibold tracking-[0.2em]">TREEFORGE</Link>
                    <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-5">
                        <Link to="/learn" className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-text-primary">
                            <ArrowLeft aria-hidden="true" size={15} /> All concepts
                        </Link>
                        <RepositoryLink />
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-[1120px] px-[var(--page-gutter)] pb-24">
                <article>
                    <header className="grid gap-8 border-b border-border-main py-14 md:grid-cols-[1.1fr_0.9fr] md:items-end md:py-20">
                        <div>
                            <p className="tf-eyebrow text-accent-lime">TREE STRUCTURES / CHAPTER</p>
                            <h1 className="mt-4 text-5xl tracking-[-0.06em] md:text-7xl">{lesson.title}</h1>
                        </div>
                        <p className="max-w-lg text-base leading-7 text-text-secondary md:text-lg">{lesson.subtitle}</p>
                    </header>

                    <section className="grid gap-10 border-b border-border-main py-12 md:grid-cols-[0.85fr_1.15fr] md:py-16">
                        <div>
                            <p className="tf-eyebrow">THE CORE IDEA</p>
                            <h2 className="mt-3 text-3xl tracking-[-0.045em]">What defines this structure?</h2>
                        </div>
                        <div>
                            <p className="text-base leading-7 text-text-secondary">{lesson.concept}</p>
                            <p className="mt-6 border-l-2 border-accent-lime pl-4 text-base font-medium leading-7 text-text-primary">
                                {lesson.rule}
                            </p>
                        </div>
                    </section>

                    <section className="grid gap-8 border-b border-border-main py-12 md:grid-cols-[0.72fr_1.28fr] md:py-16">
                        <div>
                            <p className="tf-eyebrow">STRUCTURE / EXAMPLE</p>
                            <h2 className="mt-3 text-3xl tracking-[-0.045em]">Read the branches.</h2>
                            <p className="mt-4 text-sm leading-6 text-text-secondary">{lesson.exampleNote}</p>
                        </div>
                        <div className="border border-border-main bg-[#0d0f0e] p-3 sm:p-5">
                            <StructureDiagram lesson={lesson} />
                        </div>
                    </section>

                    <section className="grid gap-10 border-b border-border-main py-12 md:grid-cols-[0.72fr_1.28fr] md:py-16">
                        <div>
                            <p className="tf-eyebrow">OPERATION WALKTHROUGH</p>
                            <h2 className="mt-3 text-3xl tracking-[-0.045em]">Follow one operation.</h2>
                        </div>
                        <ol className="divide-y divide-border-main">
                            {lesson.walkthrough.map((step) => (
                                <li key={step.step} className="grid gap-3 py-4 sm:grid-cols-[3rem_1fr] sm:gap-5">
                                    <span className="font-mono text-xs text-accent-lime">{step.step}</span>
                                    <div>
                                        <h3 className="text-lg font-medium">{step.title}</h3>
                                        <p className="mt-1 text-sm leading-6 text-text-secondary">{step.detail}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>

                    <section className="grid gap-10 border-b border-border-main py-12 md:grid-cols-[0.72fr_1.28fr] md:py-16">
                        <div>
                            <p className="tf-eyebrow">COST MODEL</p>
                            <h2 className="mt-3 text-3xl tracking-[-0.045em]">Time and space.</h2>
                            <p className="mt-4 text-sm leading-6 text-text-muted">Complexity depends on the operation and the shape of the structure.</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border-main text-xs text-text-muted">
                                        <th scope="col" className="py-3 pr-4 font-medium">Operation</th>
                                        <th scope="col" className="py-3 pr-4 font-medium">Typical</th>
                                        <th scope="col" className="py-3 font-medium">Worst case</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lesson.complexity.map((row) => (
                                        <tr key={row.operation} className="border-b border-border-main/70">
                                            <th scope="row" className="py-3 pr-4 font-medium text-text-primary">{row.operation}</th>
                                            <td className="py-3 pr-4 font-mono text-text-secondary">{row.typical}</td>
                                            <td className="py-3 font-mono text-text-secondary">{row.worst}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="grid gap-10 border-b border-border-main py-12 md:grid-cols-2 md:py-16">
                        <div>
                            <p className="tf-eyebrow">COMMON MISCONCEPTION</p>
                            <h2 className="mt-3 text-3xl tracking-[-0.045em]">Keep the invariant in view.</h2>
                            <p className="mt-4 text-sm leading-6 text-text-secondary">{lesson.misconception}</p>
                        </div>
                        <div className="border-l border-border-main pl-6">
                            <p className="tf-eyebrow">PRACTICE</p>
                            <h2 className="mt-3 text-2xl tracking-[-0.04em]">Try it on paper.</h2>
                            <p className="mt-3 text-sm leading-6 text-text-secondary">{lesson.practice}</p>
                        </div>
                    </section>

                    <section className="flex flex-col gap-5 py-10 sm:flex-row sm:items-center sm:justify-between">
                        <p className="max-w-xl text-sm leading-6 text-text-secondary">
                            {lesson.workspace
                                ? 'Test the same rules with real insertions and step-by-step traversal in the interactive workspace.'
                                : 'Continue through the guide to compare this structure with search trees and balanced trees.'}
                        </p>
                        {lesson.workspace ? (
                            <Link to={`/workspace/${lesson.workspace}`} className="tf-button tf-button-primary shrink-0">
                                Open interactive workspace <ArrowRight aria-hidden="true" size={16} />
                            </Link>
                        ) : (
                            <Link to="/learn" className="tf-button tf-button-secondary shrink-0">
                                Back to all concepts <ArrowRight aria-hidden="true" size={16} />
                            </Link>
                        )}
                    </section>
                </article>
            </main>
        </div>
    );
}
