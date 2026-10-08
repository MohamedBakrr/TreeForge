<h1><img src="./public/treeforge.svg" alt="" width="40" align="center" /> TreeForge</h1>

> An interactive visual lab for understanding tree data structures, their invariants, and the algorithms that operate on them.

[![Live app](https://img.shields.io/badge/live-tree--forge.vercel.app-C4FF68?style=flat&labelColor=080909)](https://tree-forge.vercel.app)
[![Source](https://img.shields.io/badge/source-GitHub-171918?logo=github)](https://github.com/MohamedBakrr/treeforge)
[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

TreeForge pairs concise lessons with an interactive workspace. Learn a tree's rules, build real search trees, and follow traversals one operation at a time.

**Live application:** [tree-forge.vercel.app](https://tree-forge.vercel.app)  
**Source repository:** [github.com/MohamedBakrr/treeforge](https://github.com/MohamedBakrr/treeforge)

---

## Contents

- [What you can do](#what-you-can-do)
- [Learning paths](#learning-paths)
- [Interactive workspace](#interactive-workspace)
- [Routes](#routes)
- [Technology](#technology)
- [Run locally](#run-locally)
- [Quality checks](#quality-checks)
- [Architecture](#architecture)
- [Tree model and algorithms](#tree-model-and-algorithms)
- [Accessibility and responsive behavior](#accessibility-and-responsive-behavior)
- [SEO and deployment](#seo-and-deployment)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## What you can do

- Study four structures: general trees, binary trees, binary search trees (BSTs), and AVL trees.
- Insert, edit, and delete values in the BST and AVL workspaces.
- Reset a workspace to an empty tree.
- Run inorder, preorder, postorder, or level-order traversal with animated progress, explanatory events, and the final value sequence.
- Select nodes to inspect relationships and, in the AVL workspace, height and balance factor.
- Reposition nodes visually without changing their logical parent/child relationships.
- Pan and zoom the canvas, including pinch-to-zoom on touch screens.
- Practice with examples, invariant explanations, walkthroughs, and complexity tables.

## Learning paths

| Structure | Core idea | Lesson |
| --- | --- | --- |
| General tree | A node may have any number of children. | [`/learn/general-tree`](https://tree-forge.vercel.app/learn/general-tree) |
| Binary tree | A node has at most two child positions; values are not necessarily ordered. | [`/learn/binary-tree`](https://tree-forge.vercel.app/learn/binary-tree) |
| Binary search tree | Every left-subtree value is smaller and every right-subtree value is larger than the node. | [`/learn/bst`](https://tree-forge.vercel.app/learn/bst) |
| AVL tree | A BST that rebalances to keep subtree heights within one. | [`/learn/avl`](https://tree-forge.vercel.app/learn/avl) |

The general-tree and binary-tree pages are learning chapters backed by engine classes. The interactive editing workspace is currently available for BST and AVL.

## Interactive workspace

Open the [BST workspace](https://tree-forge.vercel.app/workspace/bst) or [AVL workspace](https://tree-forge.vercel.app/workspace/avl).

### Edit the structure

- **Insert node:** enter a whole-number value. Duplicate values are rejected.
- **Select node:** click or focus a node to open its inspector and edit controls.
- **Update and reposition:** enter a different value. The old value is removed and the new one inserted through the tree engine, preserving ordering and AVL balancing.
- **Delete node:** remove the selected value; AVL deletion restores balance.
- **Reset tree:** clear all nodes and return to the empty state.

### Navigate the canvas

- Drag a node to refine its visual position. Its parent and branch side remain fixed; the edge follows it.
- Use arrow keys to nudge a focused node; hold **Shift** for a larger step.
- Drag the canvas background to pan.
- Use the zoom controls or a two-finger pinch gesture to zoom. Reset canvas view restores the default zoom and pan.

Visual node offsets are presentation state; they do not alter the search-tree structure. Positions reset when the workspace is reloaded.

### Run a traversal

Choose a traversal order and select **Run selected traversal**. The workspace advances through explanatory events, highlights active and visited nodes, and shows the final sequence when complete. Pause or resume playback, or step through the trace manually.

| Order | Rule |
| --- | --- |
| Inorder | Left subtree → node → right subtree |
| Preorder | Node → left subtree → right subtree |
| Postorder | Left subtree → right subtree → node |
| Level order | Breadth-first, using a queue |

For a BST, inorder traversal yields values in ascending order. That property does not hold for a general binary tree.

## Routes

| Path | Purpose | Indexing |
| --- | --- | --- |
| `/` | Product introduction and discovery | Index |
| `/learn` | Learning hub | Index |
| `/learn/general-tree` | General-tree chapter | Index |
| `/learn/binary-tree` | Binary-tree chapter | Index |
| `/learn/bst` | BST chapter | Index |
| `/learn/avl` | AVL chapter | Index |
| `/workspace/bst` | Interactive BST editor | `noindex,follow` |
| `/workspace/avl` | Interactive AVL editor | `noindex,follow` |

Unknown paths display a branded not-found page.

## Technology

- **Application:** React 19, TypeScript 7 (strict checking), Vite 8
- **Routing:** React Router
- **Styling:** Tailwind CSS v4 and shared CSS design tokens
- **Visualization and motion:** SVG, Framer Motion, Lucide
- **Tree engines:** standalone TypeScript classes with trace events
- **Tests:** Vitest
- **Deployment target:** Vercel

## Run locally

### Prerequisites

- Node.js **20.19+** or **22.12+**
- npm (a version compatible with the installed Node.js)

### Install and start

```bash
git clone https://github.com/MohamedBakrr/treeforge.git
cd treeforge
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Vite prints the local development URL after startup. For a Unix-like shell, replace the PowerShell `Copy-Item` command with:

```bash
cp .env.example .env.local
```

You can also omit the local env-file step: the app defaults its canonical origin to the production URL.

## Quality checks

Run the complete validation sequence before submitting a change:

```bash
npm run check
```

The command runs each stage in order and stops if one fails:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

To run the tree-engine regression tests directly:

```bash
npx vitest run src/trees/engines.test.ts
```

Preview a production build locally:

```bash
npm run build
npm run preview
```

## Architecture

```text
src/
├── app/                 Application entry points, routes, SEO, shared app links
├── features/
│   ├── landing/pages/   Home page
│   ├── learning/pages/  Learning hub and tree chapters
│   └── workspace/pages/ BST/AVL workspace and traversal UI
├── store/               Redux Toolkit store setup
├── styles/              Tailwind entry point and global design tokens
├── trees/
│   ├── core/             Shared node and tree types
│   ├── trace/            Algorithm trace event model
│   ├── bst/              BST engine
│   ├── avl/              AVL engine
│   ├── binary-tree/      Binary-tree engine
│   ├── general-tree/     General-tree engine
│   └── engines.test.ts   BST/AVL mutation regression tests
└── visualization/
    ├── layout/           Binary-tree node layout
    └── TreeCanvas.tsx    Interactive SVG canvas
```

The workspace currently owns its active engine and UI state locally. The Redux store is registered at the application boundary, but workspace state is not currently persisted through Redux or local storage. Tree-engine traces are built from typed events such as `start`, `compare`, `insert`, `delete`, `rotate`, `visit`, and `end`.

## Tree model and algorithms

### Shared node relationships

Binary-tree nodes store a stable ID, numeric value, parent ID, and left/right child IDs. AVL nodes additionally store height and balance-factor metadata.

### Binary search tree

`BSTEngine` supports insertion, lookup, inorder traversal, deletion, clearing, and loading an existing node list. Insertion rejects duplicates. Deleting a node with two children replaces its value with its inorder successor before unlinking the successor. Parent and child links are repaired during deletion.

For a tree of height `h`:

| Operation | Cost |
| --- | --- |
| Search | `O(h)`; worst case `O(n)` |
| Insert | `O(h)`; worst case `O(n)` |
| Delete | `O(h)`; worst case `O(n)` |
| Full traversal | `O(n)` |

### AVL tree

`AVLEngine` inserts and deletes using BST ordering, updates subtree heights and balance factors, and applies single or double rotations when a node becomes unbalanced. With AVL height `O(log n)`, search, insert, and delete are `O(log n)`; a full traversal is `O(n)`.

### Binary and general trees

`BinaryTreeEngine` provides root and left/right child insertion, enforcing one child per side. `GeneralTreeEngine` supports insertion beneath a parent and preorder traversal. These engines underpin educational examples but are not currently exposed as editable workspace routes.

## Accessibility and responsive behavior

- Semantic headings, landmarks, labeled inputs, and accessible names are used throughout.
- Nodes are keyboard-focusable; **Enter** or **Space** selects a node, and arrow keys reposition it.
- Trace progress is announced through a live status region.
- The workspace supports small screens, touch zoom, visible focus styling, and the `prefers-reduced-motion` preference.
- Links that open GitHub use a new tab with `noopener noreferrer`.

## SEO and deployment

The app is deployed as a Vite single-page application on Vercel at [tree-forge.vercel.app](https://tree-forge.vercel.app). Vercel configuration supplies a route fallback for deep links and baseline response security headers.

SEO includes:

- Page-specific document titles and descriptions.
- Canonical URLs, Open Graph fields, and Twitter card metadata.
- `WebApplication` JSON-LD on the landing document.
- `public/robots.txt` and a sitemap of public learning routes.
- `noindex,follow` on interactive workspace routes.

Deploy by importing the GitHub repository into Vercel or running the Vercel CLI. The production domain is `tree-forge.vercel.app`. The configured production defaults are:

| Setting | Value |
| --- | --- |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |

After connecting the repository, configure `tree-forge.vercel.app` as the production domain in Vercel and make sure it matches the canonical URLs in `index.html`, `public/robots.txt`, and `public/sitemap.xml`. Update these files if the domain changes.

## Configuration

`.env.example` documents the public site-origin variable:

```dotenv
VITE_SITE_URL=https://tree-forge.vercel.app
```

Set `VITE_SITE_URL` in `.env.local` for local testing or in the Vercel project environment to control canonical links generated for client-side routes. Variables with the `VITE_` prefix are included in client code; never put secrets in them.

## Contributing

1. Create a focused branch for your change.
2. Keep algorithm changes in the relevant engine and cover invariants with tests.
3. Preserve keyboard, touch, and reduced-motion behavior for UI changes.
4. Run `npm run check`.
5. Open a pull request with a concise description and screenshots for visual changes.

## License

This project is licensed under the MIT License. See [`LICENSE`](./LICENSE) for the full text.
