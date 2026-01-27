// Сервис для преобразования данных формы в JSON
const JsonExportService = (function() {
    'use strict';

    /**
     * Мапа хендлеров по названию формы
     * Каждый хендлер принимает данные формы и возвращает преобразованный объект
     */
    const formHandlers = {
        'incident': handleIncidentForm,
        'change': handleChangeForm,
        'service': handleServiceForm
    };

    /**
     * Хендлер для формы "Инцидент"
     * @param {Object} formData
     * @returns {Object}
     */
    function handleIncidentForm(formData) {
        return {
            type: 'incident',
            title: formData.title || '',
            description: formData.description || '',
            priority: formData.priority || '',
            category: formData.category || '',
            subcategory: formData.subcategory || '',
            affectedCI: formData.affectedCI || '',
            submittedAt: new Date().toISOString(),
            rawData: formData
        };
    }

    /**
     * Хендлер для формы "Изменение"
     * @param {Object} formData
     * @returns {Object}
     */
    function handleChangeForm(formData) {
        return {
            type: 'change',
            title: formData.title || '',
            description: formData.description || '',
            changeType: formData.changeType || '',
            priority: formData.priority || '',
            plannedStart: formData.plannedStart || '',
            plannedEnd: formData.plannedEnd || '',
            affectedSystems: formData.affectedSystems || [],
            submittedAt: new Date().toISOString(),
            rawData: formData
        };
    }

    /**
     * Хендлер для формы "Сервисный запрос"
     * @param {Object} formData
     * @returns {Object}
     */
    function handleServiceForm(formData) {
        return {
            type: 'service_request',
            title: formData.title || '',
            description: formData.description || '',
            serviceType: formData.serviceType || '',
            urgency: formData.urgency || '',
            submittedAt: new Date().toISOString(),
            rawData: formData
        };
    }

    /**
     * Преобразование данных формы в JSON
     * @param {String} formType - Тип формы
     * @param {Object} formData - Данные формы
     * @returns {Object} - Объект с результатом { success, json, error }
     */
    function exportToJson(formType, formData) {
        try {
            // Проверяем, есть ли хендлер для данного типа формы
            const handler = formHandlers[formType];

            let processedData;
            if (handler) {
                // Используем специфичный хендлер
                processedData = handler(formData);
            } else {
                // Используем данные как есть, если нет специфичного хендлера
                processedData = {
                    type: formType,
                    submittedAt: new Date().toISOString(),
                    data: formData
                };
            }

            // Преобразуем в JSON с отступами
            const jsonString = JSON.stringify(processedData, null, 2);

            return {
                success: true,
                json: jsonString,
                data: processedData
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Показ JSON в модальном окне
     * @param {String} jsonString - JSON строка
     */
    function showJsonModal(jsonString) {
        // Создаём модальное окно
        const modal = document.createElement('div');
        modal.className = 'json-modal';
        modal.innerHTML = `
            <div class="json-modal-content">
                <div class="json-modal-header">
                    <h3>Данные формы (JSON)</h3>
                    <button class="json-modal-close">&times;</button>
                </div>
                <div class="json-modal-body">
                    <pre class="json-output"><code>${escapeHtml(jsonString)}</code></pre>
                </div>
                <div class="json-modal-footer">
                    <button class="json-copy-btn">Скопировать</button>
                    <button class="json-close-btn">Закрыть</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Обработчики кнопок
        const closeBtn = modal.querySelector('.json-modal-close');
        const closeBtnFooter = modal.querySelector('.json-close-btn');
        const copyBtn = modal.querySelector('.json-copy-btn');

        function closeModal() {
            modal.remove();
        }

        closeBtn.addEventListener('click', closeModal);
        closeBtnFooter.addEventListener('click', closeModal);

        // Закрытие при клике вне модального окна
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Копирование в буфер обмена
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(jsonString).then(function() {
                // Меняем текст кнопки на "Скопировано!"
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Скопировано!';
                copyBtn.classList.add('copied');

                setTimeout(function() {
                    copyBtn.textContent = originalText;
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(function(error) {
                console.error('Ошибка при копировании:', error);
                alert('Не удалось скопировать в буфер обмена');
            });
        });
    }

    /**
     * Экранирование HTML для безопасного отображения
     * @param {String} text
     * @returns {String}
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Регистрация нового хендлера для типа формы
     * @param {String} formType
     * @param {Function} handler
     */
    function registerHandler(formType, handler) {
        formHandlers[formType] = handler;
    }

    // Публичный API
    return {
        exportToJson: exportToJson,
        showJsonModal: showJsonModal,
        registerHandler: registerHandler
    };
})();
