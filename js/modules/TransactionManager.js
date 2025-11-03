/**
 * TransactionManager - Gerenciador de transações financeiras
 * Responsável por CRUD, categorização e controle de parcelas
 */

export class TransactionManager {
    constructor() {
        this.transactions = [];
        this.categories = this.getDefaultCategories();
        this.storageKey = 'financeApp_transactions';
        this.categoriesKey = 'financeApp_categories';
        
        // Configurações
        this.config = {
            autoCalculateInstallments: true,
            defaultCurrency: 'BRL',
            maxInstallments: 60
        };
    }

    /**
     * Categorias padrão do sistema
     */
    getDefaultCategories() {
        return {
            receitas: [
                { id: 'salario', name: 'Salário', icon: '💰', color: '#10B981' },
                { id: 'freelance', name: 'Freelance', icon: '💻', color: '#8B5CF6' },
                { id: 'investimentos', name: 'Investimentos', icon: '📈', color: '#06B6D4' },
                { id: 'vendas', name: 'Vendas', icon: '🛒', color: '#F59E0B' },
                { id: 'outros_ganhos', name: 'Outros Ganhos', icon: '💸', color: '#84CC16' }
            ],
            despesas: [
                { id: 'alimentacao', name: 'Alimentação', icon: '🍽️', color: '#EF4444' },
                { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#F97316' },
                { id: 'moradia', name: 'Moradia', icon: '🏠', color: '#8B5CF6' },
                { id: 'saude', name: 'Saúde', icon: '🏥', color: '#EC4899' },
                { id: 'educacao', name: 'Educação', icon: '📚', color: '#3B82F6' },
                { id: 'lazer', name: 'Lazer', icon: '🎬', color: '#10B981' },
                { id: 'roupas', name: 'Roupas', icon: '👔', color: '#F59E0B' },
                { id: 'tecnologia', name: 'Tecnologia', icon: '📱', color: '#6366F1' },
                { id: 'servicos', name: 'Serviços', icon: '🔧', color: '#84CC16' },
                { id: 'outros_gastos', name: 'Outros Gastos', icon: '💳', color: '#6B7280' }
            ]
        };
    }

    /**
     * Carrega dados do localStorage
     */
    async loadFromStorage() {
        try {
            // Carregar transações
            const savedTransactions = localStorage.getItem(this.storageKey);
            if (savedTransactions) {
                this.transactions = JSON.parse(savedTransactions);
                console.log(`📥 ${this.transactions.length} transações carregadas`);
            }

            // Carregar categorias personalizadas
            const savedCategories = localStorage.getItem(this.categoriesKey);
            if (savedCategories) {
                const customCategories = JSON.parse(savedCategories);
                this.categories = { ...this.categories, ...customCategories };
            }

        } catch (error) {
            console.error('❌ Erro ao carregar transações:', error);
            this.transactions = [];
        }
    }

    /**
     * Salva dados no localStorage
     */
    async saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.transactions));
            console.log(`💾 ${this.transactions.length} transações salvas`);
        } catch (error) {
            console.error('❌ Erro ao salvar transações:', error);
            throw error;
        }
    }

    /**
     * Adiciona nova transação
     */
    async add(transactionData) {
        try {
            // Validar dados obrigatórios
            this.validateTransactionData(transactionData);

            // Criar transação base
            const transaction = this.createTransaction(transactionData);

            // Processar parcelamento se necessário
            if (transaction.installments && transaction.installments > 1) {
                const installmentTransactions = this.createInstallmentTransactions(transaction);
                this.transactions.push(...installmentTransactions);
                console.log(`💳 ${installmentTransactions.length} parcelas criadas`);
            } else {
                this.transactions.push(transaction);
                console.log('💰 Transação única criada');
            }

            // Salvar automaticamente
            await this.saveToStorage();

            return transaction;

        } catch (error) {
            console.error('❌ Erro ao adicionar transação:', error);
            throw error;
        }
    }

    /**
     * Valida dados da transação
     */
    validateTransactionData(data) {
        const required = ['description', 'amount', 'type', 'category'];
        
        for (const field of required) {
            if (!data[field]) {
                throw new Error(`Campo obrigatório ausente: ${field}`);
            }
        }

        if (!['receita', 'despesa'].includes(data.type)) {
            throw new Error('Tipo deve ser "receita" ou "despesa"');
        }

        if (isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
            throw new Error('Valor deve ser um número positivo');
        }
    }

    /**
     * Cria objeto de transação
     */
    createTransaction(data) {
        const now = new Date();
        
        return {
            id: this.generateId(),
            description: data.description.trim(),
            amount: parseFloat(data.amount),
            type: data.type,
            category: data.category,
            date: data.date || now.toISOString().split('T')[0],
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
            
            // Campos opcionais
            notes: data.notes || '',
            tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
            
            // Parcelamento
            installments: parseInt(data.installments) || 1,
            installmentNumber: 1,
            parentId: null, // Para transações parceladas
            
            // Recorrência
            isRecurring: data.isRecurring || false,
            recurringType: data.recurringType || null, // monthly, weekly, yearly
            recurringEndDate: data.recurringEndDate || null,
            
            // Status
            status: data.status || 'completed', // completed, pending, cancelled
            isPaid: data.type === 'receita' ? true : (data.isPaid || false),
            
            // Metadados
            paymentMethod: data.paymentMethod || 'money',
            location: data.location || '',
            attachments: data.attachments || []
        };
    }

    /**
     * Cria transações parceladas
     */
    createInstallmentTransactions(baseTransaction) {
        const transactions = [];
        const installmentAmount = baseTransaction.amount / baseTransaction.installments;
        const baseDate = new Date(baseTransaction.date);

        for (let i = 0; i < baseTransaction.installments; i++) {
            const installmentDate = new Date(baseDate);
            installmentDate.setMonth(baseDate.getMonth() + i);

            const installmentTransaction = {
                ...baseTransaction,
                id: this.generateId(),
                amount: installmentAmount,
                installmentNumber: i + 1,
                parentId: baseTransaction.id,
                date: installmentDate.toISOString().split('T')[0],
                description: `${baseTransaction.description} (${i + 1}/${baseTransaction.installments})`,
                isPaid: i === 0 ? baseTransaction.isPaid : false // Apenas primeira parcela paga por padrão
            };

            transactions.push(installmentTransaction);
        }

        return transactions;
    }

    /**
     * Atualiza transação existente
     */
    async update(id, updateData) {
        try {
            const index = this.transactions.findIndex(t => t.id === id);
            if (index === -1) {
                throw new Error('Transação não encontrada');
            }

            const transaction = this.transactions[index];
            
            // Atualizar dados
            Object.assign(transaction, updateData, {
                updatedAt: new Date().toISOString()
            });

            // Se for transação parcelada, perguntar se quer atualizar todas
            if (transaction.parentId || this.hasInstallments(id)) {
                console.log('💳 Transação parcelada detectada');
                // Aqui poderia ter lógica para atualizar todas as parcelas
            }

            await this.saveToStorage();
            console.log(`✏️ Transação ${id} atualizada`);

            return transaction;

        } catch (error) {
            console.error('❌ Erro ao atualizar transação:', error);
            throw error;
        }
    }

    /**
     * Remove transação
     */
    async remove(id) {
        try {
            const transaction = this.transactions.find(t => t.id === id);
            if (!transaction) {
                throw new Error('Transação não encontrada');
            }

            // Se for transação parcelada, remover todas as parcelas
            if (transaction.parentId || this.hasInstallments(id)) {
                const parentId = transaction.parentId || id;
                this.transactions = this.transactions.filter(t => 
                    t.id !== parentId && t.parentId !== parentId
                );
                console.log('💳 Todas as parcelas removidas');
            } else {
                this.transactions = this.transactions.filter(t => t.id !== id);
                console.log('🗑️ Transação removida');
            }

            await this.saveToStorage();

        } catch (error) {
            console.error('❌ Erro ao remover transação:', error);
            throw error;
        }
    }

    /**
     * Busca transação por ID
     */
    findById(id) {
        return this.transactions.find(t => t.id === id);
    }

    /**
     * Obtém todas as transações
     */
    getAll() {
        return [...this.transactions];
    }

    /**
     * Filtra transações por período
     */
    getByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= start && transactionDate <= end;
        });
    }

    /**
     * Filtra transações por categoria
     */
    getByCategory(categoryId) {
        return this.transactions.filter(t => t.category === categoryId);
    }

    /**
     * Filtra transações por tipo
     */
    getByType(type) {
        return this.transactions.filter(t => t.type === type);
    }

    /**
     * Busca transações por texto
     */
    search(query) {
        const searchTerm = query.toLowerCase();
        
        return this.transactions.filter(t => 
            t.description.toLowerCase().includes(searchTerm) ||
            t.notes.toLowerCase().includes(searchTerm) ||
            t.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Obtém transações do mês atual
     */
    getCurrentMonth() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        return this.getByDateRange(
            startOfMonth.toISOString().split('T')[0],
            endOfMonth.toISOString().split('T')[0]
        );
    }

    /**
     * Calcula totais por tipo
     */
    getTotals(transactions = null) {
        const txns = transactions || this.transactions;
        
        const totals = {
            receitas: 0,
            despesas: 0,
            saldo: 0
        };

        txns.forEach(t => {
            if (t.type === 'receita') {
                totals.receitas += t.amount;
            } else if (t.type === 'despesa') {
                totals.despesas += t.amount;
            }
        });

        totals.saldo = totals.receitas - totals.despesas;
        
        return totals;
    }

    /**
     * Calcula totais por categoria
     */
    getTotalsByCategory(type = null) {
        const filtered = type ? this.getByType(type) : this.transactions;
        const totals = {};

        filtered.forEach(t => {
            if (!totals[t.category]) {
                totals[t.category] = {
                    total: 0,
                    count: 0,
                    category: this.getCategoryInfo(t.category)
                };
            }
            
            totals[t.category].total += t.amount;
            totals[t.category].count++;
        });

        return totals;
    }

    /**
     * Obtém informações de uma categoria
     */
    getCategoryInfo(categoryId) {
        const allCategories = [...this.categories.receitas, ...this.categories.despesas];
        return allCategories.find(cat => cat.id === categoryId) || {
            id: categoryId,
            name: categoryId,
            icon: '❓',
            color: '#6B7280'
        };
    }

    /**
     * Verifica se transação tem parcelas
     */
    hasInstallments(transactionId) {
        return this.transactions.some(t => t.parentId === transactionId);
    }

    /**
     * Obtém todas as parcelas de uma transação
     */
    getInstallments(parentId) {
        return this.transactions
            .filter(t => t.parentId === parentId)
            .sort((a, b) => a.installmentNumber - b.installmentNumber);
    }

    /**
     * Marca parcela como paga
     */
    async markInstallmentAsPaid(transactionId, isPaid = true) {
        const transaction = this.findById(transactionId);
        if (!transaction) {
            throw new Error('Transação não encontrada');
        }

        transaction.isPaid = isPaid;
        transaction.updatedAt = new Date().toISOString();
        
        if (isPaid && transaction.status === 'pending') {
            transaction.status = 'completed';
        }

        await this.saveToStorage();
        console.log(`✅ Parcela ${transactionId} marcada como ${isPaid ? 'paga' : 'pendente'}`);
    }

    /**
     * Obtém transações pendentes
     */
    getPendingTransactions() {
        return this.transactions.filter(t => !t.isPaid || t.status === 'pending');
    }

    /**
     * Obtém próximas transações vencendo
     */
    getUpcomingTransactions(days = 7) {
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + days);

        return this.transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= now && 
                   transactionDate <= futureDate && 
                   !t.isPaid;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    /**
     * Gera estatísticas rápidas
     */
    getQuickStats(period = 'month') {
        let transactions;
        
        switch (period) {
            case 'week':
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                transactions = this.getByDateRange(
                    weekAgo.toISOString().split('T')[0],
                    new Date().toISOString().split('T')[0]
                );
                break;
            case 'month':
                transactions = this.getCurrentMonth();
                break;
            case 'year':
                const yearStart = new Date(new Date().getFullYear(), 0, 1);
                transactions = this.getByDateRange(
                    yearStart.toISOString().split('T')[0],
                    new Date().toISOString().split('T')[0]
                );
                break;
            default:
                transactions = this.transactions;
        }

        const totals = this.getTotals(transactions);
        const pending = transactions.filter(t => !t.isPaid).length;
        const avgTransaction = transactions.length > 0 
            ? (totals.receitas + totals.despesas) / transactions.length 
            : 0;

        return {
            ...totals,
            totalTransactions: transactions.length,
            pendingTransactions: pending,
            averageTransaction: avgTransaction,
            period
        };
    }

    /**
     * Exporta dados para JSON
     */
    exportToJSON() {
        const exportData = {
            transactions: this.transactions,
            categories: this.categories,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Importa dados de JSON
     */
    async importFromJSON(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.transactions && Array.isArray(data.transactions)) {
                this.transactions = data.transactions;
                console.log(`📥 ${this.transactions.length} transações importadas`);
            }

            if (data.categories) {
                this.categories = { ...this.categories, ...data.categories };
                console.log('📁 Categorias importadas');
            }

            await this.saveToStorage();

        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
            throw error;
        }
    }

    /**
     * Gera ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Limpa todos os dados
     */
    async clearAll() {
        this.transactions = [];
        await this.saveToStorage();
        console.log('🧹 Todas as transações removidas');
    }

    /**
     * Obtém resumo do manager
     */
    getSummary() {
        const totals = this.getTotals();
        const quickStats = this.getQuickStats();
        
        return {
            totalTransactions: this.transactions.length,
            ...totals,
            monthlyStats: quickStats,
            categories: Object.keys(this.getTotalsByCategory()).length,
            pendingCount: this.getPendingTransactions().length
        };
    }
}