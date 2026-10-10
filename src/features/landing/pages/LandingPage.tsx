import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../../../app/SeoHead';
import { RepositoryLink } from '../../../app/RepositoryLink';

const treeNodes = [
    { value: 50, x: 340, y: 78, root: true },
    { value: 30, x: 204, y: 206 },
    { value: 70, x: 476, y: 206 },
    { value: 20, x: 128, y: 334 },
    { value: 40, x: 264, y: 334 },
    { value: 60, x: 416, y: 334 },
    { value: 80, x: 552, y: 334 },
];

const treeEdges = [
    [340, 78, 204, 206],
    [340, 78, 476, 206],
    [204, 206, 128, 334],
    [204, 206, 264, 334],
    [476, 206, 416, 334],
    [476, 206, 552, 334],
];

const learningSteps = [
    {
        number: '01',
        title: 'See the structure',
        text: 'Start with the relationships between nodes—not a page of syntax to memorize.',
    },
    {
        number: '02',
        title: 'Follow each decision',
        text: 'Trace comparisons and traversal order one operation at a time.',
    },
    {
        number: '03',
        title: 'Make it your own',
        text: 'Change the input and watch the actual tree respond.',
    },
];

export function LandingPage() {
    return (
        <div className="min-h-screen bg-main-bg text-text-primary">
            <SeoHead
                title="TreeForge | Learn Tree Data Structures Visually"
                description="Learn binary search trees and AVL trees by building them, tracing operations, and exploring interactive visualizations."
                path="/"
            />
            <header className="mx-auto max-w-[1360px] px-[var(--page-gutter)]">
                <div className="flex h-[76px] items-center justify-between border-b border-border-main">
                    <Link to="/" aria-label="TreeForge home" className="flex shrink-0 items-center gap-3">
                        <img src="/treeforge.svg" alt="" className="h-9 w-9" />
                        <span className="hidden text-xs font-semibold tracking-[0.2em] text-text-primary min-[380px]:inline">
                            TREEFORGE
                        </span>
                    </Link>

                    <nav aria-label="Main navigation" className="flex items-center gap-2 text-sm sm:gap-5">
                        <RepositoryLink />
                        <Link to="/learn" className="hidden text-text-secondary transition-colors hover:text-text-primary sm:inline">Learn</Link>
                        <Link
                            to="/workspace/bst"
                            aria-label="Open the binary search tree workspace"
                            className="tf-button tf-button-secondary min-h-10 shrink-0 whitespace-nowrap px-3 sm:px-4"
                        >
                            <span className="sm:hidden">Workspace</span>
                            <span className="hidden sm:inline">Open workspace</span>
                            <ArrowRight aria-hidden="true" size={15} />
                        </Link>
                    </nav>
                </div>
            </header>

            <main>
                <section className="mx-auto grid max-w-[1360px] items-center gap-12 px-[var(--page-gutter)] pb-16 pt-14 md:pt-20 lg:min-h-[min(760px,calc(100svh-76px))] lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:gap-10 lg:py-16">
                    <div className="max-w-[680px]">
                        <p className="mb-6 flex items-center gap-3 font-mono text-xs tracking-[0.14em] text-text-secondary">
                            <span className="h-px w-8 bg-accent-lime" />
                            A VISUAL LAB FOR DATA STRUCTURES
                        </p>

                        <h1 className="max-w-[12ch] text-[clamp(3.25rem,6.2vw,5.75rem)] leading-[0.98] tracking-[-0.065em] text-text-primary">
                            Understand the shape of <span className="text-accent-lime">an algorithm.</span>
                        </h1>

                        <p className="mt-7 max-w-[34rem] text-base leading-7 text-text-secondary md:text-lg md:leading-8">
                            Explore tree structures by building them, tracing their decisions, and seeing how each operation changes the whole.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link to="/workspace/bst" className="tf-button tf-button-primary px-5">
                                Build a tree <ArrowRight aria-hidden="true" size={16} />
                            </Link>
                            <Link to="/learn" className="tf-button tf-button-secondary px-5">
                                Explore the guide
                            </Link>
                        </div>

                        <p className="mt-8 max-w-[32rem] border-l border-border-main pl-4 text-sm leading-6 text-text-muted">
                            No setup. No hidden steps. Just the structure, the operation, and the reasoning between them.
                        </p>
                    </div>

                    <figure className="relative min-w-0 border border-border-main bg-[#0d0f0e] p-4 sm:p-6">
                        <div className="mb-5 flex items-start justify-between gap-4 border-b border-border-main pb-4">
                            <div>
                                <p className="font-mono text-xs text-text-muted">STRUCTURE STUDY / 01</p>
                                <h2 className="mt-1 text-lg font-medium tracking-tight">Binary search tree</h2>
                            </div>
                            <span className="mt-1 inline-flex items-center gap-2 font-mono text-xs text-text-secondary">
                                <span className="h-1.5 w-1.5 rounded-full bg-accent-lime" />
                                ORDERED
                            </span>
                        </div>

                        <svg
                            aria-labelledby="tree-preview-title tree-preview-description"
                            className="block h-auto w-full"
                            viewBox="0 0 680 410"
                            role="img"
                        >
                            <title id="tree-preview-title">Example binary search tree</title>
                            <desc id="tree-preview-description">
                                The root value 50 branches to 30 and 70. Values smaller than each parent are on the left and larger values are on the right.
                            </desc>
                            <defs>
                                <pattern id="tree-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#292c29" strokeOpacity="0.48" strokeWidth="1" />
                                </pattern>
                            </defs>
                            <rect width="680" height="410" fill="url(#tree-grid)" />

                            <g fill="none" stroke="#737871" strokeOpacity="0.72" strokeWidth="1.5">
                                {treeEdges.map(([x1, y1, x2, y2]) => (
                                    <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />
                                ))}
                            </g>

                            {treeNodes.map((node) => (
                                <g key={node.value}>
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={node.root ? 25 : 21}
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

                            <text x="136" y="388" fill="#858a82" fontFamily="ui-monospace, monospace" fontSize="11">LEFT &lt; PARENT</text>
                            <text x="442" y="388" fill="#858a82" fontFamily="ui-monospace, monospace" fontSize="11">RIGHT &gt; PARENT</text>
                        </svg>

                        <figcaption className="mt-3 flex items-center justify-between gap-3 border-t border-border-main pt-4 text-xs text-text-muted">
                            <span>Each branch preserves the ordering rule.</span>
                            <Link to="/workspace/bst" aria-label="Open the binary search tree workspace">
                                <ArrowDownRight aria-hidden="true" size={17} className="text-accent-lime" />
                            </Link>
                        </figcaption>
                    </figure>
                </section>

                <section className="border-y border-border-main bg-[#0c0e0d]">
                    <div className="mx-auto grid max-w-[1360px] gap-10 px-[var(--page-gutter)] py-16 md:py-20 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
                        <div>
                            <p className="tf-eyebrow">LEARN THROUGH THE PROCESS</p>
                            <h2 className="mt-4 max-w-[12ch] text-4xl leading-[1.02] tracking-[-0.055em] md:text-5xl">
                                From abstract rules to visible behavior.
                            </h2>
                        </div>

                        <ol className="divide-y divide-border-main">
                            {learningSteps.map((step) => (
                                <li key={step.number} className="grid gap-3 py-5 sm:grid-cols-[3rem_1fr] sm:gap-5">
                                    <span className="font-mono text-xs text-accent-lime">{step.number}</span>
                                    <div>
                                        <h3 className="text-lg font-medium">{step.title}</h3>
                                        <p className="mt-1 max-w-xl text-sm leading-6 text-text-secondary">{step.text}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="mx-auto max-w-[1360px] px-[var(--page-gutter)] py-16 md:py-20">
                    <div className="flex flex-col gap-5 border-b border-border-main pb-6 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="tf-eyebrow">THE LEARNING GUIDE</p>
                            <h2 className="mt-3 text-4xl tracking-[-0.055em] md:text-5xl">Four ways to branch out.</h2>
                        </div>
                        <Link to="/learn" className="inline-flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-accent-lime">
                            Browse all concepts <ArrowRight aria-hidden="true" size={15} />
                        </Link>
                    </div>

                    <div className="grid gap-x-10 md:grid-cols-2">
                        {[
                            ['01', 'General tree', 'A node may have any number of children.', '/learn/general-tree'],
                            ['02', 'Binary tree', 'Each node has at most two child positions.', '/learn/binary-tree'],
                            ['03', 'Binary search tree', 'Ordered branches make search systematic.', '/learn/bst'],
                            ['04', 'AVL tree', 'Height balance keeps search paths short.', '/learn/avl'],
                        ].map(([number, title, description, route]) => (
                            <Link
                                key={number}
                                to={route}
                                className="group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-b border-border-main py-5"
                            >
                                <span className="font-mono text-xs text-text-muted">{number}</span>
                                <span>
                                    <span className="block text-lg font-medium text-text-primary transition-colors group-hover:text-accent-lime">{title}</span>
                                    <span className="mt-1 block text-sm leading-5 text-text-muted">{description}</span>
                                </span>
                                <ArrowRight aria-hidden="true" size={16} className="text-text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent-lime" />
                            </Link>
                        ))}
                    </div>
                </section>
            </main>

            <footer className="border-t border-border-main">
                <div className="mx-auto flex max-w-[1360px] flex-col gap-3 px-[var(--page-gutter)] py-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold tracking-[0.18em] text-text-secondary">TREEFORGE</span>
                    <span>A hands-on guide to tree data structures.</span>
                    <Link to="/learn" className="transition-colors hover:text-text-primary">Learning guide</Link>
                </div>
            </footer>
        </div>
    );
}
