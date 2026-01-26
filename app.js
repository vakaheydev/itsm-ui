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
                    // Не все зависимые поля заполнены - очищаем
                    if (field.type === 'multiselect') {
                        FormRenderer.updateMultiSelectOptions(field.name, []);
                    } else {
                        FormRenderer.updateSelectOptions(field.name, []);
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
                    // Очищаем зависимое поле
                    if (field.type === 'multiselect') {
                        FormRenderer.updateMultiSelectOptions(field.name, []);
                    } else {
                        FormRenderer.updateSelectOptions(field.name, []);
                    }
                }
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

