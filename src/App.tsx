import { BookOpen, Car, Loader2, Menu, TrafficCone } from 'lucide-react';
import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/Sidebar';
import { SectionView } from '@/components/SectionView';
import { SearchBox } from '@/components/SearchBox';
import { RefsProvider } from '@/components/Refs';
import { usePdd } from '@/hooks/usePdd';
import { buildRefIndex } from '@/lib/refs';

export default function App() {
  const {
    data,
    error,
    done,
    toggleDone,
    sections,
    active,
    prevSection,
    nextSection,
    openSection,
    stats,
  } = usePdd();

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-6 text-center">
        <div>
          <p className="text-lg font-semibold">Не удалось загрузить данные</p>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AppBody
      sections={sections}
      activeId={active?.id ?? null}
      done={done}
      toggleDone={toggleDone}
      active={active}
      prevSection={prevSection}
      nextSection={nextSection}
      openSection={openSection}
      stats={stats}
      title={data.title}
      subtitle={data.subtitle}
    />
  );
}

function AppBody({
  sections,
  activeId,
  done,
  toggleDone,
  active,
  prevSection,
  nextSection,
  openSection,
  stats,
  title,
  subtitle,
}: {
  sections: ReturnType<typeof usePdd>['sections'];
  activeId: string | null;
  done: Set<string>;
  toggleDone: (id: string) => void;
  active: ReturnType<typeof usePdd>['active'];
  prevSection: ReturnType<typeof usePdd>['prevSection'];
  nextSection: ReturnType<typeof usePdd>['nextSection'];
  openSection: (id: string) => void;
  stats: ReturnType<typeof usePdd>['stats'];
  title: string;
  subtitle: string;
}) {
  const refIndex = useMemo(() => buildRefIndex(sections), [sections]);
  const progress = sections.length ? (done.size / sections.length) * 100 : 0;

  const sidebar = (
    <Sidebar sections={sections} activeId={activeId} done={done} onSelect={openSection} />
  );

  return (
    <RefsProvider index={refIndex} onOpenSection={(kind) => openSection(kind === 'sign' ? 'signs' : 'markup')}>
      <div className="flex h-screen flex-col">
      {/* Шапка */}
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetTitle className="sr-only">Разделы ПДД</SheetTitle>
            <div className="h-full overflow-y-auto">{sidebar}</div>
          </SheetContent>
        </Sheet>

        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Car className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight">{title}</h1>
            <p className="truncate text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden w-40 sm:block">
            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
              <span>Прогресс</span>
              <span>
                {done.size} / {sections.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="hidden md:block">
            <SearchBox sections={sections} onOpen={openSection} />
          </div>
        </div>
      </header>

      {/* Поиск для мобильных */}
      <div className="border-b px-4 py-2 md:hidden">
        <SearchBox sections={sections} onOpen={openSection} />
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Боковая панель */}
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-r md:block">
          {sidebar}
        </aside>

        {/* Контент */}
        <main id="content-top" className="min-w-0 flex-1 overflow-y-auto">
          {active ? (
            <SectionView
              key={active.id}
              section={active}
              isDone={done.has(active.id)}
              onToggleDone={() => toggleDone(active.id)}
              prev={prevSection}
              next={nextSection}
              onOpen={openSection}
            />
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <TrafficCone className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-2xl font-bold">Учебное приложение по ПДД</h2>
              <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
                Весь текст Правил дорожного движения разбит на разделы, иллюстрации —
                дорожные знаки, разметка, схемы — размещены на своих местах в тексте.
                Выберите раздел слева или воспользуйтесь поиском.
              </p>
              <div className="mt-8 grid w-full grid-cols-3 gap-3">
                <div className="rounded-xl border bg-card p-4">
                  <BookOpen className="mx-auto h-5 w-5 text-primary" />
                  <div className="mt-2 text-2xl font-bold">{stats.sections}</div>
                  <div className="text-xs text-muted-foreground">разделов</div>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <BookOpen className="mx-auto h-5 w-5 text-primary" />
                  <div className="mt-2 text-2xl font-bold">{stats.paras}</div>
                  <div className="text-xs text-muted-foreground">абзацев текста</div>
                </div>
                <div className="rounded-xl border bg-card p-4">
                  <TrafficCone className="mx-auto h-5 w-5 text-primary" />
                  <div className="mt-2 text-2xl font-bold">{stats.imgs}</div>
                  <div className="text-xs text-muted-foreground">иллюстраций</div>
                </div>
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                Отмечайте разделы как изученные — прогресс сохраняется в этом браузере.
              </p>
            </div>
          )}
        </main>
      </div>
      </div>
    </RefsProvider>
  );
}
