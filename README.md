# TimesheetPro - Sistema de Controle de Ponto

Sistema moderno, responsivo e escalável para controle de ponto com cálculo automático de horas extras.

## 🚀 Características

- **Interface Moderna**: Design responsivo com CSS Grid e Flexbox
- **Cálculos Automáticos**: Horas extras, tempo de almoço, valores monetários
- **Armazenamento Local**: Dados salvos no localStorage do navegador
- **Exportação CSV**: Exportar dados para planilhas
- **Padrão MVC**: Arquitetura escalável e organizada
- **PWA Ready**: Preparado para ser Progressive Web App

## 📁 Estrutura do Projeto

```
timesheet/
├── package.json           # Dependências Node.js
├── server.js             # Servidor Express (Padrão MVC)
├── index.html            # Interface principal
├── static/
│   ├── css/
│   │   ├── main.css      # Estilos principais
│   │   ├── components.css # Componentes UI
│   │   └── responsive.css # Media queries
│   └── js/
│       ├── utils.js      # Utilitários gerais
│       ├── storage.js    # Gerenciamento localStorage
│       ├── calculator.js # Cálculos de timesheet
│       ├── components.js # Componentes UI
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

## 💡 Funcionalidades

### ✅ Implementadas

1. **Registro de Ponto**
   - Data e hora de entrada/saída
   - Horário de almoço (opcional)
   - Múltiplos turnos por data
   - Validação em tempo real

2. **Cálculos Automáticos**
   - Total bruto de horas trabalhadas
   - Desconto do tempo de almoço
   - Total líquido de horas
   - Horas extras (baseado em 8h normais)
   - Valor monetário das horas extras (50% adicional)

3. **Interface Responsiva**
   - Design moderno com CSS Grid/Flexbox
   - Adaptação para mobile/tablet
   - Animações e transições suaves
   - Dark mode (preparado)

4. **Gerenciamento de Dados**
   - Armazenamento no localStorage
   - Backup automático
   - Busca e filtros
   - Estatísticas em tempo real

5. **Exportação**
   - Exportar para CSV
   - Formato compatível com Excel
   - Dados completos com fórmulas

### 🔄 Próximas Versões

1. **Importação de Dados**
   - Importar CSV
   - Migração de outras ferramentas

2. **Relatórios Avançados**
   - Relatórios mensais/anuais
   - Gráficos de produtividade
   - Análise de padrões

3. **Configurações**
   - Jornada de trabalho personalizada
   - Diferentes tipos de hora extra
   - Configuração de feriados

4. **PWA Completo**
   - Service Worker
   - Notificações push
   - Trabalho offline

## 🎯 Padrões Utilizados

### **MVC (Model-View-Controller)**
- **Model**: `StorageManager` - Gerencia dados
- **View**: HTML/CSS - Interface do usuário  
- **Controller**: `TimesheetApp` - Lógica de negócio

### **Outros Padrões**
- **Singleton**: Classes principais são instanciadas uma vez
- **Observer**: Event listeners para reatividade
- **Strategy**: Diferentes calculadoras para cenários específicos
- **Factory**: Geração de IDs e elementos DOM

## 🔧 Configuração

### Configurações Padrão
```javascript
// Configurações podem ser alteradas em:
static/js/calculator.js

- Jornada normal: 8 horas
- Adicional HE: 50%
- Formato de hora: HH:MM
- Moeda: BRL (Real)
```

### Personalização
```javascript
// Para alterar jornada padrão:
TimesheetCalculator.defaultWorkingHours = '06:00'; // 6 horas

// Para alterar adicional:
TimesheetCalculator.overtimeRate = 2.0; // 100% adicional
```

## 📊 Exemplos de Uso

### Turno Comercial
```
Entrada: 08:00 (25/07)
Saída: 17:00 (25/07)
Almoço: 12:00 - 13:00
Resultado: 8h normais, 0h extras
```

### Turno com Hora Extra
```
Entrada: 08:00 (25/07)
Saída: 19:00 (25/07)
Almoço: 12:00 - 13:00
Resultado: 8h normais, 2h extras
```

### Turno Noturno (Cruza Meia-noite)
```
Entrada: 22:30 (25/07)
Saída: 03:00 (26/07)
Almoço: -
Resultado: 0h normais, 4h30 extras
```

## 🔒 Segurança

- **CSP**: Content Security Policy configurado
- **Helmet**: Headers de segurança
- **Sanitização**: XSS protection nos inputs
- **Validação**: Cliente e servidor

## 📱 Responsividade

- **Desktop**: Layout completo com sidebar
- **Tablet**: Grid adaptativo  
- **Mobile**: Stack vertical, tabela responsiva
- **Print**: Layout otimizado para impressão

## 🎨 Design System

### Cores
```css
--primary-color: #3b82f6    /* Azul principal */
--success-color: #10b981    /* Verde sucesso */
--warning-color: #f59e0b    /* Amarelo alerta */
--danger-color: #ef4444     /* Vermelho erro */
```

### Tipografia
```css
--font-size-xs: 0.75rem     /* 12px */
--font-size-sm: 0.875rem    /* 14px */
--font-size-base: 1rem      /* 16px */
--font-size-lg: 1.125rem    /* 18px */
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

## 👨‍💻 Desenvolvido por

Sistema desenvolvido com foco em usabilidade, performance e escalabilidade.

---

**TimesheetPro** - Controle de ponto profissional e moderno! ⏰
