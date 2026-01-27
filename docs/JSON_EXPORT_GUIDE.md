# JSON Export Service - Руководство

## Описание

`json-export-service.js` - сервис для преобразования данных форм в JSON формат с возможностью кастомной обработки для каждого типа формы.

## Возможности

1. **Мапа хендлеров** - индивидуальная обработка для каждого типа формы
2. **Модальное окно** - красивое отображение JSON с подсветкой
3. **Копирование** - кнопка для копирования JSON в буфер обмена
4. **Расширяемость** - легко добавлять новые хендлеры

## Структура хендлеров

### Встроенные хендлеры

```javascript
const formHandlers = {
    'incident': handleIncidentForm,      // Форма "Инцидент"
    'change': handleChangeForm,          // Форма "Изменение"
    'service': handleServiceForm         // Форма "Сервисный запрос"
};
```

### Пример хендлера

```javascript
function handleIncidentForm(formData) {
    return {
        type: 'incident',
        title: formData.title || '',
        description: formData.description || '',
        priority: formData.priority || '',
        category: formData.category || '',
        subcategory: formData.subcategory || '',
        affectedCI: formData.affectedCI || '',
        submittedAt: new Date().toISOString(),
        rawData: formData  // Сохраняем исходные данные
    };
}
```

## API

### exportToJson(formType, formData)

Преобразует данные формы в JSON.

**Параметры:**
- `formType` (String) - тип формы (например, 'incident')
- `formData` (Object) - данные из формы

**Возвращает:**
```javascript
{
    success: true,
    json: "...",      // JSON строка с отступами
    data: {...}       // Обработанный объект данных
}
```

### showJsonModal(jsonString)

Показывает модальное окно с JSON.

**Параметры:**
- `jsonString` (String) - JSON строка для отображения

### registerHandler(formType, handler)

Регистрирует новый хендлер для типа формы.

**Параметры:**
- `formType` (String) - тип формы
- `handler` (Function) - функция обработки данных

**Пример:**
```javascript
JsonExportService.registerHandler('custom-form', function(formData) {
    return {
        type: 'custom',
        customField: formData.someField,
        timestamp: new Date().toISOString()
    };
});
```

## Использование в app.js

```javascript
function handleFormSubmit(successMessage) {
    // ... валидация ...

    // Экспорт в JSON
    const result = JsonExportService.exportToJson(currentFormType.id, formData);
    
    if (result.success) {
        JsonExportService.showJsonModal(result.json);
    } else {
        console.error('Ошибка при экспорте JSON:', result.error);
    }
}
```

## Добавление нового хендлера

### Шаг 1: Определить структуру данных

Решите, какую структуру JSON вы хотите получить для вашего типа формы.

### Шаг 2: Создать функцию хендлера

```javascript
function handleMyCustomForm(formData) {
    return {
        type: 'my_custom_type',
        // Ваша кастомная структура
        field1: formData.field1 || '',
        field2: formData.field2 || '',
        metadata: {
            submittedAt: new Date().toISOString(),
            version: '1.0'
        },
        rawData: formData
    };
}
```

### Шаг 3: Добавить в мапу

```javascript
const formHandlers = {
    'incident': handleIncidentForm,
    'change': handleChangeForm,
    'service': handleServiceForm,
    'my-custom-form': handleMyCustomForm  // ← Добавить здесь
};
```

### Шаг 4: (Опционально) Динамическая регистрация

Если не хотите менять исходный код, используйте API:

```javascript
// В отдельном файле или при инициализации
JsonExportService.registerHandler('my-custom-form', handleMyCustomForm);
```

## Формат вывода

### Для формы с хендлером

```json
{
  "type": "incident",
  "title": "Проблема с доступом",
  "description": "Не могу войти в систему",
  "priority": "high",
  "category": "access",
  "subcategory": "login",
  "affectedCI": "AUTH-001",
  "submittedAt": "2026-01-27T10:30:00.000Z",
  "rawData": {
    "title": "Проблема с доступом",
    "description": "Не могу войти в систему",
    ...
  }
}
```

### Для формы БЕЗ хендлера

Если для типа формы нет специфичного хендлера, используется универсальный формат:

```json
{
  "type": "unknown-form-type",
  "submittedAt": "2026-01-27T10:30:00.000Z",
  "data": {
    // Все поля формы как есть
  }
}
```

## Стилизация модального окна

Стили находятся в [`styles.css`](styles.css) в секции `/* JSON Modal Styles */`.

### Основные классы:

- `.json-modal` - оверлей модального окна
- `.json-modal-content` - контейнер содержимого
- `.json-modal-header` - заголовок
- `.json-modal-body` - тело с JSON
- `.json-output` - блок кода с JSON
- `.json-modal-footer` - футер с кнопками
- `.json-copy-btn` - кнопка копирования
- `.json-close-btn` - кнопка закрытия

## Безопасность

- Используется `escapeHtml()` для предотвращения XSS атак
- JSON отображается как текст, а не выполняется
- Использует `textContent` вместо `innerHTML` где возможно

## Будущие улучшения

- [ ] Валидация выходных данных по JSON Schema
- [ ] Экспорт в другие форматы (XML, CSV)
- [ ] История экспортов
- [ ] Сохранение в файл
- [ ] Подсветка синтаксиса JSON
