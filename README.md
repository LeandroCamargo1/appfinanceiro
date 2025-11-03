# Nós na Conta PRO 💰

Um aplicativo web moderno e intuitivo para gerenciamento de finanças pessoais com sincronização em tempo real via Firebase.

## 🎯 Características Principais

- ✅ **Dashboard Intuitivo**: Visualize suas finanças em tempo real
- ✅ **Gestão de Transações**: Registre receitas e despesas com categorias personalizadas
- ✅ **Orçamentos**: Controle seus gastos por categoria
- ✅ **Metas Financeiras**: Defina e acompanhe suas metas de economia
- ✅ **Relatórios Avançados**: Análise detalhada com gráficos interativos
- ✅ **Sincronização Firebase**: Seus dados sempre sincronizados
- ✅ **Modo Offline**: Use o app mesmo sem internet
- ✅ **Design Responsivo**: Funciona em todos os dispositivos
- ✅ **Autenticação Segura**: Login via Firebase Authentication

## 🚀 Como Usar

### Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- Conexão com a internet (recomendado)

### Instalação Local

1. **Clone o repositório:**
```bash
git clone https://github.com/seu-usuario/financa-familiar.git
cd financa-familiar
```

2. **Abra o arquivo no navegador:**
```bash
# Usando um servidor HTTP local (recomendado)
# Python 3
python -m http.server 8000

# Ou Node.js
npx http-server

# Depois acesse: http://localhost:8000
```

3. **Configure o Firebase (Opcional):**
   - Edite `firebase-config.js` com suas credenciais Firebase
   - Se não configurar, o app funciona localmente com localStorage

## 📖 Guia do Usuário

### Dashboard
- Visualize resumo de receitas, despesas e saldo
- Veja transações recentes
- Acompanhe progresso de metas e orçamentos

### Registrar Transações
1. Clique no botão **+** flutuante ou em "Nova Transação"
2. Preencha os dados (descrição, valor, categoria, tipo)
3. Para parcelas: selecione número de parcelas
4. Clique em "Salvar"

### Gerenciar Orçamentos
1. Acesse a aba **Orçamentos**
2. Clique em "Novo Orçamento"
3. Defina categoria e limite mensal
4. Acompanhe o consumo em tempo real

### Definir Metas
1. Acesse a aba **Metas**
2. Clique em "Nova Meta"
3. Defina nome, valor alvo e data limite
4. Atualize o progresso conforme economiza

### Analisar Relatórios
1. Acesse a aba **Relatórios**
2. Selecione o período inicial (padrão: mês vigente)
3. Use os filtros para afunilar a análise
4. Visualize gráficos e tabelas detalhadas

## 🛠️ Estrutura do Projeto

```
financa-familiar/
├── index.html                    # Página principal
├── styles.css                    # Estilos CSS
├── firebase-config.js            # Configuração Firebase (gitignored)
├── js/
│   ├── main-static.js           # Ponto de entrada principal
│   ├── core/
│   │   └── FinanceApp.js        # Orquestrador principal da app
│   ├── modules/
│   │   ├── TransactionManager.js # Gerenciador de transações
│   │   ├── BudgetManager.js     # Gerenciador de orçamentos
│   │   ├── GoalManager.js       # Gerenciador de metas
│   │   ├── ModalManager.js      # Gerenciador de modais
│   │   ├── DashboardRenderer.js # Renderizador do dashboard
│   │   ├── ModernChartRenderer.js # Renderizador de gráficos
│   │   └── ReportGenerator.js   # Gerador de relatórios
│   ├── services/
│   │   ├── FirebaseService.js   # Integração Firebase
│   │   ├── DataSyncService.js   # Sincronização de dados
│   │   └── NotificationService.js # Sistema de notificações
│   ├── components/
│   │   ├── AuthComponent.js     # Componente de autenticação
│   │   └── DataRecoveryInterface.js # Interface de recuperação de dados
│   └── utils/
│       ├── SampleDataGenerator.js # Gerador de dados de exemplo
│       └── CacheManager.js      # Gerenciador de cache
└── README.md                     # Esta documentação
```

## 🔧 Configuração Firebase

Para usar Firebase (sincronização em nuvem):

1. **Crie um projeto Firebase:**
   - Acesse [Firebase Console](https://console.firebase.google.com)
   - Crie um novo projeto

2. **Configure a autenticação:**
   - Ative "Email/Password" ou "Google Sign-in"

3. **Configure o Firestore:**
   - Crie banco de dados Firestore
   - Defina as regras de segurança

4. **Copie as credenciais:**
   - Em Configurações do Projeto, copie a config JavaScript
   - Crie arquivo `firebase-config.js` na raiz com:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 📱 Funcionalidades por Aba

### Resumo
- Cards com principais métricas
- Gráfico de categorias
- Transações recentes
- Progresso de metas e orçamentos

### Transações
- Lista completa de todas as transações
- Filtros por categoria e período
- Busca por descrição
- Edição e exclusão de registros

### Orçamentos
- Definição de limites por categoria
- Visualização de consumo
- Alertas quando próximo do limite
- Histórico de orçamentos

### Metas
- Acompanhamento de progresso
- Visualização em percentual
- Cálculo automático de dias restantes
- Sugestões de economia

### Relatórios
- Análise por período
- Gráficos interativos
- Comparação mês a mês
- Exportação de dados (preparado)

## 🐛 Troubleshooting

### "App ainda carregando"
- Aguarde alguns segundos
- Recarregue a página (F5)
- Limpe o cache do navegador (Ctrl+Shift+Delete)

### Dados não sincronizam
- Verifique conexão com internet
- Verifique configuração do Firebase
- Abra console (F12) e procure por erros
- Tente "Carregar Dados de Exemplo" nas configurações

### Modal não abre
- Verifique console para erros (F12)
- Tente recarregar a página
- Limpe localStorage: `localStorage.clear()` no console

### Dados desaparecem
- Dados são salvos em localStorage automaticamente
- Com Firebase, os dados são sincronizados
- Não limpe o cache sem backup

## 🔐 Segurança

- Autenticação via Firebase
- Dados locais em localStorage (criptografia do navegador)
- Comunicação HTTPS com Firebase
- Sem armazenamento de senhas localmente
- Regras Firestore restritivas (customize conforme necessário)

## 📊 Dados de Exemplo

Para carregar dados de exemplo:
1. Abra o menu de configurações (ícone de engrenagem)
2. Clique em "Carregar Dados de Exemplo"
3. Os dados de outubro 2025 aparecerão

Para limpar todos os dados:
1. Abra o menu de configurações
2. Clique em "Limpar Todos os Dados"
3. Confirme a ação

## 🌐 Compatibilidade

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Navegadores móveis modernos

## 📝 Notas de Desenvolvimento

### Tecnologias Utilizadas
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Estilização**: Tailwind CSS
- **Gráficos**: Chart.js
- **Backend**: Firebase (Firestore + Authentication)
- **Armazenamento Local**: localStorage

### Próximas Melhorias
- [ ] Exportação de dados (CSV/PDF)
- [ ] Categorias personalizadas
- [ ] Recurring transactions automáticas
- [ ] Modo escuro
- [ ] Aplicativo mobile nativo
- [ ] Sincronização automática em background
- [ ] Notificações push
- [ ] Suporte multimoeda

## 🤝 Contribuindo

1. Faça um Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE para detalhes.

## 💬 Suporte

- � Email: suporte@nosconta.com.br
- 🐛 Issues: [GitHub Issues](https://github.com/seu-usuario/financa-familiar/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/seu-usuario/financa-familiar/discussions)

## 📈 Roadmap

### v1.0 (Atual)
- ✅ Dashboard com resumo financeiro
- ✅ Gestão básica de transações
- ✅ Orçamentos e metas
- ✅ Relatórios com gráficos
- ✅ Firebase sync
- ✅ Modo offline

### v1.1 (Próximo)
- [ ] Modo escuro
- [ ] Categorias customizáveis
- [ ] Filtros avançados
- [ ] Exportação de dados

### v2.0 (Futuro)
- [ ] Aplicativo mobile (React Native)
- [ ] Suporte multimoeda
- [ ] Integração com bancos
- [ ] IA para insights financeiros

---

**Desenvolvido com ❤️ para ajudar você a controlar suas finanças**

Última atualização: 31 de outubro de 2025

## 📊 Estrutura do Banco de Dados

### Coleção: `users`
```javascript
{
  name: "João Silva",
  email: "joao@email.com",
  createdAt: Timestamp
}
```

### Coleção: `transactions`
```javascript
{
  type: "expense" | "income",
  category: "🛒 Alimentação",
  description: "Supermercado",
  amount: 150.50,
  date: "2025-10-31",
  personName: "João Silva",
  userId: "uid_do_usuario",
  createdAt: Timestamp,
  id: "uid_timestamp"
}
```

## 🔒 Segurança

- Senhas são gerenciadas pelo Firebase
- Apenas o proprietário pode deletar suas transações
- Todos podem visualizar transações (para compartilhar dados)
- Use HTTPS em produção

## 🎯 Próximas Melhorias

- [ ] Relatórios e gráficos
- [ ] Exportar dados em CSV/PDF
- [ ] Metas financeiras
- [ ] Notificações
- [ ] Modo escuro
- [ ] Múltiplas contas/carteiras

## 💡 Dicas

- As transações são sincronizadas em tempo real
- Sempre use datas corretas para facilitar filtros
- Categorias ajudam a entender melhor os gastos
- Cada usuário vê apenas as transações que pode deletar com o ícone 🗑️

## ❓ Suporte

Se encontrar problemas:
1. Verifique as regras do Firestore
2. Confirme que as credenciais estão corretas
3. Verifique o console do navegador para erros
4. Confirme que autenticação e Firestore estão habilitados

---

Feito com ❤️ para melhorar a gestão financeira familiar!
