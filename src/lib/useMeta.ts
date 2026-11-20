import { useEffect } from 'react'

const DEFAULT_TITLE = 'Homestead · Your page, your address, your home online'

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/** Sets the document title and description/OG tags for the current page. */
export function useMeta(title: string, description: string): void {
  useEffect(() => {
    document.title = title
    setMeta('meta[name="description"]', 'name', 'description', description)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', description)
    return () => { document.title = DEFAULT_TITLE }
  }, [title, description])
}
