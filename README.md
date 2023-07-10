# Evacuation

![test workflow](https://github.com/NikBel3476/evacuation/actions/workflows/test.yml/badge.svg)
[![codecov](https://codecov.io/gh/NikBel3476/evacuation/branch/master/graph/badge.svg?token=ZPETC3A6Y5)](https://codecov.io/gh/NikBel3476/evacuation)

**EvacuationC** -- программа моделирования движения людей в здании. 

Резульататом работы программы является время освобождения здания (длительность эвакуации).

# Структура проекта

```
.
├── res             -- Ресурсы. Файлы зданий
├── src-tauri       -- Исходный код программы
├── cypress         -- UI тесты
└── src-ui          -- Исходный код управления графическим интерфейсом
```

#### Используемые библиотеки Rust:
- serde(serde_json) - библиотека для сериализации/десериализации json файлов
- libc - библиотека для совместимости типов Rust и C
- cc - библиотека для компиляции исходного кода языка Си и объединение его с основным исполянемым файлом
- tauri - библиотека для создания графического интерфейса, основанная на webview

## Необходимый интсрументарий
- Rust последней версии(rustup, rustc и cargo). [Ссылка для скачивания rust](https://www.rust-lang.org/tools/install)
- Node.js версии 16.* или выше [Ссылка для скачивания Node.js](https://nodejs.org/en)  
  (для этого можно воспользоваться [nvm](https://github.com/nvm-sh/nvm)(Linux и macOS) или [nvm-windows](https://github.com/coreybutler/nvm-windows)(Windows))

## Сборка и запуск

Перед запуском необходимо установить нужные для работы пакеты и зависимости, которые указаны на этой странице:  
https://tauri.app/v1/guides/getting-started/prerequisites

1. Перейти в корневую директорию проекта
2. Выполнить команду `npm install` или `npm i` для установки зависимостей
3. Выполнить команду `npm run tauri dev` для запуска приложения

Настройки моделируемого сценария задаются в файле scenario.json. Он состоит из нескольких секций:
```
{
  "bim": [],                 -- список цифровых моделей зданий,
  "logger_configure": "",    -- путь к файлу с настроками логгирования
  "distribution": {},        -- настройки распределения людей в здании
  "transits": {},            -- настройки ширины проемов в здании
  "modeling": {}             -- настройки модели движения людского потока в здании
}
```

### distribution
Через блок `distribution` можно задать выбрать тип (`type`) распределения людей в здании:
```
uniform   -- равномерное распределение людей в здании с заданной плотностью (density)
from_bim  -- распеделение, которое задано в пространственно-информационной модели здания
```
В поле `density` указывается плотность начального количества людей, чел./м^2

В блоке `special` можно указать специальные настройки для одного или группы областей здания.
Этот блок обрабатывается всегда.

```json
{
    "distribution": {
        "type":"uniform",
        "density": 0.1,
        "special": [
            {
                "uuid": [
                    "87c49613-44a7-4f3f-82e0-fb4a9ca2f46d"
                ],
                "density": 1.0,
                "_comment": "The uuid is Room_1 by three_zone_three_transit"
            }
        ]
    }   
}
```

### transits


### modeling


### some useful links
http://www.fireevacuation.ru/files/files-5-1/evac2015.pdf?ysclid=liyie02rcj367967370
