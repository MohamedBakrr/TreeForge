import { GitBranch } from 'lucide-react';

export function RepositoryLink() {
    return (
        <a
            href="https://github.com/MohamedBakrr/treeforge"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open the TreeForge GitHub repository in a new tab"
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 border border-border-main px-3 text-sm text-text-secondary transition-colors hover:border-[#555a53] hover:bg-surface hover:text-text-primary sm:px-4"
        >
            <GitBranch aria-hidden="true" size={16} />
            <span className="hidden sm:inline">GitHub</span>
        </a>
    );
}
