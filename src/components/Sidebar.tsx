import { CheckCircle2 } from 'lucide-react';
import type { Section } from '@/types/pdd';

interface Props {
  sections: Section[];
  activeId: string | null;
  done: Set<string>;
  onSelect: (id: string) => void;
}

function Item({
  section,
  badge,
  active,
  isDone,
  onSelect,
}: {
  section: Section;
  badge: string;
  active: boolean;
  isDone: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(section.id)}
      className={`flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-accent hover:text-accent-foreground'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${
          active
            ? 'bg-primary-foreground/20 text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {badge}
      </span>
      <span className="min-w-0 flex-1 leading-snug">{section.title}</span>
      {isDone &&
        (active ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        ))}
    </button>
  );
}

export function Sidebar({ sections, activeId, done, onSelect }: Props) {
  const groups: { label: string; items: { section: Section; badge: string }[] }[] = [
    { label: 'Разделы Правил', items: [] },
    { label: 'Приложения', items: [] },
    { label: 'Эксплуатация ТС', items: [] },
  ];
  sections.forEach((s) => {
    const m = /^s(\d+)$/.exec(s.id);
    if (m) groups[0].items.push({ section: s, badge: m[1] });
    else if (s.id === 'signs' || s.id === 'markup')
      groups[1].items.push({ section: s, badge: s.id === 'signs' ? 'А1' : 'А2' });
    else groups[2].items.push({ section: s, badge: '★' });
  });

  return (
    <nav className="flex flex-col gap-4 p-3">
      {groups.map((g) =>
        g.items.length === 0 ? null : (
          <div key={g.label}>
            <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {g.label}
            </div>
            <div className="flex flex-col gap-0.5">
              {g.items.map(({ section, badge }) => (
                <Item
                  key={section.id}
                  section={section}
                  badge={badge}
                  active={activeId === section.id}
                  isDone={done.has(section.id)}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ),
      )}
    </nav>
  );
}
