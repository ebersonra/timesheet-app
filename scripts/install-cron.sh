#!/bin/bash

# ========================================
# TimesheetPro - Instalador Automático do Crontab
# ========================================

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
APP_DIR="/Users/eberson/Documents/_Developer/_Dev/_timesheet"
SCRIPTS_DIR="$APP_DIR/scripts"
BACKUP_DIR="$HOME/.timesheet-cron-backup"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}TimesheetPro - Instalador do Crontab${NC}"
echo -e "${BLUE}========================================${NC}"

# Verificar se os scripts existem
if [ ! -f "$SCRIPTS_DIR/start-timesheet.sh" ] || [ ! -f "$SCRIPTS_DIR/stop-timesheet.sh" ]; then
    echo -e "${RED}ERRO: Scripts não encontrados em $SCRIPTS_DIR${NC}"
    exit 1
fi

# Criar backup do crontab atual
echo -e "${YELLOW}Criando backup do crontab atual...${NC}"
mkdir -p "$BACKUP_DIR"
crontab -l > "$BACKUP_DIR/crontab-backup-$(date +%Y%m%d-%H%M%S).txt" 2>/dev/null || echo "# Nenhum crontab existente" > "$BACKUP_DIR/crontab-backup-$(date +%Y%m%d-%H%M%S).txt"

# Função para mostrar menu
show_menu() {
    echo ""
    echo -e "${BLUE}Escolha o tipo de configuração:${NC}"
    echo "1) Desenvolvimento (segunda a sexta, 8h-18h)"
    echo "2) Produção 24/7 (com reinicialização semanal)"
    echo "3) Personalizado"
    echo "4) Apenas @reboot (inicialização do sistema)"
    echo "5) Remover todas as entradas do TimesheetPro"
    echo "6) Cancelar"
    echo ""
    read -p "Escolha uma opção (1-6): " choice
}

# Configurações predefinidas
setup_development() {
    echo -e "${GREEN}Configurando para desenvolvimento (segunda a sexta)...${NC}"
    
    # Remover entradas existentes do TimesheetPro
    crontab -l 2>/dev/null | grep -v "timesheet" > /tmp/new_crontab
    
    # Adicionar novas entradas
    echo "# TimesheetPro - Configuração de Desenvolvimento" >> /tmp/new_crontab
    echo "0 8 * * 1-5 $SCRIPTS_DIR/start-timesheet.sh" >> /tmp/new_crontab
    echo "0 18 * * 1-5 $SCRIPTS_DIR/stop-timesheet.sh" >> /tmp/new_crontab
    echo "" >> /tmp/new_crontab
    
    # Instalar novo crontab
    crontab /tmp/new_crontab
    rm /tmp/new_crontab
    
    echo -e "${GREEN}Configuração instalada:${NC}"
    echo "- Iniciar: Segunda a Sexta às 8:00 AM"
    echo "- Parar: Segunda a Sexta às 18:00 PM"
}

setup_production() {
    echo -e "${GREEN}Configurando para produção 24/7...${NC}"
    
    # Remover entradas existentes do TimesheetPro
    crontab -l 2>/dev/null | grep -v "timesheet" > /tmp/new_crontab
    
    # Adicionar novas entradas
    echo "# TimesheetPro - Configuração de Produção 24/7" >> /tmp/new_crontab
    echo "@reboot $SCRIPTS_DIR/start-timesheet.sh" >> /tmp/new_crontab
    echo "0 3 * * 0 $SCRIPTS_DIR/stop-timesheet.sh && sleep 10 && $SCRIPTS_DIR/start-timesheet.sh" >> /tmp/new_crontab
    echo "" >> /tmp/new_crontab
    
    # Instalar novo crontab
    crontab /tmp/new_crontab
    rm /tmp/new_crontab
    
    echo -e "${GREEN}Configuração instalada:${NC}"
    echo "- Iniciar: Na inicialização do sistema"
    echo "- Reiniciar: Todo domingo às 3:00 AM (manutenção)"
}

setup_custom() {
    echo -e "${YELLOW}Configuração personalizada...${NC}"
    echo ""
    echo "Digite os horários desejados (formato: minuto hora dia mês dia_da_semana)"
    echo "Exemplos:"
    echo "  0 8 * * * (todo dia às 8:00)"
    echo "  0 9 * * 1-5 (segunda a sexta às 9:00)"
    echo "  */30 * * * * (a cada 30 minutos)"
    echo ""
    
    read -p "Horário para INICIAR (ou ENTER para pular): " start_time
    read -p "Horário para PARAR (ou ENTER para pular): " stop_time
    
    # Remover entradas existentes do TimesheetPro
    crontab -l 2>/dev/null | grep -v "timesheet" > /tmp/new_crontab
    
    # Adicionar novas entradas
    echo "# TimesheetPro - Configuração Personalizada" >> /tmp/new_crontab
    
    if [ -n "$start_time" ]; then
        echo "$start_time $SCRIPTS_DIR/start-timesheet.sh" >> /tmp/new_crontab
    fi
    
    if [ -n "$stop_time" ]; then
        echo "$stop_time $SCRIPTS_DIR/stop-timesheet.sh" >> /tmp/new_crontab
    fi
    
    echo "" >> /tmp/new_crontab
    
    # Instalar novo crontab
    crontab /tmp/new_crontab
    rm /tmp/new_crontab
    
    echo -e "${GREEN}Configuração personalizada instalada!${NC}"
}

setup_reboot_only() {
    echo -e "${GREEN}Configurando apenas inicialização automática...${NC}"
    
    # Remover entradas existentes do TimesheetPro
    crontab -l 2>/dev/null | grep -v "timesheet" > /tmp/new_crontab
    
    # Adicionar nova entrada
    echo "# TimesheetPro - Inicialização Automática" >> /tmp/new_crontab
    echo "@reboot $SCRIPTS_DIR/start-timesheet.sh" >> /tmp/new_crontab
    echo "" >> /tmp/new_crontab
    
    # Instalar novo crontab
    crontab /tmp/new_crontab
    rm /tmp/new_crontab
    
    echo -e "${GREEN}Configuração instalada:${NC}"
    echo "- Iniciar: Apenas na inicialização do sistema"
}

remove_timesheet_cron() {
    echo -e "${YELLOW}Removendo todas as entradas do TimesheetPro...${NC}"
    
    # Remover entradas do TimesheetPro
    crontab -l 2>/dev/null | grep -v -i "timesheet" > /tmp/new_crontab
    
    # Instalar novo crontab
    crontab /tmp/new_crontab
    rm /tmp/new_crontab
    
    echo -e "${GREEN}Todas as entradas do TimesheetPro foram removidas!${NC}"
}

# Menu principal
show_menu

case $choice in
    1)
        setup_development
        ;;
    2)
        setup_production
        ;;
    3)
        setup_custom
        ;;
    4)
        setup_reboot_only
        ;;
    5)
        remove_timesheet_cron
        ;;
    6)
        echo -e "${YELLOW}Instalação cancelada.${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}Opção inválida!${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Crontab atualizado com sucesso!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Para verificar as entradas instaladas:${NC}"
echo "crontab -l"
echo ""
echo -e "${YELLOW}Para ver logs da aplicação:${NC}"
echo "tail -f $APP_DIR/logs/timesheet.log"
echo ""
echo -e "${YELLOW}Para restaurar backup (se necessário):${NC}"
echo "crontab $BACKUP_DIR/crontab-backup-*.txt"
echo ""
echo -e "${GREEN}Configuração concluída!${NC}"
