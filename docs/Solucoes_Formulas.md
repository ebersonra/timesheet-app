# Problemas Comuns com Fórmulas de Horas Extras no Excel

## Problema: G2*1.5 não funciona

### Possíveis causas e soluções:

### 1. **Separador decimal regional**
No Brasil, o Excel usa vírgula como separador decimal:
```excel
❌ Errado: =G2*1.5
✅ Correto: =G2*1,5
```

### 2. **Cálculo de horas como números**
Se você quer calcular o **valor em dinheiro** das horas extras:

```excel
# Se G2 contém horas (ex: 2:30) e você quer multiplicar por valor/hora:
=G2*24*50  # Para R$ 50/hora (converte horas para decimal)

# Ou use:
=(HORA(G2)+MINUTO(G2)/60)*50  # Mais explícito
```

### 3. **Multiplicação simples de tempo**
Se você quer apenas mostrar as horas extras com adicional de 50%:

```excel
# Para mostrar as horas com 50% a mais:
=G2*1,5

# Para mostrar em formato de tempo:
=TEXTO(G2*1,5;"[h]:mm")
```

### 4. **Fórmula completa para valor monetário**
```excel
# Supondo valor/hora de R$ 25:
=(HORA(G2)*60+MINUTO(G2))/60*25*1,5

# Ou mais simples:
=G2*24*25*1,5  # G2 em formato hora, R$ 25/hora, 50% adicional
```

### 5. **Alternativas que sempre funcionam**

#### Para adicional de 50%:
```excel
=G2+G2*0,5  # Soma 50% às horas extras
```

#### Para valor em reais (exemplo R$ 30/hora):
```excel
=G2*24*30*1,5  # Converte para decimal e multiplica pelo valor
```

### 6. **Formatação importante**
- **Células de tempo (G2):** Formato `[h]:mm`
- **Células de valor (H2):** Formato `Moeda` ou `Número`

### Exemplo prático:
Se G2 = 2:30 (2 horas e 30 minutos) e valor/hora = R$ 40:

```excel
# Valor das horas extras:
=G2*24*40*1,5
# Resultado: R$ 150,00
```

## Teste rápido:
1. Digite em uma célula: `=2,5*1,5`
2. Se funcionar, o problema é com formato de horas
3. Se não funcionar, mude configurações regionais do Excel
