# 📘 Подробный гайд по файлам проекта для Java-разработчика

## Оглавление
1. [index.html](#indexhtml) - Точка входа (аналог index.jsp)
2. [styles.css](#stylescss) - Стили (аналог CSS в Spring)
3. [validator.js](#validatorjs) - Валидация (аналог javax.validation)
4. [data-service.js](#data-servicejs) - Сервис данных (аналог @Service)
5. [form-renderer.js](#form-rendererjs) - Рендерер (аналог View)
6. [form-configs.js](#form-configsjs) - Конфигурации (аналог @Configuration)
7. [app.js](#appjs) - Главный контроллер (аналог @Controller)

---

## 1. index.html

### 🎯 Назначение
Главная HTML-страница приложения. Аналог JSP/Thymeleaf шаблона в Spring.

### 📋 Структура

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <!-- Мета-теги и заголовок -->
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Форма заявки</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
<div class="container">
    <h1>Система подачи заявок</h1>

    <!-- ЭКРАН ВЫБОРА ТИПА ЗАЯВКИ -->
    <div id="form-selector" class="form-selector">
        <h2>Выберите тип заявки</h2>
        <!-- Кнопки генерируются динамически через JavaScript -->
        <div id="form-type-buttons" class="form-type-buttons"></div>
    </div>

    <!-- ФОРМА ЗАЯВКИ (скрыта по умолчанию) -->
    <div id="form-wrapper" class="form-wrapper hidden">
        <div class="form-header">
            <h2 id="form-title">Форма заявки</h2>
            <button id="back-btn" class="btn-back">← Назад</button>
        </div>
        <!-- Поля формы генерируются динамически -->
        <div id="form-container"></div>
        <div class="form-actions">
            <button id="submit-btn" class="btn btn-primary">Отправить</button>
            <button id="reset-btn" class="btn btn-secondary">Очистить</button>
        </div>
        <div id="success-message" class="success-message hidden">
            Заявка успешно отправлена!
        </div>
    </div>
</div>

<!-- Подключение JavaScript модулей (порядок важен!) -->
<script src="../validator.js"></script>
<script src="../data-service.js"></script>
<script src="../form-configs.js"></script>
<script src="../form-renderer.js"></script>
<script src="../app.js"></script>
</body>
</html>
```

### 🔑 Ключевые моменты

#### 1. Контейнеры для динамического контента
```html
<div id="form-type-buttons"></div>  <!-- Здесь будут кнопки выбора -->
<div id="form-container"></div>     <!-- Здесь будут поля формы -->
```

**Аналогия в Java:**
```java
// Это как Spring Thymeleaf placeholder
<div th:insert="fragments/form :: formFields"></div>
```

#### 2. Классы для управления видимостью
```html
<div class="hidden">  <!-- display: none в CSS -->
```

**Аналогия в Java:**
```java
@ConditionalOnProperty(name = "feature.enabled", havingValue = "true")
```

#### 3. ID элементов для JavaScript
```html
<div id="form-selector">   <!-- getElementById('form-selector') -->
<button id="submit-btn">   <!-- getElementById('submit-btn') -->
```

**Аналогия в Java:**
```java
@Autowired
@Qualifier("formSelector")
private Component formSelector;
```

#### 4. Порядок подключения скриптов
```html
<!-- Важно! Зависимости должны загружаться первыми -->
<script src="validator.js"></script>      <!-- Не зависит ни от кого -->
<script src="data-service.js"></script>   <!-- Не зависит ни от кого -->
<script src="form-configs.js"></script>   <!-- Не зависит ни от кого -->
<script src="form-renderer.js"></script>  <!-- Использует validator -->
<script src="app.js"></script>            <!-- Использует все остальные -->
```

**Аналогия в Java:**
```java
// Это как порядок загрузки бинов в Spring
@DependsOn({"validator", "dataService", "formConfigs", "formRenderer"})
@Component
public class App { }
```

---

## 2. styles.css

### 🎯 Назначение
Стили для всего приложения. Аналог CSS в Spring Boot приложении.

### 📋 Основные секции

```css
/* 1. СБРОС СТИЛЕЙ (CSS Reset) */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;  /* Ширина включает padding и border */
}

/* 2. ОСНОВНЫЕ СТИЛИ BODY */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;  /* Минимум высота экрана */
    padding: 20px;
}

/* 3. КОНТЕЙНЕР */
.container {
    max-width: 700px;        /* Максимальная ширина */
    margin: 0 auto;          /* Центрирование */
    background: white;
    padding: 40px;
    border-radius: 12px;     /* Закругленные углы */
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);  /* Тень */
}

/* 4. КНОПКИ ВЫБОРА ТИПА ЗАЯВКИ */
.form-type-buttons {
    display: grid;                                      /* CSS Grid Layout */
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 15px;
}

.form-type-btn {
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;  /* Плавный переход при наведении */
}

.form-type-btn:hover {
    transform: translateY(-3px);  /* Подъем при наведении */
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

/* 5. ПОЛЯ ФОРМЫ */
.form-control {
    width: 100%;
    padding: 12px 15px;
    border: 2px solid #e0e0e0;
    border-radius: 6px;
    font-size: 14px;
    transition: all 0.3s ease;
}

.form-control:focus {
    outline: none;                              /* Убираем стандартный outline */
    border-color: #667eea;                      /* Меняем цвет рамки */
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);  /* Добавляем свечение */
}

/* 6. ОШИБКИ ВАЛИДАЦИИ */
.form-control.error {
    border-color: #e74c3c;  /* Красная рамка при ошибке */
}

.error-message {
    color: #e74c3c;
    font-size: 13px;
    margin-top: 6px;
    display: block;
    min-height: 18px;      /* Резервируем место под сообщение */
}

/* 7. УТИЛИТЫ */
.hidden {
    display: none;  /* Скрытие элемента */
}

/* 8. АДАПТИВНОСТЬ (Responsive) */
@media (max-width: 600px) {
    .container {
        padding: 25px;
    }
    .form-actions {
        flex-direction: column;  /* Вертикальное расположение кнопок */
    }
    .btn {
        width: 100%;  /* Кнопки на всю ширину */
    }
}
```

### 🔑 Ключевые концепции CSS для Java-разработчика

#### 1. Селекторы (аналог аннотаций)
```css
/* Класс (аналог @Component) */
.my-class { }

/* ID (аналог @Qualifier("uniqueName")) */
#my-id { }

/* Элемент (аналог выбора по типу) */
div { }

/* Псевдоклассы (аналог состояний) */
.btn:hover { }      /* При наведении */
.btn:active { }     /* При клике */
.input:focus { }    /* При фокусе */
```

#### 2. Box Model (коробочная модель)
```css
.element {
    width: 200px;          /* Ширина контента */
    padding: 10px;         /* Внутренний отступ */
    border: 2px solid;     /* Рамка */
    margin: 15px;          /* Внешний отступ */
}
```

**Аналогия:**
```
┌─────────────────────────────┐
│        margin               │  Внешний отступ
│  ┌─────────────────────┐    │
│  │      border         │    │  Рамка
│  │  ┌──────────────┐   │    │
│  │  │   padding    │   │    │  Внутренний отступ
│  │  │  ┌────────┐  │   │    │
│  │  │  │ content│  │   │    │  Контент
│  │  │  └────────┘  │   │    │
│  │  └──────────────┘   │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

#### 3. Flexbox (гибкая разметка)
```css
.container {
    display: flex;              /* Включаем Flexbox */
    justify-content: center;    /* Центрирование по горизонтали */
    align-items: center;        /* Центрирование по вертикали */
    gap: 15px;                  /* Расстояние между элементами */
}
```

#### 4. Grid Layout (сеточная разметка)
```css
.grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);  /* 3 колонки равной ширины */
    gap: 15px;
}
```

---

## 3. validator.js

### 🎯 Назначение
Модуль валидации полей формы. **Аналог javax.validation (Bean Validation)**

### 📋 Полная структура

```javascript
// МОДУЛЬ ПАТТЕРН - Аналог Singleton в Java
const Validator = (function() {
    'use strict';  // Строгий режим (аналог компилятора с warnings)

    // ============================================
    // ПРИВАТНЫЕ КОНСТАНТЫ (как private static final)
    // ============================================
    const validationRules = {
        email: {
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Введите корректный email адрес'
        },
        number: {
            pattern: /^-?\d+(\.\d+)?$/,
            message: 'Введите корректное число'
        }
    };

    // ============================================
    // ПУБЛИЧНЫЕ МЕТОДЫ (public API)
    // ============================================
    
    /**
     * Валидация одного поля
     * @param {Object} field - Описание поля (DTO)
     * @param {String} value - Значение для проверки
     * @returns {String|null} - Сообщение об ошибке или null
     */
    function validateField(field, value) {
        // 1. Проверка обязательности
        if (field.required && (!value || value.trim() === '')) {
            return 'Это поле обязательно для заполнения';
        }

        // 2. Если поле пустое и необязательное - валидация пройдена
        if (!value || value.trim() === '') {
            return null;
        }

        // 3. Проверка минимальной длины
        if (field.minLength && value.length < field.minLength) {
            return `Минимальная длина: ${field.minLength} символов`;
        }

        // 4. Проверка максимальной длины
        if (field.maxLength && value.length > field.maxLength) {
            return `Максимальная длина: ${field.maxLength} символов`;
        }

        // 5. Проверка email формата
        if (field.type === 'email' && !validationRules.email.pattern.test(value)) {
            return validationRules.email.message;
        }

        // 6. Проверка числового формата
        if (field.type === 'number') {
            if (!validationRules.number.pattern.test(value)) {
                return validationRules.number.message;
            }

            const numValue = parseFloat(value);

            // Проверка минимального значения
            if (field.min !== undefined && numValue < field.min) {
                return `Минимальное значение: ${field.min}`;
            }

            // Проверка максимального значения
            if (field.max !== undefined && numValue > field.max) {
                return `Максимальное значение: ${field.max}`;
            }
        }

        return null;  // Валидация пройдена
    }

    /**
     * Валидация всей формы
     * @param {Array} fields - Массив описаний полей
     * @param {Object} formData - Данные формы
     * @returns {Object} - Map с ошибками { fieldName: errorMessage }
     */
    function validateForm(fields, formData) {
        const errors = {};

        fields.forEach(field => {
            const value = formData[field.name] || '';
            const error = validateField(field, value);
            if (error) {
                errors[field.name] = error;
            }
        });

        return errors;
    }

    /**
     * Проверка наличия ошибок
     * @param {Object} errors - Объект с ошибками
     * @returns {Boolean}
     */
    function hasErrors(errors) {
        return Object.keys(errors).length > 0;
    }

    // ============================================
    // ПУБЛИЧНЫЙ API (Возврат публичных методов)
    // ============================================
    return {
        validateField: validateField,
        validateForm: validateForm,
        hasErrors: hasErrors
    };
})();  // IIFE - Immediately Invoked Function Expression
```

### 🔑 Ключевые концепции для Java-разработчика

#### 1. Module Pattern (Модуль паттерн)

**JavaScript:**
```javascript
const Validator = (function() {
    // Приватные переменные
    const privateVar = 'secret';
    
    // Приватные методы
    function privateMethod() {
        console.log(privateVar);
    }
    
    // Публичный API
    return {
        publicMethod: function() {
            privateMethod();
        }
    };
})();
```

**Java аналог:**
```java
public class Validator {
    // Приватные поля
    private static final String PRIVATE_VAR = "secret";
    
    // Приватные методы
    private void privateMethod() {
        System.out.println(PRIVATE_VAR);
    }
    
    // Публичные методы
    public void publicMethod() {
        privateMethod();
    }
}
```

#### 2. IIFE (Immediately Invoked Function Expression)

**JavaScript:**
```javascript
const result = (function() {
    // Код выполняется сразу
    return "value";
})();
```

**Java аналог:**
```java
String result = new Object() {
    {
        // Блок инициализации
    }
    
    public String getValue() {
        return "value";
    }
}.getValue();
```

#### 3. 'use strict' - строгий режим

```javascript
'use strict';  // Включает строгую проверку
```

**Что это дает:**
- Запрещает использование необъявленных переменных
- Запрещает дублирование параметров
- Запрещает изменение read-only свойств
- **Аналог:** компилятор Java с включенными warnings

#### 4. Регулярные выражения

```javascript
const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
pattern.test("test@mail.com");  // true или false
```

**Java аналог:**
```java
Pattern pattern = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
Matcher matcher = pattern.matcher("test@mail.com");
boolean matches = matcher.matches();
```

#### 5. Стрелочные функции (Arrow Functions)

```javascript
// ES6 синтаксис
fields.forEach(field => {
    console.log(field.name);
});

// Аналог в Java
fields.forEach(field -> {
    System.out.println(field.getName());
});
```

#### 6. Template Strings (Шаблонные строки)

```javascript
const min = 5;
const message = `Минимальная длина: ${min} символов`;
```

**Java аналог:**
```java
int min = 5;
String message = String.format("Минимальная длина: %d символов", min);
// или в Java 15+
String message = STR."Минимальная длина: \{min} символов";
```

---

## 4. data-service.js

### 🎯 Назначение
Сервис для работы с данными и справочниками. **Аналог @Service класса в Spring**

### 📋 Полная структура

```javascript
// СЕРВИСНЫЙ СЛОЙ (аналог @Service)
const DataService = (function() {
    'use strict';

    // ============================================
    // ПРИВАТНЫЕ ДАННЫЕ (аналог @Repository)
    // ============================================
    const mockData = {
        // Простой справочник (List<City>)
        cities: [
            { id: '1', name: 'Москва' },
            { id: '2', name: 'Санкт-Петербург' }
        ],
        
        // Зависимый справочник (Map<String, List<Department>>)
        departments: {
            '1': [  // Ключ - ID города
                { id: '1-1', name: 'IT-отдел' },
                { id: '1-2', name: 'Отдел продаж' }
            ],
            '2': [
                { id: '2-1', name: 'IT-отдел' },
                { id: '2-2', name: 'Отдел логистики' }
            ]
        }
    };

    // ============================================
    // ПРИВАТНЫЕ МЕТОДЫ
    // ============================================
    
    /**
     * Имитация HTTP-запроса с задержкой
     * Аналог Thread.sleep() + return
     */
    function simulateHttpRequest(data, delay) {
        delay = delay || 300;  // Default значение
        
        // Promise - аналог CompletableFuture в Java
        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve(data);
            }, delay);
        });
    }

    // ============================================
    // ПУБЛИЧНЫЕ МЕТОДЫ (API)
    // ============================================
    
    /**
     * Загрузка данных справочника
     * @param {String} dictionaryName - Название справочника
     * @param {String} dependsOnValue - Значение родителя (optional)
     * @returns {Promise} - Асинхронный результат
     */
    function loadDictionary(dictionaryName, dependsOnValue) {
        let data = null;

        // Обработка справочников с зависимостями
        if (dependsOnValue && mockData[dictionaryName] 
            && typeof mockData[dictionaryName] === 'object') {
            data = mockData[dictionaryName][dependsOnValue] || [];
        } 
        // Обработка обычных справочников
        else if (mockData[dictionaryName] 
            && Array.isArray(mockData[dictionaryName])) {
            data = mockData[dictionaryName];
        } 
        else {
            data = [];
        }

        return simulateHttpRequest(data);
    }

    /**
     * Отправка формы
     * @param {Object} formData - Данные формы
     * @returns {Promise}
     */
    function submitForm(formData) {
        console.log('Отправка формы:', formData);
        return simulateHttpRequest(
            { success: true, message: 'Заявка успешно отправлена' }, 
            500
        );
    }

    // ============================================
    // ПУБЛИЧНЫЙ API
    // ============================================
    return {
        loadDictionary: loadDictionary,
        submitForm: submitForm
    };
})();
```

### 🔑 Ключевые концепции для Java-разработчика

#### 1. Promise (Промисы) - аналог CompletableFuture

**JavaScript:**
```javascript
function loadData() {
    return new Promise(function(resolve, reject) {
        // Асинхронная операция
        setTimeout(function() {
            resolve("data");  // Успех
            // или
            reject("error");  // Ошибка
        }, 1000);
    });
}

// Использование
loadData()
    .then(function(data) {
        console.log(data);  // Успешный результат
    })
    .catch(function(error) {
        console.error(error);  // Обработка ошибки
    });
```

**Java аналог:**
```java
public CompletableFuture<String> loadData() {
    return CompletableFuture.supplyAsync(() -> {
        try {
            Thread.sleep(1000);
            return "data";
        } catch (Exception e) {
            throw new RuntimeException("error");
        }
    });
}

// Использование
loadData()
    .thenAccept(data -> {
        System.out.println(data);  // Успешный результат
    })
    .exceptionally(error -> {
        System.err.println(error);  // Обработка ошибки
        return null;
    });
```

#### 2. setTimeout - аналог ScheduledExecutorService

**JavaScript:**
```javascript
setTimeout(function() {
    console.log("Выполнится через 1 секунду");
}, 1000);
```

**Java аналог:**
```java
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
scheduler.schedule(() -> {
    System.out.println("Выполнится через 1 секунду");
}, 1, TimeUnit.SECONDS);
```

#### 3. typeof и Array.isArray - проверка типов

**JavaScript:**
```javascript
typeof "hello"        // "string"
typeof 123            // "number"
typeof {}             // "object"
typeof []             // "object" (!)

Array.isArray([])     // true
Array.isArray({})     // false
```

**Java аналог:**
```java
object instanceof String
object instanceof Integer
object instanceof Map
object instanceof List
```

#### 4. Default параметры

**JavaScript:**
```javascript
function method(param) {
    param = param || 'default';  // Старый способ
}

// ES6+
function method(param = 'default') {
    // param имеет значение по умолчанию
}
```

**Java аналог:**
```java
public void method(String param) {
    param = Optional.ofNullable(param).orElse("default");
}

// Или перегрузка
public void method() {
    method("default");
}

public void method(String param) {
    // ...
}
```

---

## 5. form-renderer.js

### 🎯 Назначение
Универсальный рендерер форм. **Аналог View/Template engine (Thymeleaf, JSP)**

### 📋 Полная структура с комментариями

```javascript
const FormRenderer = (function() {
    'use strict';

    // ============================================
    // ПРИВАТНЫЕ ПЕРЕМЕННЫЕ (State)
    // ============================================
    let formFields = [];        // Текущие поля формы
    let formContainer = null;   // DOM контейнер

    // ============================================
    // ПУБЛИЧНЫЕ МЕТОДЫ - ИНИЦИАЛИЗАЦИЯ
    // ============================================
    
    /**
     * Инициализация рендерера
     * @param {Array} fields - Конфигурация полей
     * @param {HTMLElement} container - DOM элемент
     */
    function init(fields, container) {
        formFields = fields;
        formContainer = container;
    }

    // ============================================
    // ПРИВАТНЫЕ МЕТОДЫ - СОЗДАНИЕ ЭЛЕМЕНТОВ
    // ============================================
    
    /**
     * Создание input поля
     * В Java это был бы метод, возвращающий HTML строку
     */
    function createInputField(field) {
        // document.createElement - аналог new StringBuilder()
        const input = document.createElement('input');
        
        // Установка атрибутов (аналог setAttribute())
        input.type = field.type;
        input.id = field.name;
        input.name = field.name;
        input.className = 'form-control';

        if (field.placeholder) {
            input.placeholder = field.placeholder;
        }

        // Условная логика для числовых полей
        if (field.type === 'number') {
            if (field.min !== undefined) {
                input.min = field.min;
            }
            if (field.max !== undefined) {
                input.max = field.max;
            }
        }

        // Для полей даты - минимум сегодня
        if (field.type === 'date') {
            const today = new Date().toISOString().split('T')[0];
            input.min = today;
        }

        return input;  // Возвращаем DOM элемент
    }

    /**
     * Создание select (выпадающий список)
     */
    function createSelectField(field) {
        const select = document.createElement('select');
        select.id = field.name;
        select.name = field.name;
        select.className = 'form-control';

        // Создание пустой опции
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = field.placeholder || 'Выберите...';
        select.appendChild(emptyOption);  // Добавление дочернего элемента

        return select;
    }

    /**
     * Создание textarea
     */
    function createTextareaField(field) {
        const textarea = document.createElement('textarea');
        textarea.id = field.name;
        textarea.name = field.name;
        textarea.className = 'form-control';
        textarea.rows = field.rows || 4;

        if (field.placeholder) {
            textarea.placeholder = field.placeholder;
        }

        return textarea;
    }

    /**
     * Создание группы формы (label + input + error)
     * Аналог composite компонента в Swing
     */
    function createFormGroup(field) {
        // Создаем контейнер
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        // Создаем label
        const label = document.createElement('label');
        label.htmlFor = field.name;
        label.textContent = field.label;

        // Добавляем звездочку для обязательных полей
        if (field.required) {
            const required = document.createElement('span');
            required.className = 'required';
            required.textContent = '*';
            label.appendChild(required);
        }

        // Создаем поле в зависимости от типа
        let fieldElement;
        if (field.type === 'select') {
            fieldElement = createSelectField(field);
        } else if (field.type === 'textarea') {
            fieldElement = createTextareaField(field);
        } else {
            fieldElement = createInputField(field);
        }

        // Создаем контейнер для ошибок
        const errorContainer = document.createElement('span');
        errorContainer.className = 'error-message';
        errorContainer.id = field.name + '-error';

        // Собираем всё вместе
        formGroup.appendChild(label);
        formGroup.appendChild(fieldElement);
        formGroup.appendChild(errorContainer);

        return formGroup;
    }

    // ============================================
    // ПУБЛИЧНЫЕ МЕТОДЫ - РЕНДЕРИНГ
    // ============================================
    
    /**
     * Рендеринг всей формы
     */
    function render() {
        // Очищаем контейнер
        formContainer.innerHTML = '';

        // Создаем и добавляем группы полей
        formFields.forEach(function(field) {
            const formGroup = createFormGroup(field);
            formContainer.appendChild(formGroup);
        });
    }

    /**
     * Обновление опций выпадающего списка
     * @param {String} fieldName
     * @param {Array} options - [{id, name}]
     */
    function updateSelectOptions(fieldName, options) {
        const select = document.getElementById(fieldName);
        if (!select) return;

        // Сохраняем текущее значение
        const currentValue = select.value;

        // Удаляем старые опции (кроме первой пустой)
        while (select.options.length > 1) {
            select.remove(1);
        }

        // Добавляем новые опции
        options.forEach(function(option) {
            const optionElement = document.createElement('option');
            optionElement.value = option.id;
            optionElement.textContent = option.name;
            select.appendChild(optionElement);
        });

        // Восстанавливаем значение если оно есть
        const valueExists = options.some(function(option) {
            return option.id === currentValue;
        });

        if (valueExists) {
            select.value = currentValue;
        }
    }

    /**
     * Получение данных формы
     * Аналог formToBean() в Spring
     * @returns {Object} - Map с данными
     */
    function getFormData() {
        const data = {};

        formFields.forEach(function(field) {
            const element = document.getElementById(field.name);
            if (element) {
                data[field.name] = element.value;
            }
        });

        return data;
    }

    /**
     * Отображение ошибок валидации
     * @param {Object} errors - {fieldName: errorMessage}
     */
    function showErrors(errors) {
        // Сначала очищаем все ошибки
        clearErrors();

        // Отображаем новые
        Object.keys(errors).forEach(function(fieldName) {
            const field = document.getElementById(fieldName);
            const errorContainer = document.getElementById(fieldName + '-error');

            if (field) {
                field.classList.add('error');  // Добавляем CSS класс
            }

            if (errorContainer) {
                errorContainer.textContent = errors[fieldName];
            }
        });
    }

    /**
     * Очистка всех ошибок
     */
    function clearErrors() {
        formFields.forEach(function(field) {
            const fieldElement = document.getElementById(field.name);
            const errorContainer = document.getElementById(field.name + '-error');

            if (fieldElement) {
                fieldElement.classList.remove('error');
            }

            if (errorContainer) {
                errorContainer.textContent = '';
            }
        });
    }

    /**
     * Очистка формы
     */
    function clearForm() {
        formFields.forEach(function(field) {
            const element = document.getElementById(field.name);
            if (element) {
                element.value = '';

                // Для select с зависимостями очищаем опции
                if (field.type === 'select' && field.dependsOn) {
                    while (element.options.length > 1) {
                        element.remove(1);
                    }
                }
            }
        });
        clearErrors();
    }

    /**
     * Получение поля по имени
     * @returns {Object|null}
     */
    function getFieldByName(fieldName) {
        return formFields.find(function(field) {
            return field.name === fieldName;
        }) || null;
    }

    // ============================================
    // ПУБЛИЧНЫЙ API
    // ============================================
    return {
        init: init,
        render: render,
        updateSelectOptions: updateSelectOptions,
        getFormData: getFormData,
        showErrors: showErrors,
        clearErrors: clearErrors,
        clearForm: clearForm,
        getFieldByName: getFieldByName
    };
})();
```

### 🔑 Ключевые концепции для Java-разработчика

#### 1. DOM (Document Object Model) - аналог Swing компонентов

**JavaScript:**
```javascript
// Создание элемента
const div = document.createElement('div');

// Установка атрибутов
div.id = 'myDiv';
div.className = 'my-class';
div.textContent = 'Hello';

// Добавление в родителя
parent.appendChild(div);

// Поиск элемента
const element = document.getElementById('myDiv');
```

**Java Swing аналог:**
```java
// Создание компонента
JPanel panel = new JPanel();

// Установка свойств
panel.setName("myDiv");
panel.setBackground(Color.WHITE);
JLabel label = new JLabel("Hello");
panel.add(label);

// Добавление в родителя
parent.add(panel);
```

#### 2. classList - работа с CSS классами

**JavaScript:**
```javascript
element.classList.add('error');      // Добавить класс
element.classList.remove('error');   // Удалить класс
element.classList.toggle('active');  // Переключить класс
element.classList.contains('error');// Проверка наличия
```

**Java аналог (условный):**
```java
Set<String> classes = new HashSet<>();
classes.add("error");
classes.remove("error");
boolean hasError = classes.contains("error");
```

#### 3. forEach - итерация по массиву

**JavaScript:**
```javascript
array.forEach(function(item, index) {
    console.log(item);
});

// ES6+ стрелочная функция
array.forEach((item, index) => {
    console.log(item);
});
```

**Java аналог:**
```java
list.forEach(item -> {
    System.out.println(item);
});
```

#### 4. Array методы

**JavaScript:**
```javascript
// find - поиск элемента (аналог Stream.filter().findFirst())
const found = array.find(item => item.id === '123');

// some - проверка наличия (аналог Stream.anyMatch())
const exists = array.some(item => item.id === '123');

// filter - фильтрация (аналог Stream.filter())
const filtered = array.filter(item => item.active);

// map - преобразование (аналог Stream.map())
const ids = array.map(item => item.id);
```

**Java Stream API аналог:**
```java
// find
Optional<Item> found = list.stream()
    .filter(item -> "123".equals(item.getId()))
    .findFirst();

// some
boolean exists = list.stream()
    .anyMatch(item -> "123".equals(item.getId()));

// filter
List<Item> filtered = list.stream()
    .filter(Item::isActive)
    .collect(Collectors.toList());

// map
List<String> ids = list.stream()
    .map(Item::getId)
    .collect(Collectors.toList());
```

#### 5. innerHTML vs textContent

**JavaScript:**
```javascript
// textContent - только текст (безопасно)
element.textContent = '<script>alert("XSS")</script>';
// Результат: <script>alert("XSS")</script> (как текст)

// innerHTML - HTML разметка (опасно для пользовательского ввода!)
element.innerHTML = '<b>Bold text</b>';
// Результат: Bold text (жирный)
```

**Аналогия:**
```java
// textContent - как StringBuilder.append()
// innerHTML - как вставка готового HTML
```

---

Продолжу в следующем файле с form-configs.js и app.js...

