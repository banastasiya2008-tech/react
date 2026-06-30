
# 1. Dependencies installation

npm install

## 2. Starting the server in development mode (with automatic reboot)

npm run dev

## 3. The server is available at <http://localhost:5003>

## Scrpits

| Команда         | Описание                           |
| --------------- | ---------------------------------- |
| `npm run dev`   | Запуск через `tsx` с watch-режимом |
| `npm run build` | Компиляция TS → JS в папку `dist/` |
| `npm start`     | Запуск скомпилированного JS        |

## API ENDPOINTS

## Base Url

<http://localhost:5003/api>

## Game model endpoints

| Метод  | URL             | Описание                          | Query-параметры              |
| ------ | --------------- | --------------------------------- | ---------------------------- |
| GET    | `/games`        | Список игр (с пагинацией)         | `?page=1&limit=10`           |
| GET    | `/games/search` | Поиск по названию/жанру/платформе | `?q=witcher&page=1&limit=10` |
| GET    | `/games/filter` | Фильтр по жанру                   | `?genre=rpg&page=1&limit=10` |
| GET    | `/games/:id`    | Одна игра по ID                   | —                            |
| POST   | `/games/new`    | Создать игру                      | —                            |
| PUT    | `/games/:id`    | Обновить игру                     | —                            |
| DELETE | `/games/:id`    | Удалить игру                      | —                            |

## Example of pagination get-request

GET <http://localhost:5003/api/games?page=1&limit=5>

## Example of get-request with search-query

GET <http://localhost:5003/api/games/search?q=elden&page=1&limit=10>

## Example of create game (POST-request)

POST <http://localhost:5003/api/games/new>
Content-Type: application/json

{
  "title": "Baldur's Gate 3",
  "genre": "RPG",
  "price": 59.99,
  "rating": 9.9,
  "platform": ["PC", "PS5"],
  "cover": "<https://example.com/bg3.jpg>",
  "releaseYear": 2023,
  "inStock": true
}

## Example of update-request

PUT <http://localhost:5003/api/games/1>
Content-Type: application/json

{
  "price": 19.99,
  "inStock": false
}

## Example of delete-request

DELETE <http://localhost:5003/api/games/1>
