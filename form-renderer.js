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
     * Создание поля ввода (text, email, number, date, time)
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

        if (field.type === 'date') {
            // Устанавливаем минимальную дату (сегодня)
            const today = new Date().toISOString().split('T')[0];
            input.min = today;
        }

        return input;
    }

    /**
     * Создание выпадающего списка с поиском
     * @param {Object} field - Описание поля
     * @returns {HTMLElement}
     */
    function createSelectField(field) {
        // Контейнер для кастомного select
        const customSelect = document.createElement('div');
        customSelect.className = 'custom-select';
        customSelect.id = field.name + '-container';

        // Скрытый input для хранения выбранного значения
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = field.name;
        hiddenInput.name = field.name;
        hiddenInput.value = '';

        // Поле поиска/отображения выбранного значения
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'form-control custom-select-input';
        searchInput.placeholder = field.placeholder || 'Выберите...';
        searchInput.autocomplete = 'off';
        searchInput.setAttribute('data-field-name', field.name);

        // Стрелка-индикатор
        const arrow = document.createElement('span');
        arrow.className = 'custom-select-arrow';
        arrow.innerHTML = '▼';

        // Контейнер для выпадающего списка опций
        const optionsList = document.createElement('div');
        optionsList.className = 'custom-select-options';
        optionsList.id = field.name + '-options';

        // Сообщение "Нет результатов"
        const noResults = document.createElement('div');
        noResults.className = 'custom-select-no-results';
        noResults.textContent = 'Ничего не найдено';
        noResults.style.display = 'none';

        // Обработчик фокуса - показать список
        searchInput.addEventListener('focus', function() {
            optionsList.classList.add('show');
            filterOptions(field.name, '');
        });

        // Обработчик ввода - фильтрация
        searchInput.addEventListener('input', function() {
            hiddenInput.value = '';
            filterOptions(field.name, searchInput.value);
            optionsList.classList.add('show');
        });

        // Обработчик клика по стрелке
        arrow.addEventListener('click', function() {
            if (optionsList.classList.contains('show')) {
                optionsList.classList.remove('show');
            } else {
                searchInput.focus();
            }
        });

        // Собираем компонент
        customSelect.appendChild(hiddenInput);
        customSelect.appendChild(searchInput);
        customSelect.appendChild(arrow);
        customSelect.appendChild(optionsList);
        customSelect.appendChild(noResults);

        return customSelect;
    }

    /**
     * Фильтрация опций по поисковому запросу
     * @param {String} fieldName - Название поля
     * @param {String} searchQuery - Поисковый запрос
     */
    function filterOptions(fieldName, searchQuery) {
        const optionsList = document.getElementById(fieldName + '-options');
        const noResults = document.querySelector('#' + fieldName + '-container .custom-select-no-results');

        if (!optionsList) return;

        const options = optionsList.querySelectorAll('.custom-select-option');
        let visibleCount = 0;

        const query = searchQuery.toLowerCase();

        options.forEach(function(option) {
            const text = option.textContent.toLowerCase();
            if (text.indexOf(query) !== -1) {
                option.style.display = 'block';
                visibleCount++;
            } else {
                option.style.display = 'none';
            }
        });

        // Показываем/скрываем "Нет результатов"
        if (visibleCount === 0 && options.length > 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    }

    /**
     * Создание поля с множественным выбором
     * @param {Object} field - Описание поля
     * @returns {HTMLElement}
     */
    function createMultiSelectField(field) {
        // Контейнер для multiselect
        const multiSelect = document.createElement('div');
        multiSelect.className = 'custom-multiselect';
        multiSelect.id = field.name + '-container';

        // Скрытый input для хранения выбранных значений (через запятую)
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.id = field.name;
        hiddenInput.name = field.name;
        hiddenInput.value = '';

        // Контейнер для выбранных элементов (тэги)
        const selectedTags = document.createElement('div');
        selectedTags.className = 'multiselect-tags';
        selectedTags.id = field.name + '-tags';

        // Поле поиска
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'form-control multiselect-input';
        searchInput.placeholder = field.placeholder || 'Выберите...';
        searchInput.autocomplete = 'off';
        searchInput.setAttribute('data-field-name', field.name);

        // Стрелка-индикатор
        const arrow = document.createElement('span');
        arrow.className = 'multiselect-arrow';
        arrow.innerHTML = '▼';

        // Контейнер для выпадающего списка опций
        const optionsList = document.createElement('div');
        optionsList.className = 'multiselect-options';
        optionsList.id = field.name + '-options';

        // Панель с кнопками управления
        const controlPanel = document.createElement('div');
        controlPanel.className = 'multiselect-controls';
        controlPanel.id = field.name + '-controls';

        const selectAllBtn = document.createElement('button');
        selectAllBtn.type = 'button';
        selectAllBtn.className = 'multiselect-control-btn';
        selectAllBtn.textContent = '✓ Выбрать все';
        selectAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            selectAllMultiSelectOptions(field.name);
        });

        const deselectAllBtn = document.createElement('button');
        deselectAllBtn.type = 'button';
        deselectAllBtn.className = 'multiselect-control-btn';
        deselectAllBtn.textContent = '✗ Снять все';
        deselectAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            deselectAllMultiSelectOptions(field.name);
        });

        controlPanel.appendChild(selectAllBtn);
        controlPanel.appendChild(deselectAllBtn);

        // Сообщение "Нет результатов"
        const noResults = document.createElement('div');
        noResults.className = 'multiselect-no-results';
        noResults.textContent = 'Ничего не найдено';
        noResults.style.display = 'none';

        // Обработчик фокуса - показать список
        searchInput.addEventListener('focus', function() {
            const dropdown = multiSelect.querySelector('.multiselect-dropdown');
            if (dropdown) {
                dropdown.classList.add('show');
            }
            filterMultiSelectOptions(field.name, '');
        });

        // Обработчик ввода - фильтрация
        searchInput.addEventListener('input', function() {
            const dropdown = multiSelect.querySelector('.multiselect-dropdown');
            if (dropdown) {
                dropdown.classList.add('show');
            }
            filterMultiSelectOptions(field.name, searchInput.value);
        });

        // Обработчик клика по стрелке
        arrow.addEventListener('click', function() {
            const dropdown = multiSelect.querySelector('.multiselect-dropdown');
            if (dropdown) {
                if (dropdown.classList.contains('show')) {
                    dropdown.classList.remove('show');
                } else {
                    searchInput.focus();
                }
            }
        });

        // Собираем компонент
        multiSelect.appendChild(hiddenInput);
        multiSelect.appendChild(selectedTags);
        multiSelect.appendChild(searchInput);
        multiSelect.appendChild(arrow);

        // Создаем контейнер для выпадающего меню (панель управления + опции)
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'multiselect-dropdown';
        dropdownContainer.appendChild(controlPanel);
        dropdownContainer.appendChild(optionsList);

        multiSelect.appendChild(dropdownContainer);
        multiSelect.appendChild(noResults);

        return multiSelect;
    }

    /**
     * Фильтрация опций в multiselect
     * @param {String} fieldName - Название поля
     * @param {String} searchQuery - Поисковый запрос
     */
    function filterMultiSelectOptions(fieldName, searchQuery) {
        const optionsList = document.getElementById(fieldName + '-options');
        const noResults = document.querySelector('#' + fieldName + '-container .multiselect-no-results');

        if (!optionsList) return;

        const options = optionsList.querySelectorAll('.multiselect-option');
        let visibleCount = 0;

        const query = searchQuery.toLowerCase();

        options.forEach(function(option) {
            const text = option.textContent.toLowerCase();
            const checkbox = option.querySelector('input[type="checkbox"]');

            if (text.indexOf(query) !== -1) {
                option.style.display = 'flex';
                visibleCount++;
            } else {
                option.style.display = 'none';
            }
        });

        // Показываем/скрываем "Нет результатов"
        if (visibleCount === 0 && options.length > 0) {
            noResults.style.display = 'block';
        } else {
            noResults.style.display = 'none';
        }
    }

    /**
     * Выбрать все опции в multiselect
     * @param {String} fieldName - Название поля
     */
    function selectAllMultiSelectOptions(fieldName) {
        const optionsList = document.getElementById(fieldName + '-options');
        if (!optionsList) return;

        const checkboxes = optionsList.querySelectorAll('input[type="checkbox"]');
        const visibleCheckboxes = Array.from(checkboxes).filter(function(checkbox) {
            const option = checkbox.closest('.multiselect-option');
            return option && option.style.display !== 'none';
        });

        visibleCheckboxes.forEach(function(checkbox) {
            if (!checkbox.checked) {
                checkbox.checked = true;
                const option = checkbox.closest('.multiselect-option');
                const label = option.querySelector('label');
                const value = checkbox.value;
                const text = label ? label.textContent : value;
                toggleMultiSelectOption(fieldName, value, text, true);
            }
        });
    }

    /**
     * Снять выбор со всех опций в multiselect
     * @param {String} fieldName - Название поля
     */
    function deselectAllMultiSelectOptions(fieldName) {
        const optionsList = document.getElementById(fieldName + '-options');
        if (!optionsList) return;

        const checkboxes = optionsList.querySelectorAll('input[type="checkbox"]:checked');

        checkboxes.forEach(function(checkbox) {
            checkbox.checked = false;
            const option = checkbox.closest('.multiselect-option');
            const label = option.querySelector('label');
            const value = checkbox.value;
            const text = label ? label.textContent : value;
            toggleMultiSelectOption(fieldName, value, text, false);
        });
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
        } else if (field.type === 'multiselect') {
            fieldElement = createMultiSelectField(field);
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

        // Добавляем глобальный обработчик для закрытия выпадающих списков
        setupGlobalClickHandler();
    }

    /**
     * Установка глобального обработчика кликов для закрытия выпадающих списков
     */
    function setupGlobalClickHandler() {
        document.addEventListener('click', function(event) {
            // Обработка custom-select
            const customSelects = document.querySelectorAll('.custom-select');

            customSelects.forEach(function(select) {
                const optionsList = select.querySelector('.custom-select-options');
                const searchInput = select.querySelector('.custom-select-input');
                const arrow = select.querySelector('.custom-select-arrow');

                // Если клик был вне кастомного select - закрываем список
                if (!select.contains(event.target)) {
                    if (optionsList) {
                        optionsList.classList.remove('show');
                    }
                }
            });

            // Обработка multiselect
            const multiSelects = document.querySelectorAll('.custom-multiselect');

            multiSelects.forEach(function(select) {
                const dropdown = select.querySelector('.multiselect-dropdown');

                // Если клик был вне multiselect - закрываем список
                if (!select.contains(event.target)) {
                    if (dropdown) {
                        dropdown.classList.remove('show');
                    }
                }
            });
        });
    }

    /**
     * Обновление опций выпадающего списка
     * @param {String} fieldName - Название поля
     * @param {Array} options - Массив опций { id, name }
     */
    function updateSelectOptions(fieldName, options) {
        const hiddenInput = document.getElementById(fieldName);
        const optionsList = document.getElementById(fieldName + '-options');

        if (!optionsList) return;

        // Сохраняем текущее значение
        const currentValue = hiddenInput ? hiddenInput.value : '';

        // Очищаем список
        optionsList.innerHTML = '';

        // Добавляем новые опции
        options.forEach(function(option) {
            const optionElement = document.createElement('div');
            optionElement.className = 'custom-select-option';
            optionElement.textContent = option.name;
            optionElement.setAttribute('data-value', option.id);

            // Обработчик клика по опции
            optionElement.addEventListener('click', function() {
                selectOption(fieldName, option.id, option.name);
            });

            optionsList.appendChild(optionElement);
        });

        // Восстанавливаем значение, если оно есть в новых опциях
        const valueExists = options.some(function(option) {
            return option.id === currentValue;
        });

        if (valueExists) {
            const selectedOption = options.find(function(option) {
                return option.id === currentValue;
            });
            if (selectedOption) {
                selectOption(fieldName, selectedOption.id, selectedOption.name);
            }
        }
    }

    /**
     * Выбор опции в кастомном select
     * @param {String} fieldName - Название поля
     * @param {String} value - Значение
     * @param {String} text - Текст для отображения
     */
    function selectOption(fieldName, value, text) {
        const hiddenInput = document.getElementById(fieldName);
        const searchInput = document.querySelector('[data-field-name="' + fieldName + '"]');
        const optionsList = document.getElementById(fieldName + '-options');

        if (hiddenInput) {
            hiddenInput.value = value;
        }

        if (searchInput) {
            searchInput.value = text;
        }

        if (optionsList) {
            optionsList.classList.remove('show');
        }

        // Триггерим событие change для обработки зависимых полей
        if (hiddenInput) {
            const event = new Event('change', { bubbles: true });
            hiddenInput.dispatchEvent(event);
        }
    }

    /**
     * Обновление опций multiselect
     * @param {String} fieldName - Название поля
     * @param {Array} options - Массив опций { id, name }
     */
    function updateMultiSelectOptions(fieldName, options) {
        const hiddenInput = document.getElementById(fieldName);
        const optionsList = document.getElementById(fieldName + '-options');

        if (!optionsList) return;

        // Получаем текущие выбранные значения
        const currentValues = hiddenInput ? hiddenInput.value.split(',').filter(Boolean) : [];

        // Очищаем список
        optionsList.innerHTML = '';

        // Добавляем новые опции
        options.forEach(function(option) {
            const optionElement = document.createElement('div');
            optionElement.className = 'multiselect-option';

            // Checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = fieldName + '-' + option.id;
            checkbox.value = option.id;
            checkbox.checked = currentValues.indexOf(option.id) !== -1;

            // Label
            const label = document.createElement('label');
            label.htmlFor = fieldName + '-' + option.id;
            label.textContent = option.name;

            // Обработчик изменения checkbox
            checkbox.addEventListener('change', function() {
                toggleMultiSelectOption(fieldName, option.id, option.name, checkbox.checked);
            });

            optionElement.appendChild(checkbox);
            optionElement.appendChild(label);
            optionsList.appendChild(optionElement);
        });

        // Восстанавливаем выбранные значения в тэгах
        updateMultiSelectTags(fieldName);
    }

    /**
     * Переключение опции в multiselect
     * @param {String} fieldName - Название поля
     * @param {String} value - Значение
     * @param {String} text - Текст
     * @param {Boolean} isChecked - Выбрано или нет
     */
    function toggleMultiSelectOption(fieldName, value, text, isChecked) {
        const hiddenInput = document.getElementById(fieldName);
        const searchInput = document.querySelector('[data-field-name="' + fieldName + '"]');

        if (!hiddenInput) return;

        // Получаем массив выбранных значений
        let selectedValues = hiddenInput.value ? hiddenInput.value.split(',') : [];

        if (isChecked) {
            // Добавляем значение
            if (selectedValues.indexOf(value) === -1) {
                selectedValues.push(value);
            }
        } else {
            // Удаляем значение
            selectedValues = selectedValues.filter(function(v) {
                return v !== value;
            });
        }

        // Сохраняем обратно
        hiddenInput.value = selectedValues.join(',');

        // Обновляем тэги
        updateMultiSelectTags(fieldName);

        // Очищаем поле поиска
        if (searchInput) {
            searchInput.value = '';
        }

        // Триггерим событие change
        const event = new Event('change', { bubbles: true });
        hiddenInput.dispatchEvent(event);
    }

    /**
     * Обновление тэгов выбранных значений в multiselect
     * @param {String} fieldName - Название поля
     */
    function updateMultiSelectTags(fieldName) {
        const hiddenInput = document.getElementById(fieldName);
        const tagsContainer = document.getElementById(fieldName + '-tags');
        const optionsList = document.getElementById(fieldName + '-options');

        if (!tagsContainer || !hiddenInput) return;

        // Очищаем контейнер тэгов
        tagsContainer.innerHTML = '';

        // Получаем выбранные значения
        const selectedValues = hiddenInput.value ? hiddenInput.value.split(',') : [];

        if (selectedValues.length === 0) {
            tagsContainer.style.display = 'none';
            return;
        }

        tagsContainer.style.display = 'flex';

        // Создаём тэг для каждого выбранного значения
        selectedValues.forEach(function(value) {
            const option = optionsList.querySelector('[value="' + value + '"]');
            if (!option) return;

            const label = option.nextElementSibling;
            const text = label ? label.textContent : value;

            const tag = document.createElement('span');
            tag.className = 'multiselect-tag';
            tag.textContent = text;

            // Кнопка удаления
            const removeBtn = document.createElement('span');
            removeBtn.className = 'multiselect-tag-remove';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', function() {
                // Снимаем галочку с checkbox
                if (option) {
                    option.checked = false;
                }
                toggleMultiSelectOption(fieldName, value, text, false);
            });

            tag.appendChild(removeBtn);
            tagsContainer.appendChild(tag);
        });
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
            if (field.type === 'select') {
                // Для кастомного select
                const hiddenInput = document.getElementById(field.name);
                const searchInput = document.querySelector('[data-field-name="' + field.name + '"]');
                const optionsList = document.getElementById(field.name + '-options');

                if (hiddenInput) {
                    hiddenInput.value = '';
                }
                if (searchInput) {
                    searchInput.value = '';
                }

                // Для select-ов с зависимостями очищаем опции
                if (field.dependsOn && optionsList) {
                    optionsList.innerHTML = '';
                }
            } else if (field.type === 'multiselect') {
                // Для multiselect
                const hiddenInput = document.getElementById(field.name);
                const searchInput = document.querySelector('[data-field-name="' + field.name + '"]');
                const tagsContainer = document.getElementById(field.name + '-tags');
                const optionsList = document.getElementById(field.name + '-options');

                if (hiddenInput) {
                    hiddenInput.value = '';
                }
                if (searchInput) {
                    searchInput.value = '';
                }
                if (tagsContainer) {
                    tagsContainer.innerHTML = '';
                    tagsContainer.style.display = 'none';
                }

                // Снимаем все галочки
                if (optionsList) {
                    const checkboxes = optionsList.querySelectorAll('input[type="checkbox"]');
                    checkboxes.forEach(function(checkbox) {
                        checkbox.checked = false;
                    });

                    // Для multiselect с зависимостями очищаем опции
                    if (field.dependsOn) {
                        optionsList.innerHTML = '';
                    }
                }
            } else {
                const element = document.getElementById(field.name);
                if (element) {
                    element.value = '';
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
        updateMultiSelectOptions: updateMultiSelectOptions,
        getFormData: getFormData,
        showErrors: showErrors,
        clearErrors: clearErrors,
        clearForm: clearForm,
        getFieldByName: getFieldByName
    };
})();

