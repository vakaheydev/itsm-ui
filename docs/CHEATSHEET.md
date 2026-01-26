# 📋 Быстрая шпаргалка: JavaScript для Java-разработчика

## 🔄 Основные аналогии

```javascript
// JAVA → JAVASCRIPT

// Переменные
final String name = "John";        →  const name = 'John';
String name = "John";               →  let name = 'John';

// Классы
public class User {                 →  class User {
    private String name;                constructor(name) {
                                            this.name = name;
    public User(String name) {          }
        this.name = name;               }
    }
}

// Списки
List<String> list = new ArrayList<>();  →  const list = [];
list.add("item");                       →  list.push("item");
String item = list.get(0);              →  const item = list[0];

// Map
Map<String, Object> map = new HashMap<>();  →  const map = {};
map.put("key", "value");                    →  map['key'] = 'value';
String value = map.get("key");              →  const value = map['key'];

// Итерация
list.forEach(item -> {                  →  list.forEach(item => {
    System.out.println(item);               console.log(item);
});                                     });

// Фильтрация
list.stream()                           →  list.filter(item => item > 5)
    .filter(item -> item > 5)
    .collect(Collectors.toList());

// Преобразование
list.stream()                           →  list.map(item => item * 2)
    .map(item -> item * 2)
    .collect(Collectors.toList());

// Promise
CompletableFuture<String> future =      →  const promise = 
    CompletableFuture.supplyAsync();        new Promise((resolve, reject) => {});

future.thenAccept(result -> {});        →  promise.then(result => {});
future.exceptionally(error -> {});      →  promise.catch(error => {});

// Optional
Optional.ofNullable(value)              →  value ?? 'default'
    .orElse("default");

// Switch
switch (value) {                        →  switch (value) {
    case "a":                               case 'a':
        break;                                  break;
}                                       }
```

---

## 🎯 Типичный код нашего проекта

### Module Pattern

```javascript
const MyModule = (function() {
    'use strict';
    
    // Приватное (недоступно снаружи)
    let privateVar = 'secret';
    
    function privateMethod() {
        console.log(privateVar);
    }
    
    // Публичное API
    return {
        publicMethod: function() {
            privateMethod();
        }
    };
})();

// Использование
MyModule.publicMethod();  // OK
MyModule.privateVar;      // undefined
```

**Java аналог:**
```java
public class MyModule {
    private String privateVar = "secret";
    
    private void privateMethod() {
        System.out.println(privateVar);
    }
    
    public void publicMethod() {
        privateMethod();
    }
}
```

---

### Promise (асинхронность)

```javascript
// Создание
function loadData() {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve({ data: 'value' });
        }, 1000);
    });
}

// Использование
loadData()
    .then(function(result) {
        console.log(result);
        return processData(result);
    })
    .then(function(processed) {
        console.log(processed);
    })
    .catch(function(error) {
        console.error(error);
    });
```

**Java аналог:**
```java
public CompletableFuture<Map<String, String>> loadData() {
    return CompletableFuture.supplyAsync(() -> {
        Thread.sleep(1000);
        return Map.of("data", "value");
    });
}

loadData()
    .thenApply(result -> {
        System.out.println(result);
        return processData(result);
    })
    .thenAccept(processed -> {
        System.out.println(processed);
    })
    .exceptionally(error -> {
        System.err.println(error);
        return null;
    });
```

---

### DOM Manipulation

```javascript
// Создание элемента
const div = document.createElement('div');
div.id = 'myDiv';
div.className = 'my-class';
div.textContent = 'Hello';

// Добавление в DOM
parent.appendChild(div);

// Поиск элемента
const element = document.getElementById('myDiv');
const elements = document.querySelectorAll('.my-class');

// Изменение
element.textContent = 'New text';
element.classList.add('active');
element.classList.remove('inactive');
```

**Java Swing аналог:**
```java
JPanel panel = new JPanel();
panel.setName("myDiv");
JLabel label = new JLabel("Hello");
panel.add(label);
parent.add(panel);

Component element = findComponentByName("myDiv");
label.setText("New text");
```

---

### Event Listeners

```javascript
// Добавление обработчика
button.addEventListener('click', function(event) {
    console.log('Clicked!');
});

// С параметрами
button.addEventListener('click', function(event) {
    handleClick(event, 'param');
});

// Удаление (нужна ссылка на функцию)
function handler(event) {
    console.log('Clicked');
}
button.addEventListener('click', handler);
button.removeEventListener('click', handler);
```

**Java Swing аналог:**
```java
button.addActionListener(e -> {
    System.out.println("Clicked!");
});

ActionListener handler = e -> {
    System.out.println("Clicked");
};
button.addActionListener(handler);
button.removeActionListener(handler);
```

---

## 💡 Частые операции

### Работа с массивами

```javascript
const arr = [1, 2, 3, 4, 5];

// forEach - итерация
arr.forEach(item => console.log(item));

// map - преобразование
const doubled = arr.map(item => item * 2);  // [2, 4, 6, 8, 10]

// filter - фильтрация
const even = arr.filter(item => item % 2 === 0);  // [2, 4]

// find - поиск
const found = arr.find(item => item > 3);  // 4

// some - проверка наличия
const hasEven = arr.some(item => item % 2 === 0);  // true

// every - проверка всех
const allPositive = arr.every(item => item > 0);  // true

// reduce - свёртка
const sum = arr.reduce((acc, item) => acc + item, 0);  // 15
```

---

### Работа с объектами

```javascript
const obj = {
    name: 'John',
    age: 30
};

// Доступ к свойствам
obj.name         // 'John'
obj['name']      // 'John'

// Все ключи
Object.keys(obj)    // ['name', 'age']

// Все значения
Object.values(obj)  // ['John', 30]

// Пары ключ-значение
Object.entries(obj) // [['name', 'John'], ['age', 30]]

// Проверка наличия ключа
'name' in obj       // true

// Копирование
const copy = { ...obj };

// Слияние
const merged = { ...obj, city: 'Moscow' };
```

---

### Работа со строками

```javascript
const str = 'Hello World';

// Длина
str.length                  // 11

// Подстрока
str.substring(0, 5)         // 'Hello'
str.slice(0, 5)             // 'Hello'

// Поиск
str.indexOf('World')        // 6
str.includes('World')       // true

// Замена
str.replace('World', 'JS')  // 'Hello JS'

// Разбиение
str.split(' ')              // ['Hello', 'World']

// Регистр
str.toLowerCase()           // 'hello world'
str.toUpperCase()           // 'HELLO WORLD'

// Обрезка пробелов
'  text  '.trim()           // 'text'

// Template strings
const name = 'John';
`Hello, ${name}!`           // 'Hello, John!'
```

---

## ⚠️ Частые ошибки

### 1. Использование == вместо ===

```javascript
❌ if (value == '5')      // Приведение типов
✅ if (value === '5')     // Строгое сравнение
```

### 2. Забыть var/let/const

```javascript
❌ name = 'John';         // Глобальная переменная (плохо!)
✅ const name = 'John';   // Локальная переменная
```

### 3. Потеря this в callback

```javascript
❌ 
const obj = {
    name: 'Object',
    method: function() {
        setTimeout(function() {
            console.log(this.name);  // undefined!
        }, 100);
    }
};

✅ 
const obj = {
    name: 'Object',
    method: function() {
        setTimeout(() => {
            console.log(this.name);  // 'Object'
        }, 100);
    }
};
```

### 4. Модификация массива в forEach

```javascript
❌
arr.forEach((item, index) => {
    arr[index] = item * 2;  // Модификация во время итерации
});

✅
const doubled = arr.map(item => item * 2);
```

### 5. Забыть return в стрелочной функции

```javascript
❌ arr.map(item => { item * 2 })        // undefined!
✅ arr.map(item => item * 2)            // OK
✅ arr.map(item => { return item * 2 }) // OK
```

---

## 🛠️ Отладка

### Console методы

```javascript
console.log('Обычное сообщение');
console.info('Информация');
console.warn('Предупреждение');
console.error('Ошибка');

console.table([
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 }
]);

console.time('timer');
// код
console.timeEnd('timer');  // timer: 123ms
```

### Debugger

```javascript
function myFunction() {
    const value = 123;
    debugger;  // Остановка (если открыты DevTools)
    console.log(value);
}
```

### DevTools (F12)

- **Console** - выполнение кода
- **Elements** - просмотр DOM
- **Sources** - точки останова
- **Network** - HTTP запросы

---

## 📝 В нашем проекте

### Добавление формы (5 шагов)

```javascript
// 1. Добавить тип (в form-configs.js)
const formTypes = [
    // ...
    {
        id: 'my-form',
        name: 'Моя форма',
        description: 'Описание',
        icon: '📋'
    }
];

// 2. Создать конфигурацию
const myFormConfig = [
    {
        name: 'fieldName',
        type: 'text',
        label: 'Название',
        required: true
    }
];

// 3. Зарегистрировать
const formConfigsMap = {
    // ...
    'my-form': myFormConfig
};

// 4. Добавить справочники (в data-service.js)
const mockData = {
    // ...
    myDictionary: [
        { id: '1', name: 'Опция 1' }
    ]
};

// 5. Готово! Форма появится автоматически
```

---

### Структура файлов

```
validator.js        → Валидация (like javax.validation)
data-service.js     → Данные (like @Service)
form-configs.js     → Конфигурации (like @Configuration)
form-renderer.js    → Рендеринг (like View)
app.js              → Контроллер (like @Controller)
```

---

## 🎓 Полезные ссылки

- **Полный гайд:** [MASTER_INDEX.md](MASTER_INDEX.md)
- **JS для Java:** [JAVA_TO_JS_GUIDE.md](JAVA_TO_JS_GUIDE.md)
- **Разбор файлов:** [DETAILED_GUIDE_PART1.md](DETAILED_GUIDE_PART1.md), [PART2](DETAILED_GUIDE_PART2.md)
- **Быстрый старт:** [QUICK_START.md](QUICK_START.md)

---

**Держите эту шпаргалку под рукой при работе с проектом! 📌**

