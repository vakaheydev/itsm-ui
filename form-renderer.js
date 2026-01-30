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
        arrow.textContent = '\u25BC'; // Используем textContent вместо innerHTML

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
        arrow.textContent = '\u25BC'; // Используем textContent вместо innerHTML

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
     * Создание checkbox поля (boolean)
     * @param {Object} field - Описание поля
     * @returns {HTMLElement}
     */
    function createBooleanField(field) {
        const container = document.createElement('div');
        container.className = 'boolean-field-container';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = field.name;
        checkbox.name = field.name;
        checkbox.className = 'boolean-checkbox';
        checkbox.value = 'true';

        // Устанавливаем начальное значение
        if (field.defaultValue === true) {
            checkbox.checked = true;
        }

        // Создаем визуальный переключатель (toggle switch)
        const toggle = document.createElement('label');
        toggle.className = 'boolean-toggle';
        toggle.htmlFor = field.name;

        const slider = document.createElement('span');
        slider.className = 'boolean-slider';

        toggle.appendChild(checkbox);
        toggle.appendChild(slider);

        // Текст описания рядом с переключателем
        if (field.description) {
            const description = document.createElement('span');
            description.className = 'boolean-description';
            description.textContent = field.description;
            container.appendChild(toggle);
            container.appendChild(description);
        } else {
            container.appendChild(toggle);
        }

        return container;
    }

    /**
     * Создание повторяющегося блока
     * @param {Object} field - Описание поля
     * @returns {HTMLElement}
     */
    function createRepeatableField(field) {
        const container = document.createElement('div');
        container.className = 'repeatable-container';
        container.id = field.name + '-container';
        container.setAttribute('data-field-name', field.name);
        container.setAttribute('data-min-instances', field.minInstances || 1);
        container.setAttribute('data-max-instances', field.maxInstances || 10);
        container.setAttribute('data-field-config', JSON.stringify(field.fields));

        // Контейнер для блоков
        const blocksContainer = document.createElement('div');
        blocksContainer.className = 'repeatable-blocks';
        blocksContainer.id = field.name + '-blocks';

        // Кнопка добавления блока
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'btn btn-secondary repeatable-add-btn';
        addButton.textContent = field.addButtonText || '+ Добавить блок';
        addButton.addEventListener('click', function() {
            addRepeatableBlockInternal(container, blocksContainer, field.name, field.fields);
        });

        // Контейнер для сообщения об ошибке
        const errorMessage = document.createElement('div');
        errorMessage.className = 'repeatable-error-message';
        errorMessage.id = field.name + '-error-message';
        errorMessage.style.display = 'none';
        errorMessage.style.color = '#dc3545';
        errorMessage.style.fontSize = '14px';
        errorMessage.style.marginTop = '8px';
        errorMessage.style.fontWeight = '500';

        container.appendChild(blocksContainer);
        container.appendChild(addButton);
        container.appendChild(errorMessage);

        // Добавляем минимальное количество блоков
        const minInstances = field.minInstances || 1;
        for (let i = 0; i < minInstances; i++) {
            addRepeatableBlockInternal(container, blocksContainer, field.name, field.fields, true);
        }

        return container;
    }

    /**
     * Внутренняя функция для добавления блока (принимает элементы напрямую)
     * @param {HTMLElement} container - Элемент контейнера
     * @param {HTMLElement} blocksContainer - Элемент для блоков
     * @param {String} containerName - Название контейнера
     * @param {Array} fields - Поля блока
     * @param {Boolean} isInitial - Начальный блок
     */
    function addRepeatableBlockInternal(container, blocksContainer, containerName, fields, isInitial) {
        if (!container || !blocksContainer) {
            console.error('Контейнер для repeatable блока не найден:', containerName);
            return;
        }
        
        const maxInstances = parseInt(container.getAttribute('data-max-instances'));
        const minInstances = parseInt(container.getAttribute('data-min-instances'));
        
        const currentBlocks = blocksContainer.querySelectorAll('.repeatable-block');
        const errorMessage = document.getElementById(containerName + '-error-message');
        
        if (currentBlocks.length >= maxInstances) {
            // Показываем красное сообщение вместо alert
            if (errorMessage) {
                errorMessage.textContent = 'Достигнуто максимальное количество блоков: ' + maxInstances;
                errorMessage.style.display = 'block';
                
                // Автоматически скрываем сообщение через 3 секунды
                setTimeout(function() {
                    errorMessage.style.display = 'none';
                }, 3000);
            }
            return;
        }
        
        // Скрываем сообщение об ошибке, если оно было показано
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }

        const blockIndex = currentBlocks.length;
        
        const block = document.createElement('div');
        block.className = 'repeatable-block';
        block.setAttribute('data-block-index', blockIndex);

        // Заголовок блока
        const blockHeader = document.createElement('div');
        blockHeader.className = 'repeatable-block-header';
        
        const blockTitle = document.createElement('h3');
        blockTitle.className = 'repeatable-block-title';
        blockTitle.textContent = 'Блок #' + (blockIndex + 1);
        
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'btn btn-secondary repeatable-remove-btn';
        removeButton.textContent = '× Удалить';
        removeButton.addEventListener('click', function() {
            removeRepeatableBlock(containerName, block);
        });
        
        blockHeader.appendChild(blockTitle);
        if (!isInitial || blockIndex >= minInstances) {
            blockHeader.appendChild(removeButton);
        }
        
        block.appendChild(blockHeader);

        // Добавляем поля блока
        fields.forEach(function(field) {
            const fieldCopy = Object.assign({}, field);
            // Изменяем имя поля, чтобы оно было уникальным
            fieldCopy.name = containerName + '_' + blockIndex + '_' + field.name;
            fieldCopy.originalName = field.name;
            fieldCopy.blockIndex = blockIndex;
            fieldCopy.containerName = containerName;
            
            const formGroup = createFormGroup(fieldCopy);
            block.appendChild(formGroup);
        });

        blocksContainer.appendChild(block);
        
        // Загружаем данные для справочников в новом блоке
        loadRepeatableBlockDictionaries(containerName, blockIndex, fields);
        
        // Уведомляем о создании нового блока для настройки обработчиков
        const event = new CustomEvent('repeatableBlockAdded', {
            detail: { containerName: containerName, blockIndex: blockIndex, fields: fields }
        });
        document.dispatchEvent(event);
    }

    /**
     * Удаление повторяющегося блока
     * @param {String} containerName - Название контейнера
     * @param {HTMLElement} block - Блок для удаления
     */
    function removeRepeatableBlock(containerName, block) {
        const container = document.getElementById(containerName + '-container');
        const blocksContainer = document.getElementById(containerName + '-blocks');
        const minInstances = parseInt(container.getAttribute('data-min-instances'));
        const errorMessage = document.getElementById(containerName + '-error-message');
        
        const currentBlocks = blocksContainer.querySelectorAll('.repeatable-block');
        
        if (currentBlocks.length <= minInstances) {
            // Показываем красное сообщение вместо alert
            if (errorMessage) {
                errorMessage.textContent = 'Невозможно удалить: должен остаться минимум ' + minInstances + ' блок(ов)';
                errorMessage.style.display = 'block';
                
                // Автоматически скрываем сообщение через 3 секунды
                setTimeout(function() {
                    errorMessage.style.display = 'none';
                }, 3000);
            }
            return;
        }

        block.remove();
        
        // Перенумеруем оставшиеся блоки
        renumberRepeatableBlocks(containerName);
    }

    /**
     * Перенумерация блоков после удаления
     * @param {String} containerName
     */
    function renumberRepeatableBlocks(containerName) {
        const blocksContainer = document.getElementById(containerName + '-blocks');
        const blocks = blocksContainer.querySelectorAll('.repeatable-block');
        
        blocks.forEach(function(block, index) {
            block.setAttribute('data-block-index', index);
            const title = block.querySelector('.repeatable-block-title');
            if (title) {
                title.textContent = 'Блок #' + (index + 1);
            }
        });
    }

    /**
     * Загрузка справочников для полей в блоке
     * @param {String} containerName
     * @param {Number} blockIndex
     * @param {Array} fields
     */
    function loadRepeatableBlockDictionaries(containerName, blockIndex, fields) {
        console.log('Loading dictionaries for block:', containerName, blockIndex);
        fields.forEach(function(field) {
            const fieldName = containerName + '_' + blockIndex + '_' + field.name;
            console.log('Checking field:', fieldName, 'type:', field.type, 'dictionary:', field.dictionary, 'dependsOn:', field.dependsOn);
            
            if (field.type === 'select' && field.dictionary) {
                if (!field.dependsOn) {
                    // Поле без зависимостей - загружаем сразу
                    console.log('Loading select dictionary for:', fieldName);
                    DataService.loadDictionary(field.dictionary).then(function(data) {
                        console.log('Loaded data for', fieldName, ':', data);
                        updateSelectOptions(fieldName, data);
                    }).catch(function(error) {
                        console.error('Error loading dictionary for', fieldName, ':', error);
                    });
                } else {
                    // Поле с зависимостями - проверяем текущие значения зависимых полей
                    loadDictionaryWithDependencies(fieldName, field, containerName, blockIndex);
                }
            }

            if (field.type === 'multiselect' && field.dictionary) {
                if (!field.dependsOn) {
                    // Поле без зависимостей - загружаем сразу
                    console.log('Loading multiselect dictionary for:', fieldName);
                    DataService.loadDictionary(field.dictionary).then(function(data) {
                        console.log('Loaded data for', fieldName, ':', data);
                        updateMultiSelectOptions(fieldName, data);
                    }).catch(function(error) {
                        console.error('Error loading dictionary for', fieldName, ':', error);
                    });
                } else {
                    // Поле с зависимостями - проверяем текущие значения зависимых полей
                    loadDictionaryWithDependencies(fieldName, field, containerName, blockIndex);
                }
            }
        });
    }

    /**
     * Загрузка справочника с учетом зависимостей
     * @param {String} fieldName - Полное имя поля (с префиксом блока)
     * @param {Object} field - Описание поля
     * @param {String} containerName - Имя контейнера
     * @param {Number} blockIndex - Индекс блока
     */
    function loadDictionaryWithDependencies(fieldName, field, containerName, blockIndex) {
        console.log('Loading dictionary with dependencies for:', fieldName, 'dependsOn:', field.dependsOn);
        
        const dependencyParams = {};
        let allFilled = true;
        const dependencies = Array.isArray(field.dependsOn) ? field.dependsOn : [field.dependsOn];

        dependencies.forEach(function(depFieldName) {
            // Сначала проверяем в основной форме
            let depElement = document.getElementById(depFieldName);
            let value = depElement ? depElement.value : '';
            
            // Если не найдено в основной форме, проверяем в том же блоке
            if (!value) {
                const blockDepFieldName = containerName + '_' + blockIndex + '_' + depFieldName;
                depElement = document.getElementById(blockDepFieldName);
                value = depElement ? depElement.value : '';
            }

            console.log('Dependency field:', depFieldName, 'value:', value);
            
            if (!value) {
                allFilled = false;
            }
            dependencyParams[depFieldName] = value;
        });

        console.log('All dependencies filled:', allFilled, 'params:', dependencyParams);

        if (allFilled) {
            // Все зависимости заполнены - загружаем данные
            DataService.loadDictionary(field.dictionary, dependencyParams).then(function(data) {
                console.log('Loaded dependent data for', fieldName, ':', data);
                if (field.type === 'multiselect') {
                    updateMultiSelectOptions(fieldName, data);
                } else {
                    updateSelectOptions(fieldName, data);
                }
            }).catch(function(error) {
                console.error('Error loading dependent dictionary for', fieldName, ':', error);
            });
        } else {
            // Не все зависимости заполнены - показываем сообщение
            console.log('Not all dependencies filled for', fieldName);
            const message = 'Сначала выберите: ' + dependencies.join(', ');
            if (field.type === 'multiselect') {
                updateMultiSelectOptions(fieldName, [], message);
            } else {
                updateSelectOptions(fieldName, [], message);
            }
        }
    }

    /**
     * Настройка обработчиков зависимостей для полей в repeatable блоках
     * @param {String} containerName
     * @param {Number} blockIndex
     * @param {Array} fields
     * @param {Function} onFieldChange - Коллбэк для обработки изменений
     */
    function setupRepeatableBlockDependencies(containerName, blockIndex, fields, onFieldChange) {
        fields.forEach(function(field) {
            const fieldName = containerName + '_' + blockIndex + '_' + field.name;
            const element = document.getElementById(fieldName);
            
            if (!element) return;
            
            if ((field.type === 'select' || field.type === 'multiselect') && field.dictionary && onFieldChange) {
                element.addEventListener('change', function() {
                    onFieldChange(field, element.value, containerName, blockIndex, fields);
                });
            }
        });
    }

    /**
     * Проверка условия видимости поля
     * @param {Object} field - Описание поля с параметром visibleWhen
     * @param {String} containerName - Имя контейнера (для repeatable блоков)
     * @param {Number} blockIndex - Индекс блока (для repeatable блоков)
     * @returns {Boolean} - true если поле должно быть видимым
     */
    function checkFieldVisibility(field, containerName, blockIndex) {
        // Если нет условия видимости - поле всегда видимо
        if (!field.visibleWhen) {
            return true;
        }

        const condition = field.visibleWhen;
        let targetFieldName = condition.field;
        
        // Для repeatable блоков формируем полное имя поля
        if (containerName !== undefined && blockIndex !== undefined) {
            // Сначала проверяем, существует ли поле в том же блоке
            const blockFieldName = containerName + '_' + blockIndex + '_' + condition.field;
            const blockFieldElement = document.getElementById(blockFieldName);
            
            if (blockFieldElement) {
                targetFieldName = blockFieldName;
            }
            // Если не нашли в блоке, используем имя из основной формы
        }

        const targetElement = document.getElementById(targetFieldName);
        
        if (!targetElement) {
            // Если поле не найдено:
            // - Для полей внутри repeatable блоков (containerName задан) - скрываем
            // - Для полей основной формы - показываем (элемент появится позже)
            if (containerName !== undefined && blockIndex !== undefined) {
                return false;
            }
            // Для основной формы: показываем по умолчанию, 
            // видимость будет обновлена после рендера
            return true;
        }

        // Для boolean (checkbox) полей используем checked вместо value
        let currentValue;
        if (targetElement.type === 'checkbox') {
            currentValue = targetElement.checked;
        } else {
            currentValue = targetElement.value;
        }
        
        // Проверка на конкретное значение (для boolean: true/false)
        if (condition.value !== undefined) {
            return currentValue === condition.value;
        }
        
        // Проверка на массив допустимых значений
        if (condition.values !== undefined && Array.isArray(condition.values)) {
            return condition.values.indexOf(currentValue) !== -1;
        }

        return true;
    }

    /**
     * Обновление видимости поля на основе условия visibleWhen
     * @param {String} fieldName - Имя поля
     * @param {Object} field - Описание поля
     * @param {String} containerName - Имя контейнера (опционально)
     * @param {Number} blockIndex - Индекс блока (опционально)
     */
    function updateFieldVisibility(fieldName, field, containerName, blockIndex) {
        let formGroup;
        
        // Для repeatable блоков ищем контейнер по ID
        if (field.type === 'repeatable') {
            const container = document.getElementById(fieldName + '-container');
            formGroup = container?.closest('.form-group');
        } else {
            formGroup = document.getElementById(fieldName)?.closest('.form-group');
        }
        
        if (!formGroup) return;

        const shouldBeVisible = checkFieldVisibility(field, containerName, blockIndex);
        
        if (shouldBeVisible) {
            formGroup.style.display = '';
        } else {
            formGroup.style.display = 'none';
            // Очищаем значение скрытого поля
            const element = document.getElementById(fieldName);
            if (element) {
                // Для boolean полей сбрасываем checked
                if (field.type === 'boolean' || element.type === 'checkbox') {
                    element.checked = false;
                } else {
                    element.value = '';
                }
                
                // Для кастомных select очищаем также видимый input
                if (field.type === 'select') {
                    const searchInput = document.querySelector('[data-field-name="' + fieldName + '"]');
                    if (searchInput) {
                        searchInput.value = '';
                    }
                } else if (field.type === 'multiselect') {
                    const searchInput = document.querySelector('[data-field-name="' + fieldName + '"]');
                    const tagsContainer = document.getElementById(fieldName + '-tags');
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    if (tagsContainer) {
                        tagsContainer.innerHTML = '';
                        tagsContainer.style.display = 'none';
                    }
                }
            }
        }
    }

    /**
     * Обновление видимости всех полей с условиями visibleWhen
     * @param {Array} fields - Массив описаний полей
     * @param {String} containerName - Имя контейнера (опционально)
     * @param {Number} blockIndex - Индекс блока (опционально)
     */
    function updateAllFieldsVisibility(fields, containerName, blockIndex) {
        fields.forEach(function(field) {
            if (field.visibleWhen) {
                let fieldName = field.name;
                
                // Для repeatable блоков формируем полное имя
                if (containerName !== undefined && blockIndex !== undefined) {
                    fieldName = containerName + '_' + blockIndex + '_' + field.name;
                }
                
                updateFieldVisibility(fieldName, field, containerName, blockIndex);
            }
        });
    }

    /**
     * Создание группы формы с полем
     * @param {Object} field - Описание поля
     * @returns {HTMLElement}
     */
    function createFormGroup(field) {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';

        // Устанавливаем начальную видимость на основе visibleWhen
        if (field.visibleWhen) {
            const shouldBeVisible = checkFieldVisibility(field, field.containerName, field.blockIndex);
            if (!shouldBeVisible) {
                formGroup.style.display = 'none';
            }
        }

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
        } else if (field.type === 'repeatable') {
            fieldElement = createRepeatableField(field);
        } else if (field.type === 'boolean') {
            fieldElement = createBooleanField(field);
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

        // Обновляем видимость всех полей с visibleWhen после рендера
        updateInitialVisibility();
    }

    /**
     * Обновление начальной видимости всех полей с visibleWhen
     */
    function updateInitialVisibility() {
        formFields.forEach(function(field) {
            if (field.visibleWhen) {
                updateFieldVisibility(field.name, field);
            }
        });
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
     * @param {String} dependencyMessage - Сообщение о зависимостях (опционально)
     */
    function updateSelectOptions(fieldName, options, dependencyMessage) {
        const hiddenInput = document.getElementById(fieldName);
        const optionsList = document.getElementById(fieldName + '-options');

        if (!optionsList) return;

        // Сохраняем текущее значение
        const currentValue = hiddenInput ? hiddenInput.value : '';

        // Очищаем список
        optionsList.innerHTML = '';

        // Если передано сообщение о зависимостях и нет опций - показываем предупреждение
        if (dependencyMessage && options.length === 0) {
            const messageElement = document.createElement('div');
            messageElement.className = 'custom-select-option custom-select-warning';
            messageElement.textContent = dependencyMessage;
            messageElement.style.fontStyle = 'italic';
            messageElement.style.color = '#dc3545';
            messageElement.style.cursor = 'default';
            optionsList.appendChild(messageElement);
            return;
        }

        // Добавляем новые опции
        options.forEach(function(option) {
            const optionElement = document.createElement('div');
            optionElement.className = 'custom-select-option';
            // Безопасная установка текста
            optionElement.textContent = option.name || '';
            optionElement.setAttribute('data-value', option.id || '');

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
     * @param {String} dependencyMessage - Сообщение о зависимостях (опционально)
     */
    function updateMultiSelectOptions(fieldName, options, dependencyMessage) {
        const hiddenInput = document.getElementById(fieldName);
        const optionsList = document.getElementById(fieldName + '-options');

        if (!optionsList) return;

        // Получаем текущие выбранные значения
        const currentValues = hiddenInput ? hiddenInput.value.split(',').filter(Boolean) : [];

        // Очищаем список
        optionsList.innerHTML = '';

        // Если нет опций и есть сообщение о зависимостях
        if (options.length === 0 && dependencyMessage) {
            const messageElement = document.createElement('div');
            messageElement.className = 'multiselect-option multiselect-warning';
            messageElement.textContent = dependencyMessage;
            messageElement.style.fontStyle = 'italic';
            messageElement.style.color = '#dc3545';
            messageElement.style.padding = '8px 12px';
            optionsList.appendChild(messageElement);
            return;
        }

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
            removeBtn.textContent = '\u00D7'; // Используем textContent вместо innerHTML
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
     * Получение данных формы в плоском формате (для валидации)
     * @returns {Object}
     */
    function getFormData() {
        const data = {};

        formFields.forEach(function(field) {
            if (field.type === 'repeatable') {
                // Для повторяющихся блоков добавляем каждое поле с префиксом
                const blocksContainer = document.getElementById(field.name + '-blocks');
                if (blocksContainer) {
                    const blocks = blocksContainer.querySelectorAll('.repeatable-block');

                    blocks.forEach(function(block) {
                        field.fields.forEach(function(subField) {
                            const blockIndex = block.getAttribute('data-block-index');
                            const fieldName = field.name + '_' + blockIndex + '_' + subField.name;
                            const element = document.getElementById(fieldName);
                            
                            if (element) {
                                // Для boolean полей внутри repeatable блоков
                                if (subField.type === 'boolean') {
                                    data[fieldName] = element.checked;
                                } else {
                                    data[fieldName] = element.value;
                                }
                            }
                        });
                    });
                }
            } else if (field.type === 'boolean') {
                // Для boolean полей возвращаем true/false
                const element = document.getElementById(field.name);
                if (element) {
                    data[field.name] = element.checked;
                }
            } else {
                const element = document.getElementById(field.name);
                if (element) {
                    data[field.name] = element.value;
                }
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
            if (field.type === 'repeatable') {
                // Для repeatable блоков
                const container = document.getElementById(field.name + '-container');
                const blocksContainer = document.getElementById(field.name + '-blocks');
                
                if (container && blocksContainer) {
                    const minInstances = parseInt(container.getAttribute('data-min-instances'));
                    const blocks = blocksContainer.querySelectorAll('.repeatable-block');
                    
                    // Удаляем все блоки
                    blocks.forEach(function(block) {
                        block.remove();
                    });
                    
                    // Создаём минимальное количество пустых блоков
                    for (let i = 0; i < minInstances; i++) {
                        addRepeatableBlockInternal(container, blocksContainer, field.name, field.fields, true);
                    }
                }
            } else if (field.type === 'select') {
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
        getFieldByName: getFieldByName,
        setupRepeatableBlockDependencies: setupRepeatableBlockDependencies,
        updateFieldVisibility: updateFieldVisibility,
        updateAllFieldsVisibility: updateAllFieldsVisibility,
        checkFieldVisibility: checkFieldVisibility
    };
})();

