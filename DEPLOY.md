# Деплой на edu.dvizh-school.ru

Приложение полностью статическое: прод-сборка (`npm run build`) — это каталог
`dist/`, который отдаётся nginx. Схема: пуш в `main` на GitHub → GitHub Actions
собирает проект и выгружает `dist/` на VDS по SSH.

## 1. GitHub

1. Создайте пустой репозиторий (без README) на github.com, например `pdd-trainer`.
2. Залейте код:
   ```bash
   git remote add origin git@github.com:<ваш-логин>/pdd-trainer.git
   git push -u origin main
   ```
   (нужен SSH-ключ `~/.ssh/id_ed25519`, добавленный в GitHub → Settings → SSH keys)

## 2. VDS (один раз)

```bash
# каталог сайта
mkdir -p /var/www/edu.dvizh-school.ru
chown -R <пользователь>:<пользователь> /var/www/edu.dvizh-school.ru

# nginx
cp deploy/nginx-edu.dvizh-school.ru.conf /etc/nginx/sites-available/edu.dvizh-school.ru
ln -s /etc/nginx/sites-available/edu.dvizh-school.ru /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 3. DNS (один раз)

У регистратора/провайдера DNS домена `dvizh-school.ru` добавьте запись:

```
edu  A  <IP вашего VDS>
```

Дождитесь обновления DNS (обычно 5–30 минут).

## 4. Секреты GitHub (один раз)

В репозитории: Settings → Secrets and variables → Actions → New repository secret:

| Секрет         | Значение                                            |
| -------------- | --------------------------------------------------- |
| `VDS_HOST`     | IP-адрес VDS                                        |
| `VDS_USER`     | SSH-пользователь на VDS                             |
| `VDS_PATH`     | `/var/www/edu.dvizh-school.ru`                      |
| `VDS_SSH_KEY`  | приватный SSH-ключ, которому VDS разрешает вход     |

Проще всего сгенерировать отдельную пару ключей для деплоя:

```bash
ssh-keygen -t ed25519 -f deploy_key -N ""
# публичную часть (deploy_key.pub) добавить на VDS в ~<пользователя>/.ssh/authorized_keys
# приватную часть (deploy_key) — в секрет VDS_SSH_KEY целиком
```

## 5. Проверка

Запушьте любой коммит в `main` → вкладка Actions → зелёный значок →
сайт открывается по адресу http://edu.dvizh-school.ru

## HTTPS (рекомендуется)

```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d edu.dvizh-school.ru
```

Сертификат будет автоматически продлеваться.
