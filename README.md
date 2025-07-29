# TimesheetPro - Sistema de Controle de Ponto Multi-usuário

Sistema moderno, responsivo e multi-usuário para controle de ponto com cálculo automático de horas extras e gestão de presencial.

## 🚀 Características

- **Sistema Multi-usuário**: Autenticação, cadastro e gestão de múltiplos usuários
- **Interface Moderna**: Design responsivo com CSS Grid e Flexbox
- **Cálculos Automáticos**: Horas extras, tempo de almoço, valores monetários
- **Controle Presencial**: Acompanhamento de dias presenciais e percentual obrigatório
- **Armazenamento Local**: Dados isolados por usuário no localStorage
- **Exportação CSV**: Exportar dados individuais ou por departamento
- **Sistema de Backup**: Backup automático e lembretes periódicos
- **Padrão MVC**: Arquitetura escalável e organizada
- **PWA Ready**: Preparado para ser Progressive Web App

## 📁 Estrutura do Projeto

```
timesheet/
├── package.json           # Dependências Node.js
├── server.js             # Servidor Express (Padrão MVC)
├── index.html            # Interface principal da aplicação
├── login.html            # Tela de login e cadastro
├── static/
│   ├── css/
│   │   ├── main.css      # Estilos principais
│   │   ├── components.css # Componentes UI
│   │   ├── responsive.css # Media queries
│   │   └── auth.css      # Estilos de autenticação
│   └── js/
│       ├── utils.js      # Utilitários gerais
│       ├── storage.js    # Gerenciamento localStorage
│       ├── calculator.js # Cálculos de timesheet
│       ├── components.js # Componentes UI
│       ├── user-manager.js # Gestão de usuários
│       ├── auth.js       # Sistema de autenticação
│       ├── backup-reminder.js # Sistema de backup
│       ├── fix-dates.js  # Correção de datas
│       └── app.js       # Aplicação principal (MVC)
```

## 🛠️ Instalação e Execução

### 1. Instalar dependências
```bash
npm install
```

### 2. Executar servidor
```bash
npm start
# ou para desenvolvimento
npm run dev
```

### 3. Acessar aplicação
```
http://localhost:3000
```

**Primeiro acesso**: O sistema redirecionará automaticamente para a tela de login (`/login.html`) onde você pode:
- **Cadastrar** um novo usuário com nome, email, departamento
- **Fazer login** com credenciais existentes

Após autenticação, você será redirecionado para a aplicação principal (`/index.html`).

## 💡 Funcionalidades

### ✅ Implementadas

1. **Sistema de Autenticação**
   - Tela de login e cadastro
   - Hash de senhas (implementação básica)
   - Sessões de usuário
   - Menu de usuário com perfil e logout
   - Redirecionamento automático

2. **Gestão Multi-usuário**
   - Cadastro com nome, email e departamento
   - Isolamento de dados por usuário
   - Filtros por usuário na interface
   - Estatísticas individualizadas
   - Controle de acesso

3. **Registro de Ponto**
   - Data e hora de entrada/saída
   - Horário de almoço (opcional)
   - Seleção de turno/observação (predefinida)
   - Status SAP (Pendente, Concluído, Presencial)
   - Validação em tempo real
   - Vinculação automática ao usuário logado

4. **Controle de Presencial**
   - Acompanhamento de dias presenciais (meta: 8 dias)
   - Percentual presencial (mínimo: 40%)
   - Cards visuais com indicadores de status
   - Diferenciação entre trabalho presencial e remoto

5. **Cálculos Automáticos**
   - Total bruto de horas trabalhadas
   - Desconto do tempo de almoço
   - Total líquido de horas
   - Horas extras (baseado em 8h normais)
   - Valor monetário das horas extras (50% adicional)
   - **Modo CLT**: Cálculos conforme legislação trabalhista brasileira
   - **Adicional Noturno**: 20% para trabalho entre 22h-5h (CLT Art. 73)
   - **Horas Extras CLT**: Limitadas a 2h/dia, 50% mínimo (CLT Art. 59)
   - **Validações CLT**: Intervalos obrigatórios e limites de jornada

3. **Interface Responsiva**
   - Design moderno com CSS Grid/Flexbox
   - Adaptação para mobile/tablet
   - Animações e transições suaves
   - Menu de usuário responsivo
   - Layout otimizado para diferentes telas

4. **Gerenciamento de Dados**
   - Armazenamento isolado por usuário
   - Backup automático com lembretes (7 dias)
   - Busca e filtros avançados
   - Filtro por usuário, turno e status SAP
   - Estatísticas em tempo real por usuário

5. **Sistema de Backup**
   - Backup automático local
   - Lembretes periódicos (configurável)
   - Exportação CSV individual
   - Restauração de backup

6. **Exportação e Relatórios**
   - Exportar para CSV com dados completos
   - Formato compatível com Excel
   - Dados incluem status SAP e informações do usuário
   - **Relatórios CLT**: Informações de conformidade e valores específicos
   - **Campos CLT**: Adicional noturno, status de conformidade, validações
   - Relatórios individuais por funcionário

### 🔄 Próximas Versões

1. **Aprimoramentos de Autenticação**
   - Recuperação de senha
   - Autenticação 2FA
   - Integração com OAuth (Google, Microsoft)
   - Níveis de permissão (Admin, Usuário)

2. **Relatórios Avançados**
   - Dashboard administrativo
   - Relatórios mensais/anuais por departamento
   - Gráficos de produtividade
   - Análise de padrões de trabalho
   - Comparativos entre usuários

3. **Funcionalidades Administrativas**
   - Gestão de usuários pelo admin
   - Configuração de departamentos
   - Definição de metas personalizadas
   - Aprovação de registros

4. **Importação de Dados**
   - Importar CSV com dados de usuários
   - Migração de outras ferramentas
   - Importação em lote

3. **Configurações Avançadas**
   - Jornada de trabalho personalizada por usuário
   - Diferentes tipos de hora extra
   - Configuração de feriados por departamento
   - Temas customizáveis

4. **PWA Completo**
   - Service Worker
   - Notificações push para lembretes
   - Trabalho offline
   - Sincronização automática

5. **Integrações**
   - API REST para integrações externas
   - Webhook para sistemas de RH
   - Integração com sistemas de ponto eletrônico

## 📋 Conformidade CLT

### **Características do Modo CLT**

O sistema agora possui **modo CLT completo** que implementa todas as regras da Consolidação das Leis do Trabalho brasileira:

#### **Horas Extras (CLT Art. 59)**
- ✅ **Adicional mínimo**: 50% sobre valor da hora normal
- ✅ **Domingos/Feriados**: 100% de adicional quando não compensados
- ✅ **Limite diário**: Máximo 2 horas extras por dia
- ✅ **Jornada máxima**: 10 horas diárias (8h normais + 2h extras)

#### **Adicional Noturno (CLT Art. 73)**
- ✅ **Horário noturno**: 22h às 5h (urbano)
- ✅ **Adicional**: 20% sobre valor da hora normal
- ✅ **Hora reduzida**: 52min30s (cada hora noturna)
- ✅ **Cálculo automático**: Detecção de período noturno

#### **Validações Legais**
- ✅ **Intervalos obrigatórios**: 15min (>4h) ou 1h (>6h) - CLT Art. 71
- ✅ **Limite de jornada**: Máximo 10h diárias conforme CLT
- ✅ **Intervalo entre jornadas**: Mínimo 11h entre turnos (CLT Art. 66)
- ✅ **Alertas visuais**: Avisos de não conformidade

#### **Relatórios de Conformidade**
```javascript
// Exemplo de relatório gerado
{
  totalRegistros: 20,
  conformes: 18,
  comAvisos: 2,
  comErros: 0,
  violacoes: [
    {
      registro: 5,
      data: "2025-01-15",
      tipo: "aviso",
      descricao: "Jornada > 6h requer intervalo mínimo de 1h"
    }
  ],
  estatisticas: {
    totalHorasExtras: "40:30",
    totalValorHE: 1250.50,
    totalHorasNoturnas: "8:15", 
    totalValorNoturno: 180.75
  }
}
```

### **Como Usar o Modo CLT**

1. **Ativar CLT**: Marque a opção "Aplicar Regras CLT" no formulário
2. **Preencher dados**: Horários de entrada, saída e valor/hora
3. **Calcular**: Sistema aplica automaticamente todas as regras CLT
4. **Verificar avisos**: Revise alertas de conformidade se houver
5. **Exportar**: Relatório CSV inclui campos específicos CLT

### **Benefícios da Implementação CLT**

- 🏢 **Conformidade empresarial**: Atende fiscalização trabalhista
- ⚖️ **Redução de riscos**: Evita multas e processos trabalhistas  
- 📊 **Transparência**: Cálculos corretos para funcionários
- 📋 **Auditoria facilitada**: Relatórios detalhados de conformidade
- 💰 **Precisão financeira**: Valores exatos conforme legislação

## 🎯 Padrões Utilizados

### **MVC (Model-View-Controller)**
- **Model**: `StorageManager`, `UserManager` - Gerencia dados e usuários
- **View**: HTML/CSS - Interface do usuário  
- **Controller**: `TimesheetApp`, `AuthManager` - Lógica de negócio e autenticação

### **Outros Padrões**
- **Singleton**: Classes principais são instanciadas uma vez
- **Observer**: Event listeners para reatividade
- **Strategy**: Diferentes calculadoras para cenários específicos
- **Factory**: Geração de IDs e elementos DOM
- **Module Pattern**: Organização do código em módulos independentes

## 🔧 Configuração

### Configurações Padrão
```javascript
// Configurações podem ser alteradas em:
static/js/calculator.js (modo tradicional)
static/js/calculator-clt.js (modo CLT)

// Configurações Tradicionais
- Jornada normal: 8 horas
- Adicional HE: 50%
- Formato de hora: HH:MM
- Moeda: BRL (Real)

// Configurações CLT
- Jornada normal: 8 horas (CLT Art. 58)
- Adicional HE mínimo: 50% (CLT Art. 59)
- Adicional noturno: 20% (CLT Art. 73)
- Hora noturna: 52min30s (período reduzido)
- Limite HE diário: 2 horas máximo
- Período noturno: 22h às 5h (urbano)
```

### Personalização de Turnos
```javascript
// Turnos disponíveis (configurável em index.html)
const TURNOS = [
  'Horário Comercial',
  'Extra Noturno', 
  'Plantão',
  'Home Office',
  'Sobreaviso',
  'Feriado',
  'Final de Semana',
  'Emergência'
];
```

## 📈 Métricas e Estatísticas

### Cards de Dashboard (Por Usuário)
1. **Total de Registros**: Quantidade de pontos registrados
2. **Horas Trabalhadas**: Soma total de horas líquidas
3. **Horas Extras**: Total de horas extras acumuladas
4. **Valor HE Acumulado**: Valor monetário das horas extras
5. **Dias Presenciais**: Contador atual vs. meta (X/8)
6. **% Presencial**: Percentual atual vs. mínimo (40%)

### Indicadores Visuais
- 🟢 **Verde**: Meta atingida ou acima do esperado
- 🟡 **Amarelo**: Em progresso, atenção necessária
- 🔵 **Azul**: Informação neutra
- 🔴 **Vermelho**: Abaixo do esperado ou erro

## 📊 Exemplos de Uso

### Primeiro Acesso - Cadastro
```
1. Acesse http://localhost:3000
2. Clique em "Cadastre-se"
3. Preencha: Nome, Email, Senha, Departamento
4. Faça login automático após cadastro
```

### Registro - Turno Comercial
```
Usuário: João Silva (TI)
Entrada: 08:00 (25/07)
Saída: 17:00 (25/07)
Almoço: 12:00 - 13:00
Turno: Horário Comercial
Status SAP: Pendente
Resultado: 8h normais, 0h extras
```

### Registro - Trabalho Presencial
```
Usuário: Maria Santos (RH)
Entrada: 09:00 (26/07)
Saída: 18:00 (26/07)
Almoço: 12:30 - 13:30
Turno: Horário Comercial
Status SAP: Presencial
Resultado: 8h normais, 0h extras
Impacto: +1 dia presencial (contribui para meta 40%)
```

### Turno com Hora Extra
```
Usuário: Carlos Lima (Operações)
Entrada: 08:00 (25/07)
Saída: 19:00 (25/07)
Almoço: 12:00 - 13:00
Turno: Extra Noturno
Status SAP: Concluído
Resultado: 8h normais, 2h extras
Valor HE: R$ 60,00 (assumindo R$ 30/h base)
```

### **Registro CLT - Horário Noturno**
```
Usuário: Ana Costa (Operações)
Entrada: 22:00 (25/07)
Saída: 06:00 (26/07)
Almoço: 02:00 - 03:00
Turno: Extra Noturno
Modo CLT: ✅ Ativado
Valor/Hora: R$ 25,00
Resultado CLT:
- Horas normais: 7h (com intervalo)
- Horas noturnas: 7h (22h-5h)
- Adicional noturno: R$ 35,00 (20% sobre 7h)
- Total CLT: R$ 210,00 (R$ 175 + R$ 35)
- Status: ✅ Conforme CLT
```

### **Registro CLT - Com Avisos**
```
Usuário: Pedro Silva (TI)
Entrada: 08:00 (26/07)
Saída: 20:00 (26/07)
Almoço: -
Turno: Emergência
Modo CLT: ✅ Ativado
Valor/Hora: R$ 40,00
Resultado CLT:
- Horas trabalhadas: 10h (limite CLT)
- Horas extras: 2h (limite máximo)
- Valor HE: R$ 120,00 (50% adicional)
- Total CLT: R$ 440,00
- Status: ⚠️ Com Avisos
- Avisos: "Jornada > 6h requer intervalo mínimo de 1h (CLT Art. 71)"
```

### Gestão Multi-usuário
```
Filtro por usuário: "João Silva (TI)"
Estatísticas mostradas:
- Total registros: 15
- Horas trabalhadas: 120:00
- Horas extras: 8:00
- Dias presenciais: 6/8 (75% - acima do mínimo 40%)
- Valor HE acumulado: R$ 240,00
```

## 🔒 Segurança e Privacidade

- **Autenticação**: Sistema de login com hash de senhas
- **Isolamento de Dados**: Cada usuário vê apenas seus próprios registros
- **CSP**: Content Security Policy configurado
- **Helmet**: Headers de segurança no servidor
- **Sanitização**: XSS protection nos inputs
- **Validação**: Cliente e servidor
- **Backup Seguro**: Dados mantidos localmente no navegador

## � Gestão de Usuários

### Estrutura de Dados do Usuário
```javascript
{
  id: "user_123",
  name: "João Silva",
  email: "joao@empresa.com",
  department: "TI",
  password: "hashed_password",
  createdAt: "2025-07-28T10:30:00.000Z",
  isActive: true
}
```

### Estrutura de Registros
```javascript
{
  // Dados do registro
  id: "record_456",
  dataEntrada: "2025-07-28",
  horaEntrada: "08:00",
  // ... outros campos de timesheet
  
  // Vinculação do usuário
  userId: "user_123",
  userName: "João Silva",
  userDepartment: "TI",
  createdAt: "2025-07-28T08:00:00.000Z"
}
```

### Departamentos Disponíveis
- Tecnologia da Informação (TI)
- Recursos Humanos (RH)
- Financeiro
- Operações
- Vendas
- Marketing
- Suporte
- Outros

## 📱 Responsividade

- **Desktop**: Layout completo com menu de usuário
- **Tablet**: Grid adaptativo com 2-3 cards por linha
- **Mobile**: Stack vertical, menu responsivo
- **Print**: Layout otimizado para impressão de relatórios

## 🎨 Design System

### Cores
```css
--primary-color: #3b82f6    /* Azul principal */
--success-color: #10b981    /* Verde sucesso */
--warning-color: #f59e0b    /* Amarelo alerta */
--danger-color: #ef4444     /* Vermelho erro */
--info-color: #06b6d4       /* Azul informação */
```

### Componentes de Interface
```css
/* Cards de Estatísticas */
.stat-card--success     /* Verde - meta atingida */
.stat-card--warning     /* Amarelo - em progresso */

/* Badges de Status */
.badge-success          /* Verde - concluído */
.badge-warning          /* Amarelo - pendente */
.badge-info            /* Azul - presencial */
.badge-secondary       /* Cinza - padrão */

/* Menu de Usuário */
.user-menu-toggle      /* Botão do menu */
.user-dropdown         /* Dropdown com opções */
```

## 🔧 Configuração Avançada

### Configurações de Presencial
```javascript
// Em static/js/storage.js
const MIN_PRESENTIAL_DAYS = 8;        // Meta de dias presenciais
const MIN_PRESENTIAL_PERCENT = 40;    // Percentual mínimo obrigatório
```

### Configurações de Backup
```javascript
// Em static/js/backup-reminder.js
this.checkInterval = 7 * 24 * 60 * 60 * 1000; // 7 dias para lembrete
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## � Fluxo de Autenticação

### 1. Primeiro Acesso
```
GET / → Redireciona para /login.html
```

### 2. Cadastro de Usuário
```
1. Usuário preenche formulário de cadastro
2. Sistema valida dados (email único, senha >= 6 chars)
3. Senha é hasheada e usuário salvo no localStorage
4. Login automático após cadastro
5. Redirecionamento para /index.html
```

### 3. Login Existente
```
1. Usuário insere email e senha
2. Sistema busca usuário e valida credenciais
3. Sessão criada no localStorage
4. Menu de usuário renderizado na interface
5. Dados filtrados por usuário logado
```

### 4. Navegação Protegida
```
- Toda página carrega UserManager.checkAuth()
- Se não autenticado → Redireciona para /login.html
- Se autenticado → Carrega dados do usuário
- Menu superior mostra: Nome, Departamento, Opções
```

### 5. Logout
```
1. Usuário clica em "Sair" no menu
2. Confirmação de logout
3. SessionStorage é limpo
4. Redirecionamento para /login.html
```

## �👨‍💻 Desenvolvido por

Sistema desenvolvido com foco em **usabilidade**, **segurança multi-usuário** e **escalabilidade empresarial**.

### Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Armazenamento**: localStorage (navegador)
- **Autenticação**: Sistema próprio com hash de senhas
- **Design**: CSS responsivo, Mobile-first
- **Arquitetura**: MVC, Padrões de Design

### Recursos Implementados
- ✅ Sistema multi-usuário completo
- ✅ Controle de presencial com métricas
- ✅ Interface responsiva e moderna
- ✅ Sistema de backup inteligente
- ✅ Filtros avançados por usuário/departamento
- ✅ Exportação de dados personalizada
- ✅ Isolamento de dados por usuário
- ✅ Menu de usuário com perfil

---

**TimesheetPro** - Controle de ponto profissional e multi-usuário! ⏰👥
