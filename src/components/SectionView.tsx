import { useMemo } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { LectureBlocks } from '@/components/LectureView';
import { LinkifiedTextInner } from '@/components/RefText';
import { isLecture, type Section } from '@/types/pdd';

interface Props {
  section: Section;
  isDone: boolean;
  onToggleDone: () => void;
  prev: Section | null;
  next: Section | null;
  onOpen: (id: string) => void;
}

export function SectionView({ section, isDone, onToggleDone, prev, next, onOpen }: Props) {
  const lecture = isLecture(section);

  // чипы подразделов: у лекции — подтемы, у обычного раздела — h2
  const chipType = lecture ? 'topic' : 'h2';
  const subs = useMemo(
    () =>
      section.blocks
        .map((b, i) => ({ b, i }))
        .filter((x) => x.b.type === chipType)
        .map((x) => ({
          text: (x.b as { text: string }).text,
          idx: x.i,
        })),
    [section, chipType],
  );

  return (
    <article className="mx-auto max-w-3xl px-5 py-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold leading-tight">{section.title}</h1>
        <Button
          variant={isDone ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleDone}
          className="shrink-0 gap-1.5"
        >
          {isDone ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Изучено
            </>
          ) : (
            <>
              <Circle className="h-4 w-4" /> Отметить изученным
            </>
          )}
        </Button>
      </div>

      {subs.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {subs.map((h, i) => (
            <button
              key={i}
              onClick={() =>
                document
                  .getElementById(`sub-${h.idx}`)
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {h.text}
            </button>
          ))}
        </div>
      )}

      <Separator className="my-5" />

      {lecture ? (
        <LectureBlocks blocks={section.blocks} />
      ) : (
        <div className="space-y-3">
          {section.blocks.map((b, i) => {
            if (b.type === 'h2') {
              return (
                <h2
                  key={i}
                  id={`sub-${i}`}
                  className="scroll-mt-4 pt-5 text-lg font-semibold"
                >
                  {b.text}
                </h2>
              );
            }
            if (b.type === 'img') {
              const maxW = Math.min(Math.max(b.w, 90), 330);
              return (
                <figure key={i} className="flex justify-center py-2">
                  <img
                    src={b.src}
                    alt="Иллюстрация"
                    loading="lazy"
                    className="rounded-lg border bg-white p-2 shadow-sm"
                    style={{ width: maxW, height: 'auto' }}
                  />
                </figure>
              );
            }
            if (b.type !== 'p') return null;
            const isFootnote = b.text.startsWith('*');
            const isNote = b.text.startsWith('Примечание');
            return (
              <p
                key={i}
                className={
                  isFootnote
                    ? 'text-xs leading-5 text-muted-foreground'
                    : isNote
                      ? 'rounded-md border-l-4 border-primary/40 bg-muted/40 p-3 text-[14px] leading-6'
                      : 'text-[15px] leading-7'
                }
              >
                <LinkifiedTextInner text={b.text} />
              </p>
            );
          })}
        </div>
      )}

      <Separator className="my-6" />

      <div className="flex items-center justify-between gap-2 pb-8">
        {prev ? (
          <Button variant="outline" className="gap-1.5" onClick={() => onOpen(prev.id)}>
            <ArrowLeft className="h-4 w-4" />
            <span className="max-w-[220px] truncate">{prev.title}</span>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button variant="outline" className="gap-1.5" onClick={() => onOpen(next.id)}>
            <span className="max-w-[220px] truncate">{next.title}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <span />
        )}
      </div>
    </article>
  );
}
