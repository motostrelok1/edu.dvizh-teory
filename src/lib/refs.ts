import type { Block, Section } from '@/types/pdd';

/** Элемент справочника: знак или линия разметки */
export interface RefItem {
  code: string;
  title: string;
  desc: string;
  imgs: string[];
  /** подраздел справочника, например «Предупреждающие знаки» */
  group: string;
}

export type RefKind = 'sign' | 'markup';

export interface RefIndex {
  signs: Map<string, RefItem>;
  markup: Map<string, RefItem>;
}

const CODE = String.raw`\d+(?:\.\d+){0,3}`;
/** абзац-описание знака: 1.2 "Название". ... / 1.4.1-1.4.6 "Название". ... / 5.19.1, 5.19.2 "Название". ... */
const SIGN_ITEM_RE = new RegExp(
  String.raw`(${CODE})((?:\s*[-–,]\s*${CODE})*)\s+"([^"]+)"`,
  'g',
);
/** абзац-описание разметки: 1.2 - описание ... или 2.1.1-2.1.3 - описание ... */
const MARKUP_ITEM_RE = new RegExp(
  String.raw`^(${CODE}(?:\s*[-–,]\s*${CODE})*)\s*[-–—]?\s*(?:\((цвет[^)]*)\)\s*[-–—]?\s*)?(.*)$`,
  'su',
);

/** Раскрыть диапазон вида 2.3.1–2.3.7 в список кодов; null — если раскрыть нельзя */
export function expandRange(a: string, b: string): string[] | null {
  const pa = a.split('.');
  const pb = b.split('.');
  if (pa.length !== pb.length || pa.length < 2) return null;
  for (let i = 0; i < pa.length - 1; i++) {
    if (pa[i] !== pb[i]) return null;
  }
  const na = Number(pa[pa.length - 1]);
  const nb = Number(pb[pb.length - 1]);
  if (!Number.isInteger(na) || !Number.isInteger(nb) || nb <= na || nb - na > 12) return null;
  const out: string[] = [];
  for (let n = na; n <= nb; n++) {
    out.push([...pa.slice(0, -1), String(n)].join('.'));
  }
  return out;
}

/** Извлечь коды из кластера вида «1.14.1, 1.14.2» или «2.3.1-2.3.7» */
function parseCodeGroup(group: string): string[] {
  const parts = group.split(/(\s*[-–—]\s*|\s*[,;]\s*|\s+и\s+|\s+или\s+)/);
  const out: string[] = [];
  let i = 0;
  while (i < parts.length) {
    const code = parts[i].trim();
    if (!new RegExp(`^${CODE}$`).test(code)) return out.length ? out : [];
    const sep = parts[i + 1] ?? '';
    if (sep && /[-–—]/.test(sep)) {
      const next = (parts[i + 2] ?? '').trim();
      const expanded = expandRange(code, next);
      if (expanded) {
        out.push(...expanded);
        i += 3;
        continue;
      }
    }
    out.push(code);
    i += sep ? 2 : 1;
  }
  return out;
}

/** Построить справочник из разделов «signs» и «markup» */
export function buildRefIndex(sections: Section[]): RefIndex {
  const signs = new Map<string, RefItem>();
  const markup = new Map<string, RefItem>();

  const parseSigns = (blocks: Block[]) => {
    let group = '';
    // текущая группа абзаца: коды + накопленные картинки
    let pending: { codes: string[]; titles: Map<string, string>; desc: string } | null = null;

    const flush = () => {
      if (!pending) return;
      const imgs = pendingImgs;
      pendingImgs = [];
      const per = pending.codes.length;
      pending.codes.forEach((code, idx) => {
        if (signs.has(code)) return;
        const slice =
          imgs.length >= per
            ? imgs.slice(
                Math.floor((idx * imgs.length) / per),
                Math.floor(((idx + 1) * imgs.length) / per),
              )
            : imgs;
        signs.set(code, {
          code,
          title: pending!.titles.get(code) ?? '',
          desc: pending!.desc,
          imgs: slice,
          group,
        });
      });
      pending = null;
    };

    let pendingImgs: string[] = [];

    for (const b of blocks) {
      if (b.type === 'h2') {
        flush();
        group = b.text.replace(/^\d+\.\s*/, '').trim();
        continue;
      }
      if (b.type === 'img') {
        pendingImgs.push(b.src);
        continue;
      }
      if (b.type !== 'p') continue;
      if (b.text.startsWith('*')) continue; // редакционные сноски
      SIGN_ITEM_RE.lastIndex = 0;
      const matches = [...b.text.matchAll(SIGN_ITEM_RE)];
      if (matches.length > 0) {
        flush();
        const titles = new Map<string, string>();
        const codes: string[] = [];
        let lastEnd = 0;
        for (const m of matches) {
          const [, c1, cluster, title] = m;
          const list = parseCodeGroup(c1 + cluster);
          for (const c of list) titles.set(c, title);
          codes.push(...list);
          lastEnd = (m.index ?? 0) + m[0].length;
        }
        pending = { codes, titles, desc: b.text.slice(lastEnd).replace(/^[.\s]+/, '').trim() };
      } else if (pending) {
        // дополнительный абзац к последней группе (подписи, продолжение описания)
        pending.desc = pending.desc
          ? `${pending.desc}\n${b.text.trim()}`
          : b.text.trim();
      }
    }
    flush();
  };

  const parseMarkup = (blocks: Block[]) => {
    let group = '';
    let pendingCodes: string[] = [];
    let pendingImgs: string[] = [];

    const flush = () => {
      if (pendingCodes.length === 0) return;
      const imgs = pendingImgs;
      pendingImgs = [];
      const per = pendingCodes.length;
      pendingCodes.forEach((code, idx) => {
        if (markup.has(code)) return;
        const slice =
          imgs.length >= per
            ? imgs.slice(
                Math.floor((idx * imgs.length) / per),
                Math.floor(((idx + 1) * imgs.length) / per),
              )
            : imgs;
        markup.set(code, { code, title: '', desc: pendingDesc, imgs: slice, group });
      });
      pendingCodes = [];
      pendingDesc = '';
    };

    let pendingDesc = '';

    for (const b of blocks) {
      if (b.type === 'h2') {
        flush();
        group = b.text.replace(/^\d+\.\s*/, '').trim();
        continue;
      }
      if (b.type === 'img') {
        pendingImgs.push(b.src);
        continue;
      }
      if (b.type !== 'p' || b.text.startsWith('*')) continue;
      const m = MARKUP_ITEM_RE.exec(b.text);
      if (m) {
        const codes = parseCodeGroup(m[1]);
        const color = m[2] ? `(${m[2].trim()}). ` : '';
        const desc = (color + m[3].trim()).trim();
        if (codes.length > 0 && (desc || !codes.every((c) => markup.has(c)))) {
          flush();
          pendingCodes = codes;
          pendingDesc = desc;
          continue;
        }
      }
      // подписи под иллюстрациями и прочие абзацы — в описание текущей группы
      if (pendingCodes.length > 0) {
        pendingDesc = pendingDesc ? `${pendingDesc}\n${b.text.trim()}` : b.text.trim();
      }
    }
    flush();
  };

  for (const s of sections) {
    if (s.id === 'signs') parseSigns(s.blocks);
    else if (s.id === 'markup') parseMarkup(s.blocks);
  }
  return { signs, markup };
}

/* ---------- Разметка текста ссылками ---------- */

export interface RefToken {
  kind: RefKind;
  codes: string[];
}

export type TextSegment = { str: string } | RefToken;

const CTX_RE = new RegExp(
  String.raw`(знак[а-яёa-z0-9]*|табличк[а-яёa-z0-9]*|разметк[а-яёa-z0-9]*)\s+((?:${CODE})(?:(?:\s*[-–—]\s*|\s*[,;]\s*|\s+и\s+|\s+или\s+)${CODE})*)`,
  'giu',
);

/**
 * Разбить текст на фрагменты; упоминания «знак 2.1», «знаки 5.19.1, 5.19.2»,
 * «разметкой 1.14.1–1.14.3» превращаются в RefToken.
 */
export function linkifyText(text: string): TextSegment[] {
  const out: TextSegment[] = [];
  let last = 0;
  CTX_RE.lastIndex = 0;
  for (const m of text.matchAll(CTX_RE)) {
    const idx = m.index ?? 0;
    const kind: RefKind = m[1].toLowerCase().startsWith('разметк') ? 'markup' : 'sign';
    const codes = parseCodeGroup(m[2]).slice(0, 15);
    if (codes.length === 0) continue;
    if (idx > last) out.push({ str: text.slice(last, idx) });
    out.push({ kind, codes });
    last = idx + m[0].length;
  }
  if (last < text.length) out.push({ str: text.slice(last) });
  return out;
}
