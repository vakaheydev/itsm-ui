# Структура проекта

```
naumen-webapp/
│
├── index.html              # Главная страница приложения
├── styles.css              # Стили интерфейса
│
├── app.js                  # Главная логика приложения
├── form-renderer.js        # Универсальный рендерер форм
├── form-configs.js         # Конфигурации всех типов форм
├── validator.js            # Модуль валидации полей
├── data-service.js         # Сервис для работы с данными
│
├── README.md               # Полная документация
├── QUICK_START.md          # Быстрый старт
└── EXAMPLES.js             # Примеры конфигураций
```

## Описание файлов

### index.html
- HTML-разметка приложения
- Два основных блока:
  - `#form-selector` - выбор типа заявки
  - `#form-wrapper` - сама форма
- Подключение всех JS-модулей

### styles.css
- Современный дизайн с градиентами
- Адаптивная верстка
- Стили для всех элементов форм
- Анимации и переходы
- Стили для селектора типов заявок

### app.js
**Главная логика приложения:**
- `initApp()` - инициализация при загрузке
- `renderFormTypeSelector()` - рендеринг кнопок выбора
- `selectFormType(formId)` - выбор и отображение формы
- `initForm()` - инициализация выбранной формы
- `goBackToSelector()` - возврат к выбору
- `loadInitialDictionaries()` - загрузка справочников
- `setupEventHandlers()` - установка обработчиков
- `handleFormSubmit()` - обработка отправки
- `handleDependentFields()` - каскадная загрузка

### form-renderer.js
**Универсальный рендерер форм:**
- `init(fields, container)` - инициализация
- `render()` - рендеринг всей формы
- `createFormGroup(field)` - создание группы поля
- `createInputField(field)` - создание input
- `createSelectField(field)` - создание select
- `createTextareaField(field)` - создание textarea
- `getFormData()` - получение данных формы
- `showErrors(errors)` - отображение ошибок
- `clearErrors()` - очистка ошибок
- `clearForm()` - очистка формы
- `updateSelectOptions(name, options)` - обновление опций

**Публичный API:**
```javascript
FormRenderer.init(fields, container)
FormRenderer.render()
FormRenderer.getFormData()
FormRenderer.showErrors(errors)
FormRenderer.clearErrors()
FormRenderer.clearForm()
FormRenderer.updateSelectOptions(name, options)
FormRenderer.getFieldByName(name)
```

### form-configs.js
**Конфигурации форм:**
- `formTypes` - массив всех типов форм
- `generalFormConfig` - общая заявка
- `technicalFormConfig` - техподдержка
- `hrFormConfig` - кадровые вопросы
- `accessFormConfig` - запрос доступа
- `equipmentFormConfig` - заказ оборудования
- `meetingFormConfig` - бронирование переговорной
- `formConfigsMap` - маппинг ID → конфигурация

**Публичный API:**
```javascript
FormConfigs.getFormTypes()
FormConfigs.getFormConfig(formId)
FormConfigs.getFormType(formId)
```

### validator.js
**Модуль валидации:**
- `validateField(field, value)` - валидация поля
- `validateForm(fields, formData)` - валидация формы
- `hasErrors(errors)` - проверка наличия ошибок

**Правила валидации:**
- Обязательность (required)
- Мин./макс. длина (minLength, maxLength)
- Мин./макс. значение (min, max)
- Email формат
- Числовой формат

**Публичный API:**
```javascript
Validator.validateField(field, value)
Validator.validateForm(fields, formData)
Validator.hasErrors(errors)
```

### data-service.js
**Сервис данных:**
- `mockData` - моковые данные справочников
- `loadDictionary(name, dependsOn)` - загрузка справочника
- `submitForm(formData)` - отправка формы
- `simulateHttpRequest(data, delay)` - имитация HTTP

**Справочники:**
- cities - города
- departments - отделы (зависят от города)
- requestTypes - типы заявок
- priorities - приоритеты
- problemTypes - типы проблем
- urgencyLevels - уровни срочности
- hrRequestTypes - типы HR-запросов
- systems - системы для доступа
- accessLevels - уровни доступа
- equipmentTypes - типы оборудования
- offices - офисы
- meetingRooms - переговорные (зависят от офиса)
- meetingEquipment - оборудование для встреч

**Публичный API:**
```javascript
DataService.loadDictionary(name, dependsOn)
DataService.submitForm(formData)
```

## Поток данных

```
1. Загрузка страницы
   ↓
2. app.js: initApp()
   ↓
3. Отрисовка кнопок выбора типа заявки
   ↓
4. Пользователь выбирает тип
   ↓
5. FormConfigs.getFormConfig(id)
   ↓
6. FormRenderer.init() + render()
   ↓
7. DataService.loadDictionary() - загрузка справочников
   ↓
8. Пользователь заполняет форму
   ↓
9. Validator.validateField() при потере фокуса
   ↓
10. Пользователь нажимает "Отправить"
    ↓
11. Validator.validateForm() - полная валидация
    ↓
12. DataService.submitForm() - отправка
    ↓
13. Показ сообщения об успехе
    ↓
14. Возврат к выбору типа заявки
```

## Архитектурные паттерны

### Module Pattern
Каждый модуль обернут в IIFE (Immediately Invoked Function Expression):
```javascript
const ModuleName = (function() {
    'use strict';
    // приватные переменные и функции
    return {
        // публичный API
    };
})();
```

### Разделение ответственности
- **app.js** - orchestration (оркестровка)
- **form-renderer.js** - presentation (представление)
- **form-configs.js** - configuration (конфигурация)
- **validator.js** - validation (валидация)
- **data-service.js** - data access (доступ к данным)

### Declarative Configuration
Формы описываются декларативно в JSON-формате:
```javascript
{
    name: 'fieldName',
    type: 'text',
    label: 'Label',
    required: true,
    // ...
}
```

### Dependency Injection
Рендерер не знает о конкретных конфигурациях, они передаются извне:
```javascript
FormRenderer.init(formConfig, container);
```

## Расширяемость

### Добавление нового типа поля
1. Добавить функцию создания в `form-renderer.js`
2. Обновить `createFormGroup()` для обработки нового типа
3. Добавить стили в `styles.css`
4. При необходимости добавить валидацию в `validator.js`

### Добавление новой формы
1. Описать в `form-configs.js`
2. Добавить справочники в `data-service.js`
3. Всё остальное работает автоматически!

### Интеграция с backend
Заменить методы в `data-service.js` на реальные HTTP-запросы.

## Технологии

- **Vanilla JavaScript** (ES5+)
- **CSS3** (Flexbox, Grid, Animations)
- **HTML5**
- Без зависимостей от внешних библиотек
- Модульная архитектура
- Promise-based API

