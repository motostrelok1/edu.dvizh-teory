import { Fragment } from 'react';
import { useRefs } from '@/components/Refs';
import { linkifyText } from '@/lib/refs';

/** Подсвеченный код знака/разметки — чип со ссылкой на справочник */
function RefChip({
  kind,
  codes,
}: {
  kind: 'sign' | 'markup';
  codes: string[];
}) {
  const refs = useRefs();
  if (!refs) return <>{codes.join(', ')}</>;
  const map = kind === 'sign' ? refs.index.signs : refs.index.markup;
  const known = codes.filter((c) => map.has(c));
  if (known.length === 0) return <>{codes.join(', ')}</>;
  return (
    <>
      {known.map((code, i) => (
        <Fragment key={code}>
          {i > 0 && <span className="text-muted-foreground">, </span>}
          <button
            className="inline-block rounded border border-primary/40 bg-primary/5 px-1 font-medium text-primary transition-colors hover:bg-primary/15"
            title={kind === 'sign' ? 'Показать знак' : 'Показать разметку'}
            onClick={() =>
              refs.open(kind, known, known.indexOf(code))
            }
          >
            {code}
          </button>
        </Fragment>
      ))}
    </>
  );
}

/**
 * Текст с интерактивными ссылками на знаки и разметку:
 * «знак 2.1», «знаки 5.19.1, 5.19.2», «разметкой 1.14.1–1.14.3».
 * Вне провайдера RefsProvider рендерит plain text.
 */
export function LinkifiedTextInner({ text }: { text: string }) {
  const refs = useRefs();
  if (!refs) return <>{text}</>;
  const segments = linkifyText(text);
  return (
    <>
      {segments.map((seg, i) =>
        'str' in seg ? (
          <Fragment key={i}>{seg.str}</Fragment>
        ) : (
          <RefChip key={i} kind={seg.kind} codes={seg.codes} />
        ),
      )}
    </>
  );
}
