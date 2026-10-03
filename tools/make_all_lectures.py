# -*- coding: utf-8 -*-
"""Пересборка разделов 3-26 и приложений в формат лекции.

Для каждого раздела из lecture_data.AUTHOR (кроме s1/s2, которые собраны
отдельными скриптами):
  [motivation] + intro + сконвертированные исходные блоки (quote/topic/lead/
  p/img) + examples + quiz
Разделы с 'pass': True — оригинальные блоки идут проходом (h2 -> topic).
Идемпотентен: исходники берутся из текущего sections.json, s1/s2 не трогаем
(они уже лекции; повторный запуск не испортит, т.к. их блоки не участвуют
в конвертации).
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from lecture_lib import convert, DOPUSK_POINT_RE  # noqa: E402
from lecture_data import AUTHOR  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / 'public' / 'sections.json'

SKIP = {'s1', 's2'}


def build_blocks(section, author):
    blocks = [{'type': 'motivation', 'text': author['motivation']}]
    if author.get('intro'):
        blocks.append({'type': 'lead', 'text': author['intro']})

    src = section['blocks']
    if author.get('pass'):
        for b in src:
            if b['type'] == 'h2':
                blocks.append({'type': 'topic', 'text': b['text']})
            else:
                blocks.append(dict(b))
    else:
        point_re = DOPUSK_POINT_RE if section['id'] == 'dopusk' else None
        blocks.extend(convert(src, author.get('leads'), point_re=point_re))

    for good, title, text in author.get('examples', []):
        blocks.append({'type': 'example', 'good': good, 'title': title, 'text': text})

    quiz = author.get('quiz')
    if quiz:
        blocks.append({
            'type': 'quiz',
            'intro': quiz['intro'],
            'questions': [dict(q) for q in quiz['questions']],
        })
    return blocks


def main():
    data = json.loads(DATA.read_text(encoding='utf-8'))
    for section in data['sections']:
        sid = section['id']
        if sid in SKIP or sid not in AUTHOR:
            continue
        section['blocks'] = build_blocks(section, AUTHOR[sid])
        print(f'{sid}: {len(section["blocks"])} блоков')
    DATA.write_text(
        json.dumps(data, ensure_ascii=False, indent=1) + '\n', encoding='utf-8'
    )
    print('sections.json обновлён')


if __name__ == '__main__':
    main()
