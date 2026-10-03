# -*- coding: utf-8 -*-
"""Генерация favicon для edu.dvizh-school.ru: белая шапка выпускника
на синем скруглённом квадрате. Вывод: public/favicon*.png, favicon.ico, favicon.svg."""
from PIL import Image, ImageDraw

S = 512          # базовый холст (рисуем крупно, уменьшаем для чёткости)
AA = 4           # суперсэмплинг


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def make(size):
    W = size * AA
    img = Image.new('RGBA', (W, W), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    k = W / S

    # --- фон: скруглённый квадрат с вертикальным градиентом ---
    r = int(105 * k)
    top, bottom = (37, 99, 235), (29, 78, 216)  # blue-600 -> blue-700
    mask = Image.new('L', (W, W), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, W - 1, W - 1], radius=r, fill=255)
    bg = Image.new('RGB', (W, W))
    for y in range(W):
        bg.paste(lerp(top, bottom, y / W), (0, y, W, y + 1))
    img.paste(bg, (0, 0), mask)

    white = (255, 255, 255, 255)
    P = lambda x, y: (x * k, y * k)   # координаты из 512-пространства

    # --- доска шапки (ромб) ---
    cx, cy = 256, 232
    dw, dh = 150, 76                  # полуоси ромба
    d.polygon([P(cx, cy - dh), P(cx + dw, cy), P(cx, cy + dh), P(cx - dw, cy)], fill=white)

    # --- основа под доской (эллипс) ---
    d.ellipse([P(cx - 90, 300 - 38), P(cx + 90, 300 + 44)], fill=white)

    # --- кисточка: нить + помпон ---
    d.line([P(cx + dw - 6, cy + 4), P(cx + dw + 24, 352)], fill=white, width=int(13 * k))
    px, py, pr = cx + dw + 28, 372, 25
    d.ellipse([P(px - pr, py - pr), P(px + pr, py + pr)], fill=white)

    return img.resize((size, size), Image.LANCZOS)


# PNG нужных размеров
for size, name in [(512, 'favicon-512.png'), (192, 'favicon-192.png'),
                   (180, 'apple-touch-icon.png'), (32, 'favicon-32.png')]:
    make(size).save(f'public/{name}')
    print('saved', name)

# ICO (16/32/48) для старых браузеров
img48 = make(48)
img48.save('public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print('saved favicon.ico')
