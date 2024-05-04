# Evacuation

![test workflow](https://github.com/NikBel3476/evacuation/actions/workflows/test.yml/badge.svg)
[![codecov](https://codecov.io/gh/NikBel3476/evacuation-gui-iced/graph/badge.svg?token=TYZ33ISYMJ)](https://codecov.io/gh/NikBel3476/evacuation-gui-iced)

**Evacuation-gui-iced** -- графический интерфейс программы моделирования движения людей при эвакуации ([evacuation-core](https://github.com/NikBel3476/evacuation-core)). 

Резульататом работы программы является время освобождения здания (длительность эвакуации).

## Необходимый интсрументарий
- Rust последней версии(rustup, rustc и cargo). [Ссылка для скачивания rust](https://www.rust-lang.org/tools/install)
- gtk3 или поддержка XDG Desktop Portal (для дистрибутивов Linux)

## Сборка и запуск

1. Перейти в корневую директорию проекта
2. Выполнить команду `cargo run` для запуска приложения

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
