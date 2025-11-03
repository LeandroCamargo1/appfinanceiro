# 💰 Nós na Conta PRO - Sistema de Controle Financeiro

Sistema completo de gestão financeira pessoal/familiar, desenvolvido com JavaScript vanilla e interface moderna. Projetado especialmente para casais gerenciarem suas finanças de forma integrada.

## ✨ Funcionalidades Principais

### 📊 Dashboard Inteligente
- Resumo financeiro mensal com saldo atual
- Gráficos de receitas vs despesas
- Distribuição por categorias
- Indicadores visuais de performance

### 💰 Gestão de Transações
- Registro de receitas e despesas
- Categorização automática
- Suporte a parcelamento
- Formatação automática de valores em moeda brasileira
- Histórico completo com filtros

### 📈 Orçamento e Planejamento
- Definição de limites por categoria
- Acompanhamento de gastos em tempo real
- Alertas de orçamento
- Projeções mensais

### 🎯 Metas Financeiras
- Criação de objetivos financeiros
- Acompanhamento de progresso
- Prazos e marcos
- Visualização do progresso

### 📋 Relatórios Detalhados
- Relatórios mensais e anuais
- Análise de tendências
- Exportação de dados
- Comparativos históricos

## 🚀 Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript ES6+ (Vanilla)
- **UI Framework**: TailwindCSS via CDN
- **Gráficos**: Chart.js
- **Ícones**: Emojis nativos para melhor compatibilidade
- **Armazenamento**: LocalStorage (offline-first)
- **Arquitetura**: Modular com ES6 Modules

## 📁 Estrutura do Projeto

```
financa-familiar/
├── index.html                          # Página principal
├── test.html                          # Página de testes
├── styles.css                         # Estilos customizados
├── js/
│   ├── main.js                        # Ponto de entrada da aplicação
│   ├── core/
│   │   └── FinanceApp.js             # Orquestrador principal
│   ├── modules/
│   │   ├── TransactionManager.js      # Gestão de transações
│   │   ├── BudgetManager.js          # Gestão de orçamentos
│   │   ├── GoalManager.js            # Gestão de metas
│   │   ├── ModalManager.js           # Sistema de modais
│   │   ├── NotificationService.js    # Sistema de notificações
│   │   ├── ChartRenderer.js          # Renderização de gráficos
│   │   ├── DashboardRenderer.js      # Renderização do dashboard
│   │   └── ReportGenerator.js        # Geração de relatórios
│   └── utils/
│       ├── CriticalAppLoader.js      # Carregador com skeleton UI
│       ├── SampleDataGenerator.js    # Gerador de dados de exemplo
│       ├── DateUtils.js              # Utilitários de data
│       ├── CurrencyUtils.js          # Utilitários de moeda
│       └── StorageUtils.js           # Utilitários de armazenamento
└── README.md                         # Este arquivo
```

## 🛠️ Como Executar

### Opção 1: Servidor Local Python
```bash
cd financa-familiar
python -m http.server 8000
# Acesse: http://localhost:8000
```

### Opção 2: Servidor Local Node.js
```bash
cd financa-familiar
npx serve
# ou
npx http-server
```

### Opção 3: Live Server (VS Code)
1. Instale a extensão "Live Server"
2. Clique com botão direito em `index.html`
3. Selecione "Open with Live Server"

## 📋 Primeiros Passos

1. **Primeira Execução**
   - O sistema carrega automaticamente dados de exemplo
   - Explore as diferentes abas e funcionalidades

2. **Configuração**
   - Use o menu de configurações (⚙️) no cabeçalho
   - Carregue novos dados de exemplo ou limpe tudo

3. **Registrar Transações**
   - Clique em "Nova Transação" no dashboard
   - Preencha os dados (valores são formatados automaticamente)
   - Categorize adequadamente

4. **Acompanhar Progresso**
   - Dashboard mostra resumo em tempo real
   - Use as abas para visões detalhadas
   - Navegue entre meses com os controles de data

## 🔧 Recursos Técnicos

### Formatação de Moeda
- Entrada: Formatação automática durante digitação
- Processamento: Limpeza e conversão para números
- Exibição: Formato brasileiro (R$ 1.234,56)

### Validação de Dados
- Campos obrigatórios verificados
- Valores numéricos validados
- Datas e categorias verificadas
- Feedback visual para o usuário

### Persistência de Dados
- Salvamento automático no LocalStorage
- Funciona completamente offline
- Dados mantidos entre sessões
- Backup e restore via configurações

### Responsividade
- Design mobile-first
- Adaptação automática a diferentes telas
- Touch-friendly em dispositivos móveis

## ⚠️ Resolução de Problemas

### Erro "Valor deve ser um número positivo"
**Causa**: Conflito entre formatação de moeda e validação
**Solução**: ✅ Implementada limpeza automática de valores formatados

### Dados não aparecem
**Causa**: Possível problema no LocalStorage
**Solução**: Use "Limpar Todos os Dados" e "Carregar Dados de Exemplo"

### Gráficos não carregam
**Causa**: Chart.js não foi carregado via CDN
**Solução**: Verifique conexão com internet ou use versão local

## 🔄 Status do Desenvolvimento

✅ **Concluído**
- Interface completa com design responsivo
- Sistema modular de gestão financeira
- Formatação e validação de moeda CORRIGIDA
- CRUD completo para transações, orçamentos e metas
- Dashboard com gráficos interativos
- Sistema de notificações
- Dados de exemplo para demonstração
- Menu de configurações com reset de dados

🔄 **Em Desenvolvimento**
- Recursos avançados de relatórios
- Importação/exportação de dados
- Categorias personalizáveis
- Múltiplas contas bancárias

⚠️ **Notas Importantes**
- Sistema funciona completamente offline
- Firebase removido - foco em simplicidade
- Dados armazenados localmente no navegador
- Problema de validação de moeda RESOLVIDO

## 🤝 Contribuições

Este é um projeto de exemplo/demonstração. Para melhorias:
1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Teste thoroughly
5. Envie um pull request

## 📝 Licença

Este projeto é fornecido como exemplo educativo. Use e modifique conforme necessário.

---

**Desenvolvido com ❤️ para simplificar o controle financeiro familiar**