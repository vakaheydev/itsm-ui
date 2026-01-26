// Главный файл приложения - инициализация и управление
(function() {
    'use strict';

    // Декларативное описание формы заявки
    const formConfig = [
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
            required: false,
            minLength: 10,
            maxLength: 20
        },
        {
            name: 'age',
            type: 'number',
            label: 'Возраст',
            placeholder: 'Введите ваш возраст',
            required: false,
            min: 18,
            max: 100
        },
        {
            name: 'city',
            type: 'select',
            label: 'Город',
            placeholder: 'Выберите город',
            required: true,
            dictionary: 'cities'
        },
        {
            name: 'department',
            type: 'select',
            label: 'Отдел',
            placeholder: 'Выберите отдел',
            required: true,
            dictionary: 'departments',
            dependsOn: 'city' // Зависит от выбранного города
        },
        {
            name: 'requestType',
            type: 'select',
            label: 'Тип заявки',
            placeholder: 'Выберите тип заявки',
            required: true,
            dictionary: 'requestTypes'
        },
        {
            name: 'priority',
            type: 'select',
            label: 'Приоритет',
            placeholder: 'Выберите приоритет',
            required: true,
            dictionary: 'priorities'
        },
        {
            name: 'description',
            type: 'textarea',
            label: 'Описание проблемы',
            placeholder: 'Подробно опишите вашу проблему или вопрос',
            required: true,
            minLength: 10,
            maxLength: 1000,
            rows: 5
        }
    ];

    /**
     * Инициализация приложения
     */
    function initApp() {
        const formContainer = document.getElementById('form-container');
        const submitBtn = document.getElementById('submit-btn');
        const resetBtn = document.getElementById('reset-btn');
        const successMessage = document.getElementById('success-message');

        // Инициализация рендерера формы
        FormRenderer.init(formConfig, formContainer);
        FormRenderer.render();

        // Загрузка начальных данных для справочников
        loadInitialDictionaries();

        // Установка обработчиков событий
        setupEventHandlers();

        // Обработчик отправки формы
        submitBtn.addEventListener('click', function() {
            handleFormSubmit(successMessage);
        });

        // Обработчик очистки формы
        resetBtn.addEventListener('click', function() {
            FormRenderer.clearForm();
            successMessage.classList.add('hidden');
            // Перезагружаем начальные справочники
            loadInitialDictionaries();
        });
    }

    /**
     * Загрузка начальных данных справочников
     */
    function loadInitialDictionaries() {
        formConfig.forEach(function(field) {
            if (field.type === 'select' && field.dictionary && !field.dependsOn) {
                DataService.loadDictionary(field.dictionary).then(function(data) {
                    FormRenderer.updateSelectOptions(field.name, data);
                });
            }
        });
    }

    /**
     * Установка обработчиков событий для полей формы
     */
    function setupEventHandlers() {
        formConfig.forEach(function(field) {
            const element = document.getElementById(field.name);

            if (!element) return;

            // Валидация при потере фокуса
            element.addEventListener('blur', function() {
                validateSingleField(field.name);
            });

            // Очистка ошибки при вводе
            element.addEventListener('input', function() {
                clearFieldError(field.name);
            });

            // Обработка зависимостей между полями
            if (field.type === 'select' && field.dictionary) {
                element.addEventListener('change', function() {
                    handleDependentFields(field.name, element.value);
                });
            }
        });
    }

    /**
     * Валидация одного поля
     * @param {String} fieldName
     */
    function validateSingleField(fieldName) {
        const field = FormRenderer.getFieldByName(fieldName);
        if (!field) return;

        const element = document.getElementById(fieldName);
        const value = element ? element.value : '';
        const error = Validator.validateField(field, value);

        if (error) {
            const errors = {};
            errors[fieldName] = error;
            FormRenderer.showErrors(errors);
        }
    }

    /**
     * Очистка ошибки у конкретного поля
     * @param {String} fieldName
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
     * Обработка зависимых полей
     * @param {String} parentFieldName
     * @param {String} parentValue
     */
    function handleDependentFields(parentFieldName, parentValue) {
        // Находим поля, которые зависят от текущего
        const dependentFields = formConfig.filter(function(field) {
            return field.dependsOn === parentFieldName;
        });

        dependentFields.forEach(function(field) {
            if (parentValue) {
                // Загружаем данные для зависимого справочника
                DataService.loadDictionary(field.dictionary, parentValue).then(function(data) {
                    FormRenderer.updateSelectOptions(field.name, data);
                });
            } else {
                // Очищаем зависимое поле
                FormRenderer.updateSelectOptions(field.name, []);
            }
        });
    }

    /**
     * Обработка отправки формы
     * @param {HTMLElement} successMessage
     */
    function handleFormSubmit(successMessage) {
        // Скрываем сообщение об успехе
        successMessage.classList.add('hidden');

        // Получаем данные формы
        const formData = FormRenderer.getFormData();

        // Валидация формы
        const errors = Validator.validateForm(formConfig, formData);

        if (Validator.hasErrors(errors)) {
            // Отображаем ошибки
            FormRenderer.showErrors(errors);
            return;
        }

        // Очищаем ошибки
        FormRenderer.clearErrors();

        // Отправляем форму
        DataService.submitForm(formData).then(function(response) {
            if (response.success) {
                // Показываем сообщение об успехе
                successMessage.classList.remove('hidden');

                // Прокручиваем к сообщению
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

                // Очищаем форму через небольшую задержку
                setTimeout(function() {
                    FormRenderer.clearForm();
                    loadInitialDictionaries();

                    // Скрываем сообщение через 5 секунд
                    setTimeout(function() {
                        successMessage.classList.add('hidden');
                    }, 5000);
                }, 1000);
            }
        }).catch(function(error) {
            console.error('Ошибка при отправке формы:', error);
        });
    }

    // Запуск приложения после загрузки DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
})();

