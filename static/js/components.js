// Componentes reutilizáveis
class UIComponents {
    // Exibir notificação toast
    static showToast(message, type = 'info', duration = 3000) {
        // Remover toast anterior se existir
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        document.body.appendChild(toast);

        // Remover após o tempo especificado
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, duration);
    }

    // Exibir loading
    static showLoading(message = 'Processando...') {
        const loading = document.getElementById('loading');
        const loadingText = loading.querySelector('p');
        
        if (loadingText) {
            loadingText.textContent = message;
        }
        
        loading.style.display = 'flex';
    }

    // Ocultar loading
    static hideLoading() {
        const loading = document.getElementById('loading');
        loading.style.display = 'none';
    }

    // Exibir modal de confirmação
    static showConfirmModal(title, message, onConfirm, onCancel = null) {
        const modal = document.getElementById('confirmModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalConfirm = document.getElementById('modalConfirm');
        const modalCancel = document.getElementById('modalCancel');
        const modalClose = modal.querySelector('.modal-close');

        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.classList.add('show');

        // Event listeners
        const handleConfirm = () => {
            modal.classList.remove('show');
            if (onConfirm) onConfirm();
            cleanup();
        };

        const handleCancel = () => {
            modal.classList.remove('show');
            if (onCancel) onCancel();
            cleanup();
        };

        const cleanup = () => {
            modalConfirm.removeEventListener('click', handleConfirm);
            modalCancel.removeEventListener('click', handleCancel);
            modalClose.removeEventListener('click', handleCancel);
            modal.removeEventListener('click', handleModalBackdrop);
        };

        const handleModalBackdrop = (e) => {
            if (e.target === modal) {
                handleCancel();
            }
        };

        modalConfirm.addEventListener('click', handleConfirm);
        modalCancel.addEventListener('click', handleCancel);
        modalClose.addEventListener('click', handleCancel);
        modal.addEventListener('click', handleModalBackdrop);

        // Fechar com ESC
        const handleKeyPress = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        document.addEventListener('keydown', handleKeyPress);
    }

    // Validar formulário
    static validateForm(formData, rules) {
        const errors = {};
        
        Object.entries(rules).forEach(([field, fieldRules]) => {
            const value = formData[field];
            const fieldErrors = [];

            // Required
            if (fieldRules.required && (!value || value.trim() === '')) {
                fieldErrors.push('Este campo é obrigatório');
            }

            // Se não há valor e não é obrigatório, pular outras validações
            if (!value && !fieldRules.required) {
                return;
            }

            // Time format
            if (fieldRules.time && !Utils.isValidTime(value)) {
                fieldErrors.push('Formato de horário inválido (HH:MM)');
            }

            // Date format
            if (fieldRules.date && !Utils.isValidDate(value)) {
                fieldErrors.push('Formato de data inválido');
            }

            // Number
            if (fieldRules.number && isNaN(parseFloat(value))) {
                fieldErrors.push('Deve ser um número válido');
            }

            // Min value
            if (fieldRules.min && parseFloat(value) < fieldRules.min) {
                fieldErrors.push(`Valor mínimo: ${fieldRules.min}`);
            }

            // Max value
            if (fieldRules.max && parseFloat(value) > fieldRules.max) {
                fieldErrors.push(`Valor máximo: ${fieldRules.max}`);
            }

            // Custom validation
            if (fieldRules.custom && typeof fieldRules.custom === 'function') {
                const customError = fieldRules.custom(value, formData);
                if (customError) {
                    fieldErrors.push(customError);
                }
            }

            if (fieldErrors.length > 0) {
                errors[field] = fieldErrors;
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // Exibir erros de validação no formulário
    static showFormErrors(errors) {
        // Limpar erros anteriores
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        });

        // Exibir novos erros
        Object.entries(errors).forEach(([field, fieldErrors]) => {
            const input = document.getElementById(field);
            if (input) {
                const formGroup = input.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.add('error');
                    
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = fieldErrors[0]; // Mostrar apenas o primeiro erro
                    formGroup.appendChild(errorDiv);
                }
            }
        });
    }

    // Limpar erros de validação
    static clearFormErrors() {
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error', 'success');
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        });
    }

    // Marcar campo como válido
    static markFieldValid(fieldId) {
        const input = document.getElementById(fieldId);
        if (input) {
            const formGroup = input.closest('.form-group');
            if (formGroup) {
                formGroup.classList.remove('error');
                formGroup.classList.add('success');
                const errorMsg = formGroup.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.remove();
                }
            }
        }
    }

    // Atualizar estatísticas na tela
    static updateStats(stats) {
        const elements = {
            totalRecords: document.getElementById('totalRecords'),
            totalHours: document.getElementById('totalHours'),
            totalExtra: document.getElementById('totalExtra'),
            totalValue: document.getElementById('totalValue'),
            presentialDays: document.getElementById('presentialDays'),
            presentialPercent: document.getElementById('presentialPercent')
        };

        if (elements.totalRecords) {
            elements.totalRecords.textContent = stats.totalRecords || '0';
        }

        if (elements.totalHours) {
            elements.totalHours.textContent = stats.totalHours || '0:00';
        }

        if (elements.totalExtra) {
            elements.totalExtra.textContent = stats.totalExtra || '0:00';
        }

        if (elements.totalValue) {
            elements.totalValue.textContent = Utils.formatCurrency(stats.totalValue || 0);
        }

        if (elements.presentialDays) {
            elements.presentialDays.textContent = stats.presentialTarget || '0/8';
        }

        if (elements.presentialPercent) {
            const percent = stats.presentialPercent || 0;
            const minPercent = stats.minPresentialPercent || 40;
            elements.presentialPercent.textContent = `${percent}%`;
            
            // Adicionar classe de status baseada no percentual
            elements.presentialPercent.parentElement.parentElement.classList.remove('stat-card--warning', 'stat-card--success');
            if (percent >= minPercent) {
                elements.presentialPercent.parentElement.parentElement.classList.add('stat-card--success');
            } else if (percent > 0) {
                elements.presentialPercent.parentElement.parentElement.classList.add('stat-card--warning');
            }
        }
    }

    // Obter classe CSS para badge de status
    static getStatusBadgeClass(status) {
        const statusClasses = {
            'pendente': 'badge-warning',
            'concluido': 'badge-success',
            'presencial': 'badge-info'
        };
        return statusClasses[status] || 'badge-secondary';
    }

    // Renderizar tabela de registros
    static renderTable(records, searchTerm = '', filterTerm = '', filterStatusTerm = '', filterUserTerm = '', filterMonthTerm = '') {
        const tbody = document.querySelector('#timesheetTable tbody');
        if (!tbody) return;

        // Filtrar registros
        const filteredRecords = records.filter(record => {
            const matchesSearch = !searchTerm || 
                Object.values(record).some(value => 
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                );

            const matchesFilter = !filterTerm || 
                record.observacao === filterTerm;

            const matchesStatusFilter = !filterStatusTerm || 
                record.status === filterStatusTerm;

            const matchesUserFilter = !filterUserTerm || 
                record.userId === filterUserTerm;

            const matchesMonthFilter = !filterMonthTerm || (() => {
                if (!record.dataEntrada) return false;
                const date = new Date(record.dataEntrada);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                return monthKey === filterMonthTerm;
            })();

            return matchesSearch && matchesFilter && matchesStatusFilter && matchesUserFilter && matchesMonthFilter;
        });

        // Ordenar por data/hora mais recente primeiro
        filteredRecords.sort((a, b) => {
            const dateA = new Date(`${a.dataEntrada}T${a.horaEntrada}`);
            const dateB = new Date(`${b.dataEntrada}T${b.horaEntrada}`);
            return dateB - dateA;
        });

        // Configurar paginação
        const recordsPerPage = 5;
        const totalRecords = filteredRecords.length;
        const totalPages = Math.ceil(totalRecords / recordsPerPage);
        
        // Obter página atual ou definir como 1
        let currentPage = window.currentTablePage || 1;
        
        // Verificar se a página atual é válida
        if (currentPage > totalPages) currentPage = 1;
        if (currentPage < 1) currentPage = 1;
        
        window.currentTablePage = currentPage;

        // Calcular registros para a página atual
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = startIndex + recordsPerPage;
        const recordsForPage = filteredRecords.slice(startIndex, endIndex);

        // Renderizar linhas
        tbody.innerHTML = recordsForPage.map(record => `
            <tr data-id="${record.id}">
                <td data-label="Data Entrada">${Utils.formatDate(record.dataEntrada)}</td>
                <td data-label="Hora Entrada">${record.horaEntrada}</td>
                <td data-label="Data Saída">${Utils.formatDate(record.dataSaida)}</td>
                <td data-label="Hora Saída">${record.horaSaida}</td>
                <td data-label="Almoço">${record.inicioAlmoco && record.fimAlmoco ? 
                    `${record.inicioAlmoco} - ${record.fimAlmoco}` : '-'}</td>
                <td data-label="Total Líquido">${record.totalLiquido}</td>
                <td data-label="Horas Extras">
                    <span class="badge ${record.horasExtras && record.horasExtras !== '00:00' ? 'badge-warning' : 'badge-secondary'}">
                        ${record.horasExtras}
                    </span>
                    ${record.modoCLT ? '<span class="badge-clt">CLT</span>' : ''}
                </td>
                <td data-label="Valor HE">
                    ${record.modoCLT && record.valorTotalCLT ? 
                        `${Utils.formatCurrency(record.valorTotalCLT)} <span class="badge-clt">Total CLT</span>` : 
                        Utils.formatCurrency(record.valorHE)
                    }
                </td>
                <td data-label="Observação">${Utils.sanitizeHtml(record.observacao || '-')}</td>
                <td data-label="SAP">
                    <span class="badge ${this.getStatusBadgeClass(record.status)}">
                        ${Utils.statusText(record.status) || ''}
                    </span>
                </td>
                <td data-label="Localização">
                    ${this.renderLocationInfo(record.locationInfo)}
                </td>
                <td data-label="Ações">
                    <button class="btn btn-danger action-btn delete-btn" data-record-id="${record.id}" title="Excluir registro">
                        🗑️
                    </button>
                    <button class="btn btn-secondary action-btn edit-btn" data-record-id="${record.id}" title="Editar registro">
                        ✏️
                    </button>
                </td>
            </tr>`).join('');

        // Mensagem se não houver registros
        if (filteredRecords.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="12" style="text-align: center; padding: 2rem; color: var(--text-secondary);">
                        ${records.length === 0 ? 
                            'Nenhum registro encontrado. Adicione seu primeiro registro!' : 
                            'Nenhum registro corresponde aos filtros aplicados.'}
                    </td>
                </tr>
            `;
        }

        // Renderizar controles de paginação
        this.renderPagination(currentPage, totalPages, totalRecords, startIndex + 1, Math.min(endIndex, totalRecords));
    }

    // Renderizar controles de paginação
    static renderPagination(currentPage, totalPages, totalRecords, startRecord, endRecord) {
        const paginationContainer = document.getElementById('paginationContainer');
        const paginationInfo = document.getElementById('paginationInfo');
        const pageNumbers = document.getElementById('pageNumbers');
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');

        if (!paginationContainer) return;

        // Ocultar paginação se não há registros ou apenas uma página
        if (totalRecords === 0 || totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        // Mostrar container de paginação
        paginationContainer.style.display = 'flex';

        // Atualizar informações
        paginationInfo.textContent = `Mostrando ${startRecord}-${endRecord} de ${totalRecords} registros`;

        // Configurar botões anterior/próxima
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;

        // Gerar números das páginas
        pageNumbers.innerHTML = this.generatePageNumbers(currentPage, totalPages);

        // Configurar event listeners
        this.setupPaginationEvents();
    }

    // Gerar números das páginas
    static generatePageNumbers(currentPage, totalPages) {
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Ajustar se não temos páginas suficientes no final
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        let pagesHtml = '';

        // Primeira página + reticências se necessário
        if (startPage > 1) {
            pagesHtml += `<div class="page-number" data-page="1">1</div>`;
            if (startPage > 2) {
                pagesHtml += `<div class="page-ellipsis">...</div>`;
            }
        }

        // Páginas visíveis
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === currentPage ? 'active' : '';
            pagesHtml += `<div class="page-number ${activeClass}" data-page="${i}">${i}</div>`;
        }

        // Reticências + última página se necessário
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pagesHtml += `<div class="page-ellipsis">...</div>`;
            }
            pagesHtml += `<div class="page-number" data-page="${totalPages}">${totalPages}</div>`;
        }

        return pagesHtml;
    }

    // Configurar event listeners da paginação
    static setupPaginationEvents() {
        const prevPageBtn = document.getElementById('prevPageBtn');
        const nextPageBtn = document.getElementById('nextPageBtn');
        const pageNumbers = document.getElementById('pageNumbers');

        // Remover listeners anteriores
        prevPageBtn.replaceWith(prevPageBtn.cloneNode(true));
        nextPageBtn.replaceWith(nextPageBtn.cloneNode(true));

        // Obter referências atualizadas
        const newPrevBtn = document.getElementById('prevPageBtn');
        const newNextBtn = document.getElementById('nextPageBtn');

        // Botão anterior
        newPrevBtn.addEventListener('click', () => {
            if (window.currentTablePage > 1) {
                window.currentTablePage--;
                if (window.app) {
                    window.app.updateTable();
                }
            }
        });

        // Botão próxima
        newNextBtn.addEventListener('click', () => {
            // Calcular total de páginas baseado nos registros filtrados
            const searchTerm = document.getElementById('searchInput').value;
            const filterTerm = document.getElementById('filterSelect').value;
            const filterStatusTerm = document.getElementById('filterSelectStatus').value;
            const filterUserTerm = document.getElementById('filterSelectUser').value;
            const filterMonthTerm = document.getElementById('filterSelectMonth').value;
            
            let filteredRecords = window.app.records;
            if (searchTerm || filterTerm || filterStatusTerm || filterUserTerm || filterMonthTerm) {
                filteredRecords = window.app.records.filter(record => {
                    const matchesSearch = !searchTerm || 
                        Object.values(record).some(value => 
                            String(value).toLowerCase().includes(searchTerm.toLowerCase())
                        );

                    const matchesFilter = !filterTerm || 
                        record.observacao === filterTerm;

                    const matchesStatusFilter = !filterStatusTerm || 
                        record.status === filterStatusTerm;

                    const matchesUserFilter = !filterUserTerm || 
                        record.userId === filterUserTerm;

                    const matchesMonthFilter = !filterMonthTerm || (() => {
                        if (!record.dataEntrada) return false;
                        const date = new Date(record.dataEntrada);
                        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                        return monthKey === filterMonthTerm;
                    })();

                    return matchesSearch && matchesFilter && matchesStatusFilter && matchesUserFilter && matchesMonthFilter;
                });
            }
            
            const totalPages = Math.ceil(filteredRecords.length / 5);
            if (window.currentTablePage < totalPages) {
                window.currentTablePage++;
                if (window.app) {
                    window.app.updateTable();
                }
            }
        });

        // Números das páginas
        pageNumbers.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-number') && !e.target.classList.contains('active')) {
                const page = parseInt(e.target.dataset.page);
                if (page) {
                    window.currentTablePage = page;
                    if (window.app) {
                        window.app.updateTable();
                    }
                }
            }
        });
    }

    // Animar elemento
    static animateElement(element, animationClass, duration = 500) {
        element.classList.add(animationClass);
        setTimeout(() => {
            element.classList.remove(animationClass);
        }, duration);
    }

    // Scroll suave para elemento
    static scrollToElement(elementId, offset = 0) {
        const element = document.getElementById(elementId);
        if (element) {
            const elementPosition = element.offsetTop - offset;
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    // Exportar dados para download
    static downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // Configurar data de hoje nos campos de data
    static setTodayDate() {
        const today = new Date().toISOString().split('T')[0];
        const dataEntrada = document.getElementById('dataEntrada');
        const dataSaida = document.getElementById('dataSaida');
        
        if (dataEntrada && !dataEntrada.value) {
            dataEntrada.value = today;
        }
        
        if (dataSaida && !dataSaida.value) {
            dataSaida.value = today;
        }
    }

    // Preenchimento rápido de dados
    static async quickFill() {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Mostrar loading enquanto detecta a rede e localização
        UIComponents.showToast('Detectando rede e localização...', 'info', 3000);
        
        try {
            // Detectar informações completas de localização
            const completeInfo = await Utils.getCompleteLocationInfo();
            
            // Horário comercial padrão
            document.getElementById('dataEntrada').value = today;
            document.getElementById('horaEntrada').value = '08:30';
            document.getElementById('dataSaida').value = today;
            document.getElementById('horaSaida').value = '17:30';
            document.getElementById('inicioAlmoco').value = '12:00';
            document.getElementById('fimAlmoco').value = '13:00';
            
            // Definir observação e status baseado na análise completa
            const observacaoSelect = document.getElementById('observacao');
            const statusSelect = document.getElementById('status');
            
            if (completeInfo.analysis.recommendation === 'presencial') {
                observacaoSelect.value = 'Horário Comercial';
                statusSelect.value = 'presencial';
            } else {
                observacaoSelect.value = 'Home Office';
                statusSelect.value = 'pendente';
            }
            
            // Armazenar informações de localização no formulário (para uso posterior)
            UIComponents.storeLocationData(completeInfo);
            
            // Criar mensagem detalhada
            let message = `${completeInfo.analysis.details.join('. ')} (Confiança: ${completeInfo.confidence})`;
            
            if (completeInfo.location.success) {
                message += ` | Local: ${completeInfo.location.address}`;
            }
            
            // Mostrar mensagem com o resultado da detecção
            UIComponents.showToast(message, 'success', 6000);
            
        } catch (error) {
            console.warn('Erro na detecção completa:', error);
            
            // Fallback para home office em caso de erro
            document.getElementById('dataEntrada').value = today;
            document.getElementById('horaEntrada').value = '08:30';
            document.getElementById('dataSaida').value = today;
            document.getElementById('horaSaida').value = '17:30';
            document.getElementById('inicioAlmoco').value = '12:00';
            document.getElementById('fimAlmoco').value = '13:00';
            document.getElementById('observacao').value = 'Home Office';
            document.getElementById('status').value = 'pendente';
            
            UIComponents.showToast('Erro na detecção - Usando padrão Home Office', 'warning', 3000);
        }
    }

    // Debounce para search
    static createDebouncedSearch(callback, delay = 300) {
        return Utils.debounce(callback, delay);
    }

    // Configurar event listeners para botões da tabela
    static setupTableEventListeners() {
        const tbody = document.querySelector('#timesheetTable tbody');
        if (!tbody) return;

        // Remover listeners existentes (se houver)
        tbody.removeEventListener('click', this.handleTableClick);
        
        // Adicionar event listener com delegation
        tbody.addEventListener('click', this.handleTableClick.bind(this));
    }

    // Handler para cliques na tabela
    static handleTableClick(event) {
        const target = event.target;
        
        // Verificar se clicou em um botão de ação
        if (target.classList.contains('delete-btn')) {
            event.preventDefault();
            const recordId = target.getAttribute('data-record-id');
            if (recordId && window.app) {
                window.app.removeRecord(recordId);
            }
        } else if (target.classList.contains('edit-btn')) {
            event.preventDefault();
            const recordId = target.getAttribute('data-record-id');
            if (recordId && window.app) {
                window.app.editRecord(recordId);
            }
        }
    }

    // Armazenar dados de localização temporariamente
    static storeLocationData(locationInfo) {
        // Armazenar no formulário como dados ocultos para uso no salvamento
        const form = document.getElementById('timesheetForm');
        
        // Remover dados anteriores se existirem
        const existingLocationData = form.querySelector('.location-data');
        if (existingLocationData) {
            existingLocationData.remove();
        }
        
        // Criar elemento oculto com os dados de localização
        const locationDataElement = document.createElement('div');
        locationDataElement.className = 'location-data';
        locationDataElement.style.display = 'none';
        locationDataElement.setAttribute('data-location-info', JSON.stringify(locationInfo));
        
        form.appendChild(locationDataElement);
    }

    // Recuperar dados de localização armazenados
    static getStoredLocationData() {
        const form = document.getElementById('timesheetForm');
        const locationDataElement = form.querySelector('.location-data');
        
        if (locationDataElement) {
            try {
                return JSON.parse(locationDataElement.getAttribute('data-location-info'));
            } catch (error) {
                console.warn('Erro ao recuperar dados de localização:', error);
                return null;
            }
        }
        
        return null;
    }

    // Limpar dados de localização armazenados
    static clearStoredLocationData() {
        const form = document.getElementById('timesheetForm');
        const locationDataElement = form.querySelector('.location-data');
        
        if (locationDataElement) {
            locationDataElement.remove();
        }
    }

    // Renderizar informações de localização para a tabela
    static renderLocationInfo(locationInfo) {
        if (!locationInfo) {
            return '<span class="badge badge-secondary" title="Sem informações de localização">-</span>';
        }

        const confidence = locationInfo.confidence || 'não-verificada';
        const analysis = locationInfo.analysis || {};
        const location = locationInfo.location || {};
        const network = locationInfo.network || {};

        let html = '';
        let title = '';
        let badgeClass = '';

        // Determinar classe do badge baseado na confiança
        switch (confidence) {
            case 'alta':
                badgeClass = 'badge-success';
                break;
            case 'média':
                badgeClass = 'badge-warning';
                break;
            case 'baixa':
                badgeClass = 'badge-secondary';
                break;
            default:
                badgeClass = 'badge-secondary';
        }

        // Texto principal do badge
        if (analysis.recommendation === 'presencial') {
            html = `<span class="badge ${badgeClass}" title="">🏢 Presencial</span>`;
        } else {
            html = `<span class="badge ${badgeClass}" title="">🏠 Home Office</span>`;
        }

        // Construir título com detalhes
        title += `Confiança: ${confidence}`;
        
        if (network.type) {
            title += `\nRede: ${network.type}`;
            if (network.ip) {
                title += ` (${network.ip})`;
            }
        }

        if (location.success && location.address) {
            title += `\nLocal: ${location.address}`;
            if (location.accuracy) {
                title += `\nPrecisão: ${location.accuracy}m`;
            }
        }

        if (analysis.details && analysis.details.length > 0) {
            title += `\nDetalhes: ${analysis.details.join('. ')}`;
        }

        // Adicionar título ao badge
        html = html.replace('title=""', `title="${title}"`);

        // Adicionar indicadores adicionais
        if (location.success) {
            html += ` <span class="location-indicator" title="Localização GPS verificada">📍</span>`;
        }

        if (network.type === 'wired') {
            html += ` <span class="network-indicator" title="Conexão cabeada">🔌</span>`;
        } else if (network.type === 'wifi') {
            html += ` <span class="network-indicator" title="Conexão WiFi">📶</span>`;
        }

        return html;
    }
}

// Exportar para uso global
window.UIComponents = UIComponents;
