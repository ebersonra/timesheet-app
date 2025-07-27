// Script para corrigir dados de data no localStorage
(function() {
    console.log('🔧 Iniciando correção de datas no localStorage...');
    
    const STORAGE_KEY = 'timesheet_data';
    
    try {
        // Carregar dados existentes
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            console.log('❌ Nenhum dado encontrado no localStorage');
            return;
        }
        
        const parsed = JSON.parse(savedData);
        let records = [];
        
        // Verificar estrutura dos dados
        if (parsed.data && Array.isArray(parsed.data)) {
            records = parsed.data;
        } else if (Array.isArray(parsed)) {
            records = parsed;
        } else {
            console.log('❌ Estrutura de dados inválida');
            return;
        }
        
        console.log(`📊 Encontrados ${records.length} registros para correção`);
        
        // Corrigir cada registro
        let correctedCount = 0;
        const correctedRecords = records.map(record => {
            let needsCorrection = false;
            const correctedRecord = { ...record };
            
            // Verificar e corrigir data de entrada
            if (record.dataEntrada) {
                const originalDate = record.dataEntrada;
                // Se está no formato YYYY-MM-DD, deixar como está
                if (!originalDate.includes('-') && originalDate.includes('/')) {
                    // Converter DD/MM/YYYY para YYYY-MM-DD
                    const [day, month, year] = originalDate.split('/');
                    correctedRecord.dataEntrada = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    needsCorrection = true;
                }
            }
            
            // Verificar e corrigir data de saída
            if (record.dataSaida) {
                const originalDate = record.dataSaida;
                // Se está no formato YYYY-MM-DD, deixar como está
                if (!originalDate.includes('-') && originalDate.includes('/')) {
                    // Converter DD/MM/YYYY para YYYY-MM-DD
                    const [day, month, year] = originalDate.split('/');
                    correctedRecord.dataSaida = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                    needsCorrection = true;
                }
            }
            
            if (needsCorrection) {
                correctedCount++;
                console.log(`✅ Corrigido registro ${record.id}:`, {
                    antes: { entrada: record.dataEntrada, saida: record.dataSaida },
                    depois: { entrada: correctedRecord.dataEntrada, saida: correctedRecord.dataSaida }
                });
            }
            
            return correctedRecord;
        });
        
        // Salvar dados corrigidos
        if (correctedCount > 0) {
            const dataToSave = {
                version: '1.0.1',
                timestamp: new Date().toISOString(),
                data: correctedRecords
            };
            
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
            console.log(`🎉 ${correctedCount} registros corrigidos e salvos!`);
            
            // Recarregar a página para aplicar as correções
            if (confirm('Dados corrigidos! Deseja recarregar a página para ver as mudanças?')) {
                window.location.reload();
            }
        } else {
            console.log('✅ Todos os dados já estão no formato correto!');
        }
        
    } catch (error) {
        console.error('❌ Erro ao corrigir dados:', error);
    }
})();

console.log('Para executar a correção manual, digite: fixDates()');

// Função global para correção manual
window.fixDates = function() {
    const script = document.createElement('script');
    script.textContent = `(${arguments.callee.toString()})()`;
    document.head.appendChild(script);
    document.head.removeChild(script);
};
