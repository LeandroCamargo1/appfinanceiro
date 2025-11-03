/**
 * Utilitário para recuperação de dados do Firebase antigo
 * Permite buscar e importar dados de projetos Firebase anteriores
 */
export class FirebaseDataRecovery {
    constructor(firebaseService, notificationService) {
        this.firebaseService = firebaseService;
        this.notificationService = notificationService;
        this.recoveredData = {
            transactions: [],
            budgets: [],
            goals: [],
            categories: [],
            users: []
        };
    }

    /**
     * Busca dados do Firebase com diferentes estruturas possíveis
     */
    async searchForData() {
        if (!this.firebaseService.isAuthenticated()) {
            throw new Error('Usuário deve estar autenticado para buscar dados');
        }

        console.log('🔍 Iniciando busca por dados antigos...');
        const results = {
            found: false,
            collections: [],
            data: {}
        };

        try {
            // Estruturas de dados possíveis em apps antigos
            const possibleCollections = [
                'transactions',
                'transacoes', 
                'financas',
                'expenses',
                'income',
                'budgets',
                'orcamentos',
                'goals',
                'metas',
                'categories',
                'categorias',
                'users',
                'usuarios',
                'contas',
                'accounts'
            ];

            const user = this.firebaseService.getCurrentUser();
            const db = this.firebaseService.db;

            for (const collection of possibleCollections) {
                try {
                    console.log(`🔍 Verificando coleção: ${collection}`);
                    
                    // Tentar buscar na estrutura atual (users/uid/collection)
                    let snapshot = await db
                        .collection('users')
                        .doc(user.uid)
                        .collection(collection)
                        .limit(5)
                        .get();

                    if (!snapshot.empty) {
                        console.log(`✅ Encontrados dados em users/${user.uid}/${collection}`);
                        results.collections.push(`users/${user.uid}/${collection}`);
                        results.data[collection] = await this.getAllDocuments(
                            db.collection('users').doc(user.uid).collection(collection)
                        );
                        results.found = true;
                    }

                    // Tentar buscar na raiz (estrutura antiga comum)
                    snapshot = await db
                        .collection(collection)
                        .where('userId', '==', user.uid)
                        .limit(5)
                        .get();

                    if (!snapshot.empty) {
                        console.log(`✅ Encontrados dados em ${collection} (raiz com userId)`);
                        results.collections.push(`${collection} (userId: ${user.uid})`);
                        if (!results.data[collection]) results.data[collection] = [];
                        const rootData = await this.getAllDocuments(
                            db.collection(collection).where('userId', '==', user.uid)
                        );
                        results.data[collection] = [...results.data[collection], ...rootData];
                        results.found = true;
                    }

                    // Tentar buscar na raiz com email
                    snapshot = await db
                        .collection(collection)
                        .where('userEmail', '==', user.email)
                        .limit(5)
                        .get();

                    if (!snapshot.empty) {
                        console.log(`✅ Encontrados dados em ${collection} (raiz com userEmail)`);
                        results.collections.push(`${collection} (userEmail: ${user.email})`);
                        if (!results.data[collection]) results.data[collection] = [];
                        const emailData = await this.getAllDocuments(
                            db.collection(collection).where('userEmail', '==', user.email)
                        );
                        results.data[collection] = [...results.data[collection], ...emailData];
                        results.found = true;
                    }

                    // Tentar buscar na raiz sem filtro (cuidado!)
                    snapshot = await db
                        .collection(collection)
                        .limit(5)
                        .get();

                    if (!snapshot.empty) {
                        console.log(`⚠️ Encontrados dados em ${collection} (sem filtro - pode conter dados de outros usuários)`);
                        results.collections.push(`${collection} (sem filtro)`);
                    }

                } catch (error) {
                    console.log(`❌ Erro ao verificar ${collection}:`, error.message);
                }
            }

            return results;

        } catch (error) {
            console.error('❌ Erro na busca de dados:', error);
            throw error;
        }
    }

    /**
     * Busca todos os documentos de uma referência de coleção
     */
    async getAllDocuments(collectionRef) {
        const snapshot = await collectionRef.get();
        const documents = [];
        
        snapshot.forEach(doc => {
            documents.push({
                id: doc.id,
                ...doc.data(),
                _firebaseId: doc.id,
                _recovered: true,
                _recoveredAt: new Date().toISOString()
            });
        });

        return documents;
    }

    /**
     * Analisa e categoriza os dados encontrados
     */
    analyzeRecoveredData(data) {
        console.log('🔍 Analisando dados recuperados...');
        const analysis = {
            transactions: 0,
            budgets: 0,
            goals: 0,
            categories: 0,
            other: 0,
            totalDocuments: 0,
            possibleMatches: {}
        };

        for (const [collection, documents] of Object.entries(data)) {
            if (!Array.isArray(documents)) continue;
            
            analysis.totalDocuments += documents.length;
            
            // Analisar estrutura dos documentos para identificar tipo
            const sampleDoc = documents[0];
            if (sampleDoc) {
                const fields = Object.keys(sampleDoc);
                
                // Detectar transações
                if (fields.some(f => ['amount', 'valor', 'value', 'price', 'preco'].includes(f.toLowerCase())) &&
                    fields.some(f => ['date', 'data', 'created', 'timestamp'].includes(f.toLowerCase()))) {
                    analysis.possibleMatches[collection] = 'transactions';
                    analysis.transactions += documents.length;
                }
                // Detectar orçamentos
                else if (fields.some(f => ['budget', 'orcamento', 'limit', 'limite'].includes(f.toLowerCase()))) {
                    analysis.possibleMatches[collection] = 'budgets';
                    analysis.budgets += documents.length;
                }
                // Detectar metas
                else if (fields.some(f => ['goal', 'meta', 'target', 'objetivo'].includes(f.toLowerCase()))) {
                    analysis.possibleMatches[collection] = 'goals';
                    analysis.goals += documents.length;
                }
                // Detectar categorias
                else if (fields.some(f => ['category', 'categoria', 'name', 'nome'].includes(f.toLowerCase())) &&
                         !fields.some(f => ['amount', 'valor'].includes(f.toLowerCase()))) {
                    analysis.possibleMatches[collection] = 'categories';
                    analysis.categories += documents.length;
                }
                else {
                    analysis.possibleMatches[collection] = 'other';
                    analysis.other += documents.length;
                }
            }
        }

        return analysis;
    }

    /**
     * Converte dados antigos para o formato atual
     */
    convertToCurrentFormat(data, targetType) {
        const converted = [];
        
        for (const item of data) {
            let convertedItem = {};
            
            switch (targetType) {
                case 'transactions':
                    convertedItem = this.convertTransaction(item);
                    break;
                case 'budgets':
                    convertedItem = this.convertBudget(item);
                    break;
                case 'goals':
                    convertedItem = this.convertGoal(item);
                    break;
                case 'categories':
                    convertedItem = this.convertCategory(item);
                    break;
                default:
                    convertedItem = item;
            }
            
            if (convertedItem && Object.keys(convertedItem).length > 0) {
                converted.push(convertedItem);
            }
        }
        
        return converted;
    }

    /**
     * Converte transação para formato atual
     */
    convertTransaction(oldTransaction) {
        const transaction = {
            id: this.generateId(),
            amount: this.extractAmount(oldTransaction),
            description: this.extractDescription(oldTransaction),
            category: this.extractCategory(oldTransaction),
            date: this.extractDate(oldTransaction),
            type: this.extractType(oldTransaction),
            tags: this.extractTags(oldTransaction),
            createdAt: oldTransaction._recoveredAt,
            _recovered: true,
            _originalId: oldTransaction._firebaseId
        };

        // Remover campos undefined
        return Object.fromEntries(
            Object.entries(transaction).filter(([_, value]) => value !== undefined)
        );
    }

    /**
     * Converte orçamento para formato atual
     */
    convertBudget(oldBudget) {
        return {
            id: this.generateId(),
            category: oldBudget.category || oldBudget.categoria || 'Geral',
            limit: oldBudget.limit || oldBudget.limite || oldBudget.amount || oldBudget.valor || 0,
            spent: oldBudget.spent || oldBudget.gasto || 0,
            month: oldBudget.month || oldBudget.mes || new Date().getMonth() + 1,
            year: oldBudget.year || oldBudget.ano || new Date().getFullYear(),
            createdAt: oldBudget._recoveredAt,
            _recovered: true,
            _originalId: oldBudget._firebaseId
        };
    }

    /**
     * Converte meta para formato atual
     */
    convertGoal(oldGoal) {
        return {
            id: this.generateId(),
            name: oldGoal.name || oldGoal.nome || oldGoal.title || oldGoal.titulo || 'Meta',
            target: oldGoal.target || oldGoal.meta || oldGoal.objetivo || oldGoal.amount || oldGoal.valor || 0,
            current: oldGoal.current || oldGoal.atual || oldGoal.saved || oldGoal.economizado || 0,
            category: oldGoal.category || oldGoal.categoria || 'Geral',
            deadline: oldGoal.deadline || oldGoal.prazo || oldGoal.date || oldGoal.data,
            description: oldGoal.description || oldGoal.descricao || '',
            createdAt: oldGoal._recoveredAt,
            _recovered: true,
            _originalId: oldGoal._firebaseId
        };
    }

    /**
     * Converte categoria para formato atual
     */
    convertCategory(oldCategory) {
        return {
            id: this.generateId(),
            name: oldCategory.name || oldCategory.nome || oldCategory.category || 'Categoria',
            icon: oldCategory.icon || oldCategory.icone || '📊',
            color: oldCategory.color || oldCategory.cor || '#3B82F6',
            type: oldCategory.type || oldCategory.tipo || 'expense',
            createdAt: oldCategory._recoveredAt,
            _recovered: true,
            _originalId: oldCategory._firebaseId
        };
    }

    // Métodos auxiliares para extração de dados
    extractAmount(item) {
        return item.amount || item.valor || item.value || item.price || item.preco || 0;
    }

    extractDescription(item) {
        return item.description || item.descricao || item.title || item.titulo || item.name || item.nome || '';
    }

    extractCategory(item) {
        return item.category || item.categoria || item.type || item.tipo || 'Geral';
    }

    extractDate(item) {
        const dateFields = ['date', 'data', 'created', 'createdAt', 'timestamp'];
        for (const field of dateFields) {
            if (item[field]) {
                // Tentar diferentes formatos de data
                if (item[field].toDate) return item[field].toDate(); // Firestore Timestamp
                if (item[field]._seconds) return new Date(item[field]._seconds * 1000); // Firestore Timestamp serializado
                return new Date(item[field]);
            }
        }
        return new Date();
    }

    extractType(item) {
        if (item.type) return item.type;
        if (item.tipo) return item.tipo;
        
        // Inferir do valor
        const amount = this.extractAmount(item);
        return amount < 0 ? 'expense' : 'income';
    }

    extractTags(item) {
        if (item.tags && Array.isArray(item.tags)) return item.tags;
        if (item.labels && Array.isArray(item.labels)) return item.labels;
        return [];
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Importa dados convertidos para o sistema atual
     */
    async importData(convertedData, targetManager) {
        let importedCount = 0;
        const errors = [];

        for (const item of convertedData) {
            try {
                if (targetManager.add) {
                    await targetManager.add(item);
                } else if (targetManager.create) {
                    await targetManager.create(item);
                } else {
                    // Tentar método genérico
                    targetManager.items = targetManager.items || [];
                    targetManager.items.push(item);
                }
                importedCount++;
            } catch (error) {
                console.error('❌ Erro ao importar item:', error);
                errors.push({ item, error: error.message });
            }
        }

        return { importedCount, errors };
    }

    /**
     * Cria backup dos dados atuais antes da importação
     */
    createBackup(currentData) {
        const backup = {
            timestamp: new Date().toISOString(),
            data: JSON.parse(JSON.stringify(currentData))
        };

        localStorage.setItem('firebase_recovery_backup', JSON.stringify(backup));
        console.log('💾 Backup criado antes da importação');
        
        return backup;
    }

    /**
     * Restaura backup em caso de problema
     */
    restoreBackup() {
        const backup = localStorage.getItem('firebase_recovery_backup');
        if (backup) {
            return JSON.parse(backup);
        }
        return null;
    }
}