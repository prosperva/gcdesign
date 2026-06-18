import { useRef, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GcdsButton } from '@gcds-core/components-react'

interface RichTextEditorProps {
  id: string
  label: string
  value: string
  onChange: (html: string) => void
}

interface Formats {
  bold: boolean
  italic: boolean
  underline: boolean
  strikethrough: boolean
  formatBlock: string
  fontSize: string
  ul: boolean
  ol: boolean
  inTable: boolean
}

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']

const ALLOWED_TAGS = new Set([
  'P','H1','H2','H3','H4','H5','H6','BR','STRONG','B','EM','I','U','S','STRIKE','DEL',
  'UL','OL','LI','TABLE','THEAD','TBODY','TR','TH','TD','FONT','SPAN',
])

// Word encodes list number formats (decimal, alpha-lower, roman-lower, …) in
// @list CSS rules in the clipboard <style> block. Parse them so nested lists
// get the right list-style-type instead of all defaulting to decimal.
function parseWordListFormats(doc: Document): Map<string, string> {
  const map = new Map<string, string>()
  const styleText = Array.from(doc.querySelectorAll('style')).map(s => s.textContent ?? '').join('\n')
  const cssTypeMap: Record<string, string> = {
    'decimal':     'decimal',
    'alpha-lower': 'lower-alpha',
    'alpha-upper': 'upper-alpha',
    'roman-lower': 'lower-roman',
    'roman-upper': 'upper-roman',
  }
  const ruleRe = /@list\s+(l\d+):level(\d+)\s*\{([^}]*)\}/gi
  let m: RegExpExecArray | null
  while ((m = ruleRe.exec(styleText)) !== null) {
    const fmtMatch = /mso-level-number-format\s*:\s*([a-z-]+)/i.exec(m[3])
    if (fmtMatch) {
      const css = cssTypeMap[fmtMatch[1]]
      if (css) map.set(`${m[1]}:${m[2]}`, css)
    }
  }
  return map
}

// Word pastes lists as <p style="mso-list:l0 level1 lfo1"> with a hidden
// marker span (mso-list:Ignore) holding the bullet/number as plain text,
// instead of real <ul>/<ol>/<li>. Rebuild proper list markup before cleaning.
function convertWordLists(doc: Document) {
  const listFormats = parseWordListFormats(doc)
  const paragraphs = Array.from(doc.body.querySelectorAll('p'))
  const stack: { level: number; list: Element }[] = []

  for (const p of paragraphs) {
    const style = p.getAttribute('style') || ''
    const listMatch = style.match(/mso-list:\s*(l\d+)\s+level(\d+)/i)

    if (!listMatch) {
      stack.length = 0
      continue
    }

    const listId = listMatch[1]
    const level = parseInt(listMatch[2], 10)

    const markerSpan = Array.from(p.querySelectorAll('span'))
      .find(s => /mso-list\s*:\s*ignore/i.test(s.getAttribute('style') || ''))
    const markerText = (markerSpan?.textContent ?? '').replace(/\u00a0/g, ' ').trim()
    markerSpan?.remove()

    const cssType = listFormats.get(`${listId}:${level}`)
    const isOrdered = cssType ? true : /^[a-zA-Z0-9]+[.)]/.test(markerText)
    const tagName = isOrdered ? 'ol' : 'ul'

    while (stack.length && stack[stack.length - 1].level > level) stack.pop()

    let parentList: Element
    const top = stack[stack.length - 1]
    if (top && top.level === level) {
      parentList = top.list
    } else {
      parentList = doc.createElement(tagName)
      if (cssType) (parentList as HTMLElement).style.listStyleType = cssType
      if (top) {
        const parentLi = top.list.lastElementChild
        if (parentLi) parentLi.appendChild(parentList)
        else p.parentNode?.insertBefore(parentList, p)
      } else {
        p.parentNode?.insertBefore(parentList, p)
      }
      stack.push({ level, list: parentList })
    }

    const li = doc.createElement('li')
    while (p.firstChild) li.appendChild(p.firstChild)

    const first = li.firstChild
    if (first?.nodeType === Node.TEXT_NODE) {
      first.textContent = (first.textContent ?? '').replace(/^[\s\u00a0]+/, '')
    }

    parentList.appendChild(li)
    p.remove()
  }
}
function cleanPastedHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  convertWordLists(doc)

  function clean(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
    if (node.nodeType !== Node.ELEMENT_NODE) return ''

    const el = node as HTMLElement
    const tag = el.tagName.toUpperCase()
    const children = Array.from(el.childNodes).map(clean).join('')

    if (!ALLOWED_TAGS.has(tag)) return children

    // FONT → span with color
    if (tag === 'FONT') {
      const color = el.getAttribute('color')
      return color ? `<span style="color:${color}">${children}</span>` : children
    }

    // SPAN → keep only if it carries a color, text-decoration, or font-size style
    if (tag === 'SPAN') {
      const color = el.style.color
      const dec = el.style.textDecoration
      const fontSize = el.style.fontSize
      const styleStr = [color ? `color:${color}` : '', dec ? `text-decoration:${dec}` : '', fontSize ? `font-size:${fontSize}` : ''].filter(Boolean).join(';')
      return styleStr ? `<span style="${styleStr}">${children}</span>` : children
    }

    const out = tag === 'B' ? 'strong' : tag === 'I' ? 'em' : tag === 'STRIKE' || tag === 'DEL' ? 's' : tag.toLowerCase()
    let attrs = ''
    if (tag === 'TABLE') attrs += ' style="border-collapse:collapse;margin:0.5rem 0;width:100%"'
    if (tag === 'TD' || tag === 'TH') {
      const bg = el.style.backgroundColor || el.style.background || el.getAttribute('bgcolor')
      const bgStr = bg ? `;background-color:${bg}` : ''
      attrs += ` style="border:1px solid #6f6f6f;padding:0.375rem 0.5rem${bgStr}"`
    }
    if (tag === 'OL' || tag === 'UL') {
      const lsType = el.style.listStyleType
      if (lsType) attrs += ` style="list-style-type:${lsType}"`
    }
    const colspan = el.getAttribute('colspan')
    const rowspan = el.getAttribute('rowspan')
    if (colspan) attrs += ` colspan="${colspan}"`
    if (rowspan) attrs += ` rowspan="${rowspan}"`

    return `<${out}${attrs}>${children}</${out}>`
  }

  return Array.from(doc.body.childNodes).map(clean).join('')
}

export default function RichTextEditor({ id, label, value, onChange }: RichTextEditorProps) {
  const { t } = useTranslation('editor')
  const editorRef = useRef<HTMLDivElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const savedSelRef = useRef<Range | null>(null)
  const [formats, setFormats] = useState<Formats>({
    bold: false, italic: false, underline: false, strikethrough: false, formatBlock: '', fontSize: '',
    ul: false, ol: false, inTable: false,
  })
  const [currentColor, setCurrentColor] = useState('#000000')

  const labelId = `${id}-label`
  const toolbarId = `${id}-toolbar`

  useEffect(() => {
    if (editorRef.current) editorRef.current.innerHTML = value
  }, [])

  useEffect(() => {
    if (value === '' && editorRef.current) editorRef.current.innerHTML = ''
  }, [value])

  // execCommand/queryCommandState are deprecated but remain the only
  // cross-browser API for contenteditable formatting without a library.
  const d = document as any // eslint-disable-line @typescript-eslint/no-explicit-any

  function exec(command: string, val?: string, skipFocus?: boolean) {
    if (!skipFocus) editorRef.current?.focus()
    d.execCommand(command, false, val ?? null)
    syncFormats()
    onChange(editorRef.current?.innerHTML ?? '')
  }

  function insertTable() {
    const row = (cols: number) =>
      `<tr>${Array(cols).fill('<td style="border:1px solid #6f6f6f;padding:0.375rem 0.5rem;min-width:5rem">&nbsp;</td>').join('')}</tr>`
    const table = `<table style="border-collapse:collapse;margin:0.5rem 0;width:100%"><tbody>${row(3)}${row(3)}</tbody></table><p><br></p>`
    editorRef.current?.focus()
    d.execCommand('insertHTML', false, table)
    onChange(editorRef.current?.innerHTML ?? '')
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault()
    const html = e.clipboardData.getData('text/html')
    const text = e.clipboardData.getData('text/plain')
    if (html) {
      d.execCommand('insertHTML', false, cleanPastedHtml(html))
    } else {
      d.execCommand('insertText', false, text)
    }
    onChange(editorRef.current?.innerHTML ?? '')
  }

  function handleMouseDown(e: React.MouseEvent) {
    const { clientX: x, clientY: y } = e
    const tables = editorRef.current?.querySelectorAll('table') ?? []
    for (const table of Array.from(tables)) {
      const rect = table.getBoundingClientRect()
      if (x < rect.left - 4 || x > rect.right + 4 || y < rect.top - 4 || y > rect.bottom + 4) continue
      const inCell = Array.from(table.querySelectorAll('td, th')).some(cell => {
        const cr = cell.getBoundingClientRect()
        return x >= cr.left && x <= cr.right && y >= cr.top && y <= cr.bottom
      })
      if (!inCell) {
        e.preventDefault()
        editorRef.current?.focus()
        const range = document.createRange()
        range.selectNode(table)
        const sel = window.getSelection()
        if (sel) { sel.removeAllRanges(); sel.addRange(range) }
        syncFormats()
        return
      }
    }
  }

  function getAdjacentTable(direction: 'before' | 'after'): HTMLTableElement | null {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || !sel.getRangeAt(0).collapsed) return null
    const range = sel.getRangeAt(0)

    if (direction === 'before' && range.startOffset === 0) {
      let node: Node | null = range.startContainer
      while (node && node !== editorRef.current) {
        const prev = node.previousSibling
        if (prev) return (prev as Element).tagName === 'TABLE' ? prev as HTMLTableElement : null
        node = node.parentNode
      }
    }

    if (direction === 'after') {
      const c = range.startContainer
      const atEnd = c.nodeType === Node.TEXT_NODE
        ? range.startOffset === c.textContent!.length
        : range.startOffset === c.childNodes.length
      if (atEnd) {
        let node: Node | null = c
        while (node && node !== editorRef.current) {
          const next = node.nextSibling
          if (next) return (next as Element).tagName === 'TABLE' ? next as HTMLTableElement : null
          node = node.parentNode
        }
      }
    }

    return null
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Tab') {
      e.preventDefault()
      exec(e.shiftKey ? 'outdent' : 'indent')
      return
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      const sel = window.getSelection()
      const collapsed = !sel || sel.rangeCount === 0 || sel.getRangeAt(0).collapsed
      const table = getTableAncestor()

      if (table && !collapsed) {
        e.preventDefault()
        deleteTable()
        return
      }

      if (collapsed) {
        const adjacent = getAdjacentTable(e.key === 'Backspace' ? 'before' : 'after')
        if (adjacent) {
          e.preventDefault()
          const range = document.createRange()
          range.selectNode(adjacent)
          if (sel) { sel.removeAllRanges(); sel.addRange(range) }
          syncFormats()
        }
      }
    }
  }

  function getTableAncestor(): HTMLTableElement | null {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return null
    const range = sel.getRangeAt(0)

    if (!range.collapsed && range.startContainer === range.endContainer) {
      const c = range.startContainer
      if (c.nodeType === Node.ELEMENT_NODE) {
        for (let i = range.startOffset; i < range.endOffset; i++) {
          const child = (c as Element).childNodes[i]
          if ((child as Element).tagName === 'TABLE') return child as HTMLTableElement
        }
      }
    }

    let node: Node | null = range.commonAncestorContainer
    while (node && node !== editorRef.current) {
      if ((node as Element).tagName === 'TABLE') return node as HTMLTableElement
      node = node.parentNode
    }
    return null
  }

  function deleteTable() {
    const table = getTableAncestor()
    if (!table) return
    table.parentNode?.removeChild(table)
    onChange(editorRef.current?.innerHTML ?? '')
    syncFormats()
  }

  function getCurrentFontSize(): string {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return ''
    let node: Node | null = sel.getRangeAt(0).startContainer
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode
    if (!node || !editorRef.current?.contains(node)) return ''
    const size = window.getComputedStyle(node as Element).fontSize
    return FONT_SIZES.includes(size) ? size : ''
  }

  function syncFormats() {
    const table = getTableAncestor()
    editorRef.current?.querySelectorAll('table').forEach(t => t.removeAttribute('data-selected'))
    if (table) table.setAttribute('data-selected', 'true')
    setFormats({
      bold:          d.queryCommandState('bold'),
      italic:        d.queryCommandState('italic'),
      underline:     d.queryCommandState('underline'),
      strikethrough: d.queryCommandState('strikeThrough'),
      formatBlock:   d.queryCommandValue('formatBlock').toLowerCase() || 'p',
      fontSize:      getCurrentFontSize(),
      ul:            d.queryCommandState('insertUnorderedList'),
      ol:            d.queryCommandState('insertOrderedList'),
      inTable:       !!table,
    })
  }

  function applyFontSize(size: string) {
    editorRef.current?.focus()
    if (savedSelRef.current) {
      const sel = window.getSelection()
      if (sel) { sel.removeAllRanges(); sel.addRange(savedSelRef.current) }
    }
    d.execCommand('fontSize', false, '7')
    editorRef.current?.querySelectorAll('font[size="7"]').forEach(el => {
      const span = document.createElement('span')
      span.style.fontSize = size
      span.innerHTML = el.innerHTML
      el.replaceWith(span)
    })
    onChange(editorRef.current?.innerHTML ?? '')
    syncFormats()
  }

  function openColorPicker() {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) savedSelRef.current = sel.getRangeAt(0).cloneRange()
    colorInputRef.current?.click()
  }

  function applyColor(color: string) {
    setCurrentColor(color)
    editorRef.current?.focus()
    if (savedSelRef.current) {
      const sel = window.getSelection()
      if (sel) { sel.removeAllRanges(); sel.addRange(savedSelRef.current) }
    }
    exec('foreColor', color, true)
  }

  type ToolbarItem =
    | { sep: true }
    | { colorPicker: true }
    | { sizePicker: true }
    | { fontSizePicker: true }
    | { sep?: false; colorPicker?: false; sizePicker?: false; fontSizePicker?: false; id: string; label: string; active: boolean; disabled?: boolean; child: React.ReactNode; action: () => void }

  const toolbarButtons: ToolbarItem[] = [
    { id: 'bold',         label: t('bold'),          active: formats.bold,          child: <strong>B</strong>,                                  action: () => exec('bold') },
    { id: 'italic',       label: t('italic'),        active: formats.italic,        child: <em>I</em>,                                          action: () => exec('italic') },
    { id: 'underline',    label: t('underline'),     active: formats.underline,     child: <span style={{ textDecoration: 'underline' }}>U</span>, action: () => exec('underline') },
    { id: 'strike',       label: t('strikethrough'), active: formats.strikethrough, child: <s>S</s>,                                            action: () => exec('strikeThrough') },
    { colorPicker: true },
    { sizePicker: true },
    { fontSizePicker: true },
    { sep: true },
    { id: 'ul',           label: t('bulletList'),    active: formats.ul,            child: <>≡</>,                                              action: () => exec('insertUnorderedList') },
    { id: 'ol',           label: t('orderedList'),   active: formats.ol,            child: <>1.</>,                                             action: () => exec('insertOrderedList') },
    { id: 'indent',       label: t('indent'),        active: false,                 child: <>⇥</>,                                              action: () => exec('indent') },
    { id: 'outdent',      label: t('outdent'),       active: false,                 child: <>⇤</>,                                              action: () => exec('outdent') },
    { sep: true },
    { id: 'table',        label: t('table'),         active: false,                 child: <>⊞</>,                                              action: insertTable },
    { id: 'table-delete', label: t('deleteTable'),   active: false, disabled: !formats.inTable, child: <>✕⊞</>,                               action: deleteTable },
    { sep: true },
    { id: 'undo',         label: t('undo'),          active: false,                 child: <>↩</>,                                              action: () => exec('undo') },
    { id: 'redo',         label: t('redo'),          active: false,                 child: <>↪</>,                                              action: () => exec('redo') },
  ]

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label
        id={labelId}
        style={{ display: 'block', fontWeight: 700, marginBottom: '0.375rem', fontSize: '1rem', color: '#333', fontFamily: 'inherit' }}
      >
        {label}
      </label>

      <div
        role="toolbar"
        id={toolbarId}
        aria-label={t('toolbarLabel')}
        aria-controls={id}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.25rem',
          padding: '0.375rem 0.5rem',
          border: '1px solid #6f6f6f',
          borderBottom: 'none',
          borderRadius: '4px 4px 0 0',
          background: '#f1f4f8',
        }}
      >
        {toolbarButtons.map((btn, i) => {
          if ('sep' in btn && btn.sep) {
            return <span key={`sep-${i}`} aria-hidden="true" style={{ width: '1px', background: '#b0b0b0', margin: '0.1rem 0.125rem', alignSelf: 'stretch' }} />
          }
          if ('sizePicker' in btn && btn.sizePicker) {
            const headings = [
              { value: 'p',  label: t('blockNormal') },
              { value: 'h1', label: 'H1' },
              { value: 'h2', label: 'H2' },
              { value: 'h3', label: 'H3' },
              { value: 'h4', label: 'H4' },
              { value: 'h5', label: 'H5' },
              { value: 'h6', label: 'H6' },
            ]
            return (
              <select
                key="size-picker"
                value={formats.formatBlock || 'p'}
                aria-label={t('blockFormat')}
                title={t('blockFormat')}
                onMouseDown={() => {
                  const sel = window.getSelection()
                  if (sel && sel.rangeCount > 0) savedSelRef.current = sel.getRangeAt(0).cloneRange()
                }}
                onChange={e => {
                  editorRef.current?.focus()
                  if (savedSelRef.current) {
                    const sel = window.getSelection()
                    if (sel) { sel.removeAllRanges(); sel.addRange(savedSelRef.current) }
                  }
                  exec('formatBlock', e.target.value, true)
                }}
                style={{
                  appearance: 'none',
                  padding: '0.4rem 1.75rem 0.4rem 0.5rem',
                  border: '2px solid #284162',
                  borderRadius: '4px',
                  background: `white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23284162' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 0.5rem center`,
                  color: '#284162',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {headings.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
              </select>
            )
          }
          if ('fontSizePicker' in btn && btn.fontSizePicker) {
            return (
              <select
                key="font-size-picker"
                value={formats.fontSize || ''}
                aria-label={t('fontSize')}
                title={t('fontSize')}
                onMouseDown={() => {
                  const sel = window.getSelection()
                  if (sel && sel.rangeCount > 0) savedSelRef.current = sel.getRangeAt(0).cloneRange()
                }}
                onChange={e => applyFontSize(e.target.value)}
                style={{
                  appearance: 'none',
                  padding: '0.4rem 1.75rem 0.4rem 0.5rem',
                  border: '2px solid #284162',
                  borderRadius: '4px',
                  background: `white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23284162' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 0.5rem center`,
                  color: '#284162',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="">{t('blockNormal')}</option>
                {FONT_SIZES.map(size => <option key={size} value={size}>{parseInt(size, 10)}</option>)}
              </select>
            )
          }
          if ('colorPicker' in btn && btn.colorPicker) {
            return (
              <span key="color-picker" style={{ position: 'relative' }}>
                <span onMouseDown={e => { e.preventDefault(); openColorPicker() }}>
                  <GcdsButton
                    type="button"
                    buttonRole="secondary"
                    size="small"
                    aria-label={t('color')}
                    title={t('color')}
                  >
                    <span style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px', lineHeight: 1 }}>
                      <span>A</span>
                      <span style={{ display: 'block', width: '0.875rem', height: '3px', background: currentColor, borderRadius: '1px' }} />
                    </span>
                  </GcdsButton>
                </span>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={currentColor}
                  tabIndex={-1}
                  aria-hidden="true"
                  style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }}
                  onChange={e => applyColor(e.target.value)}
                />
              </span>
            )
          }
          return (
            <span key={btn.id} onMouseDown={e => { e.preventDefault(); if (!btn.disabled) btn.action() }}>
              <GcdsButton
                type="button"
                buttonRole={btn.active ? 'primary' : 'secondary'}
                size="small"
                aria-label={btn.label}
                title={btn.label}
                aria-pressed={btn.active}
                disabled={btn.disabled}
              >
                {btn.child}
              </GcdsButton>
            </span>
          )
        })}
      </div>

      <div
        ref={editorRef}
        id={id}
        contentEditable
        role="textbox"
        aria-multiline="true"
        aria-labelledby={labelId}
        data-placeholder={t('placeholder')}
        onInput={() => onChange(editorRef.current?.innerHTML ?? '')}
        onPaste={handlePaste}
        onMouseDown={handleMouseDown}
        onKeyDown={handleKeyDown}
        onKeyUp={syncFormats}
        onMouseUp={syncFormats}
        style={{
          border: '1px solid #6f6f6f',
          borderRadius: '0 0 4px 4px',
          minHeight: '8rem',
          padding: '0.5rem 0.75rem',
          fontSize: '1rem',
          lineHeight: '1.6',
          background: 'white',
          fontFamily: 'inherit',
          outline: 'none',
        }}
      />
    </div>
  )
}
