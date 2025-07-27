// Aplicação principal
class TimesheetApp {
    constructor() {
        this.storage = new StorageManager();
        this.calculator = new TimesheetCalculator();
        this.currentEditId = null;
        this.records = [];
        
        this.init();
    }

    // Inicializar aplicação
    init() {
        this.loadRecords();
        this.bindEvents();
        this.updateUI();
        UIComponents.setTodayDate();
        
        console.log('🚀 TimesheetPro inicializado com sucesso!');
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

        // Botão exportar CSV
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.addEventListener('click', () => this.exportToCSV());

        // Botão limpar dados
        const clearDataBtn = document.getElementById('clearDataBtn');
        clearDataBtn.addEventListener('click', () => this.clearAllData());

        // Search e filtros
        const searchInput = document.getElementById('searchInput');
        const filterSelect = document.getElementById('filterSelect');
        
        const debouncedSearch = UIComponents.createDebouncedSearch(() => {
            this.updateTable();
        });

        searchInput.addEventListener('input', debouncedSearch);
        filterSelect.addEventListener('change', () => this.updateTable());

        // Auto-completar data de saída quando entrada for preenchida
        const dataEntrada = document.getElementById('dataEntrada');
        dataEntrada.addEventListener('change', (e) => {
            const dataSaida = document.getElementById('dataSaida');
            if (!dataSaida.value) {
                dataSaida.value = e.target.value;
            }
        });

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
        
        const calculation = this.calculator.calculateAll(formData);
        
        if (!calculation.isValid) {
            UIComponents.showToast('Erro nos cálculos. Verifique os dados informados', 'error');
            return;
        }

        const record = {
            ...formData,
            ...calculation,
            id: this.currentEditId || Utils.generateId(),
            createdAt: this.currentEditId ? 
                this.records.find(r => r.id === this.currentEditId)?.createdAt : 
                new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
            observacao: document.getElementById('observacao').value
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
            observacao: {}
        };

        return UIComponents.validateForm(formData, rules);
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
            const calculation = this.calculator.calculateAll(formData);
            
            if (calculation.isValid) {
                this.displayCalculationResults(calculation);
                UIComponents.showToast('Cálculo realizado com sucesso!', 'success');
            } else {
                UIComponents.showToast('Erro nos cálculos. Verifique os dados', 'error');
            }
            
            UIComponents.hideLoading();
        }, 500);
    }

    // Exibir resultados do cálculo
    displayCalculationResults(calculation) {
        const resultsSection = document.getElementById('resultsSection');
        
        document.getElementById('resultTotalBruto').textContent = calculation.totalBruto;
        document.getElementById('resultTempoAlmoco').textContent = calculation.tempoAlmoco;
        document.getElementById('resultTotalLiquido').textContent = calculation.totalLiquido;
        document.getElementById('resultHorasExtras').textContent = calculation.horasExtras;
        document.getElementById('resultValorHE').textContent = Utils.formatCurrency(calculation.valorHE);
        
        resultsSection.style.display = 'block';
        resultsSection.classList.add('fade-in');
        
        UIComponents.scrollToElement('resultsSection', 100);
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
    }

    // Limpar formulário
    clearForm() {
        document.getElementById('timesheetForm').reset();
        document.getElementById('resultsSection').style.display = 'none';
        this.currentEditId = null;
        UIComponents.clearFormErrors();
        UIComponents.setTodayDate();
    }

    // Atualizar interface
    updateUI() {
        this.updateStats();
        this.updateTable();
    }

    // Atualizar estatísticas
    updateStats() {
        const stats = this.storage.getStats();
        UIComponents.updateStats(stats);
    }

    // Atualizar tabela
    updateTable() {
        const searchTerm = document.getElementById('searchInput').value;
        const filterTerm = document.getElementById('filterSelect').value;
        
        UIComponents.renderTable(this.records, searchTerm, filterTerm);
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
