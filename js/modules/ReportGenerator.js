/**
 * ReportGenerator - Gerador de relatórios
 * Versão inicial simplificada
 */

export class ReportGenerator {
    constructor() {
        this.reports = [];
    }

    /**
     * Gera relatório mensal
     */
    generateMonthlyReport(transactions) {
        const currentMonth = new Date();
        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === currentMonth.getMonth() &&
                   tDate.getFullYear() === currentMonth.getFullYear();
        });

        return {
            period: `${currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
            totalTransactions: monthTransactions.length,
            totalIncome: monthTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0),
            totalExpenses: monthTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0),
            transactions: monthTransactions
        };
    }

    /**
     * Gera dados para gráficos
     */
    generateChartData(transactions, type = 'category') {
        if (type === 'category') {
            const categoryData = {};
            
            transactions.forEach(t => {
                if (t.type === 'despesa') {
                    categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
                }
            });

            return {
                labels: Object.keys(categoryData),
                values: Object.values(categoryData)
            };
        }

        return { labels: [], values: [] };
    }
}