# 📘 Подробный гайд - Часть 2

## 6. form-configs.js

### 🎯 Назначение
Конфигурации всех типов форм. **Аналог @Configuration класса в Spring**

### 📋 Полная структура с комментариями

```javascript
// КОНФИГУРАЦИОННЫЙ МОДУЛЬ (аналог @Configuration)
const FormConfigs = (function() {
    'use strict';

    // ============================================
    // ТИПЫ ФОРМ (Metadata)
    // Аналог enum FormType в Java
    // ============================================
    const formTypes = [
        {
            id: 'general',                    // Уникальный идентификатор
            name: 'Общая заявка',             // Отображаемое имя
            description: 'Универсальная форма заявки',  // Описание
            icon: '📝'                        // Emoji иконка
        },
        {
            id: 'technical',
            name: 'Техническая поддержка',
            description: 'Проблемы с оборудованием или ПО',
            icon: '🔧'
        }
        // ... остальные типы
    ];

    // ============================================
    // КОНФИГУРАЦИЯ ФОРМЫ - ОБЩАЯ ЗАЯВКА
    // Аналог List<FieldConfig> в Java
    // ============================================
    const generalFormConfig = [
        // Текстовое поле
        {
            name: 'fullName',              // Имя поля (аналог @JsonProperty)
            type: 'text',                  // Тип поля
            label: 'ФИО',                  // Подпись (label)
            placeholder: 'Введите ваше полное имя',  // Подсказка
            required: true,                // Обязательное поле
            minLength: 3,                  // Минимальная длина
            maxLength: 100                 // Максимальная длина
        },
        
        // Email поле
        {
            name: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'example@mail.com',
            required: true,
            maxLength: 100
        },
        
        // Числовое поле
        {
            name: 'age',
            type: 'number',
            label: 'Возраст',
            placeholder: 'Введите ваш возраст',
            required: false,
            min: 18,                       // Минимальное значение
            max: 100                       // Максимальное значение
        },
        
        // Простой select (выпадающий список)
        {
            name: 'city',
            type: 'select',
            label: 'Город',
            placeholder: 'Выберите город',
            required: true,
            dictionary: 'cities'           // Имя справочника
        },
        
        // Зависимый select
        {
            name: 'department',
            type: 'select',
            label: 'Отдел',
            placeholder: 'Выберите отдел',
            required: true,
            dictionary: 'departments',
            dependsOn: 'city'              // Зависит от поля 'city'
        },
        
        // Textarea (многострочный текст)
        {
            name: 'description',
            type: 'textarea',
            label: 'Описание',
            placeholder: 'Подробно опишите вашу заявку',
            required: true,
            minLength: 10,
            maxLength: 1000,
            rows: 5                        // Количество строк
        }
    ];

    // ============================================
    // КОНФИГУРАЦИЯ ФОРМЫ - ТЕХПОДДЕРЖКА
    // ============================================
    const technicalFormConfig = [
        {
            name: 'fullName',
            type: 'text',
            label: 'ФИО',
            placeholder: 'Введите ваше полное имя',
            required: true,
            minLength: 3,
            maxLength: 100
        },
        {
            name: 'problemType',
            type: 'select',
            label: 'Тип проблемы',
            placeholder: 'Выберите тип проблемы',
            required: true,
            dictionary: 'problemTypes'
        },
        {
            name: 'urgency',
            type: 'select',
            label: 'Срочность',
            placeholder: 'Выберите срочность',
            required: true,
            dictionary: 'urgencyLevels'
        },
        {
            name: 'problemDescription',
            type: 'textarea',
            label: 'Описание проблемы',
            placeholder: 'Подробно опишите проблему',
            required: true,
            minLength: 20,
            maxLength: 2000,
            rows: 6
        }
        // ... остальные поля
    ];

    // ... остальные конфигурации форм
    
    // ============================================
    // МАППИНГ ID -> КОНФИГУРАЦИЯ
    // Аналог Map<String, List<FieldConfig>> в Java
    // ============================================
    const formConfigsMap = {
        general: generalFormConfig,
        technical: technicalFormConfig,
        hr: hrFormConfig,
        access: accessFormConfig,
        equipment: equipmentFormConfig,
        meeting: meetingFormConfig
    };

    // ============================================
    // ПУБЛИЧНЫЕ МЕТОДЫ (API)
    // ============================================
    
    /**
     * Получить все типы форм
     * @returns {Array} Массив объектов с метаданными форм
     */
    function getFormTypes() {
        return formTypes;
    }

    /**
     * Получить конфигурацию формы по ID
     * @param {String} formId - ID формы
     * @returns {Array|null} Массив конфигураций полей или null
     */
    function getFormConfig(formId) {
        return formConfigsMap[formId] || null;
    }

    /**
     * Получить метаданные типа формы по ID
     * @param {String} formId - ID формы
     * @returns {Object|null} Объект с метаданными или null
     */
    function getFormType(formId) {
        return formTypes.find(function(type) {
            return type.id === formId;
        }) || null;
    }

    // ============================================
    // ПУБЛИЧНЫЙ API
    // ============================================
    return {
        getFormTypes: getFormTypes,
        getFormConfig: getFormConfig,
        getFormType: getFormType
    };
})();
```

### 🔑 Ключевые концепции для Java-разработчика

#### 1. Конфигурация как данные (Data-Driven Configuration)

**JavaScript:**
```javascript
const config = [
    { name: 'field1', type: 'text', required: true },
    { name: 'field2', type: 'email', required: false }
];
```

**Java аналог:**
```java
@Configuration
public class FormConfig {
    
    @Bean
    public List<FieldConfig> generalFormConfig() {
        return Arrays.asList(
            new FieldConfig("field1", "text", true),
            new FieldConfig("field2", "email", false)
        );
    }
}

// DTO класс
public class FieldConfig {
    private String name;
    private String type;
    private boolean required;
    
    // constructor, getters, setters
}
```

#### 2. Объекты-литералы (Object Literals)

**JavaScript:**
```javascript
// Создание объекта "на лету"
const person = {
    name: 'John',
    age: 30,
    greet: function() {
        console.log('Hello');
    }
};

// Доступ к свойствам
person.name        // "John"
person['name']     // "John" (динамический доступ)
```

**Java аналог:**
```java
// Нужен класс
public class Person {
    private String name;
    private int age;
    
    public void greet() {
        System.out.println("Hello");
    }
}

Person person = new Person();
person.setName("John");
person.setAge(30);
```

#### 3. Массив объектов

**JavaScript:**
```javascript
const configs = [
    { id: '1', name: 'Config 1' },
    { id: '2', name: 'Config 2' }
];
```

**Java аналог:**
```java
List<Config> configs = Arrays.asList(
    new Config("1", "Config 1"),
    new Config("2", "Config 2")
);
```

#### 4. Map через объект

**JavaScript:**
```javascript
const map = {
    'key1': 'value1',
    'key2': 'value2'
};

// Доступ
map['key1']        // "value1"
map.key1           // "value1"

// Проверка наличия ключа
'key1' in map      // true

// Все ключи
Object.keys(map)   // ['key1', 'key2']
```

**Java аналог:**
```java
Map<String, String> map = new HashMap<>();
map.put("key1", "value1");
map.put("key2", "value2");

// Доступ
map.get("key1");            // "value1"

// Проверка наличия
map.containsKey("key1");    // true

// Все ключи
map.keySet();               // Set of keys
```

---

## 7. app.js

### 🎯 Назначение
Главный файл приложения - точка входа и orchestration. **Аналог @Controller + @Service в Spring**

### 📋 Полная структура с комментариями

```javascript
// ГЛАВНЫЙ КОНТРОЛЛЕР ПРИЛОЖЕНИЯ
(function() {
    'use strict';

    // ============================================
    // СОСТОЯНИЕ ПРИЛОЖЕНИЯ (Application State)
    // Аналог @Autowired полей в Spring контроллере
    // ============================================
    let currentFormConfig = null;    // Текущая конфигурация формы
    let currentFormType = null;      // Текущий тип формы

    // ============================================
    // ТОЧКА ВХОДА (Entry Point)
    // Аналог метода main() в Java
    // ============================================
    
    /**
     * Инициализация приложения
     * Вызывается при загрузке DOM
     */
    function initApp() {
        renderFormTypeSelector();
    }

    // ============================================
    // РЕНДЕРИНГ ГЛАВНОГО ЭКРАНА
    // ============================================
    
    /**
     * Рендеринг селектора типов форм
     * Аналог метода контроллера в Spring MVC
     */
    function renderFormTypeSelector() {
        // Получаем контейнер для кнопок
        const formTypeButtons = document.getElementById('form-type-buttons');
        
        // Получаем все типы форм из конфигурации
        const formTypes = FormConfigs.getFormTypes();

        // Очищаем контейнер
        formTypeButtons.innerHTML = '';

        // Создаем кнопку для каждого типа формы
        formTypes.forEach(function(formType) {
            // Создаем кнопку
            const button = document.createElement('button');
            button.className = 'form-type-btn';
            
            // Обработчик клика (Event Handler)
            button.onclick = function() {
                selectFormType(formType.id);
            };

            // Создаем структуру кнопки
            const icon = document.createElement('div');
            icon.className = 'form-type-btn-icon';
            icon.textContent = formType.icon;

            const text = document.createElement('div');
            text.className = 'form-type-btn-text';
            text.textContent = formType.name;

            const description = document.createElement('div');
            description.className = 'form-type-btn-description';
            description.textContent = formType.description;

            // Собираем кнопку
            button.appendChild(icon);
            button.appendChild(text);
            button.appendChild(description);

            // Добавляем в контейнер
            formTypeButtons.appendChild(button);
        });
    }

    // ============================================
    // ВЫБОР И ОТОБРАЖЕНИЕ ФОРМЫ
    // ============================================
    
    /**
     * Выбор типа формы и отображение её
     * @param {String} formId - ID выбранной формы
     */
    function selectFormType(formId) {
        // Получаем конфигурацию формы
        const formConfig = FormConfigs.getFormConfig(formId);
        const formType = FormConfigs.getFormType(formId);

        // Проверка на существование
        if (!formConfig || !formType) {
            console.error('Форма не найдена:', formId);
            return;
        }

        // Сохраняем в состояние приложения
        currentFormConfig = formConfig;
        currentFormType = formType;

        // Скрываем селектор форм
        document.getElementById('form-selector').classList.add('hidden');
        
        // Показываем форму
        const formWrapper = document.getElementById('form-wrapper');
        formWrapper.classList.remove('hidden');

        // Устанавливаем заголовок
        document.getElementById('form-title').textContent = formType.name;

        // Инициализируем форму
        initForm();
    }

    /**
     * Инициализация выбранной формы
     * Аналог @PostConstruct метода в Spring
     */
    function initForm() {
        // Получаем DOM элементы
        const formContainer = document.getElementById('form-container');
        const submitBtn = document.getElementById('submit-btn');
        const resetBtn = document.getElementById('reset-btn');
        const backBtn = document.getElementById('back-btn');
        const successMessage = document.getElementById('success-message');

        // Инициализация рендерера формы
        FormRenderer.init(currentFormConfig, formContainer);
        FormRenderer.render();

        // Загрузка начальных данных для справочников
        loadInitialDictionaries();

        // Установка обработчиков событий на поля
        setupEventHandlers();

        // ========================================
        // ВАЖНО! Удаление старых обработчиков
        // ========================================
        // В JavaScript обработчики событий накапливаются!
        // Поэтому мы клонируем элемент (удаляя все обработчики)
        // и заменяем старый элемент новым
        
        // Обработчик кнопки "Отправить"
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        newSubmitBtn.addEventListener('click', function() {
            handleFormSubmit(successMessage);
        });

        // Обработчик кнопки "Очистить"
        const newResetBtn = resetBtn.cloneNode(true);
        resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
        newResetBtn.addEventListener('click', function() {
            FormRenderer.clearForm();
            successMessage.classList.add('hidden');
            loadInitialDictionaries();
        });

        // Обработчик кнопки "Назад"
        const newBackBtn = backBtn.cloneNode(true);
        backBtn.parentNode.replaceChild(newBackBtn, backBtn);
        newBackBtn.addEventListener('click', function() {
            goBackToSelector();
        });
    }

    /**
     * Возврат к выбору типа заявки
     */
    function goBackToSelector() {
        // Очищаем форму
        FormRenderer.clearForm();
        document.getElementById('success-message').classList.add('hidden');

        // Скрываем форму
        document.getElementById('form-wrapper').classList.add('hidden');

        // Показываем селектор
        document.getElementById('form-selector').classList.remove('hidden');

        // Сбрасываем состояние
        currentFormConfig = null;
        currentFormType = null;
    }

    // ============================================
    // ЗАГРУЗКА ДАННЫХ
    // ============================================
    
    /**
     * Загрузка начальных данных справочников
     * Аналог вызова @Autowired сервисов в Spring
     */
    function loadInitialDictionaries() {
        // Проходим по всем полям формы
        currentFormConfig.forEach(function(field) {
            // Загружаем только независимые справочники
            if (field.type === 'select' && field.dictionary && !field.dependsOn) {
                // Асинхронная загрузка данных
                DataService.loadDictionary(field.dictionary)
                    .then(function(data) {
                        // Обновляем опции select
                        FormRenderer.updateSelectOptions(field.name, data);
                    });
            }
        });
    }

    // ============================================
    // ОБРАБОТЧИКИ СОБЫТИЙ
    // ============================================
    
    /**
     * Установка обработчиков событий для полей формы
     * Аналог @EventListener в Spring
     */
    function setupEventHandlers() {
        currentFormConfig.forEach(function(field) {
            const element = document.getElementById(field.name);

            if (!element) return;

            // ========================================
            // СОБЫТИЕ: blur (потеря фокуса)
            // ========================================
            element.addEventListener('blur', function() {
                validateSingleField(field.name);
            });

            // ========================================
            // СОБЫТИЕ: input (изменение значения)
            // ========================================
            element.addEventListener('input', function() {
                clearFieldError(field.name);
            });

            // ========================================
            // СОБЫТИЕ: change (изменение select)
            // Обработка каскадных зависимостей
            // ========================================
            if (field.type === 'select' && field.dictionary) {
                element.addEventListener('change', function() {
                    handleDependentFields(field.name, element.value);
                });
            }
        });
    }

    /**
     * Валидация одного поля
     * @param {String} fieldName - Имя поля
     */
    function validateSingleField(fieldName) {
        // Получаем конфигурацию поля
        const field = FormRenderer.getFieldByName(fieldName);
        if (!field) return;

        // Получаем значение
        const element = document.getElementById(fieldName);
        const value = element ? element.value : '';
        
        // Вызываем валидатор
        const error = Validator.validateField(field, value);

        // Если есть ошибка - показываем
        if (error) {
            const errors = {};
            errors[fieldName] = error;
            FormRenderer.showErrors(errors);
        }
    }

    /**
     * Очистка ошибки у поля
     * @param {String} fieldName - Имя поля
     */
    function clearFieldError(fieldName) {
        const element = document.getElementById(fieldName);
        const errorContainer = document.getElementById(fieldName + '-error');

        if (element) {
            element.classList.remove('error');
        }

        if (errorContainer) {
            errorContainer.textContent = '';
        }
    }

    /**
     * Обработка зависимых полей (каскадная загрузка)
     * @param {String} parentFieldName - Имя родительского поля
     * @param {String} parentValue - Значение родительского поля
     */
    function handleDependentFields(parentFieldName, parentValue) {
        // Находим поля, которые зависят от текущего
        const dependentFields = currentFormConfig.filter(function(field) {
            return field.dependsOn === parentFieldName;
        });

        // Для каждого зависимого поля
        dependentFields.forEach(function(field) {
            if (parentValue) {
                // Загружаем данные с учётом родительского значения
                DataService.loadDictionary(field.dictionary, parentValue)
                    .then(function(data) {
                        FormRenderer.updateSelectOptions(field.name, data);
                    });
            } else {
                // Если родительское поле пустое - очищаем зависимое
                FormRenderer.updateSelectOptions(field.name, []);
            }
        });
    }

    // ============================================
    // ОТПРАВКА ФОРМЫ
    // ============================================
    
    /**
     * Обработка отправки формы
     * Аналог метода контроллера с @PostMapping
     * @param {HTMLElement} successMessage - Элемент сообщения
     */
    function handleFormSubmit(successMessage) {
        // Скрываем предыдущее сообщение
        successMessage.classList.add('hidden');

        // Получаем данные формы
        const formData = FormRenderer.getFormData();

        // Добавляем метаданные о типе формы
        formData._formType = currentFormType.id;
        formData._formName = currentFormType.name;

        // Валидация всей формы
        const errors = Validator.validateForm(currentFormConfig, formData);

        // Если есть ошибки - показываем и прерываем отправку
        if (Validator.hasErrors(errors)) {
            FormRenderer.showErrors(errors);
            return;
        }

        // Очищаем старые ошибки
        FormRenderer.clearErrors();

        // Отправляем форму асинхронно
        DataService.submitForm(formData)
            .then(function(response) {
                if (response.success) {
                    // Показываем сообщение об успехе
                    successMessage.classList.remove('hidden');

                    // Плавная прокрутка к сообщению
                    successMessage.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });

                    // Очищаем форму через 1 секунду
                    setTimeout(function() {
                        FormRenderer.clearForm();
                        loadInitialDictionaries();

                        // Возврат к выбору через 3 секунды
                        setTimeout(function() {
                            successMessage.classList.add('hidden');
                            goBackToSelector();
                        }, 3000);
                    }, 1000);
                }
            })
            .catch(function(error) {
                console.error('Ошибка при отправке формы:', error);
            });
    }

    // ============================================
    // ЗАПУСК ПРИЛОЖЕНИЯ
    // ============================================
    
    // Проверяем состояние загрузки DOM
    if (document.readyState === 'loading') {
        // DOM ещё не загружен - ждём события DOMContentLoaded
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // DOM уже загружен - запускаем сразу
        initApp();
    }
    
})();  // Самовызывающаяся функция (IIFE)
```

### 🔑 Ключевые концепции для Java-разработчика

#### 1. Event Listeners (Обработчики событий)

**JavaScript:**
```javascript
// Добавление обработчика
element.addEventListener('click', function(event) {
    console.log('Clicked!', event);
});

// Типы событий:
// - click - клик мышью
// - input - изменение значения поля
// - change - изменение и потеря фокуса
// - blur - потеря фокуса
// - focus - получение фокуса
// - submit - отправка формы
// - keypress - нажатие клавиши
```

**Java Swing аналог:**
```java
button.addActionListener(new ActionListener() {
    @Override
    public void actionPerformed(ActionEvent e) {
        System.out.println("Clicked!");
    }
});

// Или с лямбдой
button.addActionListener(e -> {
    System.out.println("Clicked!");
});
```

#### 2. cloneNode и replaceChild (удаление обработчиков)

**JavaScript:**
```javascript
// Проблема: обработчики накапливаются
element.addEventListener('click', handler1);
element.addEventListener('click', handler2);
// Теперь при клике выполнятся ОБА обработчика

// Решение: клонирование элемента (удаляет все обработчики)
const newElement = element.cloneNode(true);  // true = deep clone
element.parentNode.replaceChild(newElement, element);

// Теперь можно добавить новый обработчик
newElement.addEventListener('click', newHandler);
```

**Java аналог:**
```java
// В Swing обработчики можно удалить
for (ActionListener al : button.getActionListeners()) {
    button.removeActionListener(al);
}

// Или создать новую кнопку
JButton newButton = new JButton(button.getText());
panel.remove(button);
panel.add(newButton);
```

#### 3. setTimeout (Отложенное выполнение)

**JavaScript:**
```javascript
setTimeout(function() {
    console.log('Выполнится через 3 секунды');
}, 3000);

// Можно отменить
const timerId = setTimeout(function() {
    console.log('Не выполнится');
}, 3000);
clearTimeout(timerId);
```

**Java аналог:**
```java
ScheduledExecutorService scheduler = 
    Executors.newScheduledThreadPool(1);

ScheduledFuture<?> future = scheduler.schedule(() -> {
    System.out.println("Выполнится через 3 секунды");
}, 3, TimeUnit.SECONDS);

// Можно отменить
future.cancel(false);
```

#### 4. Promise chaining (Цепочка промисов)

**JavaScript:**
```javascript
DataService.loadData()
    .then(function(data) {
        console.log('Данные получены:', data);
        return processData(data);
    })
    .then(function(processed) {
        console.log('Данные обработаны:', processed);
        return saveData(processed);
    })
    .then(function(result) {
        console.log('Данные сохранены:', result);
    })
    .catch(function(error) {
        console.error('Ошибка:', error);
    });
```

**Java аналог:**
```java
dataService.loadData()
    .thenApply(data -> {
        System.out.println("Данные получены: " + data);
        return processData(data);
    })
    .thenApply(processed -> {
        System.out.println("Данные обработаны: " + processed);
        return saveData(processed);
    })
    .thenAccept(result -> {
        System.out.println("Данные сохранены: " + result);
    })
    .exceptionally(error -> {
        System.err.println("Ошибка: " + error);
        return null;
    });
```

#### 5. Closures (Замыкания)

**JavaScript:**
```javascript
function createCounter() {
    let count = 0;  // Приватная переменная
    
    return {
        increment: function() {
            count++;
            return count;
        },
        getCount: function() {
            return count;
        }
    };
}

const counter = createCounter();
counter.increment();  // 1
counter.increment();  // 2
counter.getCount();   // 2
// count напрямую недоступна!
```

**Java аналог:**
```java
public class Counter {
    private int count = 0;  // Приватное поле
    
    public int increment() {
        count++;
        return count;
    }
    
    public int getCount() {
        return count;
    }
}

Counter counter = new Counter();
counter.increment();  // 1
counter.increment();  // 2
counter.getCount();   // 2
```

#### 6. filter() метод массива

**JavaScript:**
```javascript
const numbers = [1, 2, 3, 4, 5];

// Фильтрация четных чисел
const even = numbers.filter(function(num) {
    return num % 2 === 0;
});
// Результат: [2, 4]

// С использованием стрелочной функции
const even = numbers.filter(num => num % 2 === 0);
```

**Java Stream API аналог:**
```java
List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5);

List<Integer> even = numbers.stream()
    .filter(num -> num % 2 == 0)
    .collect(Collectors.toList());
// Результат: [2, 4]
```

---

## 🎓 Общие концепции JavaScript для Java-разработчика

### 1. Динамическая типизация

**JavaScript:**
```javascript
let variable = "string";    // Строка
variable = 123;             // Теперь число
variable = { key: 'value' };// Теперь объект
// Всё это валидно!
```

**Java:**
```java
String variable = "string";
variable = 123;  // ОШИБКА КОМПИЛЯЦИИ!
```

### 2. === vs ==

**JavaScript:**
```javascript
5 == '5'    // true (приведение типов)
5 === '5'   // false (строгое сравнение)

// ВСЕГДА используйте ===
```

**Java аналог:**
```java
5 == 5      // true
"5".equals("5")  // true
5 == Integer.parseInt("5")  // true
```

### 3. Truthy и Falsy значения

**JavaScript:**
```javascript
// Falsy значения (приводятся к false):
false, 0, '', null, undefined, NaN

// Truthy значения (приводятся к true):
true, любое ненулевое число, любая непустая строка, объекты, массивы

if (value) {
    // Выполнится если value не falsy
}
```

**Java:**
```java
// В Java только boolean
if (value != null && !value.isEmpty()) {
    // Explicit проверка
}
```

### 4. undefined vs null

**JavaScript:**
```javascript
let a;              // undefined (переменная объявлена, но не инициализирована)
let b = null;       // null (явно присвоено "ничего")

typeof a            // "undefined"
typeof b            // "object" (особенность JavaScript)

a == b              // true (с приведением типов)
a === b             // false (разные типы)
```

**Java:**
```java
String a = null;    // null
String b = null;    // null
// Нет понятия undefined
```

### 5. Hoisting (Подъём объявлений)

**JavaScript:**
```javascript
console.log(x);  // undefined (не ошибка!)
var x = 5;

// Интерпретируется как:
var x;
console.log(x);
x = 5;

// let и const НЕ поднимаются
console.log(y);  // ОШИБКА!
let y = 5;
```

**Java:**
```java
System.out.println(x);  // ОШИБКА КОМПИЛЯЦИИ
int x = 5;
```

### 6. this context

**JavaScript:**
```javascript
const obj = {
    name: 'Object',
    method: function() {
        console.log(this.name);  // 'Object'
    }
};

const func = obj.method;
func();  // undefined (this потерян!)

// Решение 1: bind
const bound = obj.method.bind(obj);
bound();  // 'Object'

// Решение 2: стрелочная функция (сохраняет this)
const obj2 = {
    name: 'Object2',
    method: () => {
        console.log(this.name);
    }
};
```

**Java:**
```java
// В Java this всегда указывает на текущий объект
class MyClass {
    private String name = "Object";
    
    public void method() {
        System.out.println(this.name);  // Всегда работает
    }
}
```

---

Продолжу в следующем файле с итоговыми рекомендациями и шпаргалкой...

