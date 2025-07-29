# Detecção Automática de Localização por Rede e GPS

Este documento explica como funciona a funcionalidade de detecção automática de localização (Home Office vs Presencial) baseada no tipo de conexão de rede e localização geográfica (GPS).

## Como Funciona

### Botão "Preenchimento Rápido"
Quando você clica no botão **⚡ Preenchimento Rápido**, o sistema:

1. **Detecta automaticamente** o tipo de conexão de rede
2. **Solicita permissão** para acessar a localização GPS
3. **Analisa a consistência** entre rede e localização
4. **Preenche os campos** do formulário com horários padrão
5. **Define automaticamente** o local de trabalho baseado na análise:
   - **Conexão Cabeada + GPS Escritório** → Modo **Presencial** (confiança alta)
   - **WiFi + GPS Casa** → Modo **Home Office** (confiança alta)
   - **Apenas Rede Cabeada** → Modo **Presencial** (confiança média)
   - **Apenas WiFi** → Modo **Home Office** (confiança média)

### Botão "Detectar Local"
O botão **🌐 Detectar Local** permite forçar uma nova detecção usando métodos alternativos quando a detecção automática não funcionar adequadamente.

## Métodos de Detecção

### 1. Network Information API (Principal)
- Usa a API `navigator.connection` do navegador
- Detecta o tipo de conexão (ethernet, wifi, cellular, etc.)
- **Mais preciso** quando disponível

### 2. Geolocalização GPS (Complementar)
- Usa a API `navigator.geolocation` do navegador
- Obtém coordenadas precisas da localização atual
- **Reverse geocoding** para converter coordenadas em endereço
- **Análise de zonas** de trabalho (escritório vs casa)

### 3. Detecção por Velocidade (Fallback)
- Analisa a velocidade da conexão (`downlink`)
- Conexões mais rápidas (>50 Mbps) são consideradas cabeadas
- **Heurística aproximada**

### 4. Detecção por IP Local (Alternativo)
- Usa WebRTC para obter o IP local
- Analisa faixas de IP para determinar tipo de rede:
  - `192.168.1.x` → Normalmente rede corporativa cabeada
  - Outras faixas privadas → Rede doméstica WiFi

## Análise de Consistência

O sistema combina informações de rede e GPS para determinar a localização com maior precisão:

### Cenários de Alta Confiança
- **Rede Cabeada + GPS no Escritório** → Presencial ✅
- **WiFi + GPS em Casa** → Home Office ✅

### Cenários de Média Confiança  
- **Apenas Rede Cabeada** → Provável Presencial ⚠️
- **Apenas WiFi** → Provável Home Office ⚠️

### Cenários de Baixa Confiança
- **Conflito entre Rede e GPS** → Requer verificação manual ❌
- **Informações Insuficientes** → Padrão Home Office ❌

## Informações Armazenadas

Cada registro de timesheet inclui informações detalhadas de localização:

### Dados de Rede
- Tipo de conexão (wifi, ethernet, cellular)
- Endereço IP local
- Velocidade de conexão

### Dados de GPS
- Coordenadas (latitude/longitude)  
- Precisão da localização (metros)
- Endereço completo (reverse geocoding)
- Timestamp da coleta

### Análise de Confiabilidade
- Nível de confiança (alta/média/baixa)
- Recomendação final (presencial/home-office)
- Detalhes da análise
- Consistência entre métodos

## Visualização na Tabela

A coluna **Localização** mostra:

- 🏢 **Presencial** ou 🏠 **Home Office** 
- Badge colorido por nível de confiança:
  - 🟢 **Verde**: Alta confiança
  - 🟡 **Amarelo**: Média confiança  
  - ⚫ **Cinza**: Baixa confiança
- Indicadores adicionais:
  - 📍 **GPS verificado**
  - 🔌 **Conexão cabeada**
  - 📶 **Conexão WiFi**

### Tooltip Detalhado
Ao passar o mouse sobre a coluna, você vê:
- Nível de confiança
- Tipo de rede e IP
- Endereço GPS e precisão
- Detalhes da análise

## Compatibilidade

### Navegadores Suportados
- ✅ **Chrome/Edge**: Network Information API completa
- ✅ **Firefox**: Suporte parcial, usa fallbacks
- ✅ **Safari**: Usa métodos alternativos
- ✅ **Mobile**: Funciona na maioria dos navegadores móveis

### Limitações
- Alguns navegadores não expõem informações detalhadas de rede
- Redes corporativas podem mascarar o tipo real de conexão
- VPNs podem afetar a detecção

## Fallbacks e Tratamento de Erros

1. **Se a detecção falhar**: Usa padrão Home Office
2. **Se houver erro**: Mostra mensagem de aviso
3. **Método alternativo**: Botão específico para tentar outros métodos

## Mensagens do Sistema

### Sucesso
- "Conexão cabeada detectada - Modo Presencial"
- "Conexão WiFi detectada - Modo Home Office"

### Avisos
- "Não foi possível detectar o tipo de conexão - Usando padrão Home Office"
- "Conexão de alta velocidade detectada - Modo Presencial (provável)"

### Erros
- "Erro na detecção - Usando padrão Home Office"
- "Timeout na detecção - Usando padrão Home Office"

## Personalização

Para ajustar o comportamento da detecção, você pode modificar:

### Arquivo: `static/js/utils.js`
- Ajustar heurísticas de velocidade
- Modificar faixas de IP para detecção
- Alterar timeouts

### Arquivo: `static/js/components.js`
- Personalizar preenchimento automático
- Ajustar mensagens exibidas
- Modificar mapeamento observação/status

## Segurança e Privacidade

- ✅ **Não envia dados** para servidores externos
- ✅ **Processamento local** no navegador
- ✅ **IP local apenas** para heurísticas internas
- ✅ **GPS com permissão** do usuário (pode ser negada)
- ✅ **Sem armazenamento permanente** de coordenadas GPS
- ✅ **Reverse geocoding** usando OpenStreetMap (público)
- ✅ **Dados criptografados** no localStorage do navegador

### Permissões Solicitadas
- **Localização**: Para determinar se está no escritório ou em casa
- **Rede**: Para analisar tipo de conexão (automático)

### Dados NÃO Coletados
- ❌ Histórico de movimentação
- ❌ Coordenadas precisas de terceiros
- ❌ Informações pessoais de localização
- ❌ Dados enviados para servidores remotos

## Troubleshooting

### Problema: Sempre solicita permissão de localização
**Solução**: Aceite a permissão uma vez ou configure o navegador para lembrar

### Problema: Detecção sempre mostra Home Office
**Solução**: Use o botão "Detectar Local" para tentar método alternativo

### Problema: GPS não funciona
**Solução**: Verifique se está em ambiente externo ou próximo a janelas

### Problema: Detecção incorreta em rede corporativa
**Solução**: Ajuste as faixas de IP no código ou selecione manualmente

### Problema: Não funciona em navegador específico  
**Solução**: O sistema usa fallbacks automáticos, mas você pode sempre preencher manualmente
