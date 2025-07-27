// Utilitários gerais
class Utils {
    // Formatar tempo para HH:MM
    static formatTime(hours, minutes = 0) {
        if (typeof hours === 'string' && hours.includes(':')) {
            return hours;
        }
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // Converter string de tempo para minutos
    static timeToMinutes(timeString) {
        if (!timeString) return 0;
        const [hours, minutes] = timeString.split(':').map(Number);
        return (hours * 60) + (minutes || 0);
    }

    // Converter minutos para string de tempo
    static minutesToTime(totalMinutes) {
        if (totalMinutes < 0) return '00:00';
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return this.formatTime(hours, minutes);
    }

    // Calcular diferença entre duas datas/horas
    static calculateTimeDifference(startDate, startTime, endDate, endTime) {
        // Garantir que as datas estão no formato correto
        const startDateISO = this.toISODateString(startDate);
        const endDateISO = this.toISODateString(endDate);
        
        const start = new Date(`${startDateISO}T${startTime}`);
        const end = new Date(`${endDateISO}T${endTime}`);
        
        if (end < start) {
            // Se a data de fim é menor, adiciona um dia
            end.setDate(end.getDate() + 1);
        }
        
        const diffMs = end - start;
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        
        return this.minutesToTime(diffMinutes);
    }

    // Subtrair tempo
    static subtractTime(time1, time2) {
        const minutes1 = this.timeToMinutes(time1);
        const minutes2 = this.timeToMinutes(time2);
        const result = minutes1 - minutes2;
        return this.minutesToTime(Math.max(0, result));
    }

    // Adicionar tempo
    static addTime(time1, time2) {
        const minutes1 = this.timeToMinutes(time1);
        const minutes2 = this.timeToMinutes(time2);
        return this.minutesToTime(minutes1 + minutes2);
    }

    // Formatar data para DD/MM/YYYY
    static formatDate(dateString) {
        if (!dateString) return '';
        
        // Se já está no formato DD/MM/YYYY, retorna como está
        if (dateString.includes('/')) {
            return dateString;
        }
        
        // Para datas no formato YYYY-MM-DD, criar data sem problemas de timezone
        if (dateString.includes('-')) {
            const [year, month, day] = dateString.split('-');
            const date = new Date(year, month - 1, day); // month é 0-indexado
            return date.toLocaleDateString('pt-BR');
        }
        
        // Fallback para outros formatos
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    // Formatar moeda
    static formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    // Validar formato de tempo
    static isValidTime(timeString) {
        if (!timeString) return false;
        const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return regex.test(timeString);
    }

    // Validar formato de data
    static isValidDate(dateString) {
        if (!dateString) return false;
        
        // Para formato YYYY-MM-DD
        if (dateString.includes('-')) {
            const [year, month, day] = dateString.split('-');
            const date = new Date(year, month - 1, day);
            return date instanceof Date && !isNaN(date) && 
                   date.getFullYear() == year && 
                   date.getMonth() == month - 1 && 
                   date.getDate() == day;
        }
        
        // Para outros formatos
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    // Converter data para formato ISO (YYYY-MM-DD) sem problemas de timezone
    static toISODateString(dateInput) {
        if (!dateInput) return '';
        
        let date;
        if (typeof dateInput === 'string') {
            if (dateInput.includes('-')) {
                // Já está no formato correto
                return dateInput;
            }
            if (dateInput.includes('/')) {
                // Converter DD/MM/YYYY para YYYY-MM-DD
                const [day, month, year] = dateInput.split('/');
                return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            date = new Date(dateInput);
        } else {
            date = dateInput;
        }
        
        if (!(date instanceof Date) || isNaN(date)) {
            return '';
        }
        
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    // Gerar ID único
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Sanitizar string para HTML
    static sanitizeHtml(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // Capitalizar primeira letra
    static capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }

    // Verificar se é fim de semana
    static isWeekend(dateString) {
        const date = new Date(dateString);
        const day = date.getDay();
        return day === 0 || day === 6; // Domingo ou Sábado
    }

    // Calcular idade a partir de data de nascimento
    static calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    // Copiar texto para clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback para navegadores mais antigos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (fallbackErr) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }

    // Detectar dispositivo móvel
    static isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // Detectar modo escuro
    static isDarkMode() {
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Salvar dados no sessionStorage
    static saveToSession(key, data) {
        try {
            sessionStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (err) {
            console.error('Erro ao salvar no sessionStorage:', err);
            return false;
        }
    }

    // Carregar dados do sessionStorage
    static loadFromSession(key) {
        try {
            const data = sessionStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (err) {
            console.error('Erro ao carregar do sessionStorage:', err);
            return null;
        }
    }

    // Remover dados do sessionStorage
    static removeFromSession(key) {
        try {
            sessionStorage.removeItem(key);
            return true;
        } catch (err) {
            console.error('Erro ao remover do sessionStorage:', err);
            return false;
        }
    }

    // Comparar duas versões (ex: "1.2.3" vs "1.3.0")
    static compareVersions(version1, version2) {
        const v1parts = version1.split('.').map(Number);
        const v2parts = version2.split('.').map(Number);
        const maxLength = Math.max(v1parts.length, v2parts.length);
        
        for (let i = 0; i < maxLength; i++) {
            const v1part = v1parts[i] || 0;
            const v2part = v2parts[i] || 0;
            
            if (v1part < v2part) return -1;
            if (v1part > v2part) return 1;
        }
        
        return 0;
    }

    // Escapar caracteres especiais para RegExp
    static escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Verificar se o navegador suporta uma funcionalidade
    static hasSupport(feature) {
        const features = {
            localStorage: () => {
                try {
                    localStorage.setItem('test', 'test');
                    localStorage.removeItem('test');
                    return true;
                } catch (e) {
                    return false;
                }
            },
            clipboard: () => navigator.clipboard !== undefined,
            serviceWorker: () => 'serviceWorker' in navigator,
            notifications: () => 'Notification' in window,
            geolocation: () => 'geolocation' in navigator
        };
        
        return features[feature] ? features[feature]() : false;
    }
}

// Exportar para uso global
window.Utils = Utils;
