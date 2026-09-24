import { useEffect } from 'react';
import { site } from '../config/site';
import { SITE_DESCRIPTION, SITE_TITLE, type PageMeta } from '../lib/seo';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

/** Keeps <title>, description, Open Graph and canonical in sync with the route. */
export function useDocumentMeta(meta: Partial<PageMeta> | null) {
  const title = meta?.title ?? SITE_TITLE;
  const description = meta?.description ?? SITE_DESCRIPTION;
  const path = meta?.path;
  useEffect(() => {
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    if (site.url && path !== undefined) {
      const href = site.url + path;
      setMeta('property', 'og:url', href);
      let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = href;
    }
  }, [title, description, path]);
}
