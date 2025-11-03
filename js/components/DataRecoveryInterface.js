/**
 * Componente de Interface para Recuperação de Dados do Firebase
 * Permite ao usuário buscar e importar dados antigos
 */
export class DataRecoveryInterface {
    constructor(firebaseService, financeApp) {
        this.firebaseService = firebaseService;
        this.financeApp = financeApp;
        this.recovery = null;
        this.discoveredData = null;
        this.analysis = null;
        
        this.createInterface();
    }

    /**
     * Cria a interface do modal de recuperação
     */
    createInterface() {
        const modalHTML = `
            <div id="dataRecoveryModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                    <!-- Header -->
                    <div class="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7c0-2.21-1.79-4-4-4H8c-2.21 0-4 1.79-4 4z"></path>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 class="text-xl font-bold text-white">Recuperar Dados Antigos</h3>
                                    <p class="text-blue-100">Busque e importe dados do seu Firebase anterior</p>
                                </div>
                            </div>
                            <button id="closeRecoveryModal" class="text-white hover:text-blue-200 transition-colors">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <!-- Step 1: Search -->
                        <div id="searchStep" class="space-y-6">
                            <div class="text-center">
                                <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg class="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Buscar Dados Antigos</h4>
                                <p class="text-gray-600 dark:text-gray-400 mb-6">
                                    Vamos procurar por dados de aplicativos anteriores no seu Firebase.
                                    <br>Certifique-se de estar logado com a mesma conta.
                                </p>
                                
                                <div class="bg-amber-50 dark:bg-amber-900 border border-amber-200 dark:border-amber-700 rounded-lg p-4 mb-6">
                                    <div class="flex items-start space-x-3">
                                        <svg class="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                                        </svg>
                                        <div class="text-sm text-amber-800 dark:text-amber-200">
                                            <strong>Importante:</strong> Esta busca irá procurar por diferentes estruturas de dados comuns em apps de finanças.
                                            Nenhum dado será alterado até você confirmar a importação.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-center">
                                <button id="startSearchBtn" class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                    <span>Iniciar Busca</span>
                                </button>
                            </div>
                        </div>

                        <!-- Loading -->
                        <div id="loadingStep" class="hidden text-center py-12">
                            <div class="animate-spin w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Buscando dados...</h4>
                            <p class="text-gray-600 dark:text-gray-400">Isso pode levar alguns minutos</p>
                            <div id="searchProgress" class="mt-4 text-sm text-gray-500 dark:text-gray-400"></div>
                        </div>

                        <!-- Results -->
                        <div id="resultsStep" class="hidden space-y-6">
                            <div id="noResultsMessage" class="hidden text-center py-12">
                                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 20c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                                    </svg>
                                </div>
                                <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Nenhum dado encontrado</h4>
                                <p class="text-gray-600 dark:text-gray-400">
                                    Não foram encontrados dados antigos no Firebase com a conta atual.
                                </p>
                            </div>

                            <div id="resultsContent" class="hidden">
                                <div class="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
                                    <div class="flex items-center space-x-3">
                                        <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                                        </svg>
                                        <div>
                                            <h5 class="font-medium text-green-800 dark:text-green-200">Dados encontrados!</h5>
                                            <p id="foundSummary" class="text-sm text-green-700 dark:text-green-300"></p>
                                        </div>
                                    </div>
                                </div>

                                <!-- Data Overview -->
                                <div id="dataOverview" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"></div>

                                <!-- Data Details -->
                                <div id="dataDetails" class="space-y-4"></div>

                                <!-- Import Actions -->
                                <div class="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button id="backToSearchBtn" class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                                        ← Nova busca
                                    </button>
                                    <div class="flex space-x-3">
                                        <button id="previewDataBtn" class="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                            Visualizar
                                        </button>
                                        <button id="importDataBtn" class="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200">
                                            Importar Dados
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Import Progress -->
                        <div id="importStep" class="hidden text-center py-12">
                            <div class="animate-pulse w-12 h-12 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                                </svg>
                            </div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Importando dados...</h4>
                            <p class="text-gray-600 dark:text-gray-400">Convertendo e importando seus dados</p>
                            <div id="importProgress" class="mt-4 text-sm text-gray-500 dark:text-gray-400"></div>
                        </div>

                        <!-- Success -->
                        <div id="successStep" class="hidden text-center py-12">
                            <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Importação concluída!</h4>
                            <p id="successMessage" class="text-gray-600 dark:text-gray-400 mb-6"></p>
                            
                            <button id="finishRecoveryBtn" class="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200">
                                Finalizar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.attachEventListeners();
    }

    /**
     * Anexa event listeners
     */
    attachEventListeners() {
        // Fechar modal
        document.getElementById('closeRecoveryModal').addEventListener('click', () => {
            this.hide();
        });

        // Iniciar busca
        document.getElementById('startSearchBtn').addEventListener('click', () => {
            this.startSearch();
        });

        // Voltar para busca
        document.getElementById('backToSearchBtn').addEventListener('click', () => {
            this.showStep('searchStep');
        });

        // Visualizar dados
        document.getElementById('previewDataBtn').addEventListener('click', () => {
            this.previewData();
        });

        // Importar dados
        document.getElementById('importDataBtn').addEventListener('click', () => {
            this.importData();
        });

        // Finalizar
        document.getElementById('finishRecoveryBtn').addEventListener('click', () => {
            this.hide();
            // Recarregar dashboard
            if (this.financeApp.renderDashboard) {
                this.financeApp.renderDashboard();
            }
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hide();
            }
        });
    }

    /**
     * Mostra o modal
     */
    show() {
        const modal = document.getElementById('dataRecoveryModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.showStep('searchStep');
        }
    }

    /**
     * Esconde o modal
     */
    hide() {
        const modal = document.getElementById('dataRecoveryModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    /**
     * Mostra uma etapa específica
     */
    showStep(stepId) {
        const steps = ['searchStep', 'loadingStep', 'resultsStep', 'importStep', 'successStep'];
        steps.forEach(step => {
            const element = document.getElementById(step);
            if (element) {
                if (step === stepId) {
                    element.classList.remove('hidden');
                } else {
                    element.classList.add('hidden');
                }
            }
        });
    }

    /**
     * Inicia a busca por dados
     */
    async startSearch() {
        if (!this.firebaseService.isAuthenticated()) {
            alert('Você precisa estar logado para buscar dados antigos.');
            return;
        }

        this.showStep('loadingStep');
        
        try {
            // Importar o utilitário de recuperação
            const { FirebaseDataRecovery } = await import('../utils/FirebaseDataRecovery.js');
            this.recovery = new FirebaseDataRecovery(this.firebaseService, this.financeApp.notificationService);

            // Atualizar progress
            document.getElementById('searchProgress').textContent = 'Verificando coleções...';

            // Buscar dados
            const results = await this.recovery.searchForData();
            
            if (results.found) {
                this.discoveredData = results.data;
                this.analysis = this.recovery.analyzeRecoveredData(results.data);
                this.showResults(results, this.analysis);
            } else {
                this.showNoResults();
            }

        } catch (error) {
            console.error('❌ Erro na busca:', error);
            alert('Erro ao buscar dados: ' + error.message);
            this.showStep('searchStep');
        }
    }

    /**
     * Mostra os resultados da busca
     */
    showResults(results, analysis) {
        this.showStep('resultsStep');
        
        // Mostrar conteúdo de resultados
        document.getElementById('resultsContent').classList.remove('hidden');
        
        // Summary
        const summary = `Encontrados ${analysis.totalDocuments} documentos em ${results.collections.length} coleções`;
        document.getElementById('foundSummary').textContent = summary;

        // Overview cards
        this.renderOverviewCards(analysis);
        
        // Details
        this.renderDataDetails(results.data);
    }

    /**
     * Mostra mensagem de nenhum resultado
     */
    showNoResults() {
        this.showStep('resultsStep');
        document.getElementById('noResultsMessage').classList.remove('hidden');
    }

    /**
     * Renderiza cards de overview
     */
    renderOverviewCards(analysis) {
        const overview = document.getElementById('dataOverview');
        const cards = [
            { label: 'Transações', count: analysis.transactions, icon: '💰', color: 'green' },
            { label: 'Orçamentos', count: analysis.budgets, icon: '📊', color: 'blue' },
            { label: 'Metas', count: analysis.goals, icon: '🎯', color: 'purple' },
            { label: 'Outros', count: analysis.other, icon: '📋', color: 'gray' }
        ];

        overview.innerHTML = cards.map(card => `
            <div class="bg-${card.color}-50 dark:bg-${card.color}-900 border border-${card.color}-200 dark:border-${card.color}-700 rounded-lg p-4">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-${card.color}-600 dark:text-${card.color}-400">${card.label}</p>
                        <p class="text-2xl font-bold text-${card.color}-700 dark:text-${card.color}-300">${card.count}</p>
                    </div>
                    <div class="text-2xl">${card.icon}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Renderiza detalhes dos dados
     */
    renderDataDetails(data) {
        const details = document.getElementById('dataDetails');
        let html = '';

        for (const [collection, documents] of Object.entries(data)) {
            if (!Array.isArray(documents) || documents.length === 0) continue;

            html += `
                <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h6 class="font-medium text-gray-900 dark:text-white mb-2">
                        ${collection} (${documents.length} items)
                    </h6>
                    <div class="text-sm text-gray-600 dark:text-gray-400">
                        <p>Primeiro item: ${JSON.stringify(documents[0], null, 2).substring(0, 100)}...</p>
                    </div>
                </div>
            `;
        }

        details.innerHTML = html;
    }

    /**
     * Visualiza dados antes da importação
     */
    previewData() {
        if (!this.discoveredData) return;

        let preview = 'PREVIEW DOS DADOS ENCONTRADOS:\n\n';
        
        for (const [collection, documents] of Object.entries(this.discoveredData)) {
            if (!Array.isArray(documents)) continue;
            
            preview += `=== ${collection.toUpperCase()} (${documents.length} items) ===\n`;
            
            // Mostrar primeiros 3 itens
            documents.slice(0, 3).forEach((doc, index) => {
                preview += `${index + 1}. ${JSON.stringify(doc, null, 2)}\n\n`;
            });
            
            if (documents.length > 3) {
                preview += `... e mais ${documents.length - 3} itens\n\n`;
            }
        }

        // Mostrar em uma nova janela ou modal
        const previewWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
        previewWindow.document.write(`
            <html>
                <head><title>Preview dos Dados</title></head>
                <body style="font-family: monospace; padding: 20px; white-space: pre-wrap;">
                    ${preview}
                </body>
            </html>
        `);
    }

    /**
     * Importa os dados encontrados
     */
    async importData() {
        if (!this.discoveredData || !this.recovery) return;

        this.showStep('importStep');
        
        try {
            let totalImported = 0;
            const importResults = [];

            // Criar backup
            document.getElementById('importProgress').textContent = 'Criando backup...';
            this.recovery.createBackup({
                transactions: this.financeApp.transactionManager.getAll(),
                budgets: this.financeApp.budgetManager.getAll(),
                goals: this.financeApp.goalManager.getAll()
            });

            // Importar cada tipo de dados
            for (const [collection, documents] of Object.entries(this.discoveredData)) {
                if (!Array.isArray(documents) || documents.length === 0) continue;

                const matchType = this.analysis.possibleMatches[collection];
                if (!matchType || matchType === 'other') continue;

                document.getElementById('importProgress').textContent = `Importando ${collection}...`;

                // Converter dados
                const converted = this.recovery.convertToCurrentFormat(documents, matchType);
                
                // Importar baseado no tipo
                let targetManager;
                switch (matchType) {
                    case 'transactions':
                        targetManager = this.financeApp.transactionManager;
                        break;
                    case 'budgets':
                        targetManager = this.financeApp.budgetManager;
                        break;
                    case 'goals':
                        targetManager = this.financeApp.goalManager;
                        break;
                }

                if (targetManager) {
                    const result = await this.recovery.importData(converted, targetManager);
                    totalImported += result.importedCount;
                    importResults.push({
                        collection,
                        type: matchType,
                        imported: result.importedCount,
                        errors: result.errors.length
                    });
                }
            }

            // Salvar dados
            document.getElementById('importProgress').textContent = 'Salvando...';
            await this.financeApp.saveAllData();

            // Mostrar sucesso
            this.showSuccess(totalImported, importResults);

        } catch (error) {
            console.error('❌ Erro na importação:', error);
            alert('Erro na importação: ' + error.message);
            this.showStep('resultsStep');
        }
    }

    /**
     * Mostra tela de sucesso
     */
    showSuccess(totalImported, results) {
        this.showStep('successStep');
        
        let message = `${totalImported} itens importados com sucesso!\n\n`;
        results.forEach(result => {
            message += `• ${result.collection}: ${result.imported} ${result.type}\n`;
        });

        document.getElementById('successMessage').textContent = message;
    }
}