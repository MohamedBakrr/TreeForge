import { useEffect } from 'react';

interface SeoHeadProps {
    title: string;
    description: string;
    path: string;
    noIndex?: boolean;
}

const siteUrl = (import.meta.env.VITE_SITE_URL || 'https://tree-forge.vercel.app').replace(/\/$/, '');

function setMeta(attribute: 'name' | 'property', key: string, content: string) {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
    if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, key);
        document.head.append(element);
    }
    element.content = content;
}

export function SeoHead({ title, description, path, noIndex = false }: SeoHeadProps) {
    useEffect(() => {
        const canonicalUrl = new URL(path, `${siteUrl}/`).href;
        document.title = title;
        setMeta('name', 'description', description);
        setMeta('name', 'robots', noIndex ? 'noindex,follow' : 'index,follow');
        setMeta('property', 'og:type', 'website');
        setMeta('property', 'og:site_name', 'TreeForge');
        setMeta('property', 'og:title', title);
        setMeta('property', 'og:description', description);
        setMeta('property', 'og:url', canonicalUrl);
        setMeta('name', 'twitter:card', 'summary');
        setMeta('name', 'twitter:title', title);
        setMeta('name', 'twitter:description', description);

        let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.append(canonical);
        }
        canonical.href = canonicalUrl;
    }, [description, noIndex, path, title]);

    return null;
}
