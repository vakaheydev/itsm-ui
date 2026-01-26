// Модуль для работы с данными и справочниками
const DataService = (function() {
    'use strict';

    const baseDictionaryHost = 'http://localhost:8080';

    // Конфигурация справочников: какие через HTTP, какие моки
    const dictionaryConfig = {
        // HTTP справочники для API Gravitee (temporary - закомментировано)
        // api: { 
        //     type: 'http', 
        //     url: '/api/dictionaries/api',
        //     dependsOn: 'multiple', // зависит от нескольких полей
        //     params: ['environment', 'zone'] // список параметров
        // },
        // api_methods: { 
        //     type: 'http', 
        //     url: '/api/dictionaries/api-methods',
        //     dependsOn: 'api',
        //     paramName: 'apiId'
        // },
        
        // Mock справочники для Gravitee
        graviteeEnvironments: { type: 'mock' },
        graviteeZones: { type: 'mock' },
        graviteeAuthMethods: { type: 'mock' },
        
        // Mock справочники для API (temporary - вместо HTTP)
        api: { type: 'mock' },
        api_methods: { 
            type: 'mock',
            dependsOn: 'api' // зависит от выбранного API
        },
        priorities: { type: 'mock' }
    };

    // Моки данных для справочников Gravitee (только для type: 'mock')
    const mockData = {
        priorities: [
            { id: 'low', name: 'Низкий' },
            { id: 'medium', name: 'Средний' },
            { id: 'high', name: 'Высокий' }
        ],
        graviteeEnvironments: [
            { id: 'TEST', name: 'TEST' },
            { id: 'REGRESS', name: 'REGRESS' },
            { id: 'PROD', name: 'PROD' }
        ],
        graviteeZones: [
            { id: 'INT', name: 'INT' },
            { id: 'EXT', name: 'EXT' },
            { id: 'INT_EXT', name: 'INT + EXT' }
        ],
        graviteeAuthMethods: [
            { id: 'JWT', name: 'JWT' },
            { id: 'API_KEY', name: 'API_KEY' },
            { id: 'KEY_LESS', name: 'KEY_LESS' }
        ],
        
        // Mock данные для API (temporary - вместо HTTP)
        api: [
            { id: 'api-1', name: 'API Пользователей (UserAPI)' },
            { id: 'api-2', name: 'API Заказов (OrderAPI)' },
            { id: 'api-3', name: 'API Справочников (DictionaryAPI)' },
            { id: 'api-4', name: 'API Платежей (PaymentAPI)' },
            { id: 'api-5', name: 'API Уведомлений (NotificationAPI)' }
        ],
        
        // Mock данные для методов API (temporary - вместо HTTP)
        // Структура с зависимостями: ключ = apiId
        api_methods: {
            'api-1': [ // UserAPI
                { id: 'get-user', name: 'GET /users/{id} - Получить пользователя' },
                { id: 'create-user', name: 'POST /users - Создать пользователя' },
                { id: 'update-user', name: 'PUT /users/{id} - Обновить пользователя' },
                { id: 'delete-user', name: 'DELETE /users/{id} - Удалить пользователя' },
                { id: 'list-users', name: 'GET /users - Список пользователей' }
            ],
            'api-2': [ // OrderAPI
                { id: 'get-order', name: 'GET /orders/{id} - Получить заказ' },
                { id: 'create-order', name: 'POST /orders - Создать заказ' },
                { id: 'update-order', name: 'PUT /orders/{id} - Обновить заказ' },
                { id: 'cancel-order', name: 'DELETE /orders/{id} - Отменить заказ' },
                { id: 'list-orders', name: 'GET /orders - Список заказов' },
                { id: 'get-order-status', name: 'GET /orders/{id}/status - Статус заказа' }
            ],
            'api-3': [ // DictionaryAPI
                { id: 'get-dictionary', name: 'GET /dictionaries/{name} - Получить справочник' },
                { id: 'list-dictionaries', name: 'GET /dictionaries - Список справочников' },
                { id: 'update-dictionary', name: 'PUT /dictionaries/{name} - Обновить справочник' }
            ],
            'api-4': [ // PaymentAPI
                { id: 'create-payment', name: 'POST /payments - Создать платёж' },
                { id: 'get-payment', name: 'GET /payments/{id} - Получить платёж' },
                { id: 'refund-payment', name: 'POST /payments/{id}/refund - Возврат средств' },
                { id: 'list-payments', name: 'GET /payments - Список платежей' }
            ],
            'api-5': [ // NotificationAPI
                { id: 'send-email', name: 'POST /notifications/email - Отправить email' },
                { id: 'send-sms', name: 'POST /notifications/sms - Отправить SMS' },
                { id: 'send-push', name: 'POST /notifications/push - Отправить push' },
                { id: 'get-notification', name: 'GET /notifications/{id} - Получить уведомление' }
            ]
        }
    };

    /**
     * Имитация HTTP-запроса с задержкой
     * @param {*} data - Данные для возврата
     * @param {Number} delay - Задержка в миллисекундах
     * @returns {Promise}
     */
    function simulateHttpRequest(data, delay) {
        delay = delay || 300;
        return new Promise(function(resolve) {
            setTimeout(function() {
                resolve(data);
            }, delay);
        });
    }

    /**
     * HTTP GET запрос для получения JSON
     * @param {String} url - URL для запроса
     * @returns {Promise}
     */
    function getJson(url) {
        return fetch(baseDictionaryHost + url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP error: ' + response.status);
            }
            return response.json();
        });
    }

    /**
     * HTTP POST запрос для отправки JSON
     * @param {String} url - URL для запроса
     * @param {Object} body - Тело запроса
     * @returns {Promise}
     */
    function postJson(url, body) {
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(function(response) {
            if (!response.ok) {
                throw new Error('HTTP error: ' + response.status);
            }
            return response.json();
        });
    }

    /**
     * Построение URL с query параметрами
     * @param {String} baseUrl - Базовый URL
     * @param {Object} params - Объект с параметрами
     * @returns {String}
     */
    function buildUrlWithParams(baseUrl, params) {
        if (!params || Object.keys(params).length === 0) {
            return baseUrl;
        }
        
        const queryString = Object.keys(params)
            .filter(function(key) { return params[key] !== null && params[key] !== undefined; })
            .map(function(key) { return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]); })
            .join('&');
        
        return queryString ? baseUrl + '?' + queryString : baseUrl;
    }

    /**
     * Загрузка данных справочника
     * @param {String} dictionaryName - Название справочника
     * @param {String|Object} dependencyParameters - Мапа зависимостей (если есть)
     * @returns {Promise}
     */
    function loadDictionary(dictionaryName, dependencyParameters) {
        const config = dictionaryConfig[dictionaryName];
        
        // Если справочник не сконфигурирован, вернуть пустой массив
        if (!config) {
            console.warn('Справочник "' + dictionaryName + '" не найден в конфигурации');
            return Promise.resolve([]);
        }

        // Обработка mock справочников
        if (config.type === 'mock') {
            let data = mockData[dictionaryName];
            
            // Обработка зависимостей для mock справочников
            if (config.dependsOn && dependencyParameters) {
                // Если mockData[dictionaryName] - объект с зависимостями
                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    // Получаем ключ зависимости
                    let dependencyKey = null;
                    
                    if (typeof dependencyParameters === 'object' && !Array.isArray(dependencyParameters)) {
                        // dependencyParameters - объект вида {api: 'api-1'}
                        dependencyKey = dependencyParameters[config.dependsOn];
                    } else if (typeof dependencyParameters === 'string') {
                        // dependencyParameters - просто строка 'api-1'
                        dependencyKey = dependencyParameters;
                    }
                    
                    // Получаем данные по ключу зависимости
                    data = data[dependencyKey] || [];
                } else {
                    // Если структура не поддерживает зависимости, возвращаем пустой массив
                    data = [];
                }
            } else {
                // Нет зависимостей - возвращаем данные как есть
                if (!Array.isArray(data)) {
                    data = [];
                }
            }
            
            console.log(`Загрузка mock справочника "${dictionaryName}", параметры зависимости: ${JSON.stringify(dependencyParameters)}`);
            return simulateHttpRequest(data);
        }

        // Обработка HTTP справочников
        if (config.type === 'http') {
            let url = config.url;
            const params = {};
            console.log(`Загрузка HTTP справочника "${dictionaryName}", составной ключ: ${JSON.stringify(dependencyParameters)}"...`);

            // Обработка зависимостей
            if (config.dependsOn === 'multiple' && config.params) {
                // Множественные зависимости
                if (dependencyParameters && typeof dependencyParameters === 'object' && !Array.isArray(dependencyParameters)) {
                    config.params.forEach(function(paramName) {
                        if (paramName in dependencyParameters && dependencyParameters[paramName] !== null && dependencyParameters[paramName] !== undefined) {
                            params[paramName] = dependencyParameters[paramName];
                        }
                    });
                }
            } else if (config.dependsOn && config.paramName && dependencyParameters) {
                // Одиночная зависимость
                if (typeof dependencyParameters === 'object' && !Array.isArray(dependencyParameters)) {
                    if (config.dependsOn in dependencyParameters && dependencyParameters[config.dependsOn] !== null && dependencyParameters[config.dependsOn] !== undefined) {
                        params[config.paramName] = dependencyParameters[config.dependsOn];
                    }
                }
            }

            // Построение URL с параметрами
            url = buildUrlWithParams(url, params);

            // Выполнение HTTP запроса
            return getJson(url).catch(function(error) {
                console.error('Ошибка загрузки справочника "' + dictionaryName + '":', error);
                return []; // Вернуть пустой массив в случае ошибки
            });
        }

        // Неизвестный тип справочника
        console.warn('Неизвестный тип справочника "' + dictionaryName + '":', config.type);
        return Promise.resolve([]);
    }

    /**
     * Отправка формы (имитация)
     * @param {Object} formData - Данные формы
     * @returns {Promise}
     */
    function submitForm(formData) {
        console.log('Отправка формы:', formData);
       return simulateHttpRequest({ success: true, message: 'Заявка успешно отправлена' }, 500);
        // return postJson('http://localhost:8080/test/submit', formData);
    }

    // Публичный API
    return {
        loadDictionary: loadDictionary,
        submitForm: submitForm
    };
})();

