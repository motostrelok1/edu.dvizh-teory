# Как запускать

## Требования

- Node.js 20+ и npm
- Зависимости уже установлены (`node_modules/`). При переносе проекта на другую
  машину выполните один раз:

```bash
npm install
```

## Режим разработки (с hot-reload)

```bash
npm run dev
```

Сервер поднимется на **http://localhost:3000** (порт задан в `vite.config.ts`).
Чтобы использовать другой порт:

```bash
npm run dev -- --port 4173
```

## Production-сборка

```bash
npm run build      # типы + сборка в dist/
npm run preview    # локальный просмотр сборки на http://localhost:4173
```

`dist/` — статический сайт: его можно открыть через любой веб-сервер
(Nginx, GitHub Pages, внутренний портал автошколы и т.п.).

## Просмотр в Kimi Work

Приложение зарегистрировано как Website Artifact: откройте карточку
[ПДД — обучающее приложение](http://localhost:7100/) — Kimi Work сам поднимет
dev-сервер на свободном порту. Для этого важно, чтобы проект оставался в каталоге:

```
C:\Users\aleksey.dubovskoy\Documents\kimi\tasks\2026-09-25\18-21-20-601d1bd9\pdd-trainer
```

## Обновление данных (новая редакция ПДД)

1. Положите новый PDF рядом со скриптом: `work/pdd.pdf`.
2. В каталоге `work/` выполните:

```bash
python extract.py
```

3. Скопируйте результаты в проект:

```bash
cp work/app-data/sections.json pdd-trainer/public/sections.json
rm -rf pdd-trainer/public/img
cp -r work/app-data/img pdd-trainer/public/img
```

4. Пересоберите: `npm run build`.

Скрипт требует Python с пакетом PyMuPDF (`pip install PyMuPDF`).
