# 🕒 Scripts de Automação - TimesheetPro

## 📁 Scripts Criados

### 1. **start-timesheet.sh** - Script de Inicialização
- ✅ Verifica dependências (Node.js, npm)
- ✅ Instala dependências se necessário
- ✅ Verifica se já está rodando
- ✅ Inicia aplicação em background
- ✅ Salva PID para controle
- ✅ Gera logs detalhados
- ✅ Verifica se servidor está respondendo

### 2. **stop-timesheet.sh** - Script de Parada
- ✅ Parada graciosa (SIGTERM)
- ✅ Parada forçada (SIGKILL) se necessário
- ✅ Remove processos relacionados
- ✅ Libera porta 3000
- ✅ Limpa arquivos temporários
- ✅ Opções de linha de comando

### 3. **install-cron.sh** - Instalador Automático
- ✅ Menu interativo
- ✅ Backup automático do crontab
- ✅ Configurações predefinidas
- ✅ Opção personalizada
- ✅ Remoção segura

## 🚀 Como Usar

### Instalação Rápida (Recomendado):
```bash
cd /Users/eberson/Documents/_Developer/_Dev/_timesheet
./scripts/install-cron.sh
```

### Instalação Manual:
```bash
# 1. Editar crontab
crontab -e

# 2. Adicionar uma das configurações abaixo
```

## ⏰ Configurações Disponíveis

### 🏢 **Desenvolvimento** (Segunda a Sexta)
```bash
# Iniciar às 8:00 AM (seg-sex)
0 8 * * 1-5 /Users/eberson/Documents/_Developer/_Dev/_timesheet/scripts/start-timesheet.sh

# Parar às 18:00 PM (seg-sex)
0 18 * * 1-5 /Users/eberson/Documents/_Developer/_Dev/_timesheet/scripts/stop-timesheet.sh
```

### 🏭 **Produção 24/7**
```bash
# Iniciar na inicialização
@reboot /Users/eberson/Documents/_Developer/_Dev/_timesheet/scripts/start-timesheet.sh

# Reiniciar domingo às 3:00 AM (manutenção)
0 3 * * 0 /Users/eberson/Documents/_Developer/_Dev/_timesheet/scripts/stop-timesheet.sh && sleep 10 && /Users/eberson/Documents/_Developer/_Dev/_timesheet/scripts/start-timesheet.sh
```

### 🔧 **Apenas Inicialização**
```bash
# Iniciar apenas quando o Mac ligar
@reboot /Users/eberson/Documents/_Developer/_Dev/_timesheet/scripts/start-timesheet.sh
```

## 📋 Comandos Úteis

### Scripts Manuais:
```bash
# Iniciar aplicação
./scripts/start-timesheet.sh

# Parar aplicação (graciosa)
./scripts/stop-timesheet.sh

# Parar aplicação (forçada)
./scripts/stop-timesheet.sh --force

# Parar todos os processos relacionados
./scripts/stop-timesheet.sh --all
```

### Gerenciar Crontab:
```bash
# Ver crontab atual
crontab -l

# Editar crontab
crontab -e

# Remover todo o crontab
crontab -r

# Instalar configuração automática
./scripts/install-cron.sh
```

### Logs e Debug:
```bash
# Ver logs da aplicação
tail -f logs/timesheet.log

# Ver logs de erro
tail -f logs/timesheet-error.log

# Ver logs do sistema (cron)
tail -f /var/log/system.log | grep cron

# Verificar se está rodando
ps aux | grep server.js

# Verificar porta 3000
lsof -i:3000
```

## 🛠️ Solução de Problemas

### 1. **Cron não executa no macOS**
```bash
# Dar permissão total ao Terminal
# Sistema > Privacidade > Acesso Completo ao Disco > + Terminal
```

### 2. **Paths não encontrados**
```bash
# Verificar paths do Node.js
which node
which npm

# Editar scripts se necessário com paths absolutos
```

### 3. **Debug do Cron**
```bash
# Adicionar logs ao crontab
0 8 * * * /path/to/script.sh >> /tmp/cron.log 2>&1

# Verificar se cron está rodando
sudo launchctl list | grep cron
```

### 4. **Verificar Status**
```bash
# Status do TimesheetPro
curl http://localhost:3000/api/health

# Processos Node.js
ps aux | grep node

# Usar o próprio script para debug
./scripts/start-timesheet.sh  # Mostra logs coloridos
```

## 📝 Exemplo de Uso Completo

```bash
# 1. Instalar configuração para desenvolvimento
cd /Users/eberson/Documents/_Developer/_Dev/_timesheet
./scripts/install-cron.sh
# Escolher opção 1 (Desenvolvimento)

# 2. Testar manualmente
./scripts/start-timesheet.sh
curl http://localhost:3000
./scripts/stop-timesheet.sh

# 3. Verificar crontab
crontab -l

# 4. Aguardar horário programado ou reiniciar Mac
```

## 🔧 Personalização

### Alterar Horários:
Edite o crontab ou use o instalador personalizado:
```bash
./scripts/install-cron.sh
# Escolher opção 3 (Personalizado)
```

### Alterar Paths:
Se o TimesheetPro estiver em outro local, edite as variáveis nos scripts:
```bash
# Editar em start-timesheet.sh e stop-timesheet.sh
APP_DIR="/seu/novo/caminho/timesheet"
```

### Adicionar Notificações:
```bash
# Adicionar ao final dos scripts
osascript -e 'display notification "TimesheetPro iniciado!" with title "Sistema"'
```

---

## ✅ **Scripts Prontos para Uso!**

Os scripts estão configurados e testados para:
- ✅ **Inicialização automática**
- ✅ **Parada controlada**
- ✅ **Logs detalhados**
- ✅ **Tratamento de erros**
- ✅ **Múltiplas opções de configuração**

**Execute `./scripts/install-cron.sh` para começar!** 🚀
