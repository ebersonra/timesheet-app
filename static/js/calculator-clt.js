// Calculadora de horas conforme legislação CLT brasileira
class CLTCalculator {
    constructor() {
        // Configurações CLT
        this.JORNADA_NORMAL_MINUTOS = 8 * 60; // 8 horas em minutos
        this.ADICIONAL_HE_MINIMO = 0.50; // 50% mínimo CLT Art. 59
        this.ADICIONAL_HE_DOMINGO_FERIADO = 1.00; // 100% domingos e feriados
        this.ADICIONAL_NOTURNO = 0.20; // 20% adicional noturno Art. 73
        this.LIMITE_HE_DIARIA = 2; // 2h máximo por dia CLT Art. 59
        this.LIMITE_JORNADA_DIARIA = 10; // 10h máximo (8h + 2h extras)
        
        // Período noturno urbano (CLT Art. 73)
        this.INICIO_NOTURNO = 22; // 22:00
        this.FIM_NOTURNO = 5; // 05:00
        this.HORA_NOTURNA_MINUTOS = 52.5; // Hora reduzida (52min30s)
        
        // Intervalo mínimo entre jornadas
        this.INTERVALO_MINIMO_JORNADAS = 11 * 60; // 11 horas em minutos
        
        // Intervalos obrigatórios
        this.INTERVALO_MINIMO_4H = 15; // 15min para jornadas > 4h
        this.INTERVALO_MINIMO_6H = 60; // 1h para jornadas > 6h
    }

    // Calcular horas trabalhadas conforme CLT
    calcularHorasTrabalhadas(entrada, saida, inicioAlmoco = null, fimAlmoco = null) {
        try {
            const totalMinutos = this.calcularMinutosTrabalhados(entrada, saida, inicioAlmoco, fimAlmoco);
            
            // Separar horas normais e extras
            const horasNormais = Math.min(totalMinutos, this.JORNADA_NORMAL_MINUTOS);
            let horasExtras = Math.max(0, totalMinutos - this.JORNADA_NORMAL_MINUTOS);
            
            // Aplicar limite de horas extras (2h por dia)
            horasExtras = Math.min(horasExtras, this.LIMITE_HE_DIARIA * 60);
            
            // Verificar limite total da jornada
            const jornadeTotal = horasNormais + horasExtras;
            if (jornadeTotal > this.LIMITE_JORNADA_DIARIA * 60) {
                return {
                    erro: true,
                    mensagem: `Jornada excede limite legal de ${this.LIMITE_JORNADA_DIARIA}h diárias`
                };
            }
            
            return {
                totalMinutos: jornadeTotal,
                horasNormais: horasNormais,
                horasExtras: horasExtras,
                horasNormaisFormatadas: Utils.minutesToTime(horasNormais),
                horasExtrasFormatadas: Utils.minutesToTime(horasExtras),
                totalFormatado: Utils.minutesToTime(jornadeTotal)
            };
            
        } catch (error) {
            console.error('Erro no cálculo de horas trabalhadas:', error);
            return { erro: true, mensagem: 'Erro no cálculo' };
        }
    }

    // Calcular minutos trabalhados descontando intervalos
    calcularMinutosTrabalhados(entrada, saida, inicioAlmoco = null, fimAlmoco = null) {
        const entradaMinutos = this.stringToMinutos(entrada);
        const saidaMinutos = this.stringToMinutos(saida);
        
        let totalMinutos = saidaMinutos - entradaMinutos;
        
        // Se saída é no dia seguinte
        if (totalMinutos < 0) {
            totalMinutos += 24 * 60;
        }
        
        // Descontar intervalo de almoço se informado
        if (inicioAlmoco && fimAlmoco) {
            const inicioAlmocoMin = this.stringToMinutos(inicioAlmoco);
            const fimAlmocoMin = this.stringToMinutos(fimAlmoco);
            const intervaloAlmoco = fimAlmocoMin - inicioAlmocoMin;
            
            if (intervaloAlmoco > 0) {
                totalMinutos -= intervaloAlmoco;
            }
        }
        
        return Math.max(0, totalMinutos);
    }

    // Calcular adicional noturno conforme CLT Art. 73
    calcularAdicionalNoturno(entrada, saida, salarioHora = 0) {
        try {
            const minutosNoturnos = this.calcularMinutosNoturnos(entrada, saida);
            
            if (minutosNoturnos === 0 || salarioHora <= 0) {
                return {
                    minutosNoturnos: 0,
                    horasNoturnasPagamento: 0,
                    valorAdicional: 0,
                    percentualAplicado: 0
                };
            }
            
            // Converter para horas de pagamento (hora reduzida)
            const horasNoturnasPagamento = minutosNoturnos / this.HORA_NOTURNA_MINUTOS;
            
            // Calcular valor do adicional (20%)
            const valorAdicional = horasNoturnasPagamento * salarioHora * this.ADICIONAL_NOTURNO;
            
            return {
                minutosNoturnos,
                horasNoturnasPagamento: Math.round(horasNoturnasPagamento * 100) / 100,
                valorAdicional: Math.round(valorAdicional * 100) / 100,
                percentualAplicado: this.ADICIONAL_NOTURNO,
                horasNoturnasFormatadas: Utils.minutesToTime(Math.round(horasNoturnasPagamento * 60))
            };
            
        } catch (error) {
            console.error('Erro no cálculo do adicional noturno:', error);
            return {
                minutosNoturnos: 0,
                horasNoturnasPagamento: 0,
                valorAdicional: 0,
                percentualAplicado: 0
            };
        }
    }

    // Calcular minutos trabalhados em período noturno (22h às 5h)
    calcularMinutosNoturnos(entrada, saida) {
        const entradaMinutos = this.stringToMinutos(entrada);
        let saidaMinutos = this.stringToMinutos(saida);
        
        // Se saída é no dia seguinte
        if (saidaMinutos < entradaMinutos) {
            saidaMinutos += 24 * 60;
        }
        
        const inicioNoturno = this.INICIO_NOTURNO * 60; // 22:00 em minutos
        const fimNoturno = this.FIM_NOTURNO * 60; // 05:00 em minutos
        const fimNoturnoAjustado = fimNoturno + 24 * 60; // 05:00 do dia seguinte
        
        let minutosNoturnos = 0;
        
        // Período noturno: 22:00 às 05:00 (do dia seguinte)
        const inicioTurnoNoturno = Math.max(entradaMinutos, inicioNoturno);
        const fimTurnoNoturno = Math.min(saidaMinutos, fimNoturnoAjustado);
        
        if (fimTurnoNoturno > inicioTurnoNoturno) {
            minutosNoturnos = fimTurnoNoturno - inicioTurnoNoturno;
        }
        
        return Math.max(0, minutosNoturnos);
    }

    // Calcular valor das horas extras conforme CLT
    calcularValorHorasExtras(minutosExtras, salarioHora = 0, isDomingoFeriado = false) {
        if (minutosExtras === 0 || salarioHora <= 0) {
            return {
                horasExtras: 0,
                percentualAdicional: 0,
                valorHorasExtras: 0
            };
        }
        
        const horasExtras = minutosExtras / 60;
        const percentual = isDomingoFeriado ? this.ADICIONAL_HE_DOMINGO_FERIADO : this.ADICIONAL_HE_MINIMO;
        const valorHorasExtras = horasExtras * salarioHora * (1 + percentual);
        
        return {
            horasExtras: Math.round(horasExtras * 100) / 100,
            percentualAdicional: percentual,
            valorHorasExtras: Math.round(valorHorasExtras * 100) / 100,
            horasExtrasFormatadas: Utils.minutesToTime(minutosExtras)
        };
    }

    // Calcular valor total conforme CLT (normal + extras + noturno)
    calcularValorTotal(dados) {
        const {
            entrada,
            saida,
            inicioAlmoco = null,
            fimAlmoco = null,
            salarioHora = 0,
            isDomingoFeriado = false
        } = dados;
        
        try {
            // 1. Calcular horas trabalhadas
            const horas = this.calcularHorasTrabalhadas(entrada, saida, inicioAlmoco, fimAlmoco);
            
            if (horas.erro) {
                return horas;
            }
            
            // 2. Calcular adicional noturno
            const noturno = this.calcularAdicionalNoturno(entrada, saida, salarioHora);
            
            // 3. Calcular valor das horas extras
            const horasExtras = this.calcularValorHorasExtras(
                horas.horasExtras, 
                salarioHora, 
                isDomingoFeriado
            );
            
            // 4. Calcular valores
            const valorHorasNormais = (horas.horasNormais / 60) * salarioHora;
            const valorTotal = valorHorasNormais + horasExtras.valorHorasExtras + noturno.valorAdicional;
            
            return {
                // Tempos
                horasNormais: horas.horasNormaisFormatadas,
                horasExtras: horas.horasExtrasFormatadas,
                horasNoturnas: noturno.horasNoturnasFormatadas || '00:00',
                totalHoras: horas.totalFormatado,
                
                // Valores monetários
                valorHorasNormais: Math.round(valorHorasNormais * 100) / 100,
                valorHorasExtras: horasExtras.valorHorasExtras,
                valorAdicionalNoturno: noturno.valorAdicional,
                valorTotal: Math.round(valorTotal * 100) / 100,
                
                // Detalhes para auditoria
                percentualHE: horasExtras.percentualAdicional,
                percentualNoturno: noturno.percentualAplicado,
                isDomingoFeriado,
                
                // Validações CLT
                validacoes: this.validarConformidadeCLT(dados, horas)
            };
            
        } catch (error) {
            console.error('Erro no cálculo total CLT:', error);
            return {
                erro: true,
                mensagem: 'Erro no cálculo de valores CLT'
            };
        }
    }

    // Validar conformidade com CLT
    validarConformidadeCLT(dados, resultadoHoras) {
        const validacoes = {
            conforme: true,
            avisos: [],
            erros: []
        };
        
        // Verificar limite de horas extras
        if (resultadoHoras.horasExtras > this.LIMITE_HE_DIARIA * 60) {
            validacoes.conforme = false;
            validacoes.erros.push(`Limite de ${this.LIMITE_HE_DIARIA}h extras diárias excedido`);
        }
        
        // Verificar jornada total
        if (resultadoHoras.totalMinutos > this.LIMITE_JORNADA_DIARIA * 60) {
            validacoes.conforme = false;
            validacoes.erros.push(`Jornada de ${this.LIMITE_JORNADA_DIARIA}h diárias excedida`);
        }
        
        // Verificar intervalos obrigatórios
        const totalMinutos = resultadoHoras.totalMinutos;
        const temIntervalo = dados.inicioAlmoco && dados.fimAlmoco;
        
        if (totalMinutos > 6 * 60 && !temIntervalo) {
            validacoes.avisos.push('Jornada > 6h requer intervalo mínimo de 1h (CLT Art. 71)');
        }
        
        if (totalMinutos > 4 * 60 && totalMinutos <= 6 * 60 && !temIntervalo) {
            validacoes.avisos.push('Jornada > 4h requer intervalo mínimo de 15min (CLT Art. 71)');
        }
        
        return validacoes;
    }

    // Verificar intervalo entre jornadas
    validarIntervaloEntreJornadas(saidaAnterior, entradaAtual) {
        try {
            const saidaMin = this.stringToMinutos(saidaAnterior);
            const entradaMin = this.stringToMinutos(entradaAtual);
            
            let intervalo = entradaMin - saidaMin;
            
            // Se entrada é no dia seguinte
            if (intervalo < 0) {
                intervalo += 24 * 60;
            }
            
            const conforme = intervalo >= this.INTERVALO_MINIMO_JORNADAS;
            
            return {
                intervaloMinutos: intervalo,
                intervaloFormatado: Utils.minutesToTime(intervalo),
                conforme,
                minimoLegal: Utils.minutesToTime(this.INTERVALO_MINIMO_JORNADAS),
                mensagem: conforme ? 
                    'Intervalo entre jornadas conforme CLT' : 
                    'Intervalo insuficiente - mínimo 11h entre jornadas (CLT Art. 66)'
            };
            
        } catch (error) {
            console.error('Erro na validação de intervalo:', error);
            return {
                conforme: false,
                mensagem: 'Erro na validação'
            };
        }
    }

    // Verificar se é domingo ou feriado
    isDomingoOuFeriado(data, feriados = []) {
        const dataObj = new Date(data);
        const isDomingo = dataObj.getDay() === 0;
        const isFeriado = feriados.some(feriado => 
            new Date(feriado).toDateString() === dataObj.toDateString()
        );
        
        return isDomingo || isFeriado;
    }

    // Gerar relatório de conformidade CLT
    gerarRelatorioConformidade(registros) {
        const relatorio = {
            totalRegistros: registros.length,
            conformes: 0,
            comAvisos: 0,
            comErros: 0,
            violacoes: [],
            estatisticas: {
                totalHorasExtras: 0,
                totalValorHE: 0,
                totalHorasNoturnas: 0,
                totalValorNoturno: 0,
                diasComHE: 0,
                diasComNoturno: 0
            }
        };
        
        registros.forEach((registro, index) => {
            const resultado = this.calcularValorTotal({
                entrada: registro.horaEntrada,
                saida: registro.horaSaida,
                inicioAlmoco: registro.inicioAlmoco,
                fimAlmoco: registro.fimAlmoco,
                salarioHora: registro.valorHora || 0,
                isDomingoFeriado: this.isDomingoOuFeriado(registro.dataEntrada)
            });
            
            if (resultado.validacoes) {
                if (resultado.validacoes.conforme && resultado.validacoes.avisos.length === 0) {
                    relatorio.conformes++;
                } else if (resultado.validacoes.avisos.length > 0) {
                    relatorio.comAvisos++;
                } else {
                    relatorio.comErros++;
                }
                
                // Registrar violações
                resultado.validacoes.erros.forEach(erro => {
                    relatorio.violacoes.push({
                        registro: index + 1,
                        data: registro.dataEntrada,
                        tipo: 'erro',
                        descricao: erro
                    });
                });
                
                resultado.validacoes.avisos.forEach(aviso => {
                    relatorio.violacoes.push({
                        registro: index + 1,
                        data: registro.dataEntrada,
                        tipo: 'aviso',
                        descricao: aviso
                    });
                });
            }
            
            // Estatísticas
            if (resultado.valorHorasExtras > 0) {
                relatorio.estatisticas.diasComHE++;
                relatorio.estatisticas.totalValorHE += resultado.valorHorasExtras;
            }
            
            if (resultado.valorAdicionalNoturno > 0) {
                relatorio.estatisticas.diasComNoturno++;
                relatorio.estatisticas.totalValorNoturno += resultado.valorAdicionalNoturno;
            }
        });
        
        return relatorio;
    }

    // Utilitários
    stringToMinutos(timeString) {
        const [horas, minutos] = timeString.split(':').map(Number);
        return (horas * 60) + minutos;
    }

    minutosToString(minutos) {
        const h = Math.floor(minutos / 60);
        const m = minutos % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
}

// Exportar para uso global
window.CLTCalculator = CLTCalculator;
