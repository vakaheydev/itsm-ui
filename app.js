// Главный файл приложения - инициализация и управление
(function() {
    'use strict';

    // Текущая выбранная форма
    let currentFormConfig = null;
    let currentFormType = null;

    /**
     * Инициализация приложения
     */
    function initApp() {
        renderFormTypeSelector();
    }

    /**
     * Рендеринг селектора типов форм
     */
    function renderFormTypeSelector() {
        const formTypeButtons = document.getElementById('form-type-buttons');
        const formTypes = FormConfigs.getFormTypes();

        formTypeButtons.innerHTML = '';

        formTypes.forEach(function(formType) {
            const button = document.createElement('button');
            button.className = 'form-type-btn';
            button.onclick = function() {
                selectFormType(formType.id);
            };

            const icon = document.createElement('div');
            icon.className = 'form-type-btn-icon';
            icon.textContent = formType.icon;

            const text = document.createElement('div');
            text.className = 'form-type-btn-text';
            text.textContent = formType.name;

            const description = document.createElement('div');
            description.className = 'form-type-btn-description';
            description.textContent = formType.description;

            button.appendChild(icon);
            button.appendChild(text);
            button.appendChild(description);

            formTypeButtons.appendChild(button);
        });
    }

    /**
     * Выбор типа формы и отображение её
     * @param {String} formId
     */
    function selectFormType(formId) {
        const formConfig = FormConfigs.getFormConfig(formId);
        const formType = FormConfigs.getFormType(formId);

        if (!formConfig || !formType) {
            console.error('Форма не найдена:', formId);
            return;
        }

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
     */
    function initForm() {
        const formContainer = document.getElementById('form-container');
        const submitBtn = document.getElementById('submit-btn');
        const showJsonBtn = document.getElementById('show-json-btn');
        const resetBtn = document.getElementById('reset-btn');
        const backBtn = document.getElementById('back-btn');
        const successMessage = document.getElementById('success-message');

        // Инициализация рендерера формы
        FormRenderer.init(currentFormConfig, formContainer);
        FormRenderer.render();

        // Загрузка начальных данных для справочников
        loadInitialDictionaries();

        // Установка обработчиков событий
        setupEventHandlers();

        // Удаляем старые обработчики и добавляем новые
        const newSubmitBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);
        newSubmitBtn.addEventListener('click', function() {
            handleFormSubmit(successMessage);
        });

        const newShowJsonBtn = showJsonBtn.cloneNode(true);
        showJsonBtn.parentNode.replaceChild(newShowJsonBtn, showJsonBtn);
        newShowJsonBtn.addEventListener('click', function() {
            handleShowJson();
        });

        const newResetBtn = resetBtn.cloneNode(true);
        resetBtn.parentNode.replaceChild(newResetBtn, resetBtn);
        newResetBtn.addEventListener('click', function() {
            FormRenderer.clearForm();
            successMessage.classList.add('hidden');
            loadInitialDictionaries();
        });

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

        // Сбрасываем текущую форму
        currentFormConfig = null;
        currentFormType = null;
    }

    /**
     * Загрузка начальных данных справочников
     */
    function loadInitialDictionaries() {
        currentFormConfig.forEach(function(field) {
            if (field.type === 'select' && field.dictionary && !field.dependsOn) {
                DataService.loadDictionary(field.dictionary).then(function(data) {
                    FormRenderer.updateSelectOptions(field.name, data);
                });
            }

            if (field.type === 'multiselect' && field.dictionary && !field.dependsOn) {
                DataService.loadDictionary(field.dictionary).then(function(data) {
                    FormRenderer.updateMultiSelectOptions(field.name, data);
                });
            }
        });
    }

    /**
     * Установка обработчиков событий для полей формы
     */
    function setupEventHandlers() {
        currentFormConfig.forEach(function(field) {
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

            // Обработка boolean полей (обновление visibleWhen зависимых полей)
            if (field.type === 'boolean') {
                element.addEventListener('change', function() {
                    handleDependentFields(field.name, element.checked);
                });
            }
        });

        // Настройка обработчиков для repeatable блоков
        setupRepeatableBlocksHandlers();

        // Слушаем событие добавления нового repeatable блока
        document.addEventListener('repeatableBlockAdded', function(e) {
            const detail = e.detail;
            setupRepeatableBlockEventHandlers(detail.containerName, detail.blockIndex, detail.fields);
        });
    }

    /**
     * Настройка обработчиков для repeatable блоков
     */
    function setupRepeatableBlocksHandlers() {
        currentFormConfig.forEach(function(field) {
            if (field.type === 'repeatable') {
                const container = document.getElementById(field.name + '-blocks');
                if (!container) return;

                // Используем MutationObserver для отслеживания добавления новых блоков
                const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.classList && node.classList.contains('repeatable-block')) {
                                const blockIndex = node.getAttribute('data-block-index');
                                setupRepeatableBlockEventHandlers(field.name, blockIndex, field.fields);
                            }
                        });
                    });
                });

                observer.observe(container, { childList: true });

                // Настройка обработчиков для существующих блоков
                const existingBlocks = container.querySelectorAll('.repeatable-block');
                existingBlocks.forEach(function(block) {
                    const blockIndex = block.getAttribute('data-block-index');
                    setupRepeatableBlockEventHandlers(field.name, blockIndex, field.fields);
                });
            }
        });
    }

    /**
     * Настройка обработчиков для полей repeatable блока
     * @param {String} containerName
     * @param {Number} blockIndex
     * @param {Array} fields
     */
    function setupRepeatableBlockEventHandlers(containerName, blockIndex, fields) {
        fields.forEach(function(field) {
            const fieldName = containerName + '_' + blockIndex + '_' + field.name;
            const element = document.getElementById(fieldName);
            
            if (!element) return;
            
            // Обработка зависимостей внутри блока
            if ((field.type === 'select' || field.type === 'multiselect') && field.dictionary) {
                element.addEventListener('change', function() {
                    handleRepeatableFieldDependencies(field, element.value, containerName, blockIndex, fields);
                });
            }

            // Обработка boolean полей внутри repeatable блока
            if (field.type === 'boolean') {
                element.addEventListener('change', function() {
                    handleRepeatableFieldDependencies(field, element.checked, containerName, blockIndex, fields);
                });
            }
        });
    }

    /**
     * Обработка зависимостей для полей внутри repeatable блока
     * @param {Object} changedField - Поле, которое изменилось
     * @param {String} changedValue - Новое значение
     * @param {String} containerName - Имя контейнера
     * @param {Number} blockIndex - Индекс блока
     * @param {Array} allFields - Все поля в блоке
     */
    function handleRepeatableFieldDependencies(changedField, changedValue, containerName, blockIndex, allFields) {
        // Обновляем видимость полей в блоке при изменении значения
        allFields.forEach(function(field) {
            if (field.visibleWhen && field.visibleWhen.field === (changedField.originalName || changedField.name)) {
                const fieldName = containerName + '_' + blockIndex + '_' + field.name;
                FormRenderer.updateFieldVisibility(fieldName, field, containerName, blockIndex);
            }
        });

        // Находим поля, которые зависят от изменённого поля
        const dependentFields = allFields.filter(function(field) {
            if (Array.isArray(field.dependsOn)) {
                return field.dependsOn.indexOf(changedField.originalName || changedField.name) !== -1;
            }
            return field.dependsOn === (changedField.originalName || changedField.name);
        });

        dependentFields.forEach(function(depField) {
            const depFieldName = containerName + '_' + blockIndex + '_' + depField.name;
            
            // Множественная зависимость
            if (Array.isArray(depField.dependsOn)) {
                const dependencyParams = {};
                let allFilled = true;

                depField.dependsOn.forEach(function(dependsOnFieldName) {
                    let value;
                    
                    // Проверяем, зависит ли от поля из основной формы или из того же блока
                    const blockFieldName = containerName + '_' + blockIndex + '_' + dependsOnFieldName;
                    const blockFieldElement = document.getElementById(blockFieldName);
                    
                    if (blockFieldElement) {
                        // Поле из того же блока
                        value = blockFieldElement.value;
                    } else {
                        // Поле из основной формы
                        const mainFieldElement = document.getElementById(dependsOnFieldName);
                        value = mainFieldElement ? mainFieldElement.value : '';
                    }

                    if (!value) {
                        allFilled = false;
                    }
                    dependencyParams[dependsOnFieldName] = value;
                });

                if (allFilled) {
                    DataService.loadDictionary(depField.dictionary, dependencyParams).then(function(data) {
                        if (depField.type === 'multiselect') {
                            FormRenderer.updateMultiSelectOptions(depFieldName, data);
                        } else {
                            FormRenderer.updateSelectOptions(depFieldName, data);
                        }
                    });
                } else {
                    // Очищаем с сообщением
                    const message = getDependencyMessage(depField.dependsOn);
                    if (depField.type === 'multiselect') {
                        FormRenderer.updateMultiSelectOptions(depFieldName, [], message);
                    } else {
                        FormRenderer.updateSelectOptions(depFieldName, [], message);
                    }
                }
            } else {
                // Одиночная зависимость
                if (changedValue) {
                    const dependencyParams = {};
                    dependencyParams[depField.dependsOn] = changedValue;

                    DataService.loadDictionary(depField.dictionary, dependencyParams).then(function(data) {
                        if (depField.type === 'multiselect') {
                            FormRenderer.updateMultiSelectOptions(depFieldName, data);
                        } else {
                            FormRenderer.updateSelectOptions(depFieldName, data);
                        }
                    });
                } else {
                    // Очищаем с сообщением
                    const message = getDependencyMessage(depField.dependsOn);
                    if (depField.type === 'multiselect') {
                        FormRenderer.updateMultiSelectOptions(depFieldName, [], message);
                    } else {
                        FormRenderer.updateSelectOptions(depFieldName, [], message);
                    }
                }
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
     * Получение названия поля по его имени
     * @param {String} fieldName
     * @returns {String}
     */
    function getFieldLabel(fieldName) {
        const field = FormRenderer.getFieldByName(fieldName);
        return field ? field.label : fieldName;
    }

    /**
     * Формирование сообщения о зависимостях
     * @param {Array|String} dependsOn - Зависимости поля
     * @returns {String}
     */
    function getDependencyMessage(dependsOn) {
        if (Array.isArray(dependsOn)) {
            const labels = dependsOn.map(function(fieldName) {
                return getFieldLabel(fieldName);
            });
            return 'Сначала выберите: ' + labels.join(' и ');
        } else {
            return 'Сначала выберите: ' + getFieldLabel(dependsOn);
        }
    }

    /**
     * Обновление видимости полей при изменении значения поля
     * @param {String} changedFieldName - Имя изменившегося поля
     */
    function updateFieldsVisibilityOnChange(changedFieldName) {
        // Проходим по всем полям и обновляем видимость тех, у которых есть visibleWhen
        currentFormConfig.forEach(function(field) {
            if (field.visibleWhen && field.visibleWhen.field === changedFieldName) {
                FormRenderer.updateFieldVisibility(field.name, field);
            }
        });
    }

    /**
     * Обработка зависимых полей
     * @param {String} parentFieldName
     * @param {String} parentValue
     */
    function handleDependentFields(parentFieldName, parentValue) {
        // Обновляем видимость всех полей с условием visibleWhen
        updateFieldsVisibilityOnChange(parentFieldName);

        // Находим поля, которые зависят от текущего (одиночная или множественная зависимость)
        const dependentFields = currentFormConfig.filter(function(field) {
            if (Array.isArray(field.dependsOn)) {
                // Множественная зависимость
                return field.dependsOn.indexOf(parentFieldName) !== -1;
            } else {
                // Одиночная зависимость
                return field.dependsOn === parentFieldName;
            }
        });

        dependentFields.forEach(function(field) {
            // Проверяем, все ли зависимые поля заполнены
            if (Array.isArray(field.dependsOn)) {
                // Множественная зависимость - собираем значения всех зависимых полей
                const dependencyParams = {};
                let allFilled = true;

                field.dependsOn.forEach(function(depFieldName) {
                    const depElement = document.getElementById(depFieldName);
                    const depValue = depElement ? depElement.value : '';

                    if (!depValue) {
                        allFilled = false;
                    }
                    // Формируем объект с параметрами: {fieldName: value, ...}
                    dependencyParams[depFieldName] = depValue;
                });

                if (allFilled) {
                    // Загружаем данные для зависимого справочника с объектом параметров
                    DataService.loadDictionary(field.dictionary, dependencyParams).then(function(data) {
                        if (field.type === 'multiselect') {
                            FormRenderer.updateMultiSelectOptions(field.name, data);
                        } else {
                            FormRenderer.updateSelectOptions(field.name, data);
                        }
                    });
                } else {
                    // Не все зависимые поля заполнены - очищаем с сообщением
                    const message = getDependencyMessage(field.dependsOn);
                    if (field.type === 'multiselect') {
                        FormRenderer.updateMultiSelectOptions(field.name, [], message);
                    } else {
                        FormRenderer.updateSelectOptions(field.name, [], message);
                    }
                }
            } else {
                // Одиночная зависимость
                if (parentValue) {
                    // Формируем объект с параметром: {fieldName: value}
                    const dependencyParams = {};
                    dependencyParams[field.dependsOn] = parentValue;
                    
                    // Загружаем данные для зависимого справочника
                    DataService.loadDictionary(field.dictionary, dependencyParams).then(function(data) {
                        if (field.type === 'multiselect') {
                            FormRenderer.updateMultiSelectOptions(field.name, data);
                        } else {
                            FormRenderer.updateSelectOptions(field.name, data);
                        }
                    });
                } else {
                    // Очищаем зависимое поле с сообщением
                    const message = getDependencyMessage(field.dependsOn);
                    if (field.type === 'multiselect') {
                        FormRenderer.updateMultiSelectOptions(field.name, [], message);
                    } else {
                        FormRenderer.updateSelectOptions(field.name, [], message);
                    }
                }
            }
        });

        // Обновляем зависимые поля внутри repeatable блоков
        updateDependentFieldsInRepeatableBlocks(parentFieldName, parentValue);
    }

    /**
     * Обновление зависимых полей внутри repeatable блоков
     * @param {String} parentFieldName - Имя изменённого поля из основной формы
     * @param {String} parentValue - Значение изменённого поля
     */
    function updateDependentFieldsInRepeatableBlocks(parentFieldName, parentValue) {
        currentFormConfig.forEach(function(field) {
            if (field.type === 'repeatable') {
                const blocksContainer = document.getElementById(field.name + '-blocks');
                if (!blocksContainer) return;

                const blocks = blocksContainer.querySelectorAll('.repeatable-block');
                
                blocks.forEach(function(block) {
                    const blockIndex = block.getAttribute('data-block-index');
                    
                    // Проверяем каждое поле в блоке
                    field.fields.forEach(function(blockField) {
                        // Если поле зависит от изменённого поля основной формы
                        let isDependentOnParent = false;
                        
                        if (Array.isArray(blockField.dependsOn)) {
                            isDependentOnParent = blockField.dependsOn.indexOf(parentFieldName) !== -1;
                        } else if (blockField.dependsOn === parentFieldName) {
                            isDependentOnParent = true;
                        }
                        
                        if (isDependentOnParent) {
                            const blockFieldName = field.name + '_' + blockIndex + '_' + blockField.name;
                            
                            // Множественная зависимость
                            if (Array.isArray(blockField.dependsOn)) {
                                const dependencyParams = {};
                                let allFilled = true;

                                blockField.dependsOn.forEach(function(depName) {
                                    // Проверяем сначала в основной форме
                                    const mainElement = document.getElementById(depName);
                                    let value = mainElement ? mainElement.value : '';
                                    
                                    // Затем в блоке
                                    if (!value) {
                                        const blockElement = document.getElementById(field.name + '_' + blockIndex + '_' + depName);
                                        value = blockElement ? blockElement.value : '';
                                    }

                                    if (!value) {
                                        allFilled = false;
                                    }
                                    dependencyParams[depName] = value;
                                });

                                if (allFilled) {
                                    DataService.loadDictionary(blockField.dictionary, dependencyParams).then(function(data) {
                                        if (blockField.type === 'multiselect') {
                                            FormRenderer.updateMultiSelectOptions(blockFieldName, data);
                                        } else {
                                            FormRenderer.updateSelectOptions(blockFieldName, data);
                                        }
                                    });
                                } else {
                                    // Очищаем с сообщением
                                    const message = getDependencyMessage(blockField.dependsOn);
                                    if (blockField.type === 'multiselect') {
                                        FormRenderer.updateMultiSelectOptions(blockFieldName, [], message);
                                    } else {
                                        FormRenderer.updateSelectOptions(blockFieldName, [], message);
                                    }
                                }
                            } else {
                                // Одиночная зависимость
                                if (parentValue) {
                                    const dependencyParams = {};
                                    dependencyParams[blockField.dependsOn] = parentValue;

                                    DataService.loadDictionary(blockField.dictionary, dependencyParams).then(function(data) {
                                        if (blockField.type === 'multiselect') {
                                            FormRenderer.updateMultiSelectOptions(blockFieldName, data);
                                        } else {
                                            FormRenderer.updateSelectOptions(blockFieldName, data);
                                        }
                                    });
                                } else {
                                    // Очищаем с сообщением
                                    const message = getDependencyMessage(blockField.dependsOn);
                                    if (blockField.type === 'multiselect') {
                                        FormRenderer.updateMultiSelectOptions(blockFieldName, [], message);
                                    } else {
                                        FormRenderer.updateSelectOptions(blockFieldName, [], message);
                                    }
                                }
                            }
                        }
                    });
                });
            }
        });
    }

    /**
     * Показ JSON файла
     */
    function handleShowJson() {
        // Получаем данные формы
        const formData = FormRenderer.getFormData();

        // Добавляем тип формы к данным
        formData._formType = currentFormType.id;
        formData._formName = currentFormType.name;

        // Валидация формы
        const errors = Validator.validateForm(currentFormConfig, formData);

        if (Validator.hasErrors(errors)) {
            // Отображаем ошибки
            FormRenderer.showErrors(errors);
            return;
        }

        // Очищаем ошибки
        FormRenderer.clearErrors();

        // Экспортируем данные в JSON и показываем пользователю
        const result = JsonExportService.exportToJson(currentFormType.id, formData);
        const errorMessage = document.getElementById('error-message');
        const errorMessageText = document.getElementById('error-message-text');
        
        if (result.success) {
            if (errorMessage) errorMessage.classList.add('hidden');
            JsonExportService.showJsonModal(result.json);
        } else {
            console.error('Ошибка при экспорте JSON:', result.error);
            if (errorMessageText) errorMessageText.textContent = 'Ошибка при формировании JSON: ' + result.error;
            if (errorMessage) {
                errorMessage.classList.remove('hidden');
                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
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

        // Добавляем тип формы к данным
        formData._formType = currentFormType.id;
        formData._formName = currentFormType.name;

        // Валидация формы
        const errors = Validator.validateForm(currentFormConfig, formData);

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

                    // Скрываем сообщение через 3 секунды и возвращаемся к выбору
                    setTimeout(function() {
                        successMessage.classList.add('hidden');
                        goBackToSelector();
                    }, 3000);
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

