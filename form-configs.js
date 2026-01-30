// Конфигурации различных типов форм заявок
const FormConfigs = (function() {
    'use strict';

    // Все доступные типы форм
    const formTypes = [
        {
            id: 'general',
            name: 'Общая заявка',
            description: 'Универсальная форма заявки',
            icon: '📝'
        },
        {
            id: 'meeting',
            name: 'Бронирование переговорной',
            description: 'Резервирование помещений',
            icon: '📅'
        },
        {
            id: 'gravitee',
            name: 'Подписка в Gravitee',
            description: 'Создание подписки на API в Gravitee',
            icon: '🔌'
        }
    ];

    // Конфигурация формы "Общая заявка"
    const generalFormConfig = [
        {
            name: 'priority',
            type: 'select',
            label: 'Приоритет',
            placeholder: 'Выберите приоритет',
            required: true,
            dictionary: 'priorities'
        },
        {
            name: 'urgentReason',
            type: 'textarea',
            label: 'Причина срочности',
            placeholder: 'Укажите причину, почему заявка срочная',
            required: true,
            minLength: 10,
            maxLength: 500,
            rows: 3,
            visibleWhen: {
                field: 'priority',
                value: 'urgent'
            }
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'Описание',
            placeholder: 'Подробно опишите вашу заявку',
            required: true,
            minLength: 10,
            maxLength: 1000,
            rows: 5
        }
    ];

    // Конфигурация формы "Бронирование переговорной"
    const meetingFormConfig = [
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
            name: 'email',
            type: 'email',
            label: 'Email',
            placeholder: 'example@mail.com',
            required: true,
            maxLength: 100
        },
        {
            name: 'phone',
            type: 'text',
            label: 'Телефон',
            placeholder: '+7 (999) 123-45-67',
            required: true,
            minLength: 10,
            maxLength: 20
        },
        {
            name: 'office',
            type: 'select',
            label: 'Офис',
            placeholder: 'Выберите офис',
            required: true,
            dictionary: 'offices'
        },
        {
            name: 'meetingRoom',
            type: 'select',
            label: 'Переговорная',
            placeholder: 'Выберите переговорную',
            required: true,
            dictionary: 'meetingRooms',
            dependsOn: 'office'
        },
        {
            name: 'meetingDate',
            type: 'date',
            label: 'Дата',
            required: true
        },
        {
            name: 'startTime',
            type: 'time',
            label: 'Время начала',
            required: true
        },
        {
            name: 'endTime',
            type: 'time',
            label: 'Время окончания',
            required: true
        },
        {
            name: 'participants',
            type: 'number',
            label: 'Количество участников',
            placeholder: 'Ожидаемое количество человек',
            required: true,
            min: 1,
            max: 50
        },
        {
            name: 'isRecurring',
            type: 'boolean',
            label: 'Повторяющееся бронирование',
            description: 'Установите, если нужно регулярное бронирование',
            required: false,
            defaultValue: false
        },
        {
            name: 'equipment',
            type: 'select',
            label: 'Необходимое оборудование',
            placeholder: 'Выберите оборудование',
            required: false,
            dictionary: 'meetingEquipment'
        },
        {
            name: 'equipmentDetails',
            type: 'textarea',
            label: 'Детали по оборудованию',
            placeholder: 'Опишите особые требования к оборудованию',
            required: false,
            minLength: 10,
            maxLength: 300,
            rows: 3,
            visibleWhen: {
                field: 'equipment',
                values: ['projector', 'videoconference', 'whiteboard']
            }
        },
        {
            name: 'purpose',
            type: 'textarea',
            label: 'Цель встречи',
            placeholder: 'Кратко опишите цель встречи',
            required: true,
            minLength: 10,
            maxLength: 500,
            rows: 3
        }
    ];

    // Конфигурация формы "Подписка в Gravitee"
    const graviteeFormConfig = [
        {
            name: 'environment',
            type: 'select',
            label: 'Окружение',
            placeholder: 'Выберите окружение',
            required: true,
            dictionary: 'graviteeEnvironments'
        },
        {
            name: 'zone',
            type: 'select',
            label: 'Зона',
            placeholder: 'Выберите зону',
            required: true,
            dictionary: 'graviteeZones'
        },
        // Повторяющийся блок для API и методов
        {
            name: 'api_subscriptions',
            type: 'repeatable',
            label: 'Подписки на API',
            addButtonText: '+ Добавить API',
            minInstances: 1,
            maxInstances: 10,
            fields: [
                {
                    name: 'api',
                    type: 'select',
                    label: 'API',
                    placeholder: 'Выберите API',
                    required: true,
                    dictionary: 'api',
                    dependsOn: ['environment', 'zone']
                },
                {
                    name: 'api_methods',
                    type: 'multiselect',
                    label: 'Методы API',
                    placeholder: 'Выберите методы (можно несколько)',
                    required: true,
                    dictionary: 'api_methods',
                    dependsOn: 'api'
                },
                {
                    name: 'auth_method',
                    type: 'select',
                    label: 'Способ аутентификации',
                    placeholder: 'Выберите способ аутентификации',
                    required: true,
                    dictionary: 'graviteeAuthMethods'
                }
            ]
        }
    ];

    // Маппинг ID формы на её конфигурацию
    const formConfigsMap = {
        general: generalFormConfig,
        meeting: meetingFormConfig,
        gravitee: graviteeFormConfig
    };

    /**
     * Получить все доступные типы форм
     * @returns {Array}
     */
    function getFormTypes() {
        return formTypes;
    }

    /**
     * Получить конфигурацию формы по ID
     * @param {String} formId
     * @returns {Array|null}
     */
    function getFormConfig(formId) {
        return formConfigsMap[formId] || null;
    }

    /**
     * Получить информацию о типе формы по ID
     * @param {String} formId
     * @returns {Object|null}
     */
    function getFormType(formId) {
        return formTypes.find(function(type) {
            return type.id === formId;
        }) || null;
    }

    // Публичный API
    return {
        getFormTypes: getFormTypes,
        getFormConfig: getFormConfig,
        getFormType: getFormType
    };
})();

