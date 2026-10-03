import type { ReactNode } from 'react';
import {
  CheckCircle2,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Scale,
  Star,
  XCircle,
} from 'lucide-react';
import { Quiz } from '@/components/Quiz';
import { LinkifiedTextInner } from '@/components/RefText';
import type { Block, QuizBlock as QuizBlockType } from '@/types/pdd';

/** Заголовок этапа лекции */
function StageHeader({
  n,
  title,
  sub,
}: {
  n: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 pt-7 first:pt-1">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {n}
      </span>
      <div>
        <h2 className="text-lg font-semibold leading-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

/** Подтема лекции */
function Topic({ text, id }: { text: string; id: string }) {
  return (
    <h3 id={id} className="scroll-mt-4 pt-5 text-[16px] font-semibold">
      {text}
    </h3>
  );
}

/** Голос лектора — объяснение простым языком */
function Lead({ text }: { text: string }) {
  return (
    <div className="flex gap-2.5 rounded-md border-l-4 border-primary/50 bg-muted/30 py-1.5 pl-3 pr-2">
      <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <p className="text-[15px] leading-7">
        <LinkifiedTextInner text={text} />
      </p>
    </div>
  );
}

/** Точный текст пункта Правил */
function Quote({ text }: { text: string }) {
  return (
    <div className="rounded-lg border bg-card p-3.5 shadow-sm">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Scale className="h-3.5 w-3.5" /> Текст Правил
      </div>
      <p className="text-[14px] leading-6">
        <LinkifiedTextInner text={text} />
      </p>
    </div>
  );
}

/** Карточка термина */
function Term({
  term,
  def,
  important,
  id,
}: {
  term: string;
  def: string;
  important?: boolean;
  id: string;
}) {
  return (
    <div
      id={id}
      className={`scroll-mt-4 rounded-lg border bg-card p-3.5 ${
        important ? 'border-amber-400/70 dark:border-amber-600/60' : ''
      }`}
    >
      <div className="flex items-center gap-1.5 font-semibold">
        {important && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
        <span>{term}</span>
      </div>
      <p className="mt-1 text-[14px] leading-6 text-muted-foreground">
        <LinkifiedTextInner text={def} />
      </p>
    </div>
  );
}

/** Пример / антипример */
function Example({ good, title, text }: { good: boolean; title: string; text: string }) {
  return (
    <div
      className={`rounded-lg border p-3.5 ${
        good
          ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20'
          : 'border-red-400/50 bg-red-50/50 dark:bg-red-950/20'
      }`}
    >
      <div className="flex items-center gap-2 font-semibold">
        {good ? (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="h-5 w-5 shrink-0 text-red-500" />
        )}
        <span className={good ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
          {good ? 'Пример' : 'Антипример'}
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="font-medium leading-snug">{title}</span>
      </div>
      <p className="mt-1.5 text-[14px] leading-6">
        <LinkifiedTextInner text={text} />
      </p>
    </div>
  );
}

/** Мотивационный баннер */
function Motivation({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-amber-400/60 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:from-amber-950/30 dark:to-orange-950/20">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
        <Lightbulb className="h-4 w-4" /> Зачем это важно
      </div>
      <p className="mt-2 text-[15px] leading-7">
        <LinkifiedTextInner text={text} />
      </p>
    </div>
  );
}

/** Упражнение — интерактивный тест */
function Exercise({ quiz }: { quiz: QuizBlockType }) {
  return (
    <div className="space-y-4">
            {quiz.intro && (
              <p className="text-[15px] leading-7 text-muted-foreground">
                <LinkifiedTextInner text={quiz.intro} />
              </p>
            )}
      <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
        <ListChecks className="h-4 w-4" /> Выберите ответ — сразу увидите пояснение
      </div>
      <Quiz quiz={quiz} />
    </div>
  );
}

const EXPLAIN_TYPES = new Set(['topic', 'lead', 'quote', 'term', 'p', 'h2', 'img']);

/**
 * Рендерит блоки лекции, автоматически расставляя заголовки этапов:
 * 1 — мотивация, 2 — объяснение, 3 — примеры, 4 — упражнение.
 */
export function LectureBlocks({ blocks }: { blocks: Block[] }) {
  // какие этапы уже озаглавлены
  const seen = { explain: false, examples: false, exercise: false };
  const stageOf = (b: Block): 'explain' | 'examples' | 'exercise' | null => {
    if (EXPLAIN_TYPES.has(b.type)) return 'explain';
    if (b.type === 'example') return 'examples';
    if (b.type === 'quiz') return 'exercise';
    return null;
  };

  const out: ReactNode[] = [];
  blocks.forEach((b, i) => {
    if (b.type === 'motivation') {
      out.push(<Motivation key={i} text={b.text} />);
      return;
    }
    const stage = stageOf(b);
    if (stage === 'explain' && !seen.explain) {
      seen.explain = true;
      out.push(
        <StageHeader key="stage-explain" n="2" title="Объяснение" sub="текст урока — нормы Правил и разбор простым языком" />,
      );
    }
    if (stage === 'examples' && !seen.examples) {
      seen.examples = true;
      out.push(
        <StageHeader key="stage-examples" n="3" title="Примеры и антипримеры" sub="как это выглядит в реальной жизни" />,
      );
    }
    if (stage === 'exercise' && !seen.exercise) {
      seen.exercise = true;
      out.push(
        <StageHeader key="stage-exercise" n="4" title="Проверь себя" sub="упражнение — пройдите тест, прежде чем отмечать раздел изученным" />,
      );
    }
    switch (b.type) {
      case 'topic':
        out.push(<Topic key={i} text={b.text} id={`sub-${i}`} />);
        break;
      case 'lead':
        out.push(<Lead key={i} text={b.text} />);
        break;
      case 'quote':
        out.push(<Quote key={i} text={b.text} />);
        break;
      case 'term':
        out.push(<Term key={i} term={b.term} def={b.def} important={b.important} id={`sub-${i}`} />);
        break;
      case 'example':
        out.push(<Example key={i} good={b.good} title={b.title} text={b.text} />);
        break;
      case 'quiz':
        out.push(<Exercise key={i} quiz={b} />);
        break;
      // --- проход обычных блоков (приложения, справочники) ---
      case 'h2':
        out.push(<Topic key={i} text={b.text} id={`sub-${i}`} />);
        break;
      case 'p': {
        const isFootnote = b.text.startsWith('*');
        out.push(
          <p
            key={i}
            className={
              isFootnote
                ? 'text-xs leading-5 text-muted-foreground'
                : 'text-[15px] leading-7'
            }
          >
            <LinkifiedTextInner text={b.text} />
          </p>,
        );
        break;
      }
      case 'img': {
        const maxW = Math.min(Math.max(b.w, 90), 330);
        out.push(
          <figure key={i} className="flex justify-center py-2">
            <img
              src={b.src}
              alt="Иллюстрация"
              loading="lazy"
              className="rounded-lg border bg-white p-2 shadow-sm"
              style={{ width: maxW, height: 'auto' }}
            />
          </figure>,
        );
        break;
      }
      default:
        break;
    }
  });
  return <div className="space-y-3.5">{out}</div>;
}
