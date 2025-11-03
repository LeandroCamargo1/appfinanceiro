/**
 * 💰 Nós na Conta PRO - App Consolidado
 * Arquivo único com toda a lógica (FinanceApp + Managers + Utilities)
 */

// ============================================================================
// CONFIGURAÇÃO E ESTADO GLOBAL
// ============================================================================

const app = {
    // Estado
    isInitialized: false,
    currentUser: null,
    activeTab: 'resumo',
    isOnline: navigator.onLine,
    transactions: [],
    budgets: [],
    goals: [],
    
    // Config
    config: {
        autoSave: true,
        autoSaveInterval: 30000,
        syncEnabled: false
    },

    // ========================================================================
    // INICIALIZAÇÃO
    // ========================================================================

    async initialize() {
        if (this.isInitialized) return;
        
        try {
            console.log('🚀 Iniciando Nós na Conta PRO...');
            
            this.setupEventListeners();
            await this.loadUserData();
            this.setupAutoSave();
            await this.renderInitialView();
            
            this.isInitialized = true;
            console.log('✅ App inicializado com sucesso');
            this.notify('success', 'Nós na Conta PRO carregado!');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.notify('error', 'Erro ao carregar a aplicação');
        }
    },

    // ========================================================================
    // CARREGAR DADOS
    // ========================================================================

    async loadUserData() {
        try {
            const stored = localStorage.getItem('appData');
            if (stored) {
                const data = JSON.parse(stored);
                this.transactions = data.transactions || [];
                this.budgets = data.budgets || [];
                this.goals = data.goals || [];
            } else {
                console.log('📊 Carregando dados de exemplo...');
                this.loadSampleData();
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            this.loadSampleData();
        }
    },

    saveUserData() {
        try {
            const data = {
                transactions: this.transactions,
                budgets: this.budgets,
                goals: this.goals,
                lastSave: new Date().toISOString()
            };
            localStorage.setItem('appData', JSON.stringify(data));
            console.log('💾 Dados salvos');
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    },

    // ========================================================================
    // DADOS DE EXEMPLO
    // ========================================================================

    loadSampleData() {
        this.transactions = [
            {
                id: 'sample-1',
                description: 'Salário',
                amount: 5000.00,
                type: 'receita',
                category: 'Salário',
                date: new Date(2025, 9, 5).toISOString(),
                installments: 1,
            },
            {
                id: 'sample-2',
                description: 'Aluguel',
                amount: 1200.00,
                type: 'despesa',
                category: 'Moradia',
                date: new Date(2025, 9, 10).toISOString(),
                installments: 1,
            },
            {
                id: 'sample-3',
                description: 'Supermercado',
                amount: 450.00,
                type: 'despesa',
                category: 'Alimentação',
                date: new Date(2025, 9, 12).toISOString(),
                installments: 1,
            },
            {
                id: 'sample-4',
                description: 'Freelance Web Design',
                amount: 1500.00,
                type: 'receita',
                category: 'Freelance',
                date: new Date(2025, 9, 15).toISOString(),
                installments: 1,
            },
            {
                id: 'sample-5',
                description: 'Conta de Luz',
                amount: 180.00,
                type: 'despesa',
                category: 'Contas',
                date: new Date(2025, 9, 18).toISOString(),
                installments: 1,
            },
            {
                id: 'sample-6',
                description: 'Internet',
                amount: 89.90,
                type: 'despesa',
                category: 'Contas',
                date: new Date(2025, 9, 20).toISOString(),
                installments: 1,
            }
        ];

        this.budgets = [
            { id: 'b1', category: 'Alimentação', limit: 800.00, spent: 450.00, month: 10, year: 2025 },
            { id: 'b2', category: 'Transporte', limit: 400.00, spent: 0.00, month: 10, year: 2025 },
            { id: 'b3', category: 'Contas', limit: 500.00, spent: 269.90, month: 10, year: 2025 }
        ];

        this.goals = [
            { id: 'g1', title: 'Viagem para o Nordeste', targetAmount: 5000.00, currentAmount: 2500.00, targetDate: '2026-06-30' },
            { id: 'g2', title: 'Novo Notebook', targetAmount: 3000.00, currentAmount: 800.00, targetDate: '2025-12-25' }
        ];

        this.saveUserData();
    },

    // ========================================================================
    // TRANSAÇÕES
    // ========================================================================

    addTransaction(data) {
        const transaction = {
            id: 'txn-' + Date.now(),
            ...data,
            createdAt: new Date().toISOString()
        };
        this.transactions.push(transaction);
        this.saveUserData();
        this.notify('success', 'Transação adicionada!');
        this.renderDashboard();
        this.closeModal('transactionModal');
    },

    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveUserData();
        this.notify('success', 'Transação removida');
        this.renderDashboard();
    },

    // ========================================================================
    // ORÇAMENTOS
    // ========================================================================

    addBudget(data) {
        const budget = {
            id: 'budget-' + Date.now(),
            ...data,
            spent: 0,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            createdAt: new Date().toISOString()
        };
        this.budgets.push(budget);
        this.saveUserData();
        this.notify('success', 'Orçamento criado!');
        this.renderBudgets();
        this.closeModal('budgetModal');
    },

    deleteBudget(id) {
        this.budgets = this.budgets.filter(b => b.id !== id);
        this.saveUserData();
        this.notify('success', 'Orçamento removido');
        this.renderBudgets();
    },

    // ========================================================================
    // METAS
    // ========================================================================

    addGoal(data) {
        const goal = {
            id: 'goal-' + Date.now(),
            ...data,
            createdAt: new Date().toISOString()
        };
        this.goals.push(goal);
        this.saveUserData();
        this.notify('success', 'Meta criada!');
        this.renderGoals();
        this.closeModal('goalModal');
    },

    deleteGoal(id) {
        this.goals = this.goals.filter(g => g.id !== id);
        this.saveUserData();
        this.notify('success', 'Meta removida');
        this.renderGoals();
    },

    updateGoalProgress(id, amount) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            goal.currentAmount = parseFloat(amount);
            this.saveUserData();
            this.renderGoals();
        }
    },

    // ========================================================================
    // CÁLCULOS E ANÁLISES
    // ========================================================================

    getCurrentMonth() {
        const now = new Date();
        return { month: now.getMonth(), year: now.getFullYear() };
    },

    getTransactionsForCurrentMonth() {
        const { month, year } = this.getCurrentMonth();
        return this.transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
    },

    calculateMonthlyTotals() {
        const monthTxns = this.getTransactionsForCurrentMonth();
        const totalIncome = monthTxns
            .filter(t => t.type === 'receita')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalExpense = monthTxns
            .filter(t => t.type === 'despesa')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        return {
            income: totalIncome,
            expense: totalExpense,
            balance: totalIncome - totalExpense
        };
    },

    getCategoryTotals() {
        const monthTxns = this.getTransactionsForCurrentMonth();
        const byCategory = {};
        monthTxns.forEach(t => {
            if (!byCategory[t.category]) {
                byCategory[t.category] = { income: 0, expense: 0 };
            }
            if (t.type === 'receita') {
                byCategory[t.category].income += parseFloat(t.amount);
            } else {
                byCategory[t.category].expense += parseFloat(t.amount);
            }
        });
        return byCategory;
    },

    // ========================================================================
    // RENDERIZAÇÃO
    // ========================================================================

    async renderInitialView() {
        await this.renderDashboard();
        this.setupTabNavigation();
        this.hideLoadingScreen();
    },

    hideLoadingScreen() {
        const screen = document.getElementById('loadingScreen');
        if (screen) {
            screen.style.opacity = '0';
            setTimeout(() => {
                screen.style.display = 'none';
                const main = document.getElementById('mainContent');
                if (main) main.classList.remove('hidden');
            }, 300);
        }
    },

    async renderDashboard() {
        const content = document.getElementById('resumoContent');
        if (!content) return;

        const totals = this.calculateMonthTotals();
        const categories = this.getCategoryTotals();
        const monthTxns = this.getTransactionsForCurrentMonth();

        let html = `
            <div class="mb-6">
                <button id="newTransactionBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Nova Transação
                </button>
            </div>

            <!-- Cards de Resumo -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div class="modern-card">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm">Receitas</p>
                            <p class="text-2xl font-bold text-green-600">R$ ${totals.income.toFixed(2)}</p>
                        </div>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                            📈
                        </div>
                    </div>
                </div>

                <div class="modern-card">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm">Despesas</p>
                            <p class="text-2xl font-bold text-red-600">R$ ${totals.expense.toFixed(2)}</p>
                        </div>
                        <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                            📉
                        </div>
                    </div>
                </div>

                <div class="modern-card ${totals.balance >= 0 ? 'bg-green-50' : 'bg-red-50'}">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-gray-600 text-sm">Saldo</p>
                            <p class="text-2xl font-bold ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}">
                                R$ ${totals.balance.toFixed(2)}
                            </p>
                        </div>
                        <div class="w-12 h-12 ${totals.balance >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-lg flex items-center justify-center ${totals.balance >= 0 ? 'text-green-600' : 'text-red-600'}">
                            💰
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráfico -->
            <div class="modern-card mb-8">
                <h3 class="text-lg font-semibold mb-4">Despesas por Categoria</h3>
                <canvas id="categoryChart" height="80"></canvas>
            </div>

            <!-- Transações Recentes -->
            <div class="modern-card">
                <h3 class="text-lg font-semibold mb-4">Transações Recentes</h3>
                <div class="space-y-3">
                    ${monthTxns.slice(0, 10).map(t => `
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                            <div class="flex items-center">
                                <span class="text-2xl mr-3">${t.type === 'receita' ? '📈' : '📉'}</span>
                                <div>
                                    <p class="font-medium text-gray-900">${t.description}</p>
                                    <p class="text-sm text-gray-500">${t.category}</p>
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="font-semibold ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}">
                                    ${t.type === 'receita' ? '+' : '-'} R$ ${parseFloat(t.amount).toFixed(2)}
                                </p>
                                <p class="text-sm text-gray-500">${new Date(t.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        content.innerHTML = html;

        // Configurar chart
        this.renderChart();

        // Configurar botão
        document.getElementById('newTransactionBtn')?.addEventListener('click', () => this.openModal('transactionModal'));
    },

    renderChart() {
        const canvas = document.getElementById('categoryChart');
        if (!canvas || !window.Chart) return;

        const categories = this.getCategoryTotals();
        const labels = Object.keys(categories);
        const data = labels.map(cat => categories[cat].expense);

        if (window.categoryChart) {
            window.categoryChart.destroy();
        }

        window.categoryChart = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },

    async renderTransactions() {
        const content = document.getElementById('lancamentosContent');
        if (!content) return;

        const monthTxns = this.getTransactionsForCurrentMonth();

        content.innerHTML = `
            <div class="mb-6">
                <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                    + Adicionar
                </button>
            </div>
            <div class="space-y-3">
                ${monthTxns.map(t => `
                    <div class="modern-card flex items-center justify-between p-4">
                        <div>
                            <p class="font-medium">${t.description}</p>
                            <p class="text-sm text-gray-500">${t.category} • ${new Date(t.date).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <button onclick="app.deleteTransaction('${t.id}')" class="text-red-600 hover:text-red-800">🗑️</button>
                        <p class="font-semibold ${t.type === 'receita' ? 'text-green-600' : 'text-red-600'}">
                            ${t.type === 'receita' ? '+' : '-'} R$ ${parseFloat(t.amount).toFixed(2)}
                        </p>
                    </div>
                `).join('')}
            </div>
        `;
    },

    async renderBudgets() {
        const content = document.getElementById('orcamentoContent');
        if (!content) return;

        const { month, year } = this.getCurrentMonth();
        const budgets = this.budgets.filter(b => b.month === month + 1 && b.year === year);

        content.innerHTML = `
            <div class="mb-6">
                <button onclick="app.openModal('budgetModal')" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                    + Novo Orçamento
                </button>
            </div>
            <div class="space-y-4">
                ${budgets.map(b => {
                    const percentage = Math.min(100, (b.spent / b.limit) * 100);
                    const status = b.spent > b.limit ? 'Excedido' : 'Ok';
                    return `
                        <div class="modern-card p-4">
                            <div class="flex justify-between mb-2">
                                <h4 class="font-semibold">${b.category}</h4>
                                <span class="text-sm ${b.spent > b.limit ? 'text-red-600' : 'text-green-600'}">${status}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2">
                                <div class="progress-bar ${b.spent > b.limit ? 'bg-red-600' : 'bg-blue-600'} h-2 rounded-full" style="width: ${percentage}%"></div>
                            </div>
                            <p class="text-sm text-gray-600 mt-2">R$ ${b.spent.toFixed(2)} de R$ ${b.limit.toFixed(2)}</p>
                            <button onclick="app.deleteBudget('${b.id}')" class="mt-3 text-red-600 text-sm">🗑️ Remover</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    async renderGoals() {
        const content = document.getElementById('metasContent');
        if (!content) return;

        content.innerHTML = `
            <div class="mb-6">
                <button onclick="app.openModal('goalModal')" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                    + Nova Meta
                </button>
            </div>
            <div class="space-y-4">
                ${this.goals.map(g => {
                    const percentage = Math.min(100, (parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) * 100);
                    return `
                        <div class="modern-card p-4">
                            <div class="flex justify-between mb-2">
                                <h4 class="font-semibold">${g.title}</h4>
                                <span class="text-sm text-gray-500">${percentage.toFixed(0)}%</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-3">
                                <div class="progress-bar bg-green-600 h-3 rounded-full" style="width: ${percentage}%"></div>
                            </div>
                            <p class="text-sm text-gray-600 mt-2">R$ ${parseFloat(g.currentAmount).toFixed(2)} de R$ ${parseFloat(g.targetAmount).toFixed(2)}</p>
                            <p class="text-xs text-gray-500 mt-1">Até: ${new Date(g.targetDate).toLocaleDateString('pt-BR')}</p>
                            <button onclick="app.deleteGoal('${g.id}')" class="mt-3 text-red-600 text-sm">🗑️ Remover</button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    async renderReports() {
        const content = document.getElementById('relatoriosContent');
        if (!content) return;

        const totals = this.calculateMonthTotals();
        const categories = this.getCategoryTotals();

        content.innerHTML = `
            <div class="modern-card p-6">
                <h2 class="text-2xl font-bold mb-6">Relatório do Mês</h2>
                
                <div class="grid grid-cols-2 gap-4 mb-8">
                    <div class="bg-green-50 p-4 rounded-lg">
                        <p class="text-gray-600 text-sm">Total de Receitas</p>
                        <p class="text-2xl font-bold text-green-600">R$ ${totals.income.toFixed(2)}</p>
                    </div>
                    <div class="bg-red-50 p-4 rounded-lg">
                        <p class="text-gray-600 text-sm">Total de Despesas</p>
                        <p class="text-2xl font-bold text-red-600">R$ ${totals.expense.toFixed(2)}</p>
                    </div>
                </div>

                <h3 class="text-lg font-semibold mb-4">Despesas por Categoria</h3>
                <div class="space-y-3">
                    ${Object.entries(categories).map(([cat, vals]) => `
                        <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <span>${cat}</span>
                            <span class="font-semibold">R$ ${vals.expense.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // ========================================================================
    // MODAIS
    // ========================================================================

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            const form = modal.querySelector('form');
            if (form) form.reset();
        }
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    },

    // ========================================================================
    // NOTIFICAÇÕES
    // ========================================================================

    notify(type, message) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast show bg-${type === 'success' ? 'green' : type === 'error' ? 'red' : 'blue'}-500 text-white px-4 py-3 rounded-lg shadow-lg`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    // ========================================================================
    // EVENT LISTENERS
    // ========================================================================

    setupEventListeners() {
        // Abas
        document.querySelectorAll('[data-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.closest('[data-tab]').dataset.tab));
        });

        // Modal de Transação
        const txnForm = document.getElementById('transactionForm');
        if (txnForm) {
            txnForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(txnForm);
                this.addTransaction({
                    description: formData.get('description'),
                    amount: parseFloat(formData.get('amount')),
                    type: formData.get('type'),
                    category: formData.get('category'),
                    date: formData.get('date') || new Date().toISOString(),
                    installments: parseInt(formData.get('installments')) || 1
                });
            });
        }

        // Modal de Orçamento
        const budgetForm = document.getElementById('budgetForm');
        if (budgetForm) {
            budgetForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(budgetForm);
                this.addBudget({
                    category: formData.get('category'),
                    limit: parseFloat(formData.get('amount'))
                });
            });
        }

        // Modal de Meta
        const goalForm = document.getElementById('goalForm');
        if (goalForm) {
            goalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = new FormData(goalForm);
                this.addGoal({
                    title: formData.get('title'),
                    targetAmount: parseFloat(formData.get('targetAmount')),
                    currentAmount: parseFloat(formData.get('currentAmount')) || 0,
                    targetDate: formData.get('targetDate')
                });
            });
        }

        // Fechar modais
        document.querySelectorAll('[data-close-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('[data-modal]');
                if (modal) this.closeModal(modal.id);
            });
        });

        // FAB Button
        const fab = document.getElementById('fabButton');
        if (fab) {
            fab.addEventListener('click', () => this.openModal('transactionModal'));
        }

        // Fechar modal ao clicar fora
        document.querySelectorAll('[data-modal]').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal(modal.id);
            });
        });

        // Settings Menu
        const settingsBtn = document.getElementById('settingsButton');
        const settingsMenu = document.getElementById('settingsMenu');
        if (settingsBtn && settingsMenu) {
            settingsBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                settingsMenu.classList.toggle('hidden');
            });
            document.addEventListener('click', () => settingsMenu.classList.add('hidden'));
        }

        // Menu de dados
        const loadSampleBtn = document.getElementById('loadSampleBtn');
        if (loadSampleBtn) {
            loadSampleBtn.addEventListener('click', () => {
                this.loadSampleData();
                this.renderDashboard();
                this.notify('success', 'Dados de exemplo carregados!');
            });
        }

        // Online/Offline
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.notify('success', 'Você está online');
        });
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.notify('error', 'Você está offline');
        });
    },

    setupTabNavigation() {
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const tabId = tab.dataset.tab;
                document.querySelectorAll('[data-tab-content]').forEach(content => {
                    content.style.display = 'none';
                });
                document.getElementById(tabId + 'Content').style.display = 'block';

                if (tabId === 'lancamentos') this.renderTransactions();
                else if (tabId === 'orcamento') this.renderBudgets();
                else if (tabId === 'metas') this.renderGoals();
                else if (tabId === 'relatorios') this.renderReports();
            });
        });
    },

    switchTab(tabId) {
        document.querySelectorAll('[data-tab]').forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');

        document.querySelectorAll('[data-tab-content]').forEach(c => c.style.display = 'none');
        document.getElementById(tabId + 'Content').style.display = 'block';

        if (tabId === 'lancamentos') this.renderTransactions();
        else if (tabId === 'orcamento') this.renderBudgets();
        else if (tabId === 'metas') this.renderGoals();
        else if (tabId === 'relatorios') this.renderReports();
    },

    setupAutoSave() {
        setInterval(() => {
            if (this.config.autoSave) {
                this.saveUserData();
                console.log('💾 Auto-save executado');
            }
        }, this.config.autoSaveInterval);
    }
};

// ============================================================================
// INICIALIZAÇÃO AO CARREGAR O DOM
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
});

// Expor globalmente
window.app = app;
