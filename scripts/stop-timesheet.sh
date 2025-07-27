#!/bin/bash

# ========================================
# TimesheetPro - Script de Parada
# ========================================

# Configurações
APP_NAME="TimesheetPro"
APP_DIR="/Users/eberson/Documents/_Developer/_Dev/_timesheet"
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

# Verificar se está rodando
check_running() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null 2>&1; then
            return 0
        else
            log_color "PID file existe mas processo não está rodando. Removendo PID file..." "$YELLOW"
            rm -f "$PID_FILE"
            return 1
        fi
    else
        return 1
    fi
}

# Parar aplicação graciosamente
stop_graceful() {
    local PID=$1
    log_color "Parando $APP_NAME graciosamente (PID: $PID)..." "$BLUE"
    
    # Enviar SIGTERM
    kill -TERM $PID 2>/dev/null
    
    # Aguardar até 10 segundos para parada graciosa
    local count=0
    while [ $count -lt 10 ]; do
        if ! ps -p $PID > /dev/null 2>&1; then
            log_color "$APP_NAME parado graciosamente!" "$GREEN"
            return 0
        fi
        sleep 1
        count=$((count + 1))
    done
    
    return 1
}

# Parar aplicação forçadamente
stop_force() {
    local PID=$1
    log_color "Forçando parada do $APP_NAME (PID: $PID)..." "$YELLOW"
    
    # Enviar SIGKILL
    kill -KILL $PID 2>/dev/null
    
    # Aguardar 3 segundos
    sleep 3
    
    if ! ps -p $PID > /dev/null 2>&1; then
        log_color "$APP_NAME parado forçadamente!" "$GREEN"
        return 0
    else
        log_color "ERRO: Não foi possível parar $APP_NAME!" "$RED"
        return 1
    fi
}

# Parar todos os processos Node.js relacionados ao TimesheetPro
stop_all_related() {
    log_color "Verificando processos Node.js relacionados ao TimesheetPro..." "$BLUE"
    
    # Buscar processos que contenham "timesheet" ou "server.js"
    RELATED_PIDS=$(ps aux | grep -E "(timesheet|server\.js)" | grep -v grep | awk '{print $2}')
    
    if [ -n "$RELATED_PIDS" ]; then
        log_color "Encontrados processos relacionados: $RELATED_PIDS" "$YELLOW"
        
        for pid in $RELATED_PIDS; do
            if ps -p $pid > /dev/null 2>&1; then
                log_color "Parando processo relacionado (PID: $pid)..." "$BLUE"
                kill -TERM $pid 2>/dev/null
                sleep 2
                
                if ps -p $pid > /dev/null 2>&1; then
                    log_color "Forçando parada do processo (PID: $pid)..." "$YELLOW"
                    kill -KILL $pid 2>/dev/null
                fi
            fi
        done
    else
        log_color "Nenhum processo relacionado encontrado." "$GREEN"
    fi
}

# Limpar recursos
cleanup() {
    log_color "Limpando recursos..." "$BLUE"
    
    # Remover PID file
    if [ -f "$PID_FILE" ]; then
        rm -f "$PID_FILE"
        log_color "PID file removido." "$GREEN"
    fi
    
    # Verificar se a porta 3000 ainda está em uso
    if command -v lsof &> /dev/null; then
        PORT_PROCESS=$(lsof -ti:3000)
        if [ -n "$PORT_PROCESS" ]; then
            log_color "Porta 3000 ainda em uso por processo $PORT_PROCESS. Liberando..." "$YELLOW"
            kill -TERM $PORT_PROCESS 2>/dev/null
            sleep 2
            
            # Verificar novamente
            PORT_PROCESS=$(lsof -ti:3000)
            if [ -n "$PORT_PROCESS" ]; then
                kill -KILL $PORT_PROCESS 2>/dev/null
                log_color "Porta 3000 liberada forçadamente." "$GREEN"
            else
                log_color "Porta 3000 liberada." "$GREEN"
            fi
        fi
    fi
}

# Verificar status após parada
verify_stopped() {
    log_color "Verificando se $APP_NAME foi parado completamente..." "$BLUE"
    
    # Verificar se ainda há processos relacionados
    REMAINING=$(ps aux | grep -E "(timesheet|server\.js)" | grep -v grep | wc -l)
    
    if [ $REMAINING -eq 0 ]; then
        log_color "$APP_NAME parado completamente!" "$GREEN"
        
        # Verificar se a porta está liberada
        if command -v curl &> /dev/null; then
            if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
                log_color "Porta 3000 liberada com sucesso!" "$GREEN"
            else
                log_color "AVISO: Algo ainda está respondendo na porta 3000" "$YELLOW"
            fi
        fi
    else
        log_color "AVISO: Ainda há $REMAINING processo(s) relacionado(s) rodando" "$YELLOW"
        ps aux | grep -E "(timesheet|server\.js)" | grep -v grep | tee -a "$LOG_FILE"
    fi
}

# Função principal
main() {
    log_color "=== PARANDO $APP_NAME ===" "$BLUE"
    
    # Verificar se está rodando
    if ! check_running; then
        log_color "$APP_NAME não está rodando." "$YELLOW"
        
        # Ainda assim, verificar processos relacionados
        stop_all_related
        cleanup
        exit 0
    fi
    
    # Obter PID
    PID=$(cat "$PID_FILE")
    
    # Tentar parada graciosa primeiro
    if stop_graceful $PID; then
        cleanup
        verify_stopped
        log_color "=== $APP_NAME PARADO COM SUCESSO ===" "$GREEN"
        exit 0
    fi
    
    # Se parada graciosa falhou, forçar parada
    log_color "Parada graciosa falhou. Tentando parada forçada..." "$YELLOW"
    
    if stop_force $PID; then
        cleanup
        verify_stopped
        log_color "=== $APP_NAME PARADO FORÇADAMENTE ===" "$GREEN"
        exit 0
    fi
    
    # Se ainda não parou, tentar parar todos os processos relacionados
    log_color "Parada forçada falhou. Parando todos os processos relacionados..." "$RED"
    stop_all_related
    cleanup
    verify_stopped
    
    log_color "=== TENTATIVA DE PARADA CONCLUÍDA ===" "$YELLOW"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [opções]"
    echo ""
    echo "Opções:"
    echo "  -h, --help     Mostrar esta ajuda"
    echo "  -f, --force    Forçar parada imediatamente"
    echo "  -a, --all      Parar todos os processos relacionados"
    echo ""
    echo "Exemplos:"
    echo "  $0              # Parada normal (graciosa)"
    echo "  $0 --force      # Parada forçada"
    echo "  $0 --all        # Parar todos os processos relacionados"
}

# Processar argumentos
case "${1:-}" in
    -h|--help)
        show_help
        exit 0
        ;;
    -f|--force)
        log_color "=== PARADA FORÇADA SOLICITADA ===" "$YELLOW"
        if check_running; then
            PID=$(cat "$PID_FILE")
            stop_force $PID
        fi
        stop_all_related
        cleanup
        verify_stopped
        exit 0
        ;;
    -a|--all)
        log_color "=== PARANDO TODOS OS PROCESSOS RELACIONADOS ===" "$YELLOW"
        stop_all_related
        cleanup
        verify_stopped
        exit 0
        ;;
    "")
        # Execução normal
        main "$@"
        ;;
    *)
        echo "Opção inválida: $1"
        show_help
        exit 1
        ;;
esac
