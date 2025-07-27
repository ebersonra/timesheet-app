# Controle de Múltiplos Turnos por Data

## Cenário: Mesmo Funcionário, Múltiplos Turnos no Mesmo Dia

### Exemplo do dia 25/07/2025:
1. **Turno Regular:** 08:00 às 17:00 (com almoço 12:00-13:00)
2. **Turno Extra:** 22:30 às 03:00 (do dia seguinte)

## Estratégias de Controle

### 1. **Linhas Separadas (Método Atual)**
Cada turno = uma linha na planilha

**Vantagens:**
- Controle detalhado de cada período
- Fácil identificação de turnos noturnos
- Cálculo preciso de horas extras por turno

**Exemplo:**
```
Data        | Entrada | Saída | Turno
25/07/2025  | 08:00   | 17:00 | Comercial
25/07/2025  | 22:30   | 03:00 | Extra Noturno
```

### 2. **Resumo Diário**
Adicionar linhas de totalização por data:

```excel
# Nova fórmula para somar horas do dia:
=SOMASES(I:I;A:A;A2)  # Soma total líquido da mesma data
```

### 3. **Configuração de Horas Normais por Turno**

#### Para Turno Extra (linha 3):
- **Horas Normais:** 0:00 (tudo é extra)
- **Fórmula HE:** `=I3` (todo tempo trabalhado é hora extra)

#### Para Turno Regular (linha 2):
- **Horas Normais:** 8:00
- **Fórmula HE:** `=SE(I2>J2;I2-J2;0)`

## Fórmulas para Controle Avançado

### 1. **Total de Horas do Dia**
```excel
=SOMASES($I$2:$I$100;$A$2:$A$100;A2)
```

### 2. **Verificar se Passou de 8h no Dia**
```excel
=SE(SOMASES($I$2:$I$100;$A$2:$A$100;A2)>TEMPO(8;0;0);"ATENÇÃO: +8h";"OK")
```

### 3. **Cálculo de HE Considerando Total Diário**
```excel
# Em uma nova coluna "HE Diária":
=SE(SOMASES($I$2:$I$100;$A$2:$A$100;A2)>TEMPO(8;0;0);
   SOMASES($I$2:$I$100;$A$2:$A$100;A2)-TEMPO(8;0;0);0)
```

## Cenários Comuns

### 1. **Plantão 24h**
```
25/07 22:00 → 26/07 22:00 (com pausas)
```

### 2. **Turno Duplo**
```
25/07 08:00-17:00 (regular)
25/07 18:00-22:00 (extra 4h)
```

### 3. **Sobreaviso**
```
25/07 08:00-17:00 (regular)
25/07 02:00-04:00 (chamada emergência)
```

## Tabela de Resumo Diário

Criar uma aba separada com resumo:

| Data       | Total Horas | HE Diárias | Valor Total |
|------------|-------------|------------|-------------|
| 25/07/2025 | 12:30       | 4:30       | R$ 337,50   |
| 26/07/2025 | 10:00       | 2:00       | R$ 150,00   |

### Fórmula para o resumo:
```excel
# Total Horas por Data:
=SOMASES(Timesheet!I:I;Timesheet!A:A;A2)

# HE Diárias:
=SE(B2>TEMPO(8;0;0);B2-TEMPO(8;0;0);0)
```

## Recomendações

1. **Use a coluna "Turno/Observação"** para identificar cada período
2. **Mantenha turnos extras com "Horas Normais = 0"**
3. **Crie relatórios diários** para controle gerencial
4. **Use formatação condicional** para destacar dias com +12h
5. **Considere adicionar coluna "Tipo"**: Regular, Extra, Plantão, Sobreaviso

## Legislação Trabalhista

- **Jornada máxima:** 8h/dia, 44h/semana
- **HE máxima:** 2h/dia
- **Intervalo mínimo entre jornadas:** 11h
- **Adicional noturno:** 22h às 05h (+20%)
- **Plantões médicos:** Regras específicas
