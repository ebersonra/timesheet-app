// Calculadora de horas e horas extras
class TimesheetCalculator {
    constructor() {
        this.defaultWorkingHours = '08:00';
        this.overtimeRate = 1.5; // 50% adicional
    }

    // Calcular total bruto (tempo entre entrada e saída)
    calculateGrossTotal(startDate, startTime, endDate, endTime) {
        if (!startDate || !startTime || !endDate || !endTime) {
            return '00:00';
        }

        try {
            return Utils.calculateTimeDifference(startDate, startTime, endDate, endTime);
        } catch (error) {
            console.error('Erro ao calcular total bruto:', error);
            return '00:00';
        }
    }

    // Calcular tempo de almoço
    calculateLunchTime(lunchStart, lunchEnd) {
        if (!lunchStart || !lunchEnd) {
            return '00:00';
        }

        try {
            const startMinutes = Utils.timeToMinutes(lunchStart);
            const endMinutes = Utils.timeToMinutes(lunchEnd);
            
            if (endMinutes <= startMinutes) {
                return '00:00';
            }
            
            return Utils.minutesToTime(endMinutes - startMinutes);
        } catch (error) {
            console.error('Erro ao calcular tempo de almoço:', error);
            return '00:00';
        }
    }

    // Calcular total líquido (total bruto - tempo de almoço)
    calculateNetTotal(grossTotal, lunchTime) {
        try {
            return Utils.subtractTime(grossTotal, lunchTime);
        } catch (error) {
            console.error('Erro ao calcular total líquido:', error);
            return '00:00';
        }
    }

    // Calcular horas extras
    calculateOvertime(netTotal, normalHours = this.defaultWorkingHours) {
        try {
            const netMinutes = Utils.timeToMinutes(netTotal);
            const normalMinutes = Utils.timeToMinutes(normalHours);
            
            if (netMinutes <= normalMinutes) {
                return '00:00';
            }
            
            const overtimeMinutes = netMinutes - normalMinutes;
            return Utils.minutesToTime(overtimeMinutes);
        } catch (error) {
            console.error('Erro ao calcular horas extras:', error);
            return '00:00';
        }
    }

    // Calcular valor das horas extras
    calculateOvertimeValue(overtimeHours, hourlyRate = 0) {
        try {
            if (!overtimeHours || overtimeHours === '00:00' || hourlyRate <= 0) {
                return 0;
            }

            const overtimeMinutes = Utils.timeToMinutes(overtimeHours);
            const overtimeHoursDecimal = overtimeMinutes / 60;
            const overtimeValue = overtimeHoursDecimal * hourlyRate * this.overtimeRate;
            
            return Math.round(overtimeValue * 100) / 100; // Arredondar para 2 casas decimais
        } catch (error) {
            console.error('Erro ao calcular valor das horas extras:', error);
            return 0;
        }
    }

    // Calcular todos os valores de uma vez
    calculateAll(data) {
        try {
            const {
                dataEntrada,
                horaEntrada,
                dataSaida,
                horaSaida,
                inicioAlmoco,
                fimAlmoco,
                horasNormais = this.defaultWorkingHours,
                valorHora = 0
            } = data;

            // 1. Calcular total bruto
            const totalBruto = this.calculateGrossTotal(
                dataEntrada, horaEntrada, dataSaida, horaSaida
            );

            // 2. Calcular tempo de almoço
            const tempoAlmoco = this.calculateLunchTime(inicioAlmoco, fimAlmoco);

            // 3. Calcular total líquido
            const totalLiquido = this.calculateNetTotal(totalBruto, tempoAlmoco);

            // 4. Calcular horas extras
            const horasExtras = this.calculateOvertime(totalLiquido, horasNormais);

            // 5. Calcular valor das horas extras
            const valorHE = this.calculateOvertimeValue(horasExtras, parseFloat(valorHora));

            return {
                totalBruto,
                tempoAlmoco,
                totalLiquido,
                horasExtras,
                valorHE,
                isValid: this.validateCalculation(data)
            };
        } catch (error) {
            console.error('Erro no cálculo completo:', error);
            return this.getEmptyResult();
        }
    }

    // Validar dados de entrada
    validateCalculation(data) {
        const {
            dataEntrada,
            horaEntrada,
            dataSaida,
            horaSaida,
            inicioAlmoco,
            fimAlmoco
        } = data;

        // Validações obrigatórias
        if (!Utils.isValidDate(dataEntrada) || !Utils.isValidTime(horaEntrada) ||
            !Utils.isValidDate(dataSaida) || !Utils.isValidTime(horaSaida)) {
            return {
                isValid: false,
                errors: ['Data de entrada, hora de entrada, data de saída e hora de saída são obrigatórias']
            };
        }

        const errors = [];

        // Validar horário de almoço (se informado)
        if (inicioAlmoco && !Utils.isValidTime(inicioAlmoco)) {
            errors.push('Formato de início do almoço inválido');
        }

        if (fimAlmoco && !Utils.isValidTime(fimAlmoco)) {
            errors.push('Formato de fim do almoço inválido');
        }

        if (inicioAlmoco && fimAlmoco) {
            const startLunch = Utils.timeToMinutes(inicioAlmoco);
            const endLunch = Utils.timeToMinutes(fimAlmoco);
            
            if (endLunch <= startLunch) {
                errors.push('Fim do almoço deve ser posterior ao início');
            }
        }

        // Validar se a saída é posterior à entrada
        const startDateTime = new Date(`${dataEntrada}T${horaEntrada}`);
        let endDateTime = new Date(`${dataSaida}T${horaSaida}`);
        
        // Se a data de saída é anterior à entrada, assumir dia seguinte
        if (endDateTime < startDateTime) {
            endDateTime.setDate(endDateTime.getDate() + 1);
        }

        const diffHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
        if (diffHours > 24) {
            errors.push('Diferença entre entrada e saída não pode ser superior a 24 horas');
        }

        if (diffHours < 0) {
            errors.push('Data/hora de saída deve ser posterior à entrada');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Resultado vazio
    getEmptyResult() {
        return {
            totalBruto: '00:00',
            tempoAlmoco: '00:00',
            totalLiquido: '00:00',
            horasExtras: '00:00',
            valorHE: 0,
            isValid: false
        };
    }

    // Calcular estatísticas de um período
    calculatePeriodStats(records, startDate, endDate) {
        try {
            const filteredRecords = records.filter(record => {
                const recordDate = new Date(record.dataEntrada);
                const start = new Date(startDate);
                const end = new Date(endDate);
                return recordDate >= start && recordDate <= end;
            });

            let totalWorkedMinutes = 0;
            let totalOvertimeMinutes = 0;
            let totalOvertimeValue = 0;
            let totalDays = new Set();

            filteredRecords.forEach(record => {
                if (record.totalLiquido) {
                    totalWorkedMinutes += Utils.timeToMinutes(record.totalLiquido);
                }
                if (record.horasExtras) {
                    totalOvertimeMinutes += Utils.timeToMinutes(record.horasExtras);
                }
                if (record.valorHE) {
                    totalOvertimeValue += parseFloat(record.valorHE) || 0;
                }
                totalDays.add(record.dataEntrada);
            });

            return {
                totalRecords: filteredRecords.length,
                totalDays: totalDays.size,
                totalWorkedTime: Utils.minutesToTime(totalWorkedMinutes),
                totalOvertimeTime: Utils.minutesToTime(totalOvertimeMinutes),
                totalOvertimeValue: Math.round(totalOvertimeValue * 100) / 100,
                averageHoursPerDay: totalDays.size > 0 ? 
                    Utils.minutesToTime(Math.round(totalWorkedMinutes / totalDays.size)) : '00:00'
            };
        } catch (error) {
            console.error('Erro ao calcular estatísticas do período:', error);
            return {
                totalRecords: 0,
                totalDays: 0,
                totalWorkedTime: '00:00',
                totalOvertimeTime: '00:00',
                totalOvertimeValue: 0,
                averageHoursPerDay: '00:00'
            };
        }
    }

    // Calcular diferenças entre turnos (para verificar intervalo legal)
    calculateShiftGap(previousShift, currentShift) {
        try {
            if (!previousShift.dataSaida || !previousShift.horaSaida ||
                !currentShift.dataEntrada || !currentShift.horaEntrada) {
                return null;
            }

            const previousEnd = new Date(`${previousShift.dataSaida}T${previousShift.horaSaida}`);
            const currentStart = new Date(`${currentShift.dataEntrada}T${currentShift.horaEntrada}`);

            if (currentStart <= previousEnd) {
                return null; // Turnos sobrepostos ou inválidos
            }

            const gapMs = currentStart - previousEnd;
            const gapMinutes = Math.floor(gapMs / (1000 * 60));
            const gapTime = Utils.minutesToTime(gapMinutes);

            return {
                gapTime,
                isLegalInterval: gapMinutes >= 660, // 11 horas mínimas pela CLT
                gapHours: Math.round(gapMinutes / 60 * 100) / 100
            };
        } catch (error) {
            console.error('Erro ao calcular intervalo entre turnos:', error);
            return null;
        }
    }

    // Verificar se é turno noturno (22h às 5h)
    isNightShift(startTime, endTime) {
        try {
            const start = Utils.timeToMinutes(startTime);
            const end = Utils.timeToMinutes(endTime);
            
            // Turno noturno: 22:00 às 05:00
            const nightStart = 22 * 60; // 22:00
            const nightEnd = 5 * 60;    // 05:00

            // Verificar se o início está no período noturno
            const startsAtNight = start >= nightStart || start <= nightEnd;
            
            // Verificar se o fim está no período noturno
            const endsAtNight = (end >= nightStart && end >= start) || 
                              (end <= nightEnd && end < start);

            return startsAtNight || endsAtNight;
        } catch (error) {
            console.error('Erro ao verificar turno noturno:', error);
            return false;
        }
    }

    // Calcular adicional noturno (20% sobre as horas entre 22h e 5h)
    calculateNightShiftBonus(startDate, startTime, endDate, endTime, hourlyRate = 0) {
        try {
            if (!this.isNightShift(startTime, endTime) || hourlyRate <= 0) {
                return 0;
            }

            // Lógica simplificada: se é turno noturno, aplicar 20% sobre todo o período
            const totalMinutes = Utils.timeToMinutes(
                Utils.calculateTimeDifference(startDate, startTime, endDate, endTime)
            );
            
            const totalHours = totalMinutes / 60;
            const nightBonus = totalHours * hourlyRate * 0.2; // 20% adicional

            return Math.round(nightBonus * 100) / 100;
        } catch (error) {
            console.error('Erro ao calcular adicional noturno:', error);
            return 0;
        }
    }
}

// Exportar para uso global
window.TimesheetCalculator = TimesheetCalculator;
