// Gerenciamento de localStorage
class StorageManager {
    constructor() {
        this.storageKey = 'timesheet_data';
        this.settingsKey = 'timesheet_settings';
        this.backupKey = 'timesheet_backup';
        this.isSupported = this.checkSupport();
    }

    // Verificar se localStorage está disponível
    checkSupport() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage não está disponível:', e);
            return false;
        }
    }

    // Salvar dados
    save(data) {
        if (!this.isSupported) {
            console.error('localStorage não está disponível');
            return false;
        }

        try {
            const dataToSave = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                data: data
            };
            
            localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
            
            // Criar backup automático
            this.createBackup();
            
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    }

    // Carregar dados
    load() {
        if (!this.isSupported) {
            return [];
        }

        try {
            const savedData = localStorage.getItem(this.storageKey);
            if (!savedData) {
                return [];
            }

            const parsed = JSON.parse(savedData);
            
            // Verificar estrutura dos dados
            if (parsed.data && Array.isArray(parsed.data)) {
                return parsed.data;
            }
            
            // Fallback para dados antigos (sem estrutura de versão)
            if (Array.isArray(parsed)) {
                return parsed;
            }

            return [];
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            return [];
        }
    }

    // Adicionar novo registro
    addRecord(record) {
        const records = this.load();
        record.id = record.id || Utils.generateId();
        record.createdAt = new Date().toISOString();
        records.push(record);
        return this.save(records);
    }

    // Atualizar registro
    updateRecord(id, updatedRecord) {
        const records = this.load();
        const index = records.findIndex(record => record.id === id);
        
        if (index !== -1) {
            records[index] = { ...records[index], ...updatedRecord, updatedAt: new Date().toISOString() };
            return this.save(records);
        }
        
        return false;
    }

    // Remover registro
    removeRecord(id) {
        const records = this.load();
        const filteredRecords = records.filter(record => record.id !== id);
        return this.save(filteredRecords);
    }

    // Buscar registros
    findRecords(query = {}) {
        const records = this.load();
        
        if (Object.keys(query).length === 0) {
            return records;
        }

        return records.filter(record => {
            return Object.entries(query).every(([key, value]) => {
                if (typeof value === 'string') {
                    return record[key] && record[key].toLowerCase().includes(value.toLowerCase());
                }
                return record[key] === value;
            });
        });
    }

    // Obter estatísticas
    getStats() {
        const records = this.load();
        
        let totalRecords = records.length;
        let totalMinutes = 0;
        let totalExtraMinutes = 0;
        let totalValue = 0;

        records.forEach(record => {
            if (record.totalLiquido) {
                totalMinutes += Utils.timeToMinutes(record.totalLiquido);
            }
            if (record.horasExtras) {
                totalExtraMinutes += Utils.timeToMinutes(record.horasExtras);
            }
            if (record.valorHE) {
                totalValue += parseFloat(record.valorHE) || 0;
            }
        });

        return {
            totalRecords,
            totalHours: Utils.minutesToTime(totalMinutes),
            totalExtra: Utils.minutesToTime(totalExtraMinutes),
            totalValue: totalValue
        };
    }

    // Exportar dados para CSV
    exportToCSV() {
        const records = this.load();
        
        if (records.length === 0) {
            throw new Error('Nenhum registro encontrado para exportar');
        }

        const headers = [
            'Data Entrada',
            'Hora Entrada', 
            'Data Saída',
            'Hora Saída',
            'Início Almoço',
            'Fim Almoço',
            'Total Bruto',
            'Tempo Almoço',
            'Total Líquido',
            'Horas Normais',
            'Horas Extras',
            'Valor HE (50%)',
            'Turno/Observação'
        ];

        const csvContent = [
            headers.join(','),
            ...records.map(record => [
                record.dataEntrada || '',
                record.horaEntrada || '',
                record.dataSaida || '',
                record.horaSaida || '',
                record.inicioAlmoco || '',
                record.fimAlmoco || '',
                record.totalBruto || '',
                record.tempoAlmoco || '',
                record.totalLiquido || '',
                record.horasNormais || '',
                record.horasExtras || '',
                record.valorHE || '',
                `"${record.observacao || ''}"` // Aspas para textos com vírgulas
            ].join(','))
        ].join('\n');

        return csvContent;
    }

    // Importar dados de CSV
    importFromCSV(csvContent) {
        try {
            const lines = csvContent.trim().split('\n');
            const headers = lines[0].split(',');
            const records = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                const record = {
                    id: Utils.generateId(),
                    dataEntrada: values[0] || '',
                    horaEntrada: values[1] || '',
                    dataSaida: values[2] || '',
                    horaSaida: values[3] || '',
                    inicioAlmoco: values[4] || '',
                    fimAlmoco: values[5] || '',
                    totalBruto: values[6] || '',
                    tempoAlmoco: values[7] || '',
                    totalLiquido: values[8] || '',
                    horasNormais: values[9] || '',
                    horasExtras: values[10] || '',
                    valorHE: values[11] || '',
                    observacao: values[12] ? values[12].replace(/"/g, '') : '',
                    importedAt: new Date().toISOString()
                };
                records.push(record);
            }

            // Salvar registros importados
            const existingRecords = this.load();
            const allRecords = [...existingRecords, ...records];
            this.save(allRecords);

            return records.length;
        } catch (error) {
            console.error('Erro ao importar CSV:', error);
            throw new Error('Formato de CSV inválido');
        }
    }

    // Criar backup
    createBackup() {
        try {
            const currentData = localStorage.getItem(this.storageKey);
            if (currentData) {
                const backup = {
                    timestamp: new Date().toISOString(),
                    data: currentData
                };
                localStorage.setItem(this.backupKey, JSON.stringify(backup));
            }
        } catch (error) {
            console.error('Erro ao criar backup:', error);
        }
    }

    // Restaurar backup
    restoreBackup() {
        try {
            const backupData = localStorage.getItem(this.backupKey);
            if (backupData) {
                const backup = JSON.parse(backupData);
                localStorage.setItem(this.storageKey, backup.data);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao restaurar backup:', error);
            return false;
        }
    }

    // Limpar todos os dados
    clear() {
        try {
            localStorage.removeItem(this.storageKey);
            localStorage.removeItem(this.backupKey);
            return true;
        } catch (error) {
            console.error('Erro ao limpar dados:', error);
            return false;
        }
    }

    // Salvar configurações
    saveSettings(settings) {
        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            return false;
        }
    }

    // Carregar configurações
    loadSettings() {
        try {
            const settings = localStorage.getItem(this.settingsKey);
            return settings ? JSON.parse(settings) : this.getDefaultSettings();
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            return this.getDefaultSettings();
        }
    }

    // Configurações padrão
    getDefaultSettings() {
        return {
            horasNormais: '08:00',
            valorHoraPadrao: 30.00,
            autoSave: true,
            theme: 'light',
            notifications: true,
            language: 'pt-BR'
        };
    }

    // Obter informações de armazenamento
    getStorageInfo() {
        if (!this.isSupported) {
            return { available: false };
        }

        try {
            // Calcular tamanho usado (aproximado)
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }

            const records = this.load();
            
            return {
                available: true,
                totalRecords: records.length,
                approximateSize: `${(totalSize / 1024).toFixed(2)} KB`,
                lastModified: records.length > 0 ? records[records.length - 1].updatedAt || records[records.length - 1].createdAt : null
            };
        } catch (error) {
            console.error('Erro ao obter informações de armazenamento:', error);
            return { available: false, error: error.message };
        }
    }
}

// Exportar para uso global
window.StorageManager = StorageManager;
