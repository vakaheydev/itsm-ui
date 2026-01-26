# 🔗 Множественные зависимости полей - Документация

## ✅ Что реализовано

Добавлена поддержка **множественных зависимостей** - теперь поле может зависеть от нескольких других полей одновременно.

---

## 🎯 Пример: API зависит от окружения И зоны

### Конфигурация в form-configs.js

```javascript
{
    name: 'environment',
    type: 'select',
    label: 'Окружение',
    dictionary: 'graviteeEnvironments'
},
{
    name: 'zone',
    type: 'select',
    label: 'Зона',
    dictionary: 'graviteeZones'
},
{
    name: 'api',
    type: 'select',
    label: 'API',
    dictionary: 'api',
    dependsOn: ['environment', 'zone']  // ← Массив зависимостей!
}
```

---

## 🗂️ Структура данных в data-service.js

### Составной ключ: "окружение:зона"

```javascript
api: {
    // Ключ формата "ОКРУЖЕНИЕ:ЗОНА"
    'TEST:INT': [
        { id: 'api-1', name: 'API Пользователей - TEST INT' },
        { id: 'api-2', name: 'API Заказов - TEST INT' }
    ],
    'TEST:EXT': [
        { id: 'api-4', name: 'API Платежей - TEST EXT' },
        { id: 'api-5', name: 'API Уведомлений - TEST EXT' }
    ],
    'PROD:INT': [
        { id: 'api-1', name: 'API Пользователей - PROD INT' },
        { id: 'api-2', name: 'API Заказов - PROD INT' }
    ]
    // ... и так далее
}
```

---

## 🔄 Как работает

### Сценарий использования:

```
1. Пользователь выбирает Окружение = "TEST"
   ↓
   Поле API очищается (зона ещё не выбрана)
   
2. Пользователь выбирает Зону = "INT"
   ↓
   handleDependentFields собирает значения:
   - environment: "TEST"
   - zone: "INT"
   ↓
   Формирует составной ключ: "TEST:INT"
   ↓
   loadDictionary('api', 'TEST:INT')
   ↓
   Загружаются API для TEST INT:
   - API Пользователей - TEST INT
   - API Заказов - TEST INT
   - API Справочников - TEST INT

3. Пользователь меняет Окружение на "PROD"
   ↓
   Новый ключ: "PROD:INT"
   ↓
   Загружаются API для PROD INT:
   - API Пользователей - PROD INT
   - API Заказов - PROD INT
```

---

## 💻 Код обработки (app.js)

### Проверка типа зависимости:

```javascript
if (Array.isArray(field.dependsOn)) {
    // Множественная зависимость
    handleMultipleDependencies(field);
} else {
    // Одиночная зависимость
    handleSingleDependency(field);
}
```

### Сбор значений зависимых полей:

```javascript
const dependencyValues = [];
let allFilled = true;

field.dependsOn.forEach(function(depFieldName) {
    const depElement = document.getElementById(depFieldName);
    const depValue = depElement ? depElement.value : '';
    
    if (!depValue) {
        allFilled = false;  // Не все поля заполнены
    }
    dependencyValues.push(depValue);
});
```

### Формирование составного ключа:

```javascript
if (allFilled) {
    const compositeKey = dependencyValues.join(':');
    // Результат: "TEST:INT"
    
    DataService.loadDictionary('api', compositeKey)
        .then(function(data) {
            FormRenderer.updateSelectOptions('api', data);
        });
}
```

---

## 📝 Синтаксис

### Одиночная зависимость (как раньше):

```javascript
{
    name: 'department',
    dependsOn: 'city'  // ← Строка
}
```

**Результат:** зависит только от города

### Множественная зависимость (новое):

```javascript
{
    name: 'api',
    dependsOn: ['environment', 'zone']  // ← Массив
}
```

**Результат:** зависит от окружения И зоны

---

## 🔑 Формат ключа в справочнике

### Правило:

Значения полей соединяются символом `:` в том порядке, в котором они указаны в массиве `dependsOn`.

### Примеры:

```javascript
// dependsOn: ['environment', 'zone']
// environment = "TEST", zone = "INT"
// Ключ: "TEST:INT"

// dependsOn: ['city', 'department', 'position']
// city = "Moscow", department = "IT", position = "Senior"
// Ключ: "Moscow:IT:Senior"
```

---

## 🎯 Примеры использования

### Пример 1: Товары зависят от категории и бренда

```javascript
// Конфигурация
{
    name: 'category',
    type: 'select',
    dictionary: 'categories'
},
{
    name: 'brand',
    type: 'select',
    dictionary: 'brands'
},
{
    name: 'product',
    type: 'select',
    dictionary: 'products',
    dependsOn: ['category', 'brand']  // ← Зависит от обоих
}

// Справочник
products: {
    'electronics:samsung': [
        { id: 'p1', name: 'Samsung Galaxy S21' },
        { id: 'p2', name: 'Samsung Galaxy Tab' }
    ],
    'electronics:apple': [
        { id: 'p3', name: 'iPhone 13' },
        { id: 'p4', name: 'iPad Pro' }
    ],
    'clothing:nike': [
        { id: 'p5', name: 'Nike Air Max' },
        { id: 'p6', name: 'Nike T-Shirt' }
    ]
}
```

### Пример 2: Модель авто зависит от марки и года

```javascript
// Конфигурация
{
    name: 'make',
    type: 'select',
    dictionary: 'carMakes'
},
{
    name: 'year',
    type: 'select',
    dictionary: 'years'
},
{
    name: 'model',
    type: 'select',
    dictionary: 'carModels',
    dependsOn: ['make', 'year']
}

// Справочник
carModels: {
    'toyota:2023': [
        { id: 'm1', name: 'Camry 2023' },
        { id: 'm2', name: 'RAV4 2023' }
    ],
    'toyota:2024': [
        { id: 'm3', name: 'Camry 2024' },
        { id: 'm4', name: 'RAV4 2024' }
    ]
}
```

---

## ⚙️ Технические детали

### Поиск зависимых полей:

```javascript
const dependentFields = currentFormConfig.filter(function(field) {
    if (Array.isArray(field.dependsOn)) {
        // Проверяем, входит ли изменённое поле в массив зависимостей
        return field.dependsOn.indexOf(parentFieldName) !== -1;
    } else {
        // Одиночная зависимость
        return field.dependsOn === parentFieldName;
    }
});
```

### Проверка заполненности всех зависимых полей:

```javascript
let allFilled = true;

field.dependsOn.forEach(function(depFieldName) {
    const depValue = document.getElementById(depFieldName).value;
    if (!depValue) {
        allFilled = false;
    }
});

if (!allFilled) {
    // Очищаем поле, если не все зависимости заполнены
    FormRenderer.updateSelectOptions(field.name, []);
}
```

---

## ✨ Преимущества

### ✅ Гибкость

Можно создавать сложные зависимости:
- Город → Отдел
- Окружение + Зона → API
- Категория + Бренд → Товар
- Марка + Год → Модель

### ✅ Автоматическая очистка

Если одно из зависимых полей изменилось или очистилось, зависимое поле автоматически очищается.

### ✅ Обратная совместимость

Старые формы с одиночными зависимостями продолжают работать без изменений.

---

## 🔧 Отладка

### Проверить составной ключ:

```javascript
// В консоли браузера
const env = document.getElementById('environment').value;
const zone = document.getElementById('zone').value;
const key = env + ':' + zone;
console.log('Composite key:', key);  // "TEST:INT"
```

### Проверить данные справочника:

```javascript
// В data-service.js (временно)
function loadDictionary(dictionaryName, dependsOnValue) {
    console.log('Loading:', dictionaryName, 'with key:', dependsOnValue);
    // ... остальной код
}
```

---

## 📊 Итого

### Что добавлено:

✅ **Множественные зависимости** через массив в `dependsOn`  
✅ **Составной ключ** для справочников (значения через `:`)  
✅ **Автоматическая обработка** в `handleDependentFields()`  
✅ **Обратная совместимость** с одиночными зависимостями  

### В форме Gravitee:

✅ API теперь зависит от окружения И зоны  
✅ Разные списки API для разных комбинаций  
✅ Автоматическая очистка при изменении окружения или зоны  

**Готово к использованию! 🎉**

