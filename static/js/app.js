// Aplicação principal
class TimesheetApp {
    constructor() {
        this.userManager = new UserManager();
        this.storage = new StorageManager();
        this.calculator = new TimesheetCalculator();
        this.currentEditId = null;
        this.records = [];
        
        this.init();
    }

    // Inicializar aplicação
    init() {
        // Verificar autenticação primeiro
        if (!this.userManager.checkAuth()) {
            return;
        }

        // Inicializar paginação
        window.currentTablePage = 1;

        this.loadRecords();
        this.bindEvents();
        this.updateUI();
        this.setupUserInterface();
        UIComponents.setTodayDate();
        
        // Inicializar sistema de lembrete de backup
        if (window.BackupReminder) {
            const backupReminder = new BackupReminder();
            backupReminder.init();
        }
        
        console.log('🚀 TimesheetPro inicializado com sucesso!');
    }

    // Configurar interface do usuário
    setupUserInterface() {
        this.userManager.renderUserInfo();
        this.setupUserFilters();
        this.setupMonthFilter();
    }

    // Configurar filtros de usuário
    setupUserFilters() {
        const filterSelectUser = document.getElementById('filterSelectUser');
        if (!filterSelectUser) return;

        const users = this.userManager.getAllUsers();
        const currentUser = this.userManager.getCurrentUser();
        
        // Limpar opções existentes (exceto a primeira)
        while (filterSelectUser.children.length > 1) {
            filterSelectUser.removeChild(filterSelectUser.lastChild);
        }

        // Adicionar opção "Apenas meus registros" como padrão
        const myRecordsOption = document.createElement('option');
        myRecordsOption.value = currentUser.id;
        myRecordsOption.textContent = 'Apenas meus registros';
        myRecordsOption.selected = true;
        filterSelectUser.appendChild(myRecordsOption);

        // Adicionar outros usuários
        users.forEach(user => {
            if (user.id !== currentUser.id) {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} (${user.department})`;
                filterSelectUser.appendChild(option);
            }
        });
    }

    // Configurar filtro de meses
    setupMonthFilter() {
        const filterSelectMonth = document.getElementById('filterSelectMonth');
        if (!filterSelectMonth) return;

        // Limpar opções existentes (exceto a primeira)
        while (filterSelectMonth.children.length > 1) {
            filterSelectMonth.removeChild(filterSelectMonth.lastChild);
        }

        // Obter meses únicos dos registros
        const months = new Set();
        this.records.forEach(record => {
            if (record.dataEntrada) {
                const date = new Date(record.dataEntrada);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const monthLabel = date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
                months.add(JSON.stringify({ key: monthKey, label: monthLabel }));
            }
        });

        // Converter Set para array e ordenar
        const monthsArray = Array.from(months)
            .map(item => JSON.parse(item))
            .sort((a, b) => b.key.localeCompare(a.key)); // Mais recente primeiro

        // Adicionar opções ao select
        monthsArray.forEach(month => {
            const option = document.createElement('option');
            option.value = month.key;
            option.textContent = month.label.charAt(0).toUpperCase() + month.label.slice(1);
            filterSelectMonth.appendChild(option);
        });
    }

    // Carregar registros do localStorage
    loadRecords() {
        this.records = this.storage.load();
        console.log(`📊 ${this.records.length} registros carregados`);
    }

    // Salvar registros no localStorage
    saveRecords() {
        const saved = this.storage.save(this.records);
        if (saved) {
            UIComponents.showToast('Dados salvos automaticamente!', 'success', 2000);
        }
        return saved;
    }

    // Vincular eventos
    bindEvents() {
        // Formulário
        const form = document.getElementById('timesheetForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Botão calcular
        const calculateBtn = document.getElementById('calculateBtn');
        calculateBtn.addEventListener('click', () => this.calculateTimesheet());

        // Botão preenchimento rápido
        const quickFillBtn = document.getElementById('quickFillBtn');
        quickFillBtn.addEventListener('click', () => UIComponents.quickFill());

        // Botão detectar localização
        const detectLocationBtn = document.getElementById('detectLocationBtn');
        detectLocationBtn.addEventListener('click', () => this.detectLocationManually());

        // Botão exportar CSV
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.addEventListener('click', () => this.exportToCSV());

        // Botão limpar dados
        const clearDataBtn = document.getElementById('clearDataBtn');
        clearDataBtn.addEventListener('click', () => this.clearAllData());

        // Search e filtros
        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('filterSelect');
        const filterSelectStatus = document.getElementById('filterSelectStatus');
        const filterSelectUser = document.getElementById('filterSelectUser');
        const filterSelectMonth = document.getElementById('filterSelectMonth');
        
        const debouncedSearch = UIComponents.createDebouncedSearch(() => {
            this.updateTable();
        });

        searchInput.addEventListener('input', debouncedSearch);
        filterSelect.addEventListener('change', () => this.updateTable());
        filterSelectStatus.addEventListener('change', () => this.updateTable());
        filterSelectUser.addEventListener('change', () => this.updateTable());
        filterSelectMonth.addEventListener('change', () => this.updateTable());

        // Auto-completar data de saída quando entrada for preenchida
        const dataEntrada = document.getElementById('dataEntrada');
        dataEntrada.addEventListener('change', (e) => {
            const dataSaida = document.getElementById('dataSaida');
            if (!dataSaida.value) {
                dataSaida.value = e.target.value;
            }
        });

        // Evento para checkbox CLT
        const modoCLT = document.getElementById('modoCLT');
        if (modoCLT) {
            modoCLT.addEventListener('change', (e) => {
                this.toggleCLTMode(e.target.checked);
            });
        }

        // Validação em tempo real
        this.setupRealTimeValidation();
    }

    // Configurar validação em tempo real
    setupRealTimeValidation() {
        const fields = ['dataEntrada', 'horaEntrada', 'dataSaida', 'horaSaida', 'inicioAlmoco', 'fimAlmoco'];
        
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('blur', () => {
                    this.validateField(fieldId);
                });
                
                field.addEventListener('input', () => {
                    // Limpar erro quando começar a digitar
                    const formGroup = field.closest('.form-group');
                    if (formGroup && formGroup.classList.contains('error')) {
                        UIComponents.clearFormErrors();
                    }
                });
            }
        });
    }

    // Validar campo individual
    validateField(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const value = field.value;
        
        if (fieldId.includes('data') && value) {
            if (Utils.isValidDate(value)) {
                UIComponents.markFieldValid(fieldId);
            }
        }
        
        if (fieldId.includes('hora') || fieldId.includes('Almoco')) {
            if (value && Utils.isValidTime(value)) {
                UIComponents.markFieldValid(fieldId);
            }
        }
    }

    // Manipular envio do formulário
    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = this.getFormData();
        const validation = this.validateFormData(formData);
        
        if (!validation.isValid) {
            UIComponents.showFormErrors(validation.errors);
            UIComponents.showToast('Por favor, corrija os erros no formulário', 'error');
            return;
        }

        UIComponents.clearFormErrors();
        
        const modoCLT = document.getElementById('modoCLT').checked;
        let calculation;
        let cltData = {};
        
        if (modoCLT && window.CLTCalculator) {
            // Usar calculadora CLT
            const cltCalculator = new CLTCalculator();
            const isDomingoFeriado = this.isDomingoOuFeriado(formData.dataEntrada);
            
            const cltResult = cltCalculator.calcularValorTotal({
                entrada: formData.horaEntrada,
                saida: formData.horaSaida,
                inicioAlmoco: formData.inicioAlmoco,
                fimAlmoco: formData.fimAlmoco,
                salarioHora: parseFloat(formData.valorHora) || 0,
                isDomingoFeriado
            });
            
            if (cltResult.erro) {
                UIComponents.showToast(cltResult.mensagem, 'error');
                return;
            }
            
            // Mapear resultados CLT para formato compatível
            calculation = {
                totalBruto: '-',
                tempoAlmoco: '-',
                totalLiquido: cltResult.totalHoras,
                horasExtras: cltResult.horasExtras,
                valorHE: cltResult.valorHorasExtras,
                isValid: true
            };
            
            // Dados específicos CLT
            cltData = {
                modoCLT: true,
                horasNoturnas: cltResult.horasNoturnas,
                valorAdicionalNoturno: cltResult.valorAdicionalNoturno,
                valorTotalCLT: cltResult.valorTotal,
                percentualHE: cltResult.percentualHE,
                percentualNoturno: cltResult.percentualNoturno,
                isDomingoFeriado,
                validacoesCLT: cltResult.validacoes
            };
        } else {
            // Usar calculadora padrão
            calculation = this.calculator.calculateAll(formData);
            
            if (!calculation.isValid) {
                UIComponents.showToast('Erro nos cálculos. Verifique os dados informados', 'error');
                return;
            }
        }

        // Obter dados de localização armazenados
        const locationData = UIComponents.getStoredLocationData() || {};

        const record = {
            ...formData,
            ...calculation,
            ...cltData,
            id: this.currentEditId || Utils.generateId(),
            userId: this.userManager.getCurrentUser().id,
            userName: this.userManager.getCurrentUser().name,
            userDepartment: this.userManager.getCurrentUser().department,
            createdAt: new Date().toISOString(),
            // Dados de localização e rede
            locationInfo: {
                network: locationData.network || null,
                location: locationData.location || null,
                analysis: locationData.analysis || null,
                confidence: locationData.confidence || 'não-verificada',
                timestamp: locationData.timestamp || new Date().toISOString()
            }
        };

        if (this.currentEditId) {
            this.updateRecord(record);
        } else {
            this.addRecord(record);
        }
    }

    // Obter dados do formulário
    getFormData() {
        return {
            dataEntrada: document.getElementById('dataEntrada').value,
            horaEntrada: document.getElementById('horaEntrada').value,
            dataSaida: document.getElementById('dataSaida').value,
            horaSaida: document.getElementById('horaSaida').value,
            inicioAlmoco: document.getElementById('inicioAlmoco').value,
            fimAlmoco: document.getElementById('fimAlmoco').value,
            horasNormais: document.getElementById('horasNormais').value || '08:00',
            valorHora: document.getElementById('valorHora').value || '0',
            observacao: document.getElementById('observacao').value,
            status: document.getElementById('status').value
        };
    }

    // Validar dados do formulário
    validateFormData(formData) {
        const rules = {
            dataEntrada: { required: true, date: true },
            horaEntrada: { required: true, time: true },
            dataSaida: { required: true, date: true },
            horaSaida: { required: true, time: true },
            inicioAlmoco: { time: true },
            fimAlmoco: { time: true },
            horasNormais: { required: true, time: true },
            valorHora: { number: true, min: 0 },
            observacao: {},
            status: { required: true }
        };

        return UIComponents.validateForm(formData, rules);
    }

    // Alternar modo CLT
    toggleCLTMode(isEnabled) {
        const helpText = document.querySelector('.help-text');
        
        if (isEnabled) {
            if (helpText) {
                helpText.innerHTML = '✅ <strong>Modo CLT ativo:</strong> Cálculos conforme legislação trabalhista (adicional noturno 20%, limite HE 2h/dia)';
                helpText.style.color = 'var(--success-color)';
            }
            
            UIComponents.showToast('Modo CLT ativado - Legislação trabalhista aplicada', 'success', 3000);
        } else {
            if (helpText) {
                helpText.innerHTML = 'Ativa cálculos conforme legislação trabalhista (adicional noturno 20%, limite HE 2h/dia)';
                helpText.style.color = 'var(--text-secondary)';
            }
            
            // Ocultar resultados CLT se estiverem visíveis
            this.hideCLTResults();
        }
    }

    // Calcular timesheet sem salvar
    calculateTimesheet() {
        const formData = this.getFormData();
        const validation = this.validateFormData(formData);
        
        if (!validation.isValid) {
            UIComponents.showFormErrors(validation.errors);
            UIComponents.showToast('Corrija os erros antes de calcular', 'error');
            return;
        }

        UIComponents.clearFormErrors();
        UIComponents.showLoading('Calculando...');

        setTimeout(() => {
            const modoCLT = document.getElementById('modoCLT').checked;
            let calculation;
            
            if (modoCLT && window.CLTCalculator) {
                // Usar calculadora CLT
                const cltCalculator = new CLTCalculator();
                const isDomingoFeriado = this.isDomingoOuFeriado(formData.dataEntrada);
                
                calculation = cltCalculator.calcularValorTotal({
                    entrada: formData.horaEntrada,
                    saida: formData.horaSaida,
                    inicioAlmoco: formData.inicioAlmoco,
                    fimAlmoco: formData.fimAlmoco,
                    salarioHora: parseFloat(formData.valorHora) || 0,
                    isDomingoFeriado
                });
                
                if (calculation.erro) {
                    UIComponents.showToast(calculation.mensagem, 'error');
                    UIComponents.hideLoading();
                    return;
                }
                
                this.displayCLTResults(calculation);
            } else {
                // Usar calculadora padrão
                calculation = this.calculator.calculateAll(formData);
                
                if (calculation.isValid) {
                    this.displayCalculationResults(calculation);
                } else {
                    UIComponents.showToast('Erro nos cálculos. Verifique os dados', 'error');
                    UIComponents.hideLoading();
                    return;
                }
            }
            
            UIComponents.showToast('Cálculo realizado com sucesso!', 'success');
            UIComponents.hideLoading();
        }, 500);
    }

    // Detectar localização manualmente usando métodos alternativos
    async detectLocationManually() {
        UIComponents.showLoading('Detectando localização completa...');
        
        try {
            // Usar detecção completa de localização
            const completeInfo = await Utils.getCompleteLocationInfo();
            
            // Atualizar campos do formulário baseado na análise
            const observacaoSelect = document.getElementById('observacao');
            const statusSelect = document.getElementById('status');
            
            if (completeInfo.analysis.recommendation === 'presencial') {
                observacaoSelect.value = 'Horário Comercial';
                statusSelect.value = 'presencial';
            } else {
                observacaoSelect.value = 'Home Office';
                statusSelect.value = 'pendente';
            }
            
            // Armazenar informações de localização
            UIComponents.storeLocationData(completeInfo);
            
            // Criar mensagem detalhada
            let detailedMessage = `${completeInfo.analysis.details.join('. ')}`;
            detailedMessage += `\nConfiança: ${completeInfo.confidence}`;
            
            if (completeInfo.network.ip) {
                detailedMessage += `\nIP: ${completeInfo.network.ip}`;
            }
            
            if (completeInfo.location.success) {
                detailedMessage += `\nLocal: ${completeInfo.location.address}`;
                detailedMessage += `\nPrecisão: ${completeInfo.location.accuracy}m`;
            } else {
                detailedMessage += `\nLocalização: ${completeInfo.location.error}`;
            }
            
            UIComponents.showToast(detailedMessage, 'success', 8000);
            
        } catch (error) {
            console.error('Erro na detecção manual completa:', error);
            UIComponents.showToast('Erro na detecção de localização completa', 'error');
        } finally {
            UIComponents.hideLoading();
        }
    }

    // Exibir resultados do cálculo
    displayCalculationResults(calculation) {
        const resultsSection = document.getElementById('resultsSection');
        
        document.getElementById('resultTotalBruto').textContent = calculation.totalBruto;
        document.getElementById('resultTempoAlmoco').textContent = calculation.tempoAlmoco;
        document.getElementById('resultTotalLiquido').textContent = calculation.totalLiquido;
        document.getElementById('resultHorasExtras').textContent = calculation.horasExtras;
        document.getElementById('resultValorHE').textContent = Utils.formatCurrency(calculation.valorHE);
        
        // Ocultar campos CLT
        this.hideCLTResults();
        
        resultsSection.style.display = 'block';
        resultsSection.classList.add('fade-in');
        
        UIComponents.scrollToElement('resultsSection', 100);
    }

    // Exibir resultados do cálculo CLT
    displayCLTResults(calculation) {
        const resultsSection = document.getElementById('resultsSection');
        
        // Preencher campos básicos
        document.getElementById('resultTotalBruto').textContent = '-';
        document.getElementById('resultTempoAlmoco').textContent = '-';
        document.getElementById('resultTotalLiquido').textContent = calculation.totalHoras;
        document.getElementById('resultHorasExtras').textContent = calculation.horasExtras;
        document.getElementById('resultValorHE').textContent = Utils.formatCurrency(calculation.valorHorasExtras);
        
        // Preencher campos CLT específicos
        document.getElementById('resultHorasNoturnas').textContent = calculation.horasNoturnas || '00:00';
        document.getElementById('resultAdicionalNoturno').textContent = Utils.formatCurrency(calculation.valorAdicionalNoturno);
        document.getElementById('resultValorTotalCLT').textContent = Utils.formatCurrency(calculation.valorTotal);
        
        // Status CLT
        const statusElement = document.getElementById('resultStatusCLT');
        if (calculation.validacoes && calculation.validacoes.conforme) {
            statusElement.textContent = '✅ Conforme CLT';
            statusElement.className = 'status-clt-conforme';
        } else {
            statusElement.textContent = '⚠️ Com Avisos';
            statusElement.className = 'status-clt-aviso';
        }
        
        // Mostrar campos CLT
        this.showCLTResults();
        
        // Exibir avisos se houver
        this.displayCLTWarnings(calculation.validacoes);
        
        resultsSection.style.display = 'block';
        resultsSection.classList.add('fade-in');
        
        UIComponents.scrollToElement('resultsSection', 100);
    }

    // Mostrar campos específicos CLT
    showCLTResults() {
        const cltResults = document.querySelectorAll('.clt-result');
        cltResults.forEach(element => {
            element.style.display = 'flex';
        });
    }

    // Ocultar campos específicos CLT
    hideCLTResults() {
        const cltResults = document.querySelectorAll('.clt-result');
        cltResults.forEach(element => {
            element.style.display = 'none';
        });
        
        // Ocultar avisos também
        const warningsSection = document.getElementById('cltWarnings');
        if (warningsSection) {
            warningsSection.style.display = 'none';
        }
    }

    // Exibir avisos CLT
    displayCLTWarnings(validacoes) {
        const warningsSection = document.getElementById('cltWarnings');
        const warningsList = document.getElementById('cltWarningsList');
        
        if (!validacoes || (!validacoes.avisos.length && !validacoes.erros.length)) {
            warningsSection.style.display = 'none';
            return;
        }
        
        // Limpar lista anterior
        warningsList.innerHTML = '';
        
        // Adicionar erros
        validacoes.erros.forEach(erro => {
            const li = document.createElement('li');
            li.innerHTML = `❌ <strong>Erro:</strong> ${erro}`;
            li.style.color = 'var(--danger-color)';
            warningsList.appendChild(li);
        });
        
        // Adicionar avisos
        validacoes.avisos.forEach(aviso => {
            const li = document.createElement('li');
            li.innerHTML = `⚠️ <strong>Aviso:</strong> ${aviso}`;
            li.style.color = '#d97706';
            warningsList.appendChild(li);
        });
        
        warningsSection.style.display = 'block';
    }

    // Verificar se é domingo ou feriado
    isDomingoOuFeriado(data) {
        const dataObj = new Date(data);
        const isDomingo = dataObj.getDay() === 0;
        
        // Lista básica de feriados nacionais (pode ser expandida)
        const feriados = [
            '2025-01-01', // Confraternização Universal
            '2025-04-21', // Tiradentes
            '2025-05-01', // Dia do Trabalhador
            '2025-09-07', // Independência do Brasil
            '2025-10-12', // Nossa Senhora Aparecida
            '2025-11-02', // Finados
            '2025-11-15', // Proclamação da República
            '2025-12-25'  // Natal
        ];
        
        const dataFormatada = dataObj.toISOString().split('T')[0];
        const isFeriado = feriados.includes(dataFormatada);
        
        return isDomingo || isFeriado;
    }

    // Adicionar novo registro
    addRecord(record) {
        this.records.push(record);
        this.saveRecords();
        this.updateUI();
        this.clearForm();
        
        UIComponents.showToast('Registro adicionado com sucesso!', 'success');
        UIComponents.scrollToElement('timesheetTable', 100);
    }

    // Atualizar registro existente
    updateRecord(record) {
        const index = this.records.findIndex(r => r.id === record.id);
        if (index !== -1) {
            this.records[index] = record;
            this.saveRecords();
            this.updateUI();
            this.clearForm();
            
            UIComponents.showToast('Registro atualizado com sucesso!', 'success');
        }
    }

    // Remover registro
    removeRecord(id) {
        const record = this.records.find(r => r.id === id);
        if (!record) return;

        UIComponents.showConfirmModal(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir o registro do dia ${Utils.formatDate(record.dataEntrada)}?`,
            () => {
                this.records = this.records.filter(r => r.id !== id);
                this.saveRecords();
                this.updateUI();
                UIComponents.showToast('Registro removido com sucesso!', 'success');
            }
        );
    }

    // Editar registro
    editRecord(id) {
        const record = this.records.find(r => r.id === id);
        if (!record) return;

        this.currentEditId = id;
        this.populateForm(record);
        
        // Calcular e mostrar resultados
        const calculation = this.calculator.calculateAll(record);
        this.displayCalculationResults(calculation);
        
        UIComponents.scrollToElement('timesheetForm', 100);
        UIComponents.showToast('Registro carregado para edição', 'info');
    }

    // Preencher formulário com dados do registro
    populateForm(record) {
        document.getElementById('dataEntrada').value = record.dataEntrada || '';
        document.getElementById('horaEntrada').value = record.horaEntrada || '';
        document.getElementById('dataSaida').value = record.dataSaida || '';
        document.getElementById('horaSaida').value = record.horaSaida || '';
        document.getElementById('inicioAlmoco').value = record.inicioAlmoco || '';
        document.getElementById('fimAlmoco').value = record.fimAlmoco || '';
        document.getElementById('horasNormais').value = record.horasNormais || '08:00';
        document.getElementById('valorHora').value = record.valorHora || '';
        document.getElementById('observacao').value = record.observacao || '';
        document.getElementById('status').value = record.status || '';
    }

    // Limpar formulário
    clearForm() {
        document.getElementById('timesheetForm').reset();
        document.getElementById('resultsSection').style.display = 'none';
        this.currentEditId = null;
        UIComponents.clearFormErrors();
        UIComponents.clearStoredLocationData(); // Limpar dados de localização
        UIComponents.setTodayDate();
    }

    // Atualizar interface
    updateUI() {
        this.setupMonthFilter(); // Atualizar filtro de meses
        this.updateStats();
        this.updateTable();
    }

    // Atualizar estatísticas
    updateStats() {
        const currentUser = this.userManager.getCurrentUser();
        const stats = this.storage.getStats(currentUser.id);
        UIComponents.updateStats(stats);
    }

    // Atualizar tabela
    updateTable() {
        const searchTerm = document.getElementById('searchInput').value;
        const filterTerm = document.getElementById('filterSelect').value;
        const filterStatusTerm = document.getElementById('filterSelectStatus').value;
        const filterUserTerm = document.getElementById('filterSelectUser').value;
        const filterMonthTerm = document.getElementById('filterSelectMonth').value;
        
        // Filtrar registros para calcular total após filtros
        const filteredRecords = this.records.filter(record => {
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

        // Verificar se a página atual ainda é válida
        const recordsPerPage = 5;
        const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
        if (window.currentTablePage > totalPages && totalPages > 0) {
            window.currentTablePage = 1;
        }
        
        UIComponents.renderTable(this.records, searchTerm, filterTerm, filterStatusTerm, filterUserTerm, filterMonthTerm);
        // Configurar event listeners após renderizar a tabela
        UIComponents.setupTableEventListeners();
    }

    // Exportar para CSV
    exportToCSV() {
        try {
            if (this.records.length === 0) {
                UIComponents.showToast('Nenhum registro para exportar', 'warning');
                return;
            }

            UIComponents.showLoading('Gerando arquivo CSV...');

            setTimeout(() => {
                const csvContent = this.storage.exportToCSV();
                const filename = `timesheet-${new Date().toISOString().split('T')[0]}.csv`;
                
                UIComponents.downloadFile(csvContent, filename, 'text/csv;charset=utf-8;');
                UIComponents.showToast('Arquivo CSV exportado com sucesso!', 'success');
                UIComponents.hideLoading();
            }, 1000);

        } catch (error) {
            console.error('Erro na exportação:', error);
            UIComponents.showToast('Erro ao exportar arquivo CSV', 'error');
            UIComponents.hideLoading();
        }
    }

    // Limpar todos os dados
    clearAllData() {
        UIComponents.showConfirmModal(
            'Confirmar Limpeza',
            'Tem certeza que deseja remover TODOS os registros? Esta ação não pode ser desfeita.',
            () => {
                this.storage.clear();
                this.records = [];
                this.updateUI();
                this.clearForm();
                UIComponents.showToast('Todos os dados foram removidos', 'success');
            }
        );
    }

    // Importar dados de CSV (funcionalidade futura)
    importFromCSV(file) {
        // TODO: Implementar importação de CSV
        UIComponents.showToast('Funcionalidade de importação em desenvolvimento', 'info');
    }

    // Obter estatísticas avançadas
    getAdvancedStats() {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        const thisMonthRecords = this.records.filter(record => {
            const recordDate = new Date(record.dataEntrada);
            return recordDate.getMonth() === thisMonth && recordDate.getFullYear() === thisYear;
        });

        return {
            thisMonth: this.calculator.calculatePeriodStats(
                thisMonthRecords,
                new Date(thisYear, thisMonth, 1),
                new Date(thisYear, thisMonth + 1, 0)
            ),
            total: this.storage.getStats()
        };
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TimesheetApp();
});

// Exportar para uso global
window.TimesheetApp = TimesheetApp;
