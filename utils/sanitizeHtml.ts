// Nettoyage du HTML des descriptions d'articles (éditeur de texte enrichi).
// Liste blanche de balises, aucun attribut conservé sauf href (http, https, mailto ou lien interne) sur <a>.
// Utilisé à l'enregistrement (serveur) ET à l'affichage (page produit) : double protection.

const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'ul', 'ol', 'li',
  'h2', 'h3', 'h4', 'blockquote', 'a', 'code', 'pre', 'hr', 'div', 'span',
])
const VOID_TAGS = new Set(['br', 'hr'])

export function sanitizeHtml(input: unknown): string {
  let html = String(input ?? '')
  html = html.replace(/<!--[\s\S]*?-->/g, '')
  // contenus dangereux supprimés avec leur texte
  html = html.replace(/<(script|style|iframe|object|embed|svg|math|form|textarea|select|button|noscript)\b[\s\S]*?<\/\1\s*>/gi, '')
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (match, tag: string, attrs: string) => {
    const name = tag.toLowerCase()
    if (!ALLOWED_TAGS.has(name)) return ''
    if (match.startsWith('</')) return VOID_TAGS.has(name) ? '' : `</${name}>`
    if (name === 'a') {
      const m = /href\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs)
      const url = (m?.[1] ?? m?.[2] ?? m?.[3] ?? '').trim()
      if (/^(https?:\/\/|mailto:|\/)/i.test(url)) {
        return `<a href="${url.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer nofollow">`
      }
      return '<a>'
    }
    return `<${name}>`
  })
}

/** Texte brut d'un contenu HTML (méta description SEO, test de champ vide…). */
export function htmlToText(input: unknown): string {
  return String(input ?? '')
    .replace(/<(script|style|iframe|object|embed|svg|math|noscript)\b[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(br|\/p|\/div|\/li|\/h[2-4]|\/blockquote)\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Valeur existante (texte brut avec retours à la ligne, ou HTML) → HTML à afficher dans l'éditeur. */
export function toEditorHtml(value: unknown): string {
  const raw = String(value ?? '')
  if (!raw) return ''
  if (/<[a-z][\s\S]*>/i.test(raw)) return sanitizeHtml(raw)
  return raw
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\r?\n/g, '<br>')
}
