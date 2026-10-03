export interface ImgBlock {
  type: 'img';
  src: string;
  w: number;
  h: number;
}

export interface TextBlock {
  type: 'p' | 'h2';
  text: string;
}

/* --- Лекция: 4 части — мотивация, объяснение, примеры, упражнение --- */

/** 1. Мотивация: зачем изучать этот раздел */
export interface MotivationBlock {
  type: 'motivation';
  text: string;
}

/** Подтема внутри лекции (заголовок третьего уровня) */
export interface TopicBlock {
  type: 'topic';
  text: string;
}

/** Объяснение лектором простым языком */
export interface LeadBlock {
  type: 'lead';
  text: string;
}

/** Точный текст пункта Правил */
export interface QuoteBlock {
  type: 'quote';
  text: string;
}

/** Термин из словаря Правил (п. 1.2) */
export interface TermBlock {
  type: 'term';
  term: string;
  def: string;
  /** термин, который точно спрашивают на экзамене */
  important?: boolean;
}

/** Пример (good = true) или антипример из жизни */
export interface ExampleBlock {
  type: 'example';
  good: boolean;
  title: string;
  text: string;
}

/** Вопрос интерактивного теста */
export interface QuizQuestion {
  q: string;
  options: string[];
  /** индекс верного варианта */
  correct: number;
  /** пояснение после ответа */
  explain: string;
}

/** 4. Упражнение: тест для самопроверки */
export interface QuizBlock {
  type: 'quiz';
  intro?: string;
  questions: QuizQuestion[];
}

export type Block =
  | ImgBlock
  | TextBlock
  | MotivationBlock
  | TopicBlock
  | LeadBlock
  | QuoteBlock
  | TermBlock
  | ExampleBlock
  | QuizBlock;

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export interface PddData {
  title: string;
  subtitle: string;
  sections: Section[];
}

/** Лекционный ли это раздел (есть блок мотивации) */
export function isLecture(section: Section): boolean {
  return section.blocks.some((b) => b.type === 'motivation');
}

export function isImg(b: Block): b is ImgBlock {
  return b.type === 'img';
}
