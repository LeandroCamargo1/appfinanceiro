/**
 * BudgetManager - Gerenciador de orçamentos
 * Versão inicial simplificada
 */

export class BudgetManager {
    constructor() {
        this.budgets = [];
        this.storageKey = 'financeApp_budgets';
    }

    async loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.budgets = JSON.parse(saved);
            }
            console.log(`📊 ${this.budgets.length} orçamentos carregados`);
        } catch (error) {
            console.error('❌ Erro ao carregar orçamentos:', error);
        }
    }

    async saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.budgets));
            console.log(`💾 ${this.budgets.length} orçamentos salvos`);
        } catch (error) {
            console.error('❌ Erro ao salvar orçamentos:', error);
        }
    }

    async add(budgetData) {
        const budget = {
            id: this.generateId(),
            name: budgetData.name,
            category: budgetData.category,
            amount: parseFloat(budgetData.amount),
            period: budgetData.period || 'monthly',
            createdAt: new Date().toISOString()
        };

        this.budgets.push(budget);
        await this.saveToStorage();
        return budget;
    }

    getAll() {
        return [...this.budgets];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
}