#!/bin/bash

# ========================================
# TimesheetPro - Script de Inicialização
# ========================================

# Configurações
APP_NAME="TimesheetPro"
APP_DIR="/Users/eberson/Documents/_Developer/_Dev/_timesheet"
NODE_CMD="/usr/local/bin/node"
NPM_CMD="/usr/local/bin/npm"
PID_FILE="$APP_DIR/timesheet.pid"
LOG_FILE="$APP_DIR/logs/timesheet.log"
ERROR_LOG="$APP_DIR/logs/timesheet-error.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Função para logging com cor
log_color() {
    echo -e "${2}$(date '+%Y-%m-%d %H:%M:%S') - $1${NC}" | tee -a "$LOG_FILE"
}

# Verificar se já está rodando
check_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            log_color "$APP_NAME já está rodando (PID: $PID)" "$YELLOW"
            return 0
        else
            log_color "PID file existe mas processo não está rodando. Removendo PID file..." "$YELLOW"
            rm -f "$PID_FILE"
        fi
    fi
    return 1
}

# Criar diretório de logs se não existir
create_log_dir() {
    mkdir -p "$(dirname "$LOG_FILE")"
    mkdir -p "$(dirname "$ERROR_LOG")"
}

# Verificar dependências
check_dependencies() {
    log_color "Verificando dependências..." "$BLUE"
    
    # Verificar se Node.js está instalado
    if ! command -v node &> /dev/null; then
        log_color "ERRO: Node.js não encontrado. Instale o Node.js primeiro." "$RED"
        exit 1
    fi
    
    # Verificar se npm está instalado
    if ! command -v npm &> /dev/null; then
        log_color "ERRO: npm não encontrado. Instale o npm primeiro." "$RED"
        exit 1
    fi
    
    # Verificar se o diretório da aplicação existe
    if [ ! -d "$APP_DIR" ]; then
        log_color "ERRO: Diretório da aplicação não encontrado: $APP_DIR" "$RED"
        exit 1
    fi
    
    # Verificar se package.json existe
    if [ ! -f "$APP_DIR/package.json" ]; then
        log_color "ERRO: package.json não encontrado em $APP_DIR" "$RED"
        exit 1
    fi
    
    log_color "Dependências OK!" "$GREEN"
}

# Instalar dependências se necessário
install_dependencies() {
    cd "$APP_DIR" || exit 1
    
    if [ ! -d "node_modules" ]; then
        log_color "Instalando dependências..." "$BLUE"
        npm install >> "$LOG_FILE" 2>> "$ERROR_LOG"
        
        if [ $? -eq 0 ]; then
            log_color "Dependências instaladas com sucesso!" "$GREEN"
        else
            log_color "ERRO: Falha ao instalar dependências. Verifique $ERROR_LOG" "$RED"
            exit 1
        fi
    fi
}

# Iniciar aplicação
start_app() {
    cd "$APP_DIR" || exit 1
    
    log_color "Iniciando $APP_NAME..." "$BLUE"
    
    # Iniciar aplicação em background
    nohup $NODE_CMD server.js >> "$LOG_FILE" 2>> "$ERROR_LOG" &
    APP_PID=$!
    
    # Salvar PID
    echo $APP_PID > "$PID_FILE"
    
    # Aguardar um pouco para verificar se iniciou corretamente
    sleep 3
    
    if ps -p $APP_PID > /dev/null 2>&1; then
        log_color "$APP_NAME iniciado com sucesso! (PID: $APP_PID)" "$GREEN"
        log_color "Acesse: http://localhost:3000" "$GREEN"
        
        # Verificar se o servidor está respondendo
        if command -v curl &> /dev/null; then
            sleep 2
            if curl -s http://localhost:3000/api/health > /dev/null; then
                log_color "Servidor está respondendo corretamente!" "$GREEN"
            else
                log_color "AVISO: Servidor pode não estar respondendo na porta 3000" "$YELLOW"
            fi
        fi
    else
        log_color "ERRO: Falha ao iniciar $APP_NAME. Verifique $ERROR_LOG" "$RED"
        rm -f "$PID_FILE"
        exit 1
    fi
}

# Função principal
main() {
    log_color "=== INICIANDO $APP_NAME ===" "$BLUE"
    
    create_log_dir
    
    # Verificar se já está rodando
    if check_running; then
        exit 0
    fi
    
    check_dependencies
    install_dependencies
    start_app
    
    log_color "=== $APP_NAME INICIADO COM SUCESSO ===" "$GREEN"
}

# Executar função principal
main "$@"
