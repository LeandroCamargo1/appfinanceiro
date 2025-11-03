/**
 * GoalManager - Gerenciador de metas financeiras
 * Versão inicial simplificada
 */

export class GoalManager {
    constructor() {
        this.goals = [];
        this.storageKey = 'financeApp_goals';
    }

    async loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.goals = JSON.parse(saved);
            }
            console.log(`🎯 ${this.goals.length} metas carregadas`);
        } catch (error) {
            console.error('❌ Erro ao carregar metas:', error);
        }
    }

    async saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.goals));
            console.log(`💾 ${this.goals.length} metas salvas`);
        } catch (error) {
            console.error('❌ Erro ao salvar metas:', error);
        }
    }

    async add(goalData) {
        const goal = {
            id: this.generateId(),
            title: goalData.title,
            targetAmount: parseFloat(goalData.targetAmount),
            currentAmount: parseFloat(goalData.currentAmount) || 0,
            targetDate: goalData.targetDate,
            category: goalData.category || 'general',
            createdAt: new Date().toISOString()
        };

        this.goals.push(goal);
        await this.saveToStorage();
        return goal;
    }

    getAll() {
        return [...this.goals];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }
}