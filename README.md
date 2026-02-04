# 💰 Sistema de Gestão Financeira Familiar - Hokkaido

Sistema completo para controle de finanças familiares com sincronização em tempo real via Firebase.

## 🚀 Funcionalidades

### ✅ Lançamentos em Tempo Real
- Registro de receitas e despesas
- Sincronização instantânea com Firebase
- Modo offline com armazenamento local
- Auto-categorização inteligente (Poka-Yoke)

### 📊 Dashboard Completo
- Saldo em tempo real
- KPIs: Entradas, Saídas e Eficiência
- Gráficos por categoria
- Evolução mensal
- Top 5 gastos do mês

### 🎯 Reserva de Emergência
- Acompanhamento visual do progresso
- Meta configurável
- Estimativa de tempo para atingir objetivo

### 🔍 Histórico com Filtros
- Filtro por tipo (entrada/saída)
- Filtro por categoria
- Filtro por mês
- Exclusão individual de lançamentos

## 📋 Como Usar

### Opção 1: Modo Local (sem Firebase)
1. Abra o arquivo `index.html` no navegador
2. Clique no botão ⚙️ (configurações)
3. Selecione "Usar Modo Local"
4. Pronto! Os dados serão salvos no navegador

### Opção 2: Com Firebase (sincronização em nuvem)

#### Passo 1: Criar Projeto no Firebase
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Criar Projeto"
3. Dê um nome ao projeto (ex: "gestao-financeira-familia")
4. Desative o Google Analytics (opcional)
5. Clique em "Criar Projeto"

#### Passo 2: Configurar Autenticação
1. No menu lateral, vá em **Authentication**
2. Clique em **Começar**
3. Na aba **Sign-in method**, habilite **Anônimo**

#### Passo 3: Criar Banco de Dados Firestore
1. No menu lateral, vá em **Firestore Database**
2. Clique em **Criar banco de dados**
3. Selecione **Iniciar no modo de teste**
4. Escolha a região mais próxima (ex: southamerica-east1)

#### Passo 4: Configurar Regras de Segurança
No Firestore, vá em **Regras** e substitua por:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/transactions/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### Passo 5: Obter Credenciais
1. Clique na engrenagem ⚙️ > **Configurações do projeto**
2. Role até **Seus apps** > Clique em **</>** (Web)
3. Registre o app com um nome (ex: "web-app")
4. Copie as credenciais do `firebaseConfig`

#### Passo 6: Configurar no Sistema
1. Abra o sistema no navegador
2. Clique no botão ⚙️ (configurações)
3. Cole cada campo das credenciais:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID
4. Clique em **Salvar**

## 📁 Estrutura de Dados no Firestore

```
users/
  └── {userId}/
      └── transactions/
          └── {transactionId}/
              ├── desc: string
              ├── val: number
              ├── cat: string
              ├── type: "in" | "out"
              ├── date: string
              ├── timestamp: timestamp
              └── userId: string
```

## 🏷️ Categorias Disponíveis

| Categoria | Emoji | Descrição |
|-----------|-------|-----------|
| Alimentação | 🍽️ | Mercado, restaurantes, delivery |
| Moradia | 🏠 | Aluguel, condomínio, IPTU |
| Transporte | 🚗 | Combustível, Uber, transporte público |
| Saúde | 💊 | Farmácia, médico, academia |
| Educação | 📚 | Cursos, livros, escola |
| Lazer | 🎮 | Streaming, cinema, viagens |
| Vestuário | 👕 | Roupas, calçados |
| Serviços | ⚡ | Luz, água, internet |
| Investimento | 📈 | Ações, fundos, poupança |
| Salário | 💰 | Renda principal |
| Freelance | 💼 | Trabalhos extras |
| Outros | 📦 | Não categorizado |

## ⚡ Auto-Categorização Inteligente

O sistema detecta automaticamente a categoria baseado na descrição:

- "mercado", "supermercado", "ifood" → Alimentação
- "uber", "gasolina" → Transporte
- "farmácia", "médico" → Saúde
- "netflix", "spotify" → Lazer
- "luz", "internet" → Serviços
- E muito mais!

## 💡 Dicas de Uso

1. **Use os lançamentos rápidos** para gastos frequentes
2. **Configure a meta de reserva** de acordo com seus custos mensais
3. **Revise os gráficos semanalmente** para identificar padrões
4. **Mantenha descrições consistentes** para melhor categorização

## 🔐 Segurança

- Autenticação anônima (cada dispositivo tem seu próprio ID)
- Dados isolados por usuário no Firestore
- Backup local automático no navegador
- Regras de segurança impedem acesso não autorizado

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES6+)
- **Backend**: Firebase (Firestore + Auth)
- **Gráficos**: Chart.js
- **Armazenamento Local**: localStorage

## 📱 Responsividade

O sistema é otimizado para:
- 📱 Smartphones
- 📟 Tablets
- 💻 Desktop

## 🆘 Suporte

Se encontrar problemas:
1. Verifique se as credenciais do Firebase estão corretas
2. Confirme se a autenticação anônima está habilitada
3. Verifique as regras de segurança do Firestore
4. Abra o console do navegador (F12) para ver erros

---

**Desenvolvido com ❤️ para gestão financeira familiar**
