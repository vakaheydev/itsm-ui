// Модуль валидации полей формы
const Validator = (function() {
    'use strict';

    /**
     * Санитизация HTML для защиты от XSS
     * @param {String} str - Строка для очистки
     * @returns {String}
     */
    function sanitizeHTML(str) {
        if (typeof str !== 'string') return '';
        
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    /**
     * Экранирование спецсимволов HTML
     * @param {String} str - Строка для экранирования
     * @returns {String}
     */
    function escapeHTML(str) {
        if (typeof str !== 'string') return '';
        
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };
        return str.replace(/[&<>"'\/]/g, function(char) {
            return map[char];
        });
    }

    // Правила валидации для разных типов полей
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

    /**
     * Валидация одного поля
     * @param {Object} field - Описание поля
     * @param {String} value - Значение поля
     * @returns {String|null} - Текст ошибки или null если валидация пройдена
     */
    function validateField(field, value) {
        // Для repeatable полей валидация не применяется на верхнем уровне
        // (поля внутри блоков валидируются отдельно с полными именами)
        if (field.type === 'repeatable') {
            return null;
        }

        // Преобразуем значение в строку для валидации
        const stringValue = value != null ? String(value) : '';

        // Проверка обязательности заполнения
        if (field.required && (!stringValue || stringValue.trim() === '')) {
            return 'Это поле обязательно для заполнения';
        }

        // Если поле пустое и не обязательное, валидация пройдена
        if (!stringValue || stringValue.trim() === '') {
            return null;
        }

        // Проверка минимальной длины
        if (field.minLength && stringValue.length < field.minLength) {
            return `Минимальная длина: ${field.minLength} символов`;
        }

        // Проверка максимальной длины
        if (field.maxLength && stringValue.length > field.maxLength) {
            return `Максимальная длина: ${field.maxLength} символов`;
        }

        // Проверка формата email
        if (field.type === 'email' && !validationRules.email.pattern.test(stringValue)) {
            return validationRules.email.message;
        }

        // Проверка числового формата
        if (field.type === 'number') {
            if (!validationRules.number.pattern.test(stringValue)) {
                return validationRules.number.message;
            }

            const numValue = parseFloat(stringValue);

            // Проверка минимального значения
            if (field.min !== undefined && numValue < field.min) {
                return `Минимальное значение: ${field.min}`;
            }

            // Проверка максимального значения
            if (field.max !== undefined && numValue > field.max) {
                return `Максимальное значение: ${field.max}`;
            }
        }

        return null;
    }

    /**
     * Валидация всей формы
     * @param {Array} fields - Массив описаний полей
     * @param {Object} formData - Объект с данными формы
     * @returns {Object} - Объект с ошибками { fieldName: errorMessage }
     */
    function validateForm(fields, formData) {
        const errors = {};

        fields.forEach(field => {
            if (field.type === 'repeatable') {
                // Для repeatable полей проверяем все блоки
                // Ищем все поля с префиксом field.name_
                const repeatableFieldPrefix = field.name + '_';
                Object.keys(formData).forEach(function(dataKey) {
                    if (dataKey.startsWith(repeatableFieldPrefix)) {
                        // Извлекаем имя оригинального поля из полного имени
                        // Формат: containerName_blockIndex_fieldName
                        // Удаляем префикс containerName_
                        const withoutContainer = dataKey.substring(field.name.length + 1); // '0_api'
                        // Удаляем blockIndex_ (все до первого подчеркивания)
                        const firstUnderscore = withoutContainer.indexOf('_');
                        if (firstUnderscore !== -1) {
                            const originalFieldName = withoutContainer.substring(firstUnderscore + 1);
                            
                            // Находим описание этого поля в конфигурации
                            const subField = field.fields.find(function(f) {
                                return f.name === originalFieldName;
                            });
                            
                            if (subField) {
                                const value = formData[dataKey] || '';
                                const error = validateField(subField, value);
                                if (error) {
                                    errors[dataKey] = error;
                                }
                            }
                        }
                    }
                });
            } else {
                const value = formData[field.name] || '';
                const error = validateField(field, value);
                if (error) {
                    errors[field.name] = error;
                }
            }
        });

        return errors;
    }

    /**
     * Проверка, есть ли ошибки в форме
     * @param {Object} errors - Объект с ошибками
     * @returns {Boolean}
     */
    function hasErrors(errors) {
        return Object.keys(errors).length > 0;
    }

    // Публичный API
    return {
        validateField: validateField,
        validateForm: validateForm,
        hasErrors: hasErrors,
        sanitizeHTML: sanitizeHTML,
        escapeHTML: escapeHTML
    };
})();

