// Модуль рендеринга формы
const FormRenderer = (function() {
    'use strict';

    let formFields = [];
    let formContainer = null;

    /**
     * Инициализация рендерера
     * @param {Array} fields - Описание полей формы
     * @param {HTMLElement} container - Контейнер для формы
     */
    function init(fields, container) {
        formFields = fields;
        formContainer = container;
    }

    /**
     * Создание поля ввода (text, email, number)
     * @param {Object} field - Описание поля
     * @returns {HTMLElement}
     */
    function createInputField(field) {
        const input = document.createElement('input');
        input.type = field.type;
        input.id = field.name;
        input.name = field.name;
        input.className = 'form-control';

        if (field.placeholder) {
            input.placeholder = field.placeholder;
        }

        if (field.type === 'number') {
            if (field.min !== undefined) {
                input.min = field.min;
            }
            if (field.max !== undefined) {
                input.max = field.max;
            }
        }

        return input;
    }

    /**
     * Создание выпадающего списка
     * @param {Object} field - Описание поля
     * @returns {HTMLElement}
     */
    function createSelectField(field) {
        const select = document.createElement('select');
        select.id = field.name;
        select.name = field.name;
        select.className = 'form-control';

        // Пустая опция по умолчанию
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = field.placeholder || 'Выберите...';
        select.appendChild(emptyOption);

        return select;
    }

    /**
     * Создание textarea
     * @param {Object} field - Описание поля
     * @returns {HTMLElement}
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
     * Создание группы формы с полем
     * @param {Object} field - Описание поля
     * @returns {HTMLElement}
     */
    function createFormGroup(field) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        // Label
        const label = document.createElement('label');
        label.htmlFor = field.name;
        label.textContent = field.label;

        if (field.required) {
            const required = document.createElement('span');
            required.className = 'required';
            required.textContent = '*';
            label.appendChild(required);
        }

        // Создание поля в зависимости от типа
        let fieldElement;
        if (field.type === 'select') {
            fieldElement = createSelectField(field);
        } else if (field.type === 'textarea') {
            fieldElement = createTextareaField(field);
        } else {
            fieldElement = createInputField(field);
        }

        // Контейнер для ошибок
        const errorContainer = document.createElement('span');
        errorContainer.className = 'error-message';
        errorContainer.id = field.name + '-error';

        formGroup.appendChild(label);
        formGroup.appendChild(fieldElement);
        formGroup.appendChild(errorContainer);

        return formGroup;
    }

    /**
     * Рендеринг формы
     */
    function render() {
        formContainer.innerHTML = '';

        formFields.forEach(function(field) {
            const formGroup = createFormGroup(field);
            formContainer.appendChild(formGroup);
        });
    }

    /**
     * Обновление опций выпадающего списка
     * @param {String} fieldName - Название поля
     * @param {Array} options - Массив опций { id, name }
     */
    function updateSelectOptions(fieldName, options) {
        const select = document.getElementById(fieldName);
        if (!select) return;

        // Сохраняем текущее значение
        const currentValue = select.value;

        // Очищаем опции, кроме первой (пустой)
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

        // Восстанавливаем значение, если оно есть в новых опциях
        const valueExists = options.some(function(option) {
            return option.id === currentValue;
        });

        if (valueExists) {
            select.value = currentValue;
        }
    }

    /**
     * Получение данных формы
     * @returns {Object}
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
     * @param {Object} errors - Объект с ошибками { fieldName: errorMessage }
     */
    function showErrors(errors) {
        // Сначала очищаем все ошибки
        clearErrors();

        // Отображаем новые ошибки
        Object.keys(errors).forEach(function(fieldName) {
            const field = document.getElementById(fieldName);
            const errorContainer = document.getElementById(fieldName + '-error');

            if (field) {
                field.classList.add('error');
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

                // Для select-ов с зависимостями очищаем опции
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
     * Получение описания поля по имени
     * @param {String} fieldName
     * @returns {Object|null}
     */
    function getFieldByName(fieldName) {
        return formFields.find(function(field) {
            return field.name === fieldName;
        }) || null;
    }

    // Публичный API
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

