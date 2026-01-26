// Модуль для работы с данными и справочниками
const DataService = (function() {
    'use strict';

    // Моки данных для справочников
    const mockData = {
        cities: [
            { id: '1', name: 'Москва' },
            { id: '2', name: 'Санкт-Петербург' },
            { id: '3', name: 'Новосибирск' },
            { id: '4', name: 'Екатеринбург' },
            { id: '5', name: 'Казань' }
        ],
        departments: {
            '1': [ // Москва
                { id: '1-1', name: 'IT-отдел' },
                { id: '1-2', name: 'Отдел продаж' },
                { id: '1-3', name: 'Бухгалтерия' },
                { id: '1-4', name: 'HR-отдел' }
            ],
            '2': [ // Санкт-Петербург
                { id: '2-1', name: 'IT-отдел' },
                { id: '2-2', name: 'Отдел логистики' },
                { id: '2-3', name: 'Маркетинг' }
            ],
            '3': [ // Новосибирск
                { id: '3-1', name: 'Производство' },
                { id: '3-2', name: 'Контроль качества' }
            ],
            '4': [ // Екатеринбург
                { id: '4-1', name: 'Отдел закупок' },
                { id: '4-2', name: 'Склад' }
            ],
            '5': [ // Казань
                { id: '5-1', name: 'Региональный офис' },
                { id: '5-2', name: 'Сервисный центр' }
            ]
        },
        requestTypes: [
            { id: 'tech', name: 'Техническая поддержка' },
            { id: 'hr', name: 'Кадровый вопрос' },
            { id: 'finance', name: 'Финансовый вопрос' },
            { id: 'other', name: 'Другое' }
        ],
        priorities: [
            { id: 'low', name: 'Низкий' },
            { id: 'medium', name: 'Средний' },
            { id: 'high', name: 'Высокий' },
            { id: 'critical', name: 'Критичный' }
        ]
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
     * Загрузка данных справочника
     * @param {String} dictionaryName - Название справочника
     * @param {String} dependsOnValue - Значение зависимого поля (опционально)
     * @returns {Promise}
     */
    function loadDictionary(dictionaryName, dependsOnValue) {
        let data = null;

        switch (dictionaryName) {
            case 'cities':
                data = mockData.cities;
                break;
            case 'departments':
                if (dependsOnValue && mockData.departments[dependsOnValue]) {
                    data = mockData.departments[dependsOnValue];
                } else {
                    data = [];
                }
                break;
            case 'requestTypes':
                data = mockData.requestTypes;
                break;
            case 'priorities':
                data = mockData.priorities;
                break;
            default:
                data = [];
        }

        return simulateHttpRequest(data);
    }

    /**
     * Отправка формы (имитация)
     * @param {Object} formData - Данные формы
     * @returns {Promise}
     */
    function submitForm(formData) {
        console.log('Отправка формы:', formData);
        return simulateHttpRequest({ success: true, message: 'Заявка успешно отправлена' }, 500);
    }

    // Публичный API
    return {
        loadDictionary: loadDictionary,
        submitForm: submitForm
    };
})();

