import { useMemo, useState } from 'react';
import { CheckCircle2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import type { Section } from '@/types/pdd';

interface Props {
  sections: Section[];
  onOpen: (id: string) => void;
}

export function SearchBox({ sections, onOpen }: Props) {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 3) return [];
    const out: { section: Section; snippet: string }[] = [];
    for (const s of sections) {
      const text = s.blocks
        .map((b) => {
          switch (b.type) {
            case 'p':
            case 'h2':
            case 'motivation':
            case 'lead':
            case 'quote':
              return b.text;
            case 'topic':
              return b.text;
            case 'term':
              return `${b.term}\n${b.def}`;
            case 'example':
              return `${b.title}\n${b.text}`;
            case 'quiz':
              return b.questions.map((q) => `${q.q}\n${q.options.join('\n')}`).join('\n');
            default:
              return '';
          }
        })
        .join('\n');
      const idx = text.toLowerCase().indexOf(query);
      if (idx >= 0) {
        const from = Math.max(0, idx - 60);
        const to = Math.min(text.length, idx + 140);
        const snippet =
          (from > 0 ? '…' : '') + text.slice(from, to).trim() + (to < text.length ? '…' : '');
        out.push({ section: s, snippet });
      }
      if (out.length >= 20) break;
    }
    return out;
  }, [q, sections]);

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Поиск по Правилам…"
        className="pl-9"
      />
      {q.trim().length >= 3 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-96 overflow-y-auto rounded-md border bg-popover shadow-lg">
          {results.length === 0 ? (
            <div className="p-3 text-sm text-muted-foreground">
              Ничего не найдено.
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={i}
                className="block w-full border-b px-3 py-2 text-left last:border-b-0 hover:bg-accent"
                onClick={() => {
                  onOpen(r.section.id);
                  setQ('');
                }}
              >
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {r.section.title}
                </div>
                <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {r.snippet}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
