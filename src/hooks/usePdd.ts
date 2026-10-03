import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PddData, Section } from '@/types/pdd';

const STORAGE_KEY = 'pdd-progress-v1';

export function usePdd() {
  const [data, setData] = useState<PddData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(
    () => window.location.hash.slice(1) || null,
  );

  useEffect(() => {
    const onHash = () => setActiveId(window.location.hash.slice(1) || null);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    fetch('sections.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d: PddData) => {
        setData(d);
        try {
          const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
          setDone(new Set(saved));
        } catch {
          /* ignore */
        }
      })
      .catch((e) => setError(String(e)));
  }, []);

  const toggleDone = useCallback((id: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  const sections = useMemo(() => data?.sections ?? [], [data]);

  const flatIndex = useMemo(() => {
    const m = new Map<string, number>();
    sections.forEach((s, i) => m.set(s.id, i));
    return m;
  }, [sections]);

  const active: Section | null = useMemo(
    () => sections.find((s) => s.id === activeId) ?? null,
    [sections, activeId],
  );

  const activeIndex = active ? (flatIndex.get(active.id) ?? -1) : -1;
  const prevSection = activeIndex > 0 ? sections[activeIndex - 1] : null;
  const nextSection =
    activeIndex >= 0 && activeIndex < sections.length - 1
      ? sections[activeIndex + 1]
      : null;

  const openSection = useCallback((id: string) => {
    setActiveId(id);
    if (window.location.hash.slice(1) !== id) {
      window.location.hash = id;
    }
    requestAnimationFrame(() => {
      document
        .getElementById('content-top')
        ?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    });
  }, []);

  const stats = useMemo(() => {
    const paras = sections.reduce(
      (n, s) => n + s.blocks.filter((b) => b.type === 'p').length,
      0,
    );
    const imgs = sections.reduce(
      (n, s) => n + s.blocks.filter((b) => b.type === 'img').length,
      0,
    );
    return { sections: sections.length, paras, imgs };
  }, [sections]);

  return {
    data,
    error,
    done,
    toggleDone,
    sections,
    active,
    activeIndex,
    prevSection,
    nextSection,
    openSection,
    stats,
  };
}
