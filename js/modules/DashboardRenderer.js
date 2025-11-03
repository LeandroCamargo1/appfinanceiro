/**
 * DashboardRenderer - Renderizador do dashboard principal
 * Responsável por renderizar resumos, cards e estatísticas
 */

export class DashboardRenderer {
    constructor() {
        this.containerId = 'resumoContent';
        this.isRendering = false;
    }

    /**
     * Renderiza o dashboard completo
     */
    async render(data) {
        if (this.isRendering) {
            console.warn('⚠️ Renderização já em andamento');
            return;
        }

        this.isRendering = true;

        try {
            console.log('🎨 Renderizando dashboard...');
            
            const container = document.getElementById(this.containerId);
            if (!container) {
                throw new Error('Container do dashboard não encontrado');
            }

            // Gerar HTML do dashboard
            const dashboardHTML = this.generateDashboardHTML(data);
            container.innerHTML = dashboardHTML;

            // Inicializar eventos dos elementos
            this.initializeEventListeners();

            console.log('✅ Dashboard renderizado com sucesso');

        } catch (error) {
            console.error('❌ Erro ao renderizar dashboard:', error);
            this.renderError();
        } finally {
            this.isRendering = false;
        }
    }

    /**
     * Gera HTML completo do dashboard
     */
    generateDashboardHTML(data) {
        const { transactions = [], budgets = [], goals = [] } = data;
        
        // Calcular estatísticas
        const stats = this.calculateStats(transactions);
        const recentTransactions = this.getRecentTransactions(transactions, 5);
        const categoryStats = this.calculateCategoryStats(transactions);

        return `
            <!-- Cards de Resumo -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${this.generateSummaryCards(stats)}
            </div>

            <!-- Gráficos e Listas -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Gráfico de Categorias -->
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-lg font-semibold mb-4 flex items-center">
                        <span class="mr-2">📊</span>
                        Gastos por Categoria
                    </h3>
                    <div class="h-64 flex items-center justify-center">
                        <canvas id="categoryChart" width="300" height="300"></canvas>
                    </div>
                </div>

                <!-- Transações Recentes -->
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-lg font-semibold mb-4 flex items-center justify-between">
                        <span class="flex items-center">
                            <span class="mr-2">📋</span>
                            Transações Recentes
                        </span>
                        <button id="viewAllTransactions" class="text-blue-600 hover:text-blue-800 text-sm">
                            Ver todas
                        </button>
                    </h3>
                    <div class="space-y-3">
                        ${this.generateRecentTransactionsList(recentTransactions)}
                    </div>
                </div>
            </div>

            <!-- Seção de Metas e Orçamentos -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <!-- Progresso das Metas -->
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-lg font-semibold mb-4 flex items-center">
                        <span class="mr-2">🎯</span>
                        Progresso das Metas
                    </h3>
                    ${this.generateGoalsSection(goals)}
                </div>

                <!-- Status do Orçamento -->
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-lg font-semibold mb-4 flex items-center">
                        <span class="mr-2">💰</span>
                        Status do Orçamento
                    </h3>
                    ${this.generateBudgetSection(budgets, transactions)}
                </div>
            </div>
        `;
    }

    /**
     * Gera cards de resumo
     */
    generateSummaryCards(stats) {
        const cards = [
            {
                title: 'Receitas',
                value: this.formatCurrency(stats.receitas),
                icon: '💰',
                color: 'green',
                change: stats.receitasChange,
                changeType: stats.receitasChange >= 0 ? 'positive' : 'negative'
            },
            {
                title: 'Despesas',
                value: this.formatCurrency(stats.despesas),
                icon: '💸',
                color: 'red',
                change: stats.despesasChange,
                changeType: stats.despesasChange <= 0 ? 'positive' : 'negative'
            },
            {
                title: 'Saldo',
                value: this.formatCurrency(stats.saldo),
                icon: stats.saldo >= 0 ? '📈' : '📉',
                color: stats.saldo >= 0 ? 'green' : 'red',
                change: stats.saldoChange,
                changeType: stats.saldoChange >= 0 ? 'positive' : 'negative'
            },
            {
                title: 'Transações',
                value: stats.totalTransactions.toString(),
                icon: '📊',
                color: 'blue',
                change: stats.transactionsChange,
                changeType: 'neutral'
            }
        ];

        return cards.map(card => this.generateSummaryCard(card)).join('');
    }

    /**
     * Gera um card de resumo individual
     */
    generateSummaryCard(card) {
        const colorClasses = {
            green: 'bg-green-50 text-green-700 border-green-200',
            red: 'bg-red-50 text-red-700 border-red-200',
            blue: 'bg-blue-50 text-blue-700 border-blue-200',
            yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200'
        };

        const changeIcon = card.changeType === 'positive' ? '↗️' : 
                          card.changeType === 'negative' ? '↘️' : '➡️';
        
        const changeColor = card.changeType === 'positive' ? 'text-green-600' : 
                           card.changeType === 'negative' ? 'text-red-600' : 'text-gray-600';

        return `
            <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 ${colorClasses[card.color]} transition-transform hover:scale-105">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm font-medium text-gray-600">${card.title}</p>
                        <p class="text-2xl font-bold text-gray-900 mt-1">${card.value}</p>
                        ${card.change !== undefined ? `
                            <p class="text-sm ${changeColor} flex items-center mt-2">
                                <span class="mr-1">${changeIcon}</span>
                                ${Math.abs(card.change).toFixed(1)}% vs mês anterior
                            </p>
                        ` : ''}
                    </div>
                    <div class="text-3xl">${card.icon}</div>
                </div>
            </div>
        `;
    }

    /**
     * Gera lista de transações recentes
     */
    generateRecentTransactionsList(transactions) {
        if (!transactions || transactions.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">📭</div>
                    <p>Nenhuma transação encontrada</p>
                    <button id="addFirstTransaction" class="mt-3 text-blue-600 hover:text-blue-800">
                        Adicionar primeira transação
                    </button>
                </div>
            `;
        }

        return transactions.map(transaction => this.generateTransactionItem(transaction)).join('');
    }

    /**
     * Gera item de transação
     */
    generateTransactionItem(transaction) {
        const isIncome = transaction.type === 'receita';
        const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
        const amountPrefix = isIncome ? '+' : '-';
        
        // Obter informações da categoria (simulado - seria buscado do TransactionManager)
        const categoryInfo = this.getCategoryInfo(transaction.category);
        
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
        });

        return `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg" 
                         style="background-color: ${categoryInfo.color}20; color: ${categoryInfo.color};">
                        ${categoryInfo.icon}
                    </div>
                    <div>
                        <p class="font-medium text-gray-900">${transaction.description}</p>
                        <p class="text-sm text-gray-500">${categoryInfo.name} • ${formattedDate}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold ${amountColor}">
                        ${amountPrefix}${this.formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    ${!transaction.isPaid ? '<span class="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Pendente</span>' : ''}
                </div>
            </div>
        `;
    }

    /**
     * Gera seção de metas
     */
    generateGoalsSection(goals) {
        if (!goals || goals.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">🎯</div>
                    <p>Nenhuma meta definida</p>
                    <button id="addFirstGoal" class="mt-3 text-blue-600 hover:text-blue-800">
                        Definir primeira meta
                    </button>
                </div>
            `;
        }

        return `
            <div class="space-y-4">
                ${goals.slice(0, 3).map(goal => this.generateGoalItem(goal)).join('')}
                ${goals.length > 3 ? `
                    <button id="viewAllGoals" class="w-full text-center py-2 text-blue-600 hover:text-blue-800">
                        Ver todas as ${goals.length} metas
                    </button>
                ` : ''}
            </div>
        `;
    }

    /**
     * Gera item de meta
     */
    generateGoalItem(goal) {
        const progress = (goal.currentAmount / goal.targetAmount) * 100;
        const isCompleted = progress >= 100;
        
        return `
            <div class="border rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-gray-900">${goal.title}</h4>
                    <span class="text-sm ${isCompleted ? 'text-green-600' : 'text-gray-600'}">
                        ${progress.toFixed(1)}%
                    </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                         style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <div class="flex justify-between text-sm text-gray-600">
                    <span>${this.formatCurrency(goal.currentAmount)}</span>
                    <span>${this.formatCurrency(goal.targetAmount)}</span>
                </div>
            </div>
        `;
    }

    /**
     * Gera seção de orçamento
     */
    generateBudgetSection(budgets, transactions) {
        if (!budgets || budgets.length === 0) {
            return `
                <div class="text-center py-8 text-gray-500">
                    <div class="text-4xl mb-2">💰</div>
                    <p>Nenhum orçamento definido</p>
                    <button id="addFirstBudget" class="mt-3 text-blue-600 hover:text-blue-800">
                        Criar primeiro orçamento
                    </button>
                </div>
            `;
        }

        // Calcular gastos por categoria para comparar com orçamentos
        const categorySpending = this.calculateCategorySpending(transactions);

        return `
            <div class="space-y-4">
                ${budgets.slice(0, 4).map(budget => 
                    this.generateBudgetItem(budget, categorySpending[budget.category] || 0)
                ).join('')}
            </div>
        `;
    }

    /**
     * Gera item de orçamento
     */
    generateBudgetItem(budget, spent) {
        const progress = (spent / budget.amount) * 100;
        const isOverBudget = progress > 100;
        const remaining = budget.amount - spent;
        
        const progressColor = isOverBudget ? 'bg-red-500' : 
                             progress > 80 ? 'bg-yellow-500' : 'bg-green-500';

        return `
            <div class="border rounded-lg p-4">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-gray-900">${budget.name}</h4>
                    <span class="text-sm ${isOverBudget ? 'text-red-600' : 'text-gray-600'}">
                        ${progress.toFixed(1)}%
                    </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div class="${progressColor} h-2 rounded-full transition-all duration-300" 
                         style="width: ${Math.min(progress, 100)}%"></div>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-600">
                        Gasto: ${this.formatCurrency(spent)}
                    </span>
                    <span class="${remaining >= 0 ? 'text-green-600' : 'text-red-600'}">
                        ${remaining >= 0 ? 'Restam' : 'Excesso'}: ${this.formatCurrency(Math.abs(remaining))}
                    </span>
                </div>
            </div>
        `;
    }

    /**
     * Calcula estatísticas principais
     */
    calculateStats(transactions) {
        const currentMonth = this.getCurrentMonthTransactions(transactions);
        const previousMonth = this.getPreviousMonthTransactions(transactions);

        const currentStats = this.calculateBasicStats(currentMonth);
        const previousStats = this.calculateBasicStats(previousMonth);

        return {
            ...currentStats,
            receitasChange: this.calculatePercentageChange(previousStats.receitas, currentStats.receitas),
            despesasChange: this.calculatePercentageChange(previousStats.despesas, currentStats.despesas),
            saldoChange: this.calculatePercentageChange(previousStats.saldo, currentStats.saldo),
            transactionsChange: this.calculatePercentageChange(previousStats.totalTransactions, currentStats.totalTransactions)
        };
    }

    /**
     * Calcula estatísticas básicas
     */
    calculateBasicStats(transactions) {
        const stats = {
            receitas: 0,
            despesas: 0,
            saldo: 0,
            totalTransactions: transactions.length
        };

        transactions.forEach(t => {
            if (t.type === 'receita') {
                stats.receitas += t.amount;
            } else if (t.type === 'despesa') {
                stats.despesas += t.amount;
            }
        });

        stats.saldo = stats.receitas - stats.despesas;
        return stats;
    }

    /**
     * Calcula mudança percentual
     */
    calculatePercentageChange(previous, current) {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / previous) * 100;
    }

    /**
     * Obtém transações do mês atual
     */
    getCurrentMonthTransactions(transactions) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startOfMonth && transactionDate <= endOfMonth;
        });
    }

    /**
     * Obtém transações do mês anterior
     */
    getPreviousMonthTransactions(transactions) {
        const now = new Date();
        const startOfPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= startOfPreviousMonth && transactionDate <= endOfPreviousMonth;
        });
    }

    /**
     * Obtém transações recentes
     */
    getRecentTransactions(transactions, limit = 5) {
        return transactions
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    /**
     * Calcula estatísticas por categoria
     */
    calculateCategoryStats(transactions) {
        const stats = {};
        
        transactions.forEach(t => {
            if (!stats[t.category]) {
                stats[t.category] = {
                    total: 0,
                    count: 0
                };
            }
            stats[t.category].total += t.amount;
            stats[t.category].count++;
        });

        return stats;
    }

    /**
     * Calcula gastos por categoria (apenas despesas)
     */
    calculateCategorySpending(transactions) {
        const spending = {};
        
        transactions
            .filter(t => t.type === 'despesa')
            .forEach(t => {
                spending[t.category] = (spending[t.category] || 0) + t.amount;
            });

        return spending;
    }

    /**
     * Obtém informações da categoria (mock - seria integrado com TransactionManager)
     */
    getCategoryInfo(categoryId) {
        const defaultCategories = {
            'alimentacao': { name: 'Alimentação', icon: '🍽️', color: '#EF4444' },
            'transporte': { name: 'Transporte', icon: '🚗', color: '#F97316' },
            'moradia': { name: 'Moradia', icon: '🏠', color: '#8B5CF6' },
            'saude': { name: 'Saúde', icon: '🏥', color: '#EC4899' },
            'salario': { name: 'Salário', icon: '💰', color: '#10B981' },
            'freelance': { name: 'Freelance', icon: '💻', color: '#8B5CF6' }
        };

        return defaultCategories[categoryId] || {
            name: categoryId,
            icon: '❓',
            color: '#6B7280'
        };
    }

    /**
     * Formata valor monetário
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    /**
     * Inicializa event listeners
     */
    initializeEventListeners() {
        // Botão "Ver todas as transações"
        const viewAllBtn = document.getElementById('viewAllTransactions');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', () => {
                // Disparar evento para mudar para aba de transações
                document.dispatchEvent(new CustomEvent('switchTab', { 
                    detail: { tab: 'lancamentos' } 
                }));
            });
        }

        // Botão "Adicionar primeira transação"
        const addFirstTransactionBtn = document.getElementById('addFirstTransaction');
        if (addFirstTransactionBtn) {
            addFirstTransactionBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('openTransactionModal'));
            });
        }

        // Botão "Definir primeira meta"
        const addFirstGoalBtn = document.getElementById('addFirstGoal');
        if (addFirstGoalBtn) {
            addFirstGoalBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('openGoalModal'));
            });
        }

        // Botão "Criar primeiro orçamento"
        const addFirstBudgetBtn = document.getElementById('addFirstBudget');
        if (addFirstBudgetBtn) {
            addFirstBudgetBtn.addEventListener('click', () => {
                document.dispatchEvent(new CustomEvent('openBudgetModal'));
            });
        }

        console.log('🎯 Event listeners do dashboard inicializados');
    }

    /**
     * Renderiza estado de erro
     */
    renderError() {
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">⚠️</div>
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">
                        Erro ao carregar dashboard
                    </h3>
                    <p class="text-gray-600 mb-4">
                        Ocorreu um problema ao carregar os dados financeiros.
                    </p>
                    <button id="retryDashboard" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Tentar novamente
                    </button>
                </div>
            `;

            // Adicionar listener para retry
            const retryBtn = document.getElementById('retryDashboard');
            if (retryBtn) {
                retryBtn.addEventListener('click', () => {
                    location.reload();
                });
            }
        }
    }

    /**
     * Atualiza apenas uma seção específica
     */
    async updateSection(sectionName, data) {
        try {
            const section = document.querySelector(`[data-section="${sectionName}"]`);
            if (!section) {
                console.warn(`⚠️ Seção ${sectionName} não encontrada`);
                return;
            }

            // Implementar atualização específica por seção
            switch (sectionName) {
                case 'summary':
                    // Atualizar cards de resumo
                    break;
                case 'recent':
                    // Atualizar transações recentes
                    break;
                case 'goals':
                    // Atualizar metas
                    break;
                case 'budget':
                    // Atualizar orçamentos
                    break;
            }

            console.log(`✅ Seção ${sectionName} atualizada`);

        } catch (error) {
            console.error(`❌ Erro ao atualizar seção ${sectionName}:`, error);
        }
    }
}