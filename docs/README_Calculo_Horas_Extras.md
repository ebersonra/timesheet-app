# Cálculo de Horas Extras no Excel

## Exemplo do seu caso:
- **Entrada:** 22:30 (25/07)
- **Saída:** 03:00 (26/07)

## Estrutura da Planilha

### Colunas necessárias:
- A: Data Entrada
- B: Hora Entrada
- C: Data Saída
- D: Hora Saída
- E: Total de Horas Trabalhadas
- F: Horas Normais (8h)
- G: Horas Extras

## Fórmulas para Cálculo

### 1. Total de Horas Trabalhadas (Coluna E)
```excel
=(C2+D2)-(A2+B2)
```

**Explicação:** Esta fórmula combina data e hora para calcular corretamente a diferença, mesmo quando há mudança de data.

### 2. Exemplo prático com seus dados:

| A        | B     | C        | D     | E                    | F    | G                |
|----------|-------|----------|-------|----------------------|------|------------------|
| 25/07/2025| 22:30 | 26/07/2025| 03:00 | =(C2+D2)-(A2+B2)    | 8:00 | =SE(E2>F2,E2-F2,0)|

### 3. Resultado esperado:
- **Total trabalhado:** 4 horas e 30 minutos
- **Horas normais:** 4 horas e 30 minutos
- **Horas extras:** 0 (se jornada normal for 8h)

## Variações das Fórmulas

### Se a jornada normal for diferente de 8h:
```excel
# Para 6 horas normais:
=SE(E2>TEMPO(6,0,0),E2-TEMPO(6,0,0),0)

# Para horário comercial (8h às 17h):
=SE(E2>TEMPO(8,0,0),E2-TEMPO(8,0,0),0)
```

### Para 50% de adicional nas horas extras:
```excel
# Valor das horas extras (Coluna H):
=G2*1.5
```

## Formatação Importante

1. **Formato das células de tempo:** Selecione as colunas B, D, E, F, G e formate como `[h]:mm`
2. **Formato de data:** Colunas A e C como `dd/mm/aaaa`

## Casos Especiais

### Trabalho que cruza meia-noite (como seu exemplo):
A fórmula `=(C2+D2)-(A2+B2)` já resolve automaticamente.

### Verificação se o cálculo está correto:
```excel
# Adicione esta fórmula em uma célula para verificar:
=TEXTO(E2,"[h]:mm") & " horas trabalhadas"
```

## Exemplo Completo

Para o seu caso específico:
- **Entrada:** 25/07/2025 22:30
- **Saída:** 26/07/2025 03:00
- **Resultado:** 4:30 horas trabalhadas
- **Se jornada for 8h:** 0 horas extras
- **Se jornada for 4h:** 0:30 horas extras

## Dicas Adicionais

1. **Use formatação condicional** para destacar quando há horas extras
2. **Crie uma coluna de observações** para turnos noturnos
3. **Adicione validação de dados** para evitar erros de entrada
4. **Use PROCV** se tiver tabela de funcionários com jornadas diferentes

## Fórmula Avançada (Tudo em uma célula)

```excel
=SE((C2+D2)-(A2+B2)>TEMPO(8,0,0),(C2+D2)-(A2+B2)-TEMPO(8,0,0),0)
```

Esta fórmula calcula diretamente as horas extras, considerando 8h como jornada normal.
