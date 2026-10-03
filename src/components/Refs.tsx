import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ArrowLeft, ArrowRight, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LinkifiedTextInner } from '@/components/RefText';
import type { RefIndex, RefItem, RefKind } from '@/lib/refs';

interface ModalState {
  kind: RefKind;
  codes: string[];
  index: number;
}

interface RefsApi {
  index: RefIndex;
  open: (kind: RefKind, codes: string[], startIndex?: number) => void;
}

const RefsContext = createContext<RefsApi | null>(null);

export function useRefs(): RefsApi | null {
  return useContext(RefsContext);
}

export function RefsProvider({
  index,
  onOpenSection,
  children,
}: {
  index: RefIndex;
  onOpenSection: (kind: RefKind) => void;
  children: ReactNode;
}) {
  const [modal, setModal] = useState<ModalState | null>(null);

  const open = useCallback((kind: RefKind, codes: string[], startIndex = 0) => {
    setModal({ kind, codes, index: startIndex });
  }, []);

  const api = useMemo(() => ({ index, open }), [index, open]);

  return (
    <RefsContext.Provider value={api}>
      {children}
      {modal && (
        <RefModal
          state={modal}
          onChange={(index) => setModal({ ...modal, index })}
          onClose={() => setModal(null)}
          onOpenSection={() => {
            setModal(null);
            onOpenSection(modal.kind);
          }}
        />
      )}
    </RefsContext.Provider>
  );
}

function RefModal({
  state,
  onChange,
  onClose,
  onOpenSection,
}: {
  state: ModalState;
  onChange: (index: number) => void;
  onClose: () => void;
  onOpenSection: () => void;
}) {
  const refs = useRefs();
  const map = state.kind === 'sign' ? refs?.index.signs : refs?.index.markup;
  const item: RefItem | undefined = map?.get(state.codes[state.index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && state.index > 0) onChange(state.index - 1);
      if (e.key === 'ArrowRight' && state.index < state.codes.length - 1)
        onChange(state.index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.index, state.codes.length, onChange, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl border bg-background shadow-xl">
        {item ? (
          <>
            <div className="flex items-start justify-between gap-3 border-b px-5 py-3.5">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {state.kind === 'sign' ? 'Дорожный знак' : 'Дорожная разметка'}
                  {item.group ? ` · ${item.group}` : ''}
                </div>
                <div className="mt-0.5 truncate text-base font-bold">
                  {item.code}
                  {item.title ? ` · ${item.title}` : ''}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={onClose} aria-label="Закрыть">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {item.imgs.length > 0 ? (
                <div className={`flex flex-wrap items-start justify-center gap-3 rounded-lg border bg-white p-3 dark:bg-white`}>
                  {item.imgs.map((src) => (
                    <img
                      key={src}
                      src={src}
                      alt={item.title || item.code}
                      className="max-h-44 w-auto rounded"
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
                  Иллюстрация — в разделе «{state.kind === 'sign' ? 'Дорожные знаки' : 'Дорожная разметка'}»
                </p>
              )}
              {item.desc && (
                <p className="mt-3 whitespace-pre-line text-[14px] leading-6">
                  <LinkifiedTextInner text={item.desc} />
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t px-5 py-3">
              {state.codes.length > 1 ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={state.index === 0}
                    onClick={() => onChange(state.index - 1)}
                    aria-label="Предыдущий"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    {state.index + 1} из {state.codes.length}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={state.index === state.codes.length - 1}
                    onClick={() => onChange(state.index + 1)}
                    aria-label="Следующий"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <span />
              )}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={onOpenSection}>
                <ExternalLink className="h-3.5 w-3.5" />
                Открыть раздел
              </Button>
            </div>
          </>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              В справочнике не найдено: {state.codes[state.index]}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={onClose}>
              Закрыть
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
