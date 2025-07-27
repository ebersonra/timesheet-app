# Cálculo de Horas com Horário de Almoço

## Nova Estrutura da Planilha

### Colunas adicionadas:
- **E:** Início Almoço
- **F:** Fim Almoço
- **G:** Total Bruto (tempo total sem descontar almoço)
- **H:** Tempo de Almoço
- **I:** Total Líquido (tempo trabalhado após descontar almoço)
- **J:** Horas Normais (8:00)
- **K:** Horas Extras
- **L:** Valor HE (50%)

## Explicação das Fórmulas

### 1. **Total Bruto (Coluna G):**
```excel
=(C2+D2)-(A2+B2)
```
Calcula o tempo total entre entrada e saída (incluindo almoço).

### 2. **Tempo de Almoço (Coluna H):**
```excel
=SE(E2<>"";F2-E2;0)
```
- Se houver horário de almoço informado (E2 não vazio), calcula F2-E2
- Senão, considera 0 (para turnos sem almoço, como noturno)

### 3. **Total Líquido (Coluna I):**
```excel
=G2-H2
```
Subtrai o tempo de almoço do total bruto = tempo realmente trabalhado.

### 4. **Horas Extras (Coluna K):**
```excel
=SE(I2>J2;I2-J2;0)
```
Compara o total líquido com as horas normais (8:00).

## Exemplos Práticos

### Exemplo 1 - Horário Comercial:
- **Entrada:** 08:00
- **Saída:** 18:00
- **Almoço:** 12:00 às 13:00
- **Total Bruto:** 10:00
- **Tempo Almoço:** 1:00
- **Total Líquido:** 9:00
- **Horas Extras:** 1:00

### Exemplo 2 - Turno Noturno (sem almoço):
- **Entrada:** 22:30 (25/07)
- **Saída:** 03:00 (26/07)
- **Almoço:** (vazio)
- **Total Bruto:** 4:30
- **Tempo Almoço:** 0:00
- **Total Líquido:** 4:30
- **Horas Extras:** 0:00

### Exemplo 3 - Jornada Longa:
- **Entrada:** 14:00 (27/07)
- **Saída:** 02:00 (28/07)
- **Almoço:** 19:00 às 20:00
- **Total Bruto:** 12:00
- **Tempo Almoço:** 1:00
- **Total Líquido:** 11:00
- **Horas Extras:** 3:00

## Variações de Horário de Almoço

### Almoço de 1h30:
```excel
# Coluna F: 13:30 (se início foi 12:00)
```

### Múltiplos intervalos:
Para pausas adicionais, você pode criar mais colunas:
- **M:** Início Pausa 2
- **N:** Fim Pausa 2
- **O:** Total Pausas = H2+(N2-M2)

### Almoço variável por funcionário:
Use PROCV para buscar o tempo padrão de almoço por funcionário.

## Dicas Importantes

1. **Formato das células:**
   - Colunas E, F: `hh:mm`
   - Colunas G, H, I, J, K: `[h]:mm`
   - Coluna L: `Moeda` ou `Número`

2. **Validação:**
   - Horário de saída do almoço deve ser maior que entrada
   - Almoço deve estar dentro do horário de trabalho

3. **Para turnos 24h:**
   - Use a mesma lógica de data+hora para almoços que cruzam meia-noite

4. **Automatização:**
   - Configure horários padrão de almoço por setor/função
   - Use formatação condicional para destacar inconsistências
