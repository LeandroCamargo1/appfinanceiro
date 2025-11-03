// ============ VARIÁVEIS GLOBAIS ============
let transactions = [];
let allTransactions = [];

// Categorias por tipo
const categories = {
    expense: [
        '🛒 Alimentação',
        '🚗 Transporte',
        '🏥 Saúde',
        '🎓 Educação',
        '🏠 Moradia',
        '💡 Utilidades',
        '🎬 Lazer',
        '👗 Vestuário',
        '💰 Investimentos',
        '📱 Telecomunicações',
        '🛏️ Móveis',
        '✂️ Serviços',
        '🎁 Presentes',
        '📖 Livros',
        'Outro'
    ],
    income: [
        '💼 Salário',
        '💰 Bônus',
        '🎁 Presente',
        '📈 Investimento',
        '🏠 Aluguel',
        '💻 Freelance',
        '🛍️ Venda',
        'Outro'
    ]
};

// ============ ELEMENTOS DO DOM ============
const transactionForm = document.getElementById('transactionForm');
const transactionsList = document.getElementById('transactionsList');
const filterType = document.getElementById('filterType');
const filterDate = document.getElementById('filterDate');
const clearFiltersBtn = document.getElementById('clearFilters');
const transTypeSelect = document.getElementById('transType');
const transCategorySelect = document.getElementById('transCategory');
const transPersonInput = document.getElementById('transPerson');
const totalBalanceEl = document.getElementById('totalBalance');
const totalIncomeEl = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpense');
const userNameEl = document.getElementById('userName');

// ============ FUNÇÕES DE STORAGE ============
function saveTransactions() {
    localStorage.setItem('financa-familiar-transactions', JSON.stringify(allTransactions));
}

function loadTransactions() {
    const saved = localStorage.getItem('financa-familiar-transactions');
    if (saved) {
        allTransactions = JSON.parse(saved);
        transactions = [...allTransactions];
        updateSummary();
        renderTransactions();
    }
}

// ============ TRANSAÇÕES ============
function updateCategories() {
    const type = transTypeSelect.value;
    const categoryList = categories[type] || [];
    
    transCategorySelect.innerHTML = '<option value="">Selecione...</option>';
    
    categoryList.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        transCategorySelect.appendChild(option);
    });
}

// Event listeners
transTypeSelect.addEventListener('change', updateCategories);

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const transaction = {
        type: document.getElementById('transType').value,
        category: document.getElementById('transCategory').value,
        description: document.getElementById('transDescription').value,
        amount: parseFloat(document.getElementById('transAmount').value),
        date: document.getElementById('transDate').value,
        personName: document.getElementById('transPerson').value || 'Usuário',
        createdAt: new Date().toISOString(),
        id: `transaction_${Date.now()}`
    };
    
    // Adicionar à lista
    allTransactions.unshift(transaction);
    transactions = [...allTransactions];
    
    // Salvar no localStorage
    saveTransactions();
    
    // Atualizar interface
    updateSummary();
    renderTransactions();
    
    // Limpar formulário
    transactionForm.reset();
    updateCategories();
    
    // Definir data de hoje
    document.getElementById('transDate').valueAsDate = new Date();
});

// ============ ATUALIZAR RESUMO ============
function updateSummary() {
    let totalIncome = 0;
    let totalExpense = 0;
    
    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });
    
    const balance = totalIncome - totalExpense;
    
    totalIncomeEl.textContent = `R$ ${totalIncome.toFixed(2).replace('.', ',')}`;
    totalExpenseEl.textContent = `R$ ${totalExpense.toFixed(2).replace('.', ',')}`;
    totalBalanceEl.textContent = `R$ ${balance.toFixed(2).replace('.', ',')}`;
    
    // Mudar cor do saldo
    totalBalanceEl.className = 'amount';
    if (balance > 0) {
        totalBalanceEl.classList.add('positive');
    } else if (balance < 0) {
        totalBalanceEl.classList.add('negative');
    }
}

// ============ RENDERIZAR TRANSAÇÕES ============
function renderTransactions() {
    if (transactions.length === 0) {
        transactionsList.innerHTML = '<p class="empty-message">Nenhuma transação encontrada</p>';
        return;
    }
    
    transactionsList.innerHTML = transactions.map(transaction => `
        <div class="transaction-item ${transaction.type}">
            <div class="transaction-info">
                <div class="transaction-header">
                    <span class="category">${transaction.category}</span>
                    <span class="amount ${transaction.type}">
                        ${transaction.type === 'income' ? '+' : '-'} R$ ${transaction.amount.toFixed(2).replace('.', ',')}
                    </span>
                </div>
                <div class="transaction-details">
                    <span class="description">${transaction.description}</span>
                    <span class="date">${new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                    ${transaction.personName ? `<span class="person">👤 ${transaction.personName}</span>` : ''}
                </div>
            </div>
            <button class="delete-btn" onclick="deleteTransaction('${transaction.id}')">🗑️</button>
        </div>
    `).join('');
}

// ============ DELETAR TRANSAÇÃO ============
function deleteTransaction(transactionId) {
    if (confirm('Tem certeza que deseja deletar esta transação?')) {
        allTransactions = allTransactions.filter(t => t.id !== transactionId);
        transactions = [...allTransactions];
        
        saveTransactions();
        updateSummary();
        renderTransactions();
    }
}

// ============ FILTROS ============
function applyFilters() {
    const typeFilter = filterType.value;
    const dateFilter = filterDate.value;
    
    transactions = allTransactions.filter(transaction => {
        const matchesType = !typeFilter || transaction.type === typeFilter;
        const matchesDate = !dateFilter || transaction.date === dateFilter;
        
        return matchesType && matchesDate;
    });
    
    updateSummary();
    renderTransactions();
}

filterType.addEventListener('change', applyFilters);
filterDate.addEventListener('change', applyFilters);

clearFiltersBtn.addEventListener('click', () => {
    filterType.value = '';
    filterDate.value = '';
    transactions = [...allTransactions];
    updateSummary();
    renderTransactions();
});

// ============ INICIALIZAÇÃO ============
document.addEventListener('DOMContentLoaded', function() {
    // Configurar categorias iniciais
    updateCategories();
    
    // Definir data de hoje
    document.getElementById('transDate').valueAsDate = new Date();
    
    // Carregar transações salvas
    loadTransactions();
    
    // Atualizar nome do usuário
    userNameEl.textContent = '👋 Gestão Financeira';
    
    console.log('App carregado com sucesso!');
});