import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SeoHead } from '../../../app/SeoHead';
import { RepositoryLink } from '../../../app/RepositoryLink';

const treeTypes = [
    {
        id: 'general-tree',
        number: '01',
        name: 'General tree',
        summary: 'A node can connect to any number of children.',
        principle: 'Relationships first',
    },
    {
        id: 'binary-tree',
        number: '02',
        name: 'Binary tree',
        summary: 'Each node has at most two child positions.',
        principle: 'Two branches maximum',
    },
    {
        id: 'bst',
        number: '03',
        name: 'Binary search tree',
        summary: 'An ordering rule makes search paths meaningful.',
        principle: 'Left < node < right',
    },
    {
        id: 'avl',
        number: '04',
        name: 'AVL tree',
        summary: 'A balanced search tree that keeps paths short.',
        principle: 'Balance after insert',
    },
];

export function LearningHub() {
    return (
        <div className="min-h-screen bg-main-bg text-text-primary">
            <SeoHead
                title="Tree Data Structures Learning Guide | TreeForge"
                description="Explore clear, visual chapters on general trees, binary trees, binary search trees, and AVL trees."
                path="/learn"
            />
            <header className="mx-auto max-w-[1280px] px-[var(--page-gutter)]">
                <div className="flex h-[76px] items-center justify-between border-b border-border-main">
                    <Link to="/" className="text-xs font-semibold tracking-[0.2em]">TREEFORGE</Link>
                    <nav aria-label="Main navigation" className="flex items-center gap-3 sm:gap-5">
                        <Link to="/" className="text-sm text-text-secondary transition-colors hover:text-text-primary">Home</Link>
                        <RepositoryLink />
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-[1120px] px-[var(--page-gutter)] pb-20 pt-14 md:pt-20">
                <header className="grid gap-6 border-b border-border-main pb-10 md:grid-cols-[1fr_0.7fr] md:items-end">
                    <div>
                        <p className="tf-eyebrow text-accent-lime">LEARNING GUIDE / 04 CHAPTERS</p>
                        <h1 className="mt-4 max-w-[11ch] text-5xl tracking-[-0.06em] md:text-7xl">Start with the structure.</h1>
                    </div>
                    <p className="max-w-lg text-base leading-7 text-text-secondary">
                        Move from flexible parent-child relationships to balanced search. Each chapter explains what the structure guarantees—and what it does not.
                    </p>
                </header>

                <ol className="mt-3">
                    {treeTypes.map((tree) => (
                        <li key={tree.id} id={tree.id} className="border-b border-border-main">
                            <Link
                                to={`/learn/${tree.id}`}
                                className="group grid gap-3 py-6 transition-colors sm:grid-cols-[4rem_1fr_1fr_auto] sm:items-center sm:gap-6"
                            >
                                <span className="font-mono text-xs text-text-muted">{tree.number}</span>
                                <span className="text-xl font-medium tracking-tight text-text-primary transition-colors group-hover:text-accent-lime md:text-2xl">
                                    {tree.name}
                                </span>
                                <span className="max-w-md text-sm leading-6 text-text-secondary">{tree.summary}</span>
                                <span className="inline-flex items-center gap-3 text-xs text-text-muted sm:justify-self-end">
                                    <span className="hidden font-mono sm:inline">{tree.principle}</span>
                                    <ArrowRight aria-hidden="true" size={17} className="transition-transform group-hover:translate-x-1 group-hover:text-accent-lime" />
                                </span>
                            </Link>
                        </li>
                    ))}
                </ol>

                <div className="mt-14 grid gap-6 border-t border-border-main pt-8 md:grid-cols-[1fr_1fr]">
                    <div>
                        <p className="tf-eyebrow">A NOTE ON THE WORKSPACE</p>
                        <h2 className="mt-3 max-w-[15ch] text-3xl tracking-[-0.045em]">Concepts first. Experiment next.</h2>
                    </div>
                    <div className="flex flex-col items-start justify-between gap-5">
                        <p className="max-w-lg text-sm leading-6 text-text-secondary">
                            Interactive insertion and traversal are currently available for binary search and AVL trees. The other chapters focus on the structural rules without presenting them as implemented workspace modes.
                        </p>
                        <Link to="/workspace/bst" className="inline-flex items-center gap-2 text-sm font-medium text-accent-lime hover:text-accent-lime-hover">
                            Open the BST workspace <ArrowRight aria-hidden="true" size={15} />
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
