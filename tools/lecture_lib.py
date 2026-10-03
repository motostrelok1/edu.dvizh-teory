# -*- coding: utf-8 -*-
"""Библиотека автоконвертации разделов ПДД в формат лекции.

convert() принимает исходные блоки раздела (p/h2/img) и словарь leads
{номер пункта -> текст lead после quote этого пункта, 'intro' -> lead
перед первым quote} и возвращает лекционную последовательность блоков:
  h2 -> topic
  абзацы с номером пункта N.M. -> quote (продолжения склеиваются через \n)
  img -> проходом
Мусорные абзацы (без букв, редакционные хвосты) пропускаются.
"""
import re

POINT_RE = re.compile(r'^(\d+\.\d+[¹²]?(?:_\w+)?)\s*\.', re.S)
DOPUSK_POINT_RE = re.compile(r'^(\d+(?:_\d+)?)\s*\.', re.S)

JUNK_RES = [
    re.compile(r'^\W+$'),                       # нет букв: ",", "(, -"
    re.compile(r'^(Российской Федерации от|в ред\.|\(в ред\.|Примечание изготовителя)', re.I),
]


def is_junk(text):
    t = text.strip()
    return any(r.search(t) for r in JUNK_RES)


def convert(blocks, leads=None, point_re=None):
    """Конвертирует исходные блоки раздела в лекционную структуру."""
    leads = leads or {}
    point_re = point_re or POINT_RE
    out = []
    cur_quote = None
    cur_point = None

    def flush():
        nonlocal cur_quote, cur_point
        if cur_quote is not None:
            out.append({'type': 'quote', 'text': cur_quote})
            lead_text = leads.get(cur_point)
            if lead_text:
                out.append({'type': 'lead', 'text': lead_text})
            cur_quote = None
            cur_point = None

    for b in blocks:
        t = (b.get('text') or '').strip()
        if b['type'] == 'h2':
            flush()
            out.append({'type': 'topic', 'text': t})
            continue
        if b['type'] == 'img':
            flush()
            out.append(dict(b))
            continue
        if b['type'] != 'p':
            continue
        if is_junk(t):
            continue
        m = point_re.match(t)
        if m:
            flush()
            cur_point = m.group(1)
            cur_quote = t
        else:
            if cur_quote is not None:
                cur_quote += '\n' + t
            else:
                # Абзац без открытого пункта (вводный текст раздела) — как p
                out.append({'type': 'p', 'text': t})
    flush()
    return out
