# Implementação CLT - Documentação Técnica

## 📋 Visão Geral

O **TimesheetPro** agora possui implementação completa das regras CLT (Consolidação das Leis do Trabalho) brasileira, oferecendo cálculos precisos conforme a legislação trabalhista.

## 🏛️ Fundamentos Legais

### CLT Art. 58 - Jornada Normal
```javascript
const JORNADA_NORMAL_MINUTOS = 8 * 60; // 8 horas diárias
```

### CLT Art. 59 - Horas Extras
```javascript
const ADICIONAL_HE_MINIMO = 0.50;        // 50% mínimo
const ADICIONAL_HE_DOMINGO_FERIADO = 1.00; // 100% domingos/feriados
const LIMITE_HE_DIARIA = 2;              // 2h máximo por dia
const LIMITE_JORNADA_DIARIA = 10;        // 10h máximo total
```

### CLT Art. 73 - Trabalho Noturno
```javascript
const INICIO_NOTURNO = 22;               // 22:00
const FIM_NOTURNO = 5;                   // 05:00
const ADICIONAL_NOTURNO = 0.20;          // 20% adicional
const HORA_NOTURNA_MINUTOS = 52.5;       // Hora reduzida
```

### CLT Art. 66 - Intervalo entre Jornadas
```javascript
const INTERVALO_MINIMO_JORNADAS = 11 * 60; // 11 horas
```

### CLT Art. 71 - Intervalos Obrigatórios
```javascript
const INTERVALO_MINIMO_4H = 15;          // 15min para > 4h
const INTERVALO_MINIMO_6H = 60;          // 1h para > 6h
```

## 🔧 Arquitetura da Implementação

### Classe CLTCalculator

```javascript
class CLTCalculator {
    constructor() {
        // Configurações CLT conforme legislação
        this.JORNADA_NORMAL_MINUTOS = 8 * 60;
        this.ADICIONAL_HE_MINIMO = 0.50;
        this.ADICIONAL_NOTURNO = 0.20;
        // ... outras configurações
    }

    // Métodos principais
    calcularHorasTrabalhadas(entrada, saida, inicioAlmoco, fimAlmoco)
    calcularAdicionalNoturno(entrada, saida, salarioHora)
    calcularValorHorasExtras(minutosExtras, salarioHora, isDomingoFeriado)
    calcularValorTotal(dados)
    validarConformidadeCLT(dados, resultadoHoras)
}
```

## 📊 Fluxo de Cálculo CLT

### 1. Entrada de Dados
```javascript
const dados = {
    entrada: "22:00",
    saida: "06:00",
    inicioAlmoco: "02:00",
    fimAlmoco: "03:00",
    salarioHora: 25.00,
    isDomingoFeriado: false
};
```

### 2. Cálculo de Horas Trabalhadas
```javascript
// 1. Calcular total de minutos
const totalMinutos = calcularMinutosTrabalhados(entrada, saida, inicioAlmoco, fimAlmoco);

// 2. Separar horas normais e extras
const horasNormais = Math.min(totalMinutos, JORNADA_NORMAL_MINUTOS);
let horasExtras = Math.max(0, totalMinutos - JORNADA_NORMAL_MINUTOS);

// 3. Aplicar limite de 2h extras
horasExtras = Math.min(horasExtras, LIMITE_HE_DIARIA * 60);
```

### 3. Cálculo do Adicional Noturno
```javascript
// 1. Identificar minutos noturnos (22h-5h)
const minutosNoturnos = calcularMinutosNoturnos(entrada, saida);

// 2. Converter para horas de pagamento (hora reduzida)
const horasNoturnasPagamento = minutosNoturnos / HORA_NOTURNA_MINUTOS;

// 3. Calcular valor adicional (20%)
const valorAdicional = horasNoturnasPagamento * salarioHora * ADICIONAL_NOTURNO;
```

### 4. Cálculo de Valores
```javascript
// Valores base
const valorHorasNormais = (horasNormais / 60) * salarioHora;
const valorHorasExtras = (horasExtras / 60) * salarioHora * (1 + ADICIONAL_HE_MINIMO);
const valorAdicionalNoturno = horasNoturnasPagamento * salarioHora * ADICIONAL_NOTURNO;

// Total CLT
const valorTotal = valorHorasNormais + valorHorasExtras + valorAdicionalNoturno;
```

## ✅ Sistema de Validações

### Validações Obrigatórias (Erros)
- ❌ Excesso do limite de 2h extras diárias
- ❌ Jornada superior a 10h diárias
- ❌ Dados inválidos ou inconsistentes

### Validações Recomendadas (Avisos)
- ⚠️ Jornada > 6h sem intervalo de 1h
- ⚠️ Jornada > 4h sem intervalo de 15min
- ⚠️ Intervalo insuficiente entre jornadas (<11h)

### Implementação
```javascript
validarConformidadeCLT(dados, resultadoHoras) {
    const validacoes = {
        conforme: true,
        avisos: [],
        erros: []
    };
    
    // Verificar limite de horas extras
    if (resultadoHoras.horasExtras > LIMITE_HE_DIARIA * 60) {
        validacoes.conforme = false;
        validacoes.erros.push(`Limite de ${LIMITE_HE_DIARIA}h extras excedido`);
    }
    
    // Verificar intervalos obrigatórios
    const totalMinutos = resultadoHoras.totalMinutos;
    const temIntervalo = dados.inicioAlmoco && dados.fimAlmoco;
    
    if (totalMinutos > 6 * 60 && !temIntervalo) {
        validacoes.avisos.push('Jornada > 6h requer intervalo de 1h (CLT Art. 71)');
    }
    
    return validacoes;
}
```

## 📈 Relatórios de Conformidade

### Estrutura do Relatório
```javascript
const relatorio = {
    totalRegistros: 20,
    conformes: 18,        // Registros 100% conforme CLT
    comAvisos: 2,         // Registros com avisos
    comErros: 0,          // Registros com erros graves
    violacoes: [
        {
            registro: 5,
            data: "2025-01-15",
            tipo: "aviso",
            descricao: "Jornada > 6h requer intervalo mínimo de 1h"
        }
    ],
    estatisticas: {
        totalHorasExtras: 0,
        totalValorHE: 0,
        totalHorasNoturnas: 0,
        totalValorNoturno: 0,
        diasComHE: 0,
        diasComNoturno: 0
    }
};
```

### Geração de Relatório
```javascript
const cltCalculator = new CLTCalculator();
const relatorio = cltCalculator.gerarRelatorioConformidade(registros);

// Análise de conformidade
console.log(`Taxa de conformidade: ${(relatorio.conformes / relatorio.totalRegistros * 100).toFixed(1)}%`);
console.log(`Registros com avisos: ${relatorio.comAvisos}`);
console.log(`Valor total HE: R$ ${relatorio.estatisticas.totalValorHE.toFixed(2)}`);
```

## 🎯 Casos de Uso Específicos

### Caso 1: Turno Noturno Completo
```javascript
// Dados de entrada
entrada: "22:00"      // Início período noturno
saida: "06:00"        // Fim período noturno
inicioAlmoco: "02:00"
fimAlmoco: "03:00"
salarioHora: 30.00

// Resultado esperado
horasNormais: "07:00"              // 8h - 1h almoço
horasExtras: "00:00"               // Dentro da jornada normal
horasNoturnas: "07:00"             // Todo período é noturno
adicionalNoturno: 20%              // CLT Art. 73
valorAdicionalNoturno: 42.00       // 7h * R$30 * 20%
valorTotal: 252.00                 // R$210 + R$42
```

### Caso 2: Jornada com Horas Extras
```javascript
// Dados de entrada
entrada: "08:00"
saida: "19:00"        // 11h com 1h almoço = 10h trabalhadas
inicioAlmoco: "12:00"
fimAlmoco: "13:00"
salarioHora: 25.00

// Resultado esperado
horasNormais: "08:00"              // Jornada padrão
horasExtras: "02:00"               // Máximo permitido CLT
adicionalHE: 50%                   // CLT Art. 59
valorHorasExtras: 75.00            // 2h * R$25 * 150%
valorTotal: 275.00                 // R$200 + R$75
statusCLT: "Conforme"              // Dentro dos limites
```

### Caso 3: Domingo/Feriado
```javascript
// Dados de entrada
entrada: "09:00"
saida: "18:00"
isDomingoFeriado: true
salarioHora: 30.00

// Resultado esperado
horasNormais: "08:00"
horasExtras: "01:00"               // 1h extra
adicionalHE: 100%                  // Domingo = 100% adicional
valorHorasExtras: 60.00            // 1h * R$30 * 200%
valorTotal: 300.00                 // R$240 + R$60
```

## 🔄 Integração com Sistema

### Ativação do Modo CLT
```html
<!-- Checkbox no formulário -->
<input type="checkbox" id="modoCLT">
<label>Aplicar Regras CLT</label>
```

```javascript
// Detecção no JavaScript
const modoCLT = document.getElementById('modoCLT').checked;

if (modoCLT && window.CLTCalculator) {
    const cltCalculator = new CLTCalculator();
    const resultado = cltCalculator.calcularValorTotal(dados);
}
```

### Exibição de Resultados
```javascript
// Campos específicos CLT
document.getElementById('resultHorasNoturnas').textContent = resultado.horasNoturnas;
document.getElementById('resultAdicionalNoturno').textContent = Utils.formatCurrency(resultado.valorAdicionalNoturno);
document.getElementById('resultValorTotalCLT').textContent = Utils.formatCurrency(resultado.valorTotal);

// Status de conformidade
const statusElement = document.getElementById('resultStatusCLT');
statusElement.textContent = resultado.validacoes.conforme ? '✅ Conforme CLT' : '⚠️ Com Avisos';
```

### Exportação CSV com Dados CLT
```javascript
// Headers incluem campos CLT
const headers = [
    'Data Entrada', 'Hora Entrada', 'Data Saída', 'Hora Saída',
    'Modo CLT', 'Horas Noturnas', 'Adicional Noturno', 'Valor Total CLT',
    'Status CLT', 'Usuário', 'Departamento'
];

// Dados incluem informações CLT
record.modoCLT ? 'Sim' : 'Não',
record.horasNoturnas || '',
record.valorAdicionalNoturno || '',
record.valorTotalCLT || '',
record.validacoesCLT?.conforme ? 'Conforme' : 'Com Avisos'
```

## 🛡️ Segurança e Auditoria

### Logs de Cálculo
- ✅ Registro de modo CLT utilizado
- ✅ Validações aplicadas
- ✅ Avisos e erros gerados
- ✅ Valores calculados conforme legislação

### Rastreabilidade
- ✅ Data/hora do cálculo
- ✅ Usuário responsável
- ✅ Modo de cálculo (padrão vs CLT)
- ✅ Conformidade com legislação

### Backup e Recuperação
- ✅ Dados CLT incluídos no backup
- ✅ Histórico de validações
- ✅ Relatórios de conformidade

## 📚 Referências Legais

- **CLT Art. 58**: Duração normal do trabalho
- **CLT Art. 59**: Prorrogação da jornada (horas extras)
- **CLT Art. 66**: Intervalo entre duas jornadas
- **CLT Art. 71**: Intervalos para descanso ou alimentação
- **CLT Art. 73**: Trabalho noturno (urbano)

---

**Implementação conforme CLT - TimesheetPro** ⚖️📋
