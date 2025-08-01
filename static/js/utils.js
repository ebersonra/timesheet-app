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

    // Criar Date de forma segura para evitar problemas de timezone
    static createSafeDate(dateString) {
        if (!dateString) return null;
        
        if (dateString.includes('-')) {
            // Formato YYYY-MM-DD - criar data local sem problemas de timezone
            const [year, month, day] = dateString.split('-');
            return new Date(year, month - 1, day);
        }
        
        if (dateString.includes('/')) {
            // Formato DD/MM/YYYY - converter para YYYY-MM-DD primeiro
            const [day, month, year] = dateString.split('/');
            return new Date(year, month - 1, day);
        }
        
        // Fallback para outros formatos
        return new Date(dateString);
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

    static statusText(status) {
        const statusMap = {
            'pendente': 'Pendente',
            'concluido': 'Concluído',
            'presencial': 'Presencial'
        };
        return statusMap[status] || 'Desconhecido';
    }

    // Detectar tipo de conexão de rede
    static async detectNetworkConnection() {
        try {
            // Usar a API Network Information se disponível
            if ('connection' in navigator) {
                const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                
                if (connection) {
                    // Verificar o tipo de conexão
                    const connectionType = connection.type || connection.effectiveType;
                    
                    // Tipos que indicam conexão cabeada/ethernet
                    const wiredTypes = ['ethernet', 'other'];
                    // Tipos que indicam WiFi
                    const wifiTypes = ['wifi'];
                    
                    if (wiredTypes.includes(connectionType)) {
                        return {
                            type: 'wired',
                            location: 'presencial',
                            message: 'Conexão cabeada detectada - Modo Presencial'
                        };
                    } else if (wifiTypes.includes(connectionType)) {
                        return {
                            type: 'wifi',
                            location: 'home-office',
                            message: 'Conexão WiFi detectada - Modo Home Office'
                        };
                    }
                }
            }

            // Fallback: tentar detectar pela velocidade de conexão
            if ('connection' in navigator) {
                const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
                if (connection && connection.downlink) {
                    // Conexões cabeadas geralmente têm velocidade maior e mais estável
                    // Isso é uma heurística aproximada
                    if (connection.downlink > 50) {
                        return {
                            type: 'wired',
                            location: 'presencial',
                            message: 'Conexão de alta velocidade detectada - Modo Presencial (provável)'
                        };
                    } else {
                        return {
                            type: 'wifi',
                            location: 'home-office',
                            message: 'Conexão WiFi detectada - Modo Home Office (provável)'
                        };
                    }
                }
            }

            // Se não conseguir detectar, retornar padrão
            return {
                type: 'unknown',
                location: 'home-office',
                message: 'Não foi possível detectar o tipo de conexão - Usando padrão Home Office'
            };

        } catch (error) {
            console.warn('Erro ao detectar conexão de rede:', error);
            return {
                type: 'unknown',
                location: 'home-office',
                message: 'Erro na detecção - Usando padrão Home Office'
            };
        }
    }

    // Detectar localização baseada na rede (método alternativo usando IP local)
    static async detectLocationByIP() {
        try {
            // Criar conexão WebRTC para obter IP local
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            return new Promise((resolve) => {
                pc.createDataChannel('');
                pc.createOffer().then(offer => pc.setLocalDescription(offer));

                pc.onicecandidate = (event) => {
                    if (event.candidate) {
                        const candidate = event.candidate.candidate;
                        const match = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
                        
                        if (match) {
                            const ip = match[1];
                            
                            // IPs típicos de redes corporativas cabeadas
                            if (ip.startsWith('192.168.1.') || 
                                ip.startsWith('10.') || 
                                ip.startsWith('172.')) {
                                
                                // Heurística: IPs .1.x geralmente são cabeados em redes corporativas
                                if (ip.startsWith('192.168.1.')) {
                                    resolve({
                                        type: 'wired',
                                        location: 'presencial',
                                        message: 'Rede corporativa detectada - Modo Presencial',
                                        ip: ip
                                    });
                                } else {
                                    resolve({
                                        type: 'wifi',
                                        location: 'home-office',
                                        message: 'Rede doméstica detectada - Modo Home Office',
                                        ip: ip
                                    });
                                }
                            } else {
                                resolve({
                                    type: 'unknown',
                                    location: 'home-office',
                                    message: 'Tipo de rede desconhecida - Usando padrão Home Office',
                                    ip: ip
                                });
                            }
                        }
                    }
                };

                // Timeout fallback
                setTimeout(() => {
                    resolve({
                        type: 'unknown',
                        location: 'home-office',
                        message: 'Timeout na detecção - Usando padrão Home Office'
                    });
                }, 3000);

                pc.close();
            });

        } catch (error) {
            console.warn('Erro ao detectar IP local:', error);
            return {
                type: 'unknown',
                location: 'home-office',
                message: 'Erro na detecção por IP - Usando padrão Home Office'
            };
        }
    }

    // Obter localização geográfica do usuário
    static async getCurrentLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                resolve({
                    success: false,
                    error: 'Geolocalização não suportada pelo navegador',
                    latitude: null,
                    longitude: null,
                    accuracy: null,
                    address: 'Localização não disponível'
                });
                return;
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutos de cache
            };

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    
                    // Tentar obter endereço através de reverse geocoding
                    const address = await Utils.reverseGeocode(latitude, longitude);
                    
                    resolve({
                        success: true,
                        latitude: parseFloat(latitude.toFixed(6)),
                        longitude: parseFloat(longitude.toFixed(6)),
                        accuracy: Math.round(accuracy),
                        timestamp: new Date().toISOString(),
                        address: address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
                        zone: Utils.determineWorkZone(latitude, longitude)
                    });
                },
                (error) => {
                    let errorMessage = 'Erro desconhecido na geolocalização';
                    
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Permissão de localização negada pelo usuário';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Informações de localização indisponíveis';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Timeout na obtenção da localização';
                            break;
                    }
                    
                    resolve({
                        success: false,
                        error: errorMessage,
                        latitude: null,
                        longitude: null,
                        accuracy: null,
                        address: 'Localização não disponível'
                    });
                },
                options
            );
        });
    }

    // Reverse geocoding simples usando Nominatim (OpenStreetMap)
    static async reverseGeocode(latitude, longitude) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'TimesheetPro/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Erro na resposta do servidor');
            }

            const data = await response.json();
            
            if (data && data.display_name) {
                // Extrair partes relevantes do endereço
                const address = data.address || {};
                const parts = [];
                
                if (address.road) parts.push(address.road);
                if (address.house_number) parts.push(address.house_number);
                if (address.neighbourhood || address.suburb) {
                    parts.push(address.neighbourhood || address.suburb);
                }
                if (address.city || address.town || address.village) {
                    parts.push(address.city || address.town || address.village);
                }
                if (address.state) parts.push(address.state);
                
                return parts.length > 0 ? parts.join(', ') : data.display_name;
            }
            
            return null;
        } catch (error) {
            console.warn('Erro no reverse geocoding:', error);
            return null;
        }
    }

    // Determinar zona de trabalho baseada na localização
    static determineWorkZone(latitude, longitude) {
        // Configurações de zonas de trabalho (podem ser customizadas)
        const workZones = {
            office: {
                // Exemplo: escritório principal
                // latitude: -23.5505, longitude: -46.6333, radius: 0.5 // São Paulo
                enabled: false,
                latitude: null,
                longitude: null,
                radius: 0.5 // raio em km
            },
            homeOffice: {
                // Será definido automaticamente na primeira detecção de home office
                enabled: false,
                latitude: null,
                longitude: null,
                radius: 0.2 // raio menor para casa
            }
        };

        // Verificar se está dentro de alguma zona conhecida
        for (const [zoneName, zone] of Object.entries(workZones)) {
            if (zone.enabled && zone.latitude && zone.longitude) {
                const distance = Utils.calculateDistance(
                    latitude, longitude,
                    zone.latitude, zone.longitude
                );
                
                if (distance <= zone.radius) {
                    return {
                        type: zoneName,
                        distance: distance,
                        message: `Dentro da zona ${zoneName} (${distance.toFixed(2)}km)`
                    };
                }
            }
        }

        // Não está em zona conhecida
        return {
            type: 'unknown',
            distance: null,
            message: 'Localização fora das zonas cadastradas'
        };
    }

    // Calcular distância entre duas coordenadas (fórmula de Haversine)
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = Utils.toRadians(lat2 - lat1);
        const dLon = Utils.toRadians(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Utils.toRadians(lat1)) * Math.cos(Utils.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Converter graus para radianos
    static toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    // Combinar detecção de rede e localização
    static async getCompleteLocationInfo() {
        try {
            // Executar ambas as detecções em paralelo
            const [networkInfo, locationInfo] = await Promise.all([
                Utils.detectNetworkConnection(),
                Utils.getCurrentLocation()
            ]);

            // Analisar consistência entre rede e localização
            const analysis = Utils.analyzeLocationConsistency(networkInfo, locationInfo);

            return {
                network: networkInfo,
                location: locationInfo,
                analysis: analysis,
                timestamp: new Date().toISOString(),
                confidence: analysis.confidence
            };

        } catch (error) {
            console.error('Erro na detecção completa:', error);
            return {
                network: { type: 'unknown', location: 'home-office', message: 'Erro na detecção de rede' },
                location: { success: false, error: error.message, address: 'Localização não disponível' },
                analysis: { consistent: false, confidence: 'baixa', recommendation: 'home-office' },
                timestamp: new Date().toISOString(),
                confidence: 'baixa'
            };
        }
    }

    // Analisar consistência entre rede e localização
    static analyzeLocationConsistency(networkInfo, locationInfo) {
        const analysis = {
            consistent: false,
            confidence: 'baixa',
            recommendation: 'home-office',
            details: []
        };

        // Se não temos localização, usar apenas rede
        if (!locationInfo.success) {
            analysis.recommendation = networkInfo.location;
            analysis.confidence = 'média';
            analysis.details.push('Baseado apenas em informações de rede');
            return analysis;
        }

        // Se temos localização e rede
        if (networkInfo.type === 'wired' && locationInfo.zone?.type === 'office') {
            analysis.consistent = true;
            analysis.confidence = 'alta';
            analysis.recommendation = 'presencial';
            analysis.details.push('Rede cabeada + localização no escritório');
        } else if (networkInfo.type === 'wifi' && locationInfo.zone?.type === 'homeOffice') {
            analysis.consistent = true;
            analysis.confidence = 'alta';
            analysis.recommendation = 'home-office';
            analysis.details.push('WiFi + localização em casa');
        } else if (networkInfo.type === 'wired') {
            analysis.confidence = 'média';
            analysis.recommendation = 'presencial';
            analysis.details.push('Rede cabeada detectada - provável escritório');
        } else if (networkInfo.type === 'wifi') {
            analysis.confidence = 'média';
            analysis.recommendation = 'home-office';
            analysis.details.push('WiFi detectado - provável home office');
        } else {
            analysis.confidence = 'baixa';
            analysis.recommendation = 'home-office';
            analysis.details.push('Informações insuficientes para determinação precisa');
        }

        return analysis;
    }
}

// Exportar para uso global
window.Utils = Utils;
