import { createBrowserRouter, Link } from 'react-router-dom'
import { LandingPage } from '../features/landing/pages/LandingPage'
import { WorkspacePage } from '../features/workspace/pages/WorkspacePage'
import { LearningHub } from '../features/learning/pages/LearningHub'
import { TreeLessonPage } from '../features/learning/pages/TreeLessonPage'
import { SeoHead } from './SeoHead'

function NotFoundPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
            <SeoHead
                title="Page not found | TreeForge"
                description="The requested page could not be found."
                path="/404"
                noIndex
            />
            <p className="tf-eyebrow text-accent-lime">404 / PATH NOT FOUND</p>
            <h1 className="mt-4 text-4xl tracking-[-0.05em] md:text-6xl">This branch ends here.</h1>
            <p className="mt-4 max-w-md text-base leading-7 text-text-secondary">
                That address does not lead to a TreeForge page.
            </p>
            <Link to="/" className="tf-button tf-button-secondary mt-7">Return home</Link>
        </main>
    )
}

export const router = createBrowserRouter([
    {
        path: '/',
        element: <LandingPage />,
    },
    {
        path: '/learn',
        element: <LearningHub />
    },
    {
        path: '/learn/:treeType',
        element: <TreeLessonPage />
    },
    {
        path: '/workspace/:treeType',
        element: <WorkspacePage />,
    },
    {
        path: '*',
        element: <NotFoundPage />,
    }
])
