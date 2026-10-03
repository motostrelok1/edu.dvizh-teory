import { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinkifiedTextInner } from '@/components/RefText';
import type { QuizBlock as QuizBlockType } from '@/types/pdd';

interface Props {
  quiz: QuizBlockType;
}

export function Quiz({ quiz }: Props) {
  const { questions } = quiz;
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    questions.map(() => null),
  );

  const answeredCount = answers.filter((a) => a !== null).length;
  const correctCount = useMemo(
    () => questions.reduce((n, q, i) => n + (answers[i] === q.correct ? 1 : 0), 0),
    [answers, questions],
  );
  const allAnswered = answeredCount === questions.length;

  const pick = (qi: number, oi: number) => {
    setAnswers((prev) => {
      if (prev[qi] !== null) return prev; // вопрос уже отвечен
      const next = [...prev];
      next[qi] = oi;
      return next;
    });
  };

  const reset = () => setAnswers(questions.map(() => null));

  return (
    <div className="space-y-6">
      {answeredCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-2.5">
          <span className="text-sm">
            Отвечено {answeredCount} из {questions.length}
            {allAnswered && (
              <>
                {' · '}
                <span className={correctCount === questions.length ? 'font-semibold text-emerald-600' : 'font-semibold'}>
                  верно {correctCount}
                </span>
                {correctCount === questions.length && ' — отлично!'}
              </>
            )}
          </span>
          <Button variant="ghost" size="sm" className="gap-1.5" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5" /> Сбросить
          </Button>
        </div>
      )}

      {questions.map((q, qi) => {
        const chosen = answers[qi];
        const answered = chosen !== null;
        return (
          <div key={qi} className="rounded-xl border bg-card p-4 sm:p-5">
            <p className="font-medium leading-snug">
              <span className="mr-2 text-muted-foreground">{qi + 1}.</span>
              <LinkifiedTextInner text={q.q} />
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt, oi) => {
                let cls =
                  'w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-accent';
                if (answered) {
                  if (oi === q.correct) {
                    cls =
                      'w-full rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-2 text-left text-sm dark:bg-emerald-950/40';
                  } else if (oi === chosen) {
                    cls =
                      'w-full rounded-lg border border-red-400 bg-red-50 px-3 py-2 text-left text-sm dark:bg-red-950/40';
                  } else {
                    cls =
                      'w-full rounded-lg border px-3 py-2 text-left text-sm opacity-60';
                  }
                }
                return (
                  <button key={oi} className={cls} onClick={() => pick(qi, oi)}>
                    <span className="flex items-start gap-2">
                      {answered && oi === q.correct && (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      )}
                      {answered && oi === chosen && oi !== q.correct && (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      )}
                      <span>
                        <LinkifiedTextInner text={opt} />
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <div
                className={`mt-3 rounded-md border-l-4 px-3 py-2 text-[13px] leading-6 ${
                  chosen === q.correct
                    ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20'
                    : 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20'
                }`}
              >
                <span className="font-semibold">
                  {chosen === q.correct ? 'Верно. ' : 'Не совсем. '}
                </span>
                <LinkifiedTextInner text={q.explain} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
