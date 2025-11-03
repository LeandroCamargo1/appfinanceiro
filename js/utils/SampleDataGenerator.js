/**
 * Dados de exemplo para demonstração do sistema
 */
export class SampleDataGenerator {
    
    /**
     * Gera transações de exemplo (a partir de outubro 2025)
     */
    static generateSampleTransactions() {
        const sampleTransactions = [
            {
                id: 'sample-1',
                description: 'Salário',
                amount: 5000.00,
                type: 'receita',
                category: 'Salário',
                date: new Date(2025, 9, 5).toISOString(), // Outubro 2025
                installments: 1,
                installmentNumber: 1,
                createdAt: new Date(2025, 9, 5).toISOString()
            },
            {
                id: 'sample-2',
                description: 'Aluguel',
                amount: 1200.00,
                type: 'despesa',
                category: 'Moradia',
                date: new Date(2025, 9, 10).toISOString(),
                installments: 1,
                installmentNumber: 1,
                createdAt: new Date(2025, 9, 10).toISOString()
            },
            {
                id: 'sample-3',
                description: 'Supermercado',
                amount: 450.00,
                type: 'despesa',
                category: 'Alimentação',
                date: new Date(2025, 9, 12).toISOString(),
                installments: 1,
                installmentNumber: 1,
                createdAt: new Date(2025, 9, 12).toISOString()
            },
            {
                id: 'sample-4',
                description: 'Freelance Web Design',
                amount: 1500.00,
                type: 'receita',
                category: 'Freelance',
                date: new Date(2025, 9, 15).toISOString(),
                installments: 1,
                installmentNumber: 1,
                createdAt: new Date(2025, 9, 15).toISOString()
            },
            {
                id: 'sample-5',
                description: 'Conta de Luz',
                amount: 180.00,
                type: 'despesa',
                category: 'Contas',
                date: new Date(2025, 9, 18).toISOString(),
                installments: 1,
                installmentNumber: 1,
                createdAt: new Date(2025, 9, 18).toISOString()
            },
            {
                id: 'sample-6',
                description: 'Internet',
                amount: 89.90,
                type: 'despesa',
                category: 'Contas',
                date: new Date(2025, 9, 20).toISOString(),
                installments: 1,
                installmentNumber: 1,
                createdAt: new Date(2025, 9, 20).toISOString()
            },
            {
                id: 'sample-7',
                description: 'Gasolina',
                amount: 200.00,
                type: 'despesa',
                category: 'Transporte',
                date: new Date(2025, 9, 22).toISOString(),
                installments: 1,
                installmentNumber: 1,
                createdAt: new Date(2025, 9, 22).toISOString()
            },
            {
                id: 'sample-8',
                description: 'Academia',
                amount: 150.00,
                type: 'despesa',
                category: 'Saúde',
                date: new Date(2025, 9, 25).toISOString(),
                installments: 1,
                installmentNumber: 1,
                createdAt: new Date(2025, 9, 25).toISOString()
            }
        ];

        return sampleTransactions;
    }

    /**
     * Gera orçamentos de exemplo (outubro 2025)
     */
    static generateSampleBudgets() {
        const sampleBudgets = [
            {
                id: 'budget-1',
                category: 'Alimentação',
                limit: 800.00,
                spent: 450.00,
                month: 10,
                year: 2025,
                createdAt: new Date(2025, 9, 1).toISOString()
            },
            {
                id: 'budget-2',
                category: 'Transporte',
                limit: 400.00,
                spent: 200.00,
                month: 10,
                year: 2025,
                createdAt: new Date(2025, 9, 1).toISOString()
            },
            {
                id: 'budget-3',
                category: 'Contas',
                limit: 500.00,
                spent: 269.90,
                month: 10,
                year: 2025,
                createdAt: new Date(2025, 9, 1).toISOString()
            },
            {
                id: 'budget-4',
                category: 'Saúde',
                limit: 300.00,
                spent: 150.00,
                month: 10,
                year: 2025,
                createdAt: new Date(2025, 9, 1).toISOString()
            }
        ];

        return sampleBudgets;
    }

    /**
     * Gera metas de exemplo
     */
    static generateSampleGoals() {
        const sampleGoals = [
            {
                id: 'goal-1',
                name: 'Viagem para o Exterior',
                targetAmount: 8000.00,
                currentAmount: 2500.00,
                deadline: new Date(2025, 11, 31).toISOString(), // Dezembro 2025
                description: 'Economizar para uma viagem de férias para a Europa',
                createdAt: new Date(2025, 9, 1).toISOString()
            },
            {
                id: 'goal-2',
                name: 'Reserva de Emergência',
                targetAmount: 15000.00,
                currentAmount: 5000.00,
                deadline: new Date(2026, 3, 30).toISOString(), // Abril 2026
                description: 'Construir uma reserva equivalente a 6 meses de gastos',
                createdAt: new Date(2025, 9, 1).toISOString()
            },
            {
                id: 'goal-3',
                name: 'Novo Notebook',
                targetAmount: 3500.00,
                currentAmount: 1200.00,
                deadline: new Date(2025, 11, 15).toISOString(), // Dezembro 2025
                description: 'Comprar um notebook para trabalho',
                createdAt: new Date(2025, 9, 1).toISOString()
            }
        ];

        return sampleGoals;
    }

    /**
     * Carrega todos os dados de exemplo no localStorage
     */
    static loadSampleData() {
        const transactions = this.generateSampleTransactions();
        const budgets = this.generateSampleBudgets();
        const goals = this.generateSampleGoals();

        localStorage.setItem('financeApp_transactions', JSON.stringify(transactions));
        localStorage.setItem('financeApp_budgets', JSON.stringify(budgets));
        localStorage.setItem('financeApp_goals', JSON.stringify(goals));

        console.log('📊 Dados de exemplo carregados:', {
            transactions: transactions.length,
            budgets: budgets.length,
            goals: goals.length
        });

        return { transactions, budgets, goals };
    }

    /**
     * Limpa todos os dados do localStorage
     */
    static clearAllData() {
        localStorage.removeItem('financeApp_transactions');
        localStorage.removeItem('financeApp_budgets');
        localStorage.removeItem('financeApp_goals');
        
        console.log('🗑️ Todos os dados foram limpos');
    }

    /**
     * Verifica se já existem dados no localStorage
     */
    static hasExistingData() {
        const transactions = localStorage.getItem('financeApp_transactions');
        const budgets = localStorage.getItem('financeApp_budgets');
        const goals = localStorage.getItem('financeApp_goals');

        return !!(transactions || budgets || goals);
    }
}