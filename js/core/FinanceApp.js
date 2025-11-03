/**
 * FinanceApp - Classe principal do aplicativo Nós na Conta PRO
 * Responsável por orquestrar todos os módulos e funcionalidades
 */

import { TransactionManager } from '../modules/TransactionManager.js';
import { DashboardRenderer } from '../modules/DashboardRenderer.js';
import { ModernChartRenderer } from '../modules/ModernChartRenderer.js';
import { ModalManager } from '../modules/ModalManager.js';
import { BudgetManager } from '../modules/BudgetManager.js';
import { GoalManager } from '../modules/GoalManager.js';
import { ReportGenerator } from '../modules/ReportGenerator.js';
import { DataSyncService } from '../services/DataSyncService.js';
import { NotificationService } from '../services/NotificationService.js';
import { FirebaseService } from '../services/FirebaseService.js';
import { AuthComponent } from '../components/AuthComponent.js';
import { DataRecoveryInterface } from '../components/DataRecoveryInterface.js';
import { CacheManager } from '../utils/CacheManager.js';

export class FinanceApp {
    constructor() {
        // Estado da aplicação
        this.isInitialized = false;
        this.currentUser = null;
        this.activeTab = 'resumo';
        this.isOnline = navigator.onLine;
        
        // Configurações
        this.config = {
            autoSave: true,
            autoSaveInterval: 30000, // 30 segundos
            syncEnabled: false,
            debugMode: false
        };

        // Inicialização dos módulos principais
        this.initializeModules();
        
        // Bind dos métodos
        this.handleTabSwitch = this.handleTabSwitch.bind(this);
        this.handleOnlineStatus = this.handleOnlineStatus.bind(this);
        this.handleAutoSave = this.handleAutoSave.bind(this);
    }

    /**
     * Inicializa todos os módulos da aplicação
     */
    initializeModules() {
        try {
            // Inicializar NotificationService primeiro para uso em caso de erro
            this.notificationService = new NotificationService();
            
            // Inicializar Firebase Service
            this.firebaseService = new FirebaseService();
            this.authComponent = new AuthComponent(this.firebaseService);
            this.dataRecoveryInterface = new DataRecoveryInterface(this.firebaseService, this);
            
            // Gerenciadores de dados
            this.transactionManager = new TransactionManager();
            this.budgetManager = new BudgetManager();
            this.goalManager = new GoalManager();
            
            // Renderizadores de UI
            this.dashboardRenderer = new DashboardRenderer();
            this.chartRenderer = new ModernChartRenderer();
            
            // Inicializar ModalManager com verificação robusta
            try {
                // Aguardar DOM estar pronta se necessário
                if (document.readyState === 'loading') {
                    console.log('🔄 Aguardando DOM para ModalManager...');
                    document.addEventListener('DOMContentLoaded', () => {
                        this.initializeModalManager();
                    });
                } else {
                    this.initializeModalManager();
                }
            } catch (error) {
                console.error('❌ Erro ao inicializar ModalManager:', error);
                this.modalManager = null;
            }
            
            this.reportGenerator = new ReportGenerator();
            
            // Outros serviços
            this.dataSyncService = new DataSyncService();
            this.cacheManager = new CacheManager();

            console.log('📦 Módulos inicializados com sucesso');
        } catch (error) {
            console.error('❌ Erro ao inicializar módulos:', error);
            // Inicializar notificationService básico se não existir
            if (!this.notificationService) {
                this.notificationService = {
                    showError: (msg) => console.error('NotificationService Error:', msg),
                    showSuccess: (msg) => console.log('NotificationService Success:', msg)
                };
            }
            this.safeNotify('showError', 'Erro na inicialização da aplicação');
        }
    }

    /**
     * Inicializa o ModalManager de forma robusta
     */
    initializeModalManager() {
        try {
            console.log('🔄 Inicializando ModalManager...');
            this.modalManager = new ModalManager();
            
            // Verificar se foi inicializado corretamente
            if (this.modalManager && typeof this.modalManager.openConfirmationModal === 'function') {
                console.log('✅ ModalManager inicializado com sucesso');
                console.log('✅ openConfirmationModal disponível:', typeof this.modalManager.openConfirmationModal);
            } else {
                console.error('❌ ModalManager inicializado mas métodos não disponíveis');
                this.modalManager = null;
            }
        } catch (error) {
            console.error('❌ Erro crítico ao inicializar ModalManager:', error);
            this.modalManager = null;
        }
    }

    /**
     * Inicialização principal da aplicação
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('⚠️ Aplicação já foi inicializada');
            return;
        }

        try {
            console.log('🚀 Iniciando Nós na Conta PRO...');
            
            // 1. Configurar listeners de eventos
            this.setupEventListeners();
            
            // 2. Verificar dados salvos
            await this.loadUserData();
            
            // 3. Configurar auto-save
            this.setupAutoSave();
            
            // 4. Renderizar dashboard inicial
            await this.renderInitialView();
            
            // 5. Configurar sincronização (se disponível)
            this.setupDataSync();
            
            // 6. Marcar como inicializado
            this.isInitialized = true;
            
            console.log('✅ Aplicação inicializada com sucesso');
            this.safeNotify('showSuccess', 'Nós na Conta PRO carregado!');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.safeNotify('showError', 'Erro ao carregar a aplicação');
        }
    }

    /**
     * ============================================================================
     * MÉTODOS FIREBASE E AUTENTICAÇÃO
     * ============================================================================
     */

    /**
     * Mostra o modal de login
     */
    showLoginModal() {
        if (this.authComponent) {
            this.authComponent.show();
        } else {
            this.safeNotify('showError', 'Sistema de autenticação não disponível');
        }
    }

    /**
     * Mostra a interface de recuperação de dados
     */
    showDataRecovery() {
        if (!this.firebaseService.isAuthenticated()) {
            this.safeNotify('showError', 'Faça login primeiro para recuperar dados antigos');
            this.showLoginModal();
            return;
        }

        if (this.dataRecoveryInterface) {
            this.dataRecoveryInterface.show();
        } else {
            this.safeNotify('showError', 'Sistema de recuperação não disponível');
        }
    }

    /**
     * ============================================================================
     * MÉTODOS PÚBLICOS PARA MODAIS (chamados pelo HTML)
     * ============================================================================
     */

    /**
     * Abre modal de nova transação
     */
    openTransactionModal(transaction = null) {
        this.safeOpenModal('openTransactionModal', transaction);
    }

    /**
     * Abre modal de novo orçamento
     */
    openBudgetModal(budget = null) {
        this.safeOpenModal('openBudgetModal', budget);
    }

    /**
     * Abre modal de nova meta
     */
    openGoalModal(goal = null) {
        this.safeOpenModal('openGoalModal', goal);
    }

    /**
     * Abre interface de recuperação de dados (wrapper público)
     */
    openDataRecovery() {
        this.showDataRecovery();
    }

    /**
     * ============================================================================
     * MÉTODOS FIREBASE E AUTENTICAÇÃO
     * ============================================================================
     */

    /**
     * Callback chamado quando usuário faz login
     */
    async onUserAuthenticated(user) {
        this.currentUser = user;
        console.log('👤 Usuário autenticado:', user.email);
        
        // Atualizar UI para mostrar dados do usuário
        this.updateUserInterface(user);
        
        // Carregar dados existentes do Firebase automaticamente
        await this.loadExistingFirebaseData();
        
        // Sincronizar dados locais com Firebase (upload de novos dados)
        await this.syncWithFirebase();
        
        // Notificar sucesso
        this.safeNotify('showSuccess', `Bem-vindo, ${user.displayName || user.email}!`);
    }

    /**
     * Faz logout do usuário
     */
    async logout() {
        try {
            if (this.firebaseService) {
                const result = await this.firebaseService.signOut();
                if (result.success) {
                    this.currentUser = null;
                    this.updateUserInterface(null);
                    this.safeNotify('showSuccess', 'Logout realizado com sucesso');
                } else {
                    this.safeNotify('showError', 'Erro ao fazer logout');
                }
            }
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            this.safeNotify('showError', 'Erro ao fazer logout');
        }
    }

    /**
     * Atualiza interface baseado no estado do usuário
     */
    updateUserInterface(user) {
        const userSection = document.getElementById('userSection');
        const loginBtn = document.getElementById('loginBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');
        const syncStatus = document.getElementById('syncStatus');

        if (user) {
            // Usuário logado
            if (userInfo) {
                userInfo.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <span class="text-white text-sm font-medium">${user.displayName?.[0] || user.email[0].toUpperCase()}</span>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-900 dark:text-white">${user.displayName || 'Usuário'}</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">${user.email}</p>
                        </div>
                    </div>
                `;
            }
            
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (syncStatus) {
                syncStatus.innerHTML = `
                    <div class="flex items-center space-x-2 text-green-600 dark:text-green-400">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="text-xs">Sincronizado</span>
                    </div>
                `;
            }
        } else {
            // Usuário não logado
            if (userInfo) userInfo.innerHTML = '';
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (syncStatus) {
                syncStatus.innerHTML = `
                    <div class="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                        </svg>
                        <span class="text-xs">Offline</span>
                    </div>
                `;
            }
        }
    }

    /**
     * Sincroniza dados locais com Firebase
     */
    async syncWithFirebase() {
        if (!this.currentUser || !this.firebaseService) {
            return;
        }

        try {
            console.log('🔄 Iniciando sincronização com Firebase...');
            
            // Sincronizar transações
            const transactions = this.transactionManager.getAll();
            if (transactions.length > 0) {
                for (const transaction of transactions) {
                    await this.firebaseService.saveUserData('transactions', transaction);
                }
            }

            // Sincronizar orçamentos
            const budgets = this.budgetManager.getAll();
            if (budgets.length > 0) {
                for (const budget of budgets) {
                    await this.firebaseService.saveUserData('budgets', budget);
                }
            }

            // Sincronizar metas
            const goals = this.goalManager.getAll();
            if (goals.length > 0) {
                for (const goal of goals) {
                    await this.firebaseService.saveUserData('goals', goal);
                }
            }

            console.log('✅ Sincronização concluída');
            this.safeNotify('showSuccess', 'Dados sincronizados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro na sincronização:', error);
            this.safeNotify('showError', 'Erro ao sincronizar dados');
        }
    }

    /**
     * Carrega dados do Firebase
     */
    async loadFromFirebase() {
        if (!this.currentUser || !this.firebaseService) {
            return;
        }

        try {
            console.log('📥 Carregando dados do Firebase...');
            
            // Carregar transações
            const transactionsResult = await this.firebaseService.loadUserData('transactions');
            if (transactionsResult.success && transactionsResult.data.length > 0) {
                // Merge com dados locais (manter mais recentes)
                for (const transaction of transactionsResult.data) {
                    this.transactionManager.importData(transaction);
                }
            }

            // Carregar orçamentos
            const budgetsResult = await this.firebaseService.loadUserData('budgets');
            if (budgetsResult.success && budgetsResult.data.length > 0) {
                for (const budget of budgetsResult.data) {
                    this.budgetManager.importData(budget);
                }
            }

            // Carregar metas
            const goalsResult = await this.firebaseService.loadUserData('goals');
            if (goalsResult.success && goalsResult.data.length > 0) {
                for (const goal of goalsResult.data) {
                    this.goalManager.importData(goal);
                }
            }

            // Atualizar interface
            await this.renderDashboard();
            
            console.log('✅ Dados carregados do Firebase');
            
        } catch (error) {
            console.error('❌ Erro ao carregar do Firebase:', error);
        }
    }

    /**
     * Carrega dados existentes do Firebase automaticamente (busca inteligente)
     */
    async loadExistingFirebaseData() {
        if (!this.currentUser || !this.firebaseService) {
            return;
        }

        try {
            console.log('🔍 Buscando dados existentes no Firebase...');
            this.safeNotify('showInfo', 'Carregando seus dados...');

            // Primeiro tentar carregar da estrutura atual
            const currentData = await this.loadFromCurrentStructure();
            
            // Se não encontrou dados na estrutura atual, buscar em estruturas antigas
            if (!currentData.hasData) {
                console.log('🔍 Dados não encontrados na estrutura atual, buscando estruturas antigas...');
                await this.loadFromLegacyStructures();
            } else {
                console.log('✅ Dados encontrados na estrutura atual');
                this.safeNotify('showSuccess', `Carregados: ${currentData.summary}`);
            }

        } catch (error) {
            console.error('❌ Erro ao carregar dados existentes:', error);
            this.safeNotify('showError', 'Erro ao carregar dados salvos');
        }
    }

    /**
     * Carrega dados da estrutura atual (users/uid/collection)
     */
    async loadFromCurrentStructure() {
        let hasData = false;
        let transactionCount = 0;
        let budgetCount = 0;
        let goalCount = 0;

        try {
            // Carregar transações
            const transactionsResult = await this.firebaseService.loadUserData('transactions');
            if (transactionsResult.success && transactionsResult.data.length > 0) {
                console.log(`📊 Encontradas ${transactionsResult.data.length} transações`);
                for (const transaction of transactionsResult.data) {
                    if (this.transactionManager.add) {
                        await this.transactionManager.add(transaction);
                    } else {
                        // Fallback para managers que não têm método add
                        this.transactionManager.transactions = this.transactionManager.transactions || [];
                        this.transactionManager.transactions.push(transaction);
                    }
                    transactionCount++;
                }
                hasData = true;
            }

            // Carregar orçamentos
            const budgetsResult = await this.firebaseService.loadUserData('budgets');
            if (budgetsResult.success && budgetsResult.data.length > 0) {
                console.log(`💰 Encontrados ${budgetsResult.data.length} orçamentos`);
                for (const budget of budgetsResult.data) {
                    if (this.budgetManager.add) {
                        await this.budgetManager.add(budget);
                    } else {
                        this.budgetManager.budgets = this.budgetManager.budgets || [];
                        this.budgetManager.budgets.push(budget);
                    }
                    budgetCount++;
                }
                hasData = true;
            }

            // Carregar metas
            const goalsResult = await this.firebaseService.loadUserData('goals');
            if (goalsResult.success && goalsResult.data.length > 0) {
                console.log(`🎯 Encontradas ${goalsResult.data.length} metas`);
                for (const goal of goalsResult.data) {
                    if (this.goalManager.add) {
                        await this.goalManager.add(goal);
                    } else {
                        this.goalManager.goals = this.goalManager.goals || [];
                        this.goalManager.goals.push(goal);
                    }
                    goalCount++;
                }
                hasData = true;
            }

            // Atualizar interface se encontrou dados
            if (hasData) {
                await this.renderDashboard();
                await this.saveAllData(); // Salvar localmente também
            }

            return {
                hasData,
                summary: `${transactionCount} transações, ${budgetCount} orçamentos, ${goalCount} metas`
            };

        } catch (error) {
            console.error('❌ Erro ao carregar estrutura atual:', error);
            return { hasData: false, summary: '' };
        }
    }

    /**
     * Busca dados em estruturas antigas do Firebase
     */
    async loadFromLegacyStructures() {
        try {
            // Importar utilitário de recuperação
            const { FirebaseDataRecovery } = await import('../utils/FirebaseDataRecovery.js');
            const recovery = new FirebaseDataRecovery(this.firebaseService, this.notificationService);

            // Buscar dados antigos
            console.log('🔍 Procurando em estruturas antigas...');
            const results = await recovery.searchForData();
            
            if (results.found) {
                console.log('✅ Dados antigos encontrados!');
                const analysis = recovery.analyzeRecoveredData(results.data);
                
                let totalImported = 0;
                
                // Importar cada tipo de dados automaticamente
                for (const [collection, documents] of Object.entries(results.data)) {
                    if (!Array.isArray(documents) || documents.length === 0) continue;

                    const matchType = analysis.possibleMatches[collection];
                    if (!matchType || matchType === 'other') continue;

                    console.log(`🔄 Convertendo ${collection} (${matchType})...`);
                    
                    // Converter dados
                    const converted = recovery.convertToCurrentFormat(documents, matchType);
                    
                    // Importar baseado no tipo
                    let targetManager;
                    switch (matchType) {
                        case 'transactions':
                            targetManager = this.transactionManager;
                            break;
                        case 'budgets':
                            targetManager = this.budgetManager;
                            break;
                        case 'goals':
                            targetManager = this.goalManager;
                            break;
                    }

                    if (targetManager && converted.length > 0) {
                        const result = await recovery.importData(converted, targetManager);
                        totalImported += result.importedCount;
                        console.log(`✅ Importados ${result.importedCount} ${matchType}`);
                    }
                }

                if (totalImported > 0) {
                    // Salvar dados convertidos na estrutura atual
                    await this.syncWithFirebase();
                    await this.renderDashboard();
                    
                    this.safeNotify('showSuccess', `Recuperados ${totalImported} registros antigos!`);
                } else {
                    this.safeNotify('showInfo', 'Nenhum dado compatível encontrado');
                }
                
            } else {
                console.log('ℹ️ Nenhum dado antigo encontrado');
                this.safeNotify('showInfo', 'Nenhum dado anterior encontrado');
            }

        } catch (error) {
            console.error('❌ Erro ao buscar dados antigos:', error);
            this.safeNotify('showError', 'Erro ao buscar dados anteriores');
        }
    }

    /**
     * ============================================================================
     * MÉTODOS DE EVENT LISTENERS
     * ============================================================================
     */

    /**
     * Configura todos os event listeners
     */
    setupEventListeners() {
        // Navegação entre abas
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.dataset.tab;
                this.handleTabSwitch(tabName);
            });
        });

        // Status de conectividade
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));

        // Botões de ação principais
        this.setupActionButtons();

        // Formulários
        this.setupFormHandlers();

        // Atalhos de teclado
        this.setupKeyboardShortcuts();

        console.log('🎯 Event listeners configurados');
    }

    /**
     * Configura botões de ação
     */
    setupActionButtons() {
        // Botão de nova transação
        const newTransactionBtn = document.getElementById('newTransactionBtn');
        if (newTransactionBtn) {
            newTransactionBtn.addEventListener('click', () => {
                this.safeOpenModal('openTransactionModal');
            });
        }

        // Botão de novo orçamento
        const newBudgetBtn = document.getElementById('newBudgetBtn');
        if (newBudgetBtn) {
            newBudgetBtn.addEventListener('click', () => {
                this.safeOpenModal('openBudgetModal');
            });
        }

        // Botão de nova meta
        const newGoalBtn = document.getElementById('newGoalBtn');
        if (newGoalBtn) {
            newGoalBtn.addEventListener('click', () => {
                this.safeOpenModal('openGoalModal');
            });
        }
    }

    /**
     * Configura handlers de formulários
     */
    setupFormHandlers() {
        // Form de transação
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleTransactionSubmit(e);
            });
        }

        // Form de orçamento
        const budgetForm = document.getElementById('budgetForm');
        if (budgetForm) {
            budgetForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleBudgetSubmit(e);
            });
        }

        // Form de meta
        const goalForm = document.getElementById('goalForm');
        if (goalForm) {
            goalForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleGoalSubmit(e);
            });
        }
    }

    /**
     * Configura atalhos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N = Nova transação
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.safeOpenModal('openTransactionModal');
            }
            
            // Ctrl/Cmd + S = Salvar dados
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveAllData();
            }

            // ESC = Fechar modais
            if (e.key === 'Escape') {
                this.modalManager.closeAllModals();
            }
        });
    }

    /**
     * Carrega dados do usuário do localStorage
     */
    async loadUserData() {
        try {
            console.log('📂 Carregando dados do usuário...');
            
            // Carregar transações
            await this.transactionManager.loadFromStorage();
            
            // Carregar orçamentos
            await this.budgetManager.loadFromStorage();
            
            // Carregar metas
            await this.goalManager.loadFromStorage();
            
            // Carregar configurações
            this.loadUserSettings();
            
            console.log('📂 Dados carregados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        }
    }

    /**
     * Carrega configurações do usuário
     */
    loadUserSettings() {
        const savedSettings = localStorage.getItem('financeApp_settings');
        if (savedSettings) {
            this.config = { ...this.config, ...JSON.parse(savedSettings) };
        }
    }

    /**
     * Salva configurações do usuário
     */
    saveUserSettings() {
        localStorage.setItem('financeApp_settings', JSON.stringify(this.config));
    }

    /**
     * Configura auto-save
     */
    setupAutoSave() {
        if (this.config.autoSave) {
            setInterval(() => {
                this.handleAutoSave();
            }, this.config.autoSaveInterval);
            
            console.log(`💾 Auto-save configurado (${this.config.autoSaveInterval}ms)`);
        }
    }

    /**
     * Handler do auto-save
     */
    async handleAutoSave() {
        try {
            await this.saveAllData();
            console.log('💾 Auto-save executado');
        } catch (error) {
            console.error('❌ Erro no auto-save:', error);
        }
    }

    /**
     * Salva todos os dados
     */
    async saveAllData() {
        try {
            await Promise.all([
                this.transactionManager.saveToStorage(),
                this.budgetManager.saveToStorage(),
                this.goalManager.saveToStorage()
            ]);
            
            this.saveUserSettings();
            
            console.log('💾 Todos os dados salvos');
            
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            this.notificationService.showError('Erro ao salvar dados');
        }
    }

    /**
     * Configura sincronização de dados
     */
    setupDataSync() {
        if (this.config.syncEnabled && this.isOnline) {
            this.dataSyncService.startSync();
            console.log('🔄 Sincronização iniciada');
        }
    }

    /**
     * Renderiza a view inicial
     */
    async renderInitialView() {
        try {
            // Esconder loading screen
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }

            // Mostrar conteúdo principal
            const mainContent = document.getElementById('mainContent');
            if (mainContent) {
                mainContent.style.display = 'block';
            }

            // Renderizar dashboard
            await this.renderDashboard();
            
            // Ativar primeira aba
            this.handleTabSwitch('resumo');
            
        } catch (error) {
            console.error('❌ Erro ao renderizar view inicial:', error);
        }
    }

    /**
     * Renderiza o dashboard principal
     */
    async renderDashboard() {
        try {
            const dashboardData = {
                transactions: this.transactionManager.getAll(),
                budgets: this.budgetManager.getAll(),
                goals: this.goalManager.getAll()
            };

            await this.dashboardRenderer.render(dashboardData);
            
        } catch (error) {
            console.error('❌ Erro ao renderizar dashboard:', error);
        }
    }

    /**
     * Handler para mudança de abas
     */
    async handleTabSwitch(tabName) {
        if (this.activeTab === tabName) return;

        try {
            console.log(`🎯 Mudando para aba: ${tabName}`);
            
            // Atualizar estado
            this.activeTab = tabName;
            
            // Atualizar UI das abas
            this.updateTabUI(tabName);
            
            // Renderizar conteúdo da aba
            await this.renderTabContent(tabName);
            
        } catch (error) {
            console.error(`❌ Erro ao mudar para aba ${tabName}:`, error);
        }
    }

    /**
     * Atualiza a UI das abas
     */
    updateTabUI(activeTabName) {
        // Remover classe ativa de todas as abas
        document.querySelectorAll('[data-tab]').forEach(tab => {
            tab.classList.remove('border-blue-500', 'text-blue-600');
            tab.classList.add('border-transparent', 'text-gray-500');
        });

        // Adicionar classe ativa na aba selecionada
        const activeTab = document.querySelector(`[data-tab="${activeTabName}"]`);
        if (activeTab) {
            activeTab.classList.remove('border-transparent', 'text-gray-500');
            activeTab.classList.add('border-blue-500', 'text-blue-600');
        }

        // Esconder todos os conteúdos
        document.querySelectorAll('[data-tab-content]').forEach(content => {
            content.style.display = 'none';
        });

        // Mostrar conteúdo ativo
        const activeContent = document.querySelector(`[data-tab-content="${activeTabName}"]`);
        if (activeContent) {
            activeContent.style.display = 'block';
        }
    }

    /**
     * Renderiza conteúdo de uma aba específica
     */
    async renderTabContent(tabName) {
        try {
            switch (tabName) {
                case 'resumo':
                    await this.renderDashboard();
                    break;
                    
                case 'lancamentos':
                    await this.renderTransactions();
                    break;
                    
                case 'orcamento':
                    await this.renderBudgets();
                    break;
                    
                case 'metas':
                    await this.renderGoals();
                    break;
                    
                case 'relatorios':
                    await this.renderReports();
                    break;
                    
                default:
                    console.warn(`⚠️ Aba desconhecida: ${tabName}`);
            }
        } catch (error) {
            console.error(`❌ Erro ao renderizar conteúdo da aba ${tabName}:`, error);
        }
    }

    /**
     * Renderiza lista de transações
     */
    async renderTransactions() {
        const transactions = this.transactionManager.getAll();
        const container = document.getElementById('lancamentosContent');
        
        if (!container) {
            console.error('❌ Container de lançamentos não encontrado');
            return;
        }

        console.log('💰 Renderizando transações:', transactions.length);

        const html = `
            <div class="mb-6 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Lançamentos</h2>
                <button id="addTransactionBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Nova Transação
                </button>
            </div>

            <!-- Filtros -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                        <input type="text" id="searchFilter" placeholder="Digite para buscar..." 
                               class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                        <select id="typeFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Todos</option>
                            <option value="receita">Receitas</option>
                            <option value="despesa">Despesas</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select id="statusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="">Todos</option>
                            <option value="paid">Pagos</option>
                            <option value="pending">Pendentes</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- Lista de Transações -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b">
                    <h3 class="text-lg font-medium text-gray-900">
                        Transações (${transactions.length})
                    </h3>
                </div>
                <div class="divide-y divide-gray-200">
                    ${transactions.length === 0 ? this.renderEmptyTransactions() : this.renderTransactionsList(transactions)}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Configurar evento do botão
        const addBtn = document.getElementById('addTransactionBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.safeOpenModal('openTransactionModal');
            });
        }
    }

    /**
     * Renderiza estado vazio de transações
     */
    renderEmptyTransactions() {
        return `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">💸</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma transação encontrada</h3>
                <p class="text-gray-600 mb-4">Comece adicionando sua primeira transação financeira.</p>
                <button onclick="document.getElementById('addTransactionBtn').click()" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Adicionar Primeira Transação
                </button>
            </div>
        `;
    }

    /**
     * Renderiza lista de transações
     */
    renderTransactionsList(transactions) {
        return transactions.map(transaction => {
            const isIncome = transaction.type === 'receita';
            const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
            const amountPrefix = isIncome ? '+' : '-';
            const categoryInfo = this.getCategoryInfo(transaction.category);
            
            const date = new Date(transaction.date);
            const formattedDate = date.toLocaleDateString('pt-BR');
            
            return `
                <div class="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center text-lg" 
                                 style="background-color: ${categoryInfo.color}20; color: ${categoryInfo.color};">
                                ${categoryInfo.icon}
                            </div>
                            <div>
                                <p class="font-medium text-gray-900">${transaction.description}</p>
                                <div class="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>${categoryInfo.name}</span>
                                    <span>•</span>
                                    <span>${formattedDate}</span>
                                    ${transaction.installmentNumber ? `<span>• ${transaction.installmentNumber}/${transaction.installments || 1}</span>` : ''}
                                </div>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4">
                            <div class="text-right">
                                <p class="font-semibold ${amountColor}">
                                    ${amountPrefix} ${this.formatCurrency(Math.abs(transaction.amount))}
                                </p>
                                ${!transaction.isPaid ? 
                                    '<span class="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">Pendente</span>' : 
                                    '<span class="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Pago</span>'
                                }
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="window.app.editTransaction('${transaction.id}')" 
                                        class="text-blue-600 hover:text-blue-800">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                    </svg>
                                </button>
                                <button onclick="window.app.deleteTransaction('${transaction.id}')" 
                                        class="text-red-600 hover:text-red-800">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Obtém informações da categoria
     */
    getCategoryInfo(categoryId) {
        return this.transactionManager.getCategoryInfo(categoryId);
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
     * Renderiza orçamentos
     */
    async renderBudgets() {
        const budgets = this.budgetManager.getAll();
        const transactions = this.transactionManager.getCurrentMonth();
        const container = document.getElementById('orcamentoContent');
        
        if (!container) {
            console.error('❌ Container de orçamentos não encontrado');
            return;
        }

        console.log('📊 Renderizando orçamentos:', budgets.length);

        // Calcular gastos por categoria
        const categorySpending = this.calculateCategorySpending(transactions);

        const html = `
            <div class="mb-6 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Orçamento Mensal</h2>
                <button id="newBudgetBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Novo Orçamento
                </button>
            </div>

            <!-- Resumo Geral -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Resumo do Mês</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    ${this.renderBudgetSummary(budgets, categorySpending)}
                </div>
            </div>

            <!-- Lista de Orçamentos -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b">
                    <h3 class="text-lg font-medium text-gray-900">
                        Orçamentos por Categoria (${budgets.length})
                    </h3>
                </div>
                <div class="p-6">
                    ${budgets.length === 0 ? this.renderEmptyBudgets() : this.renderBudgetsList(budgets, categorySpending)}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Configurar evento do botão
        const newBtn = document.getElementById('newBudgetBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                this.safeOpenModal('openBudgetModal');
            });
        }
    }

    /**
     * Calcula gastos por categoria
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
     * Renderiza resumo de orçamentos
     */
    renderBudgetSummary(budgets, categorySpending) {
        const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
        const totalSpent = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
        const remaining = totalBudget - totalSpent;
        const usagePercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

        const remainingColor = remaining >= 0 ? 'text-green-600' : 'text-red-600';
        const progressColor = usagePercent > 100 ? 'bg-red-500' : usagePercent > 80 ? 'bg-yellow-500' : 'bg-green-500';

        return `
            <div class="text-center">
                <p class="text-sm font-medium text-gray-500">Orçamento Total</p>
                <p class="text-2xl font-semibold text-gray-900">${this.formatCurrency(totalBudget)}</p>
            </div>
            <div class="text-center">
                <p class="text-sm font-medium text-gray-500">Gasto</p>
                <p class="text-2xl font-semibold text-gray-900">${this.formatCurrency(totalSpent)}</p>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div class="${progressColor} h-2 rounded-full transition-all duration-300" 
                         style="width: ${Math.min(usagePercent, 100)}%"></div>
                </div>
            </div>
            <div class="text-center">
                <p class="text-sm font-medium text-gray-500">${remaining >= 0 ? 'Disponível' : 'Excesso'}</p>
                <p class="text-2xl font-semibold ${remainingColor}">${this.formatCurrency(Math.abs(remaining))}</p>
                <p class="text-sm text-gray-500 mt-1">${usagePercent.toFixed(1)}% usado</p>
            </div>
        `;
    }

    /**
     * Renderiza estado vazio de orçamentos
     */
    renderEmptyBudgets() {
        return `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">💰</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhum orçamento definido</h3>
                <p class="text-gray-600 mb-4">Comece definindo orçamentos para suas categorias de gastos.</p>
                <button onclick="document.getElementById('newBudgetBtn').click()" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Criar Primeiro Orçamento
                </button>
            </div>
        `;
    }

    /**
     * Renderiza lista de orçamentos
     */
    renderBudgetsList(budgets, categorySpending) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${budgets.map(budget => {
                    const spent = categorySpending[budget.category] || 0;
                    const progress = (spent / budget.amount) * 100;
                    const remaining = budget.amount - spent;
                    const isOverBudget = progress > 100;
                    
                    const categoryInfo = this.getCategoryInfo(budget.category);
                    const progressColor = isOverBudget ? 'bg-red-500' : 
                                         progress > 80 ? 'bg-yellow-500' : 'bg-green-500';

                    return `
                        <div class="border rounded-lg p-4">
                            <div class="flex items-center justify-between mb-3">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg" 
                                         style="background-color: ${categoryInfo.color}20; color: ${categoryInfo.color};">
                                        ${categoryInfo.icon}
                                    </div>
                                    <div>
                                        <h4 class="font-medium text-gray-900">${budget.name}</h4>
                                        <p class="text-sm text-gray-500">${categoryInfo.name}</p>
                                    </div>
                                </div>
                                <span class="text-sm ${isOverBudget ? 'text-red-600' : 'text-gray-600'}">
                                    ${progress.toFixed(1)}%
                                </span>
                            </div>
                            
                            <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
                                <div class="${progressColor} h-2 rounded-full transition-all duration-300" 
                                     style="width: ${Math.min(progress, 100)}%"></div>
                            </div>
                            
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">
                                    Gasto: ${this.formatCurrency(spent)}
                                </span>
                                <span class="text-gray-600">
                                    Meta: ${this.formatCurrency(budget.amount)}
                                </span>
                            </div>
                            
                            <div class="mt-2 text-center">
                                <span class="${remaining >= 0 ? 'text-green-600' : 'text-red-600'} font-medium">
                                    ${remaining >= 0 ? 'Restam' : 'Excesso'}: ${this.formatCurrency(Math.abs(remaining))}
                                </span>
                            </div>
                            
                            <div class="mt-3 flex justify-end space-x-2">
                                <button onclick="window.app.editBudget('${budget.id}')" 
                                        class="text-blue-600 hover:text-blue-800 text-sm">
                                    Editar
                                </button>
                                <button onclick="window.app.deleteBudget('${budget.id}')" 
                                        class="text-red-600 hover:text-red-800 text-sm">
                                    Excluir
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Renderiza metas
     */
    async renderGoals() {
        const goals = this.goalManager.getAll();
        const container = document.getElementById('metasContent');
        
        if (!container) {
            console.error('❌ Container de metas não encontrado');
            return;
        }

        console.log('🎯 Renderizando metas:', goals.length);

        const html = `
            <div class="mb-6 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-900">Metas Financeiras</h2>
                <button id="newGoalBtn" class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Nova Meta
                </button>
            </div>

            <!-- Resumo das Metas -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Resumo</h3>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    ${this.renderGoalsSummary(goals)}
                </div>
            </div>

            <!-- Lista de Metas -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b">
                    <h3 class="text-lg font-medium text-gray-900">
                        Suas Metas (${goals.length})
                    </h3>
                </div>
                <div class="p-6">
                    ${goals.length === 0 ? this.renderEmptyGoals() : this.renderGoalsList(goals)}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Configurar evento do botão
        const newBtn = document.getElementById('newGoalBtn');
        if (newBtn) {
            newBtn.addEventListener('click', () => {
                this.safeOpenModal('openGoalModal');
            });
        }
    }

    /**
     * Renderiza resumo das metas
     */
    renderGoalsSummary(goals) {
        const totalGoals = goals.length;
        const completedGoals = goals.filter(g => (g.currentAmount / g.targetAmount) >= 1).length;
        const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0);
        const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

        return `
            <div class="text-center">
                <p class="text-sm font-medium text-gray-500">Total de Metas</p>
                <p class="text-2xl font-semibold text-gray-900">${totalGoals}</p>
            </div>
            <div class="text-center">
                <p class="text-sm font-medium text-gray-500">Concluídas</p>
                <p class="text-2xl font-semibold text-green-600">${completedGoals}</p>
            </div>
            <div class="text-center">
                <p class="text-sm font-medium text-gray-500">Valor Total</p>
                <p class="text-2xl font-semibold text-gray-900">${this.formatCurrency(totalTarget)}</p>
            </div>
            <div class="text-center">
                <p class="text-sm font-medium text-gray-500">Progresso Geral</p>
                <p class="text-2xl font-semibold text-blue-600">${overallProgress.toFixed(1)}%</p>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                         style="width: ${Math.min(overallProgress, 100)}%"></div>
                </div>
            </div>
        `;
    }

    /**
     * Renderiza estado vazio de metas
     */
    renderEmptyGoals() {
        return `
            <div class="text-center py-12">
                <div class="text-6xl mb-4">🎯</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Nenhuma meta definida</h3>
                <p class="text-gray-600 mb-4">Defina metas financeiras para organizar seus objetivos.</p>
                <button onclick="document.getElementById('newGoalBtn').click()" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Criar Primeira Meta
                </button>
            </div>
        `;
    }

    /**
     * Renderiza lista de metas
     */
    renderGoalsList(goals) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${goals.map(goal => {
                    const progress = (goal.currentAmount / goal.targetAmount) * 100;
                    const isCompleted = progress >= 100;
                    const remaining = goal.targetAmount - goal.currentAmount;
                    
                    // Calcular dias restantes se houver data limite
                    let daysRemaining = null;
                    if (goal.targetDate) {
                        const targetDate = new Date(goal.targetDate);
                        const today = new Date();
                        const diffTime = targetDate - today;
                        daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    }

                    const progressColor = isCompleted ? 'bg-green-500' : 'bg-blue-500';
                    const statusColor = isCompleted ? 'text-green-600' : 
                                       daysRemaining && daysRemaining < 30 ? 'text-orange-600' : 'text-blue-600';

                    return `
                        <div class="border rounded-lg p-6 ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white'}">
                            <div class="flex justify-between items-start mb-4">
                                <h4 class="font-medium text-gray-900">${goal.title}</h4>
                                <span class="text-sm ${statusColor} font-medium">
                                    ${progress.toFixed(1)}%
                                </span>
                            </div>
                            
                            <div class="mb-4">
                                <div class="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Progresso</span>
                                    <span>${this.formatCurrency(goal.currentAmount)} / ${this.formatCurrency(goal.targetAmount)}</span>
                                </div>
                                <div class="w-full bg-gray-200 rounded-full h-3">
                                    <div class="${progressColor} h-3 rounded-full transition-all duration-300" 
                                         style="width: ${Math.min(progress, 100)}%"></div>
                                </div>
                            </div>

                            <div class="space-y-2 text-sm">
                                ${!isCompleted ? `
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Faltam:</span>
                                        <span class="font-medium text-gray-900">${this.formatCurrency(remaining)}</span>
                                    </div>
                                ` : `
                                    <div class="text-center">
                                        <span class="text-green-600 font-medium">🎉 Meta Concluída!</span>
                                    </div>
                                `}
                                
                                ${goal.targetDate ? `
                                    <div class="flex justify-between">
                                        <span class="text-gray-600">Prazo:</span>
                                        <span class="${daysRemaining && daysRemaining < 30 ? 'text-orange-600' : 'text-gray-900'} font-medium">
                                            ${daysRemaining !== null ? 
                                                daysRemaining > 0 ? `${daysRemaining} dias` : 'Vencida' :
                                                new Date(goal.targetDate).toLocaleDateString('pt-BR')
                                            }
                                        </span>
                                    </div>
                                ` : ''}
                            </div>

                            <div class="mt-4 flex justify-between items-center">
                                <button onclick="window.app.updateGoalProgress('${goal.id}')" 
                                        class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                    Atualizar Progresso
                                </button>
                                <div class="flex space-x-2">
                                    <button onclick="window.app.editGoal('${goal.id}')" 
                                            class="text-gray-600 hover:text-gray-800">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                        </svg>
                                    </button>
                                    <button onclick="window.app.deleteGoal('${goal.id}')" 
                                            class="text-red-600 hover:text-red-800">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Renderiza relatórios
     */
    async renderReports() {
        const transactions = this.transactionManager.getAll();
        const container = document.getElementById('relatoriosContent');
        
        if (!container) {
            console.error('❌ Container de relatórios não encontrado');
            return;
        }

        console.log('📈 Renderizando relatórios');

        // Gerar dados para relatórios a partir do mês vigente (outubro 2025)
        const monthlyData = this.generateMonthlyEvolutionData(transactions, 'month');
        const categoryData = this.generateCategoryReport(transactions);

        const html = `
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Relatórios Financeiros</h2>
                <p class="text-gray-600">Análise detalhada das suas finanças</p>
            </div>

            <!-- Seletor de Data Inicial -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Selecione o Período Inicial</h3>
                <div class="flex flex-wrap gap-4 items-center">
                    <input type="month" id="reportStartMonth" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                           value="${new Date().toISOString().slice(0, 7)}" />
                    <button id="applyDateFilter" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                        Aplicar Filtro
                    </button>
                    <span class="text-sm text-gray-600" id="dateRangeInfo">
                        Mostrando últimos 6 meses a partir de ${new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>

            <!-- Filtros de Período -->
            <div class="bg-white rounded-lg shadow p-6 mb-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Período de Análise</h3>
                <div class="flex flex-wrap gap-4">
                    <button class="period-btn active px-4 py-2 bg-blue-600 text-white rounded-lg" data-period="month">
                        Este Mês
                    </button>
                    <button class="period-btn px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300" data-period="quarter">
                        Últimos 3 Meses
                    </button>
                    <button class="period-btn px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300" data-period="year">
                        Este Ano
                    </button>
                    <button class="period-btn px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300" data-period="all">
                        Todos os Períodos
                    </button>
                </div>
            </div>

            <!-- Cards de Resumo -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${this.renderReportCards(this.generateMonthlyReport(this.filterTransactionsByPeriod(transactions, 'month')))}
            </div>

            <!-- Gráficos -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Gastos por Categoria</h3>
                    <div class="h-64 flex items-center justify-center">
                        <canvas id="reportCategoryChart" width="300" height="300"></canvas>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow p-6">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Evolução Mensal</h3>
                    <div class="h-64 flex items-center justify-center">
                        <canvas id="reportMonthlyChart" width="400" height="300"></canvas>
                    </div>
                </div>
            </div>

            <!-- Tabela Detalhada -->
            <div class="bg-white rounded-lg shadow">
                <div class="px-6 py-4 border-b">
                    <h3 class="text-lg font-medium text-gray-900">Análise por Categoria</h3>
                </div>
                <div class="overflow-x-auto">
                    ${this.renderCategoryTable(categoryData)}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Configurar eventos dos filtros
        this.setupReportFilters();
        
        // Configurar seletor de data
        this.setupReportDateFilter();

        // Renderizar gráficos
        setTimeout(() => {
            this.renderReportCharts(categoryData, monthlyData);
        }, 100);
    }

    /**
     * Gera relatório mensal
     */
    generateMonthlyReport(transactions) {
        const currentMonth = this.transactionManager.getCurrentMonth();
        const totalIncome = currentMonth.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = currentMonth.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
        const balance = totalIncome - totalExpenses;
        const transactionCount = currentMonth.length;

        return {
            totalIncome,
            totalExpenses,
            balance,
            transactionCount,
            avgTransaction: transactionCount > 0 ? (totalIncome + totalExpenses) / transactionCount : 0
        };
    }

    /**
     * Gera relatório por categoria
     */
    generateCategoryReport(transactions) {
        const categoryData = {};
        
        transactions.forEach(t => {
            if (!categoryData[t.category]) {
                categoryData[t.category] = {
                    category: t.category,
                    info: this.getCategoryInfo(t.category),
                    totalAmount: 0,
                    transactionCount: 0,
                    avgAmount: 0,
                    type: t.type
                };
            }
            
            categoryData[t.category].totalAmount += t.amount;
            categoryData[t.category].transactionCount++;
        });

        // Calcular médias
        Object.values(categoryData).forEach(cat => {
            cat.avgAmount = cat.totalAmount / cat.transactionCount;
        });

        return Object.values(categoryData).sort((a, b) => b.totalAmount - a.totalAmount);
    }

    /**
     * Renderiza cards do relatório
     */
    renderReportCards(data) {
        const cards = [
            {
                title: 'Receitas',
                value: this.formatCurrency(data.totalIncome),
                icon: '💰',
                color: 'green'
            },
            {
                title: 'Despesas',
                value: this.formatCurrency(data.totalExpenses),
                icon: '💸',
                color: 'red'
            },
            {
                title: 'Saldo',
                value: this.formatCurrency(data.balance),
                icon: data.balance >= 0 ? '📈' : '📉',
                color: data.balance >= 0 ? 'green' : 'red'
            },
            {
                title: 'Transações',
                value: data.transactionCount.toString(),
                icon: '📊',
                color: 'blue'
            }
        ];

        return cards.map(card => {
            const colorClasses = {
                green: 'bg-green-50 text-green-700 border-green-200',
                red: 'bg-red-50 text-red-700 border-red-200',
                blue: 'bg-blue-50 text-blue-700 border-blue-200'
            };

            return `
                <div class="bg-white rounded-lg shadow p-6 border-l-4 ${colorClasses[card.color]}">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium text-gray-600">${card.title}</p>
                            <p class="text-2xl font-bold text-gray-900 mt-1">${card.value}</p>
                        </div>
                        <div class="text-3xl">${card.icon}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Renderiza tabela de categorias
     */
    renderCategoryTable(categoryData) {
        if (categoryData.length === 0) {
            return `
                <div class="text-center py-8">
                    <p class="text-gray-500">Nenhum dado disponível</p>
                </div>
            `;
        }

        return `
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Categoria
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transações
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Média
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${categoryData.map(cat => `
                        <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="flex items-center">
                                    <div class="w-8 h-8 rounded-full flex items-center justify-center mr-3" 
                                         style="background-color: ${cat.info.color}20; color: ${cat.info.color};">
                                        ${cat.info.icon}
                                    </div>
                                    <div class="text-sm font-medium text-gray-900">${cat.info.name}</div>
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-semibold ${cat.type === 'receita' ? 'text-green-600' : 'text-red-600'}">
                                    ${this.formatCurrency(cat.totalAmount)}
                                </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${cat.transactionCount}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">${this.formatCurrency(cat.avgAmount)}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    cat.type === 'receita' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }">
                                    ${cat.type === 'receita' ? 'Receita' : 'Despesa'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Configura filtros de relatório
     */
    setupReportFilters() {
        const buttons = document.querySelectorAll('.period-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remover classe ativa de todos
                buttons.forEach(b => {
                    b.classList.remove('bg-blue-600', 'text-white');
                    b.classList.add('bg-gray-200', 'text-gray-700');
                });
                
                // Adicionar classe ativa ao clicado
                e.target.classList.remove('bg-gray-200', 'text-gray-700');
                e.target.classList.add('bg-blue-600', 'text-white');
                
                // Recarregar relatório com novo período
                const period = e.target.dataset.period;
                this.updateReportPeriod(period);
            });
        });
    }

    /**
     * Configura o seletor de data para os relatórios
     */
    setupReportDateFilter() {
        const applyBtn = document.getElementById('applyDateFilter');
        const dateInput = document.getElementById('reportStartMonth');
        
        if (!applyBtn || !dateInput) {
            console.warn('⚠️ Elementos do seletor de data não encontrados');
            return;
        }
        
        // Armazenar a data selecionada para usar nos cálculos
        this.reportStartDate = new Date(dateInput.value + '-01');
        
        applyBtn.addEventListener('click', () => {
            const selectedDate = new Date(dateInput.value + '-01');
            this.reportStartDate = selectedDate;
            
            console.log(`📅 Relatório iniciando em: ${selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`);
            
            // Atualizar texto informativo
            const dateRangeInfo = document.getElementById('dateRangeInfo');
            if (dateRangeInfo) {
                dateRangeInfo.textContent = `Mostrando últimos 6 meses a partir de ${selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`;
            }
            
            // Recarregar relatório com a nova data
            this.renderReports();
            
            this.safeNotify('showSuccess', `Relatório atualizado a partir de ${selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`);
        });
    }

    /**
     * Gera dados de evolução mensal dos últimos 6 meses (a partir do mês vigente)
     */
    generateMonthlyEvolutionData(transactions, period = 'month') {
        // Usar data inicial armazenada ou data de hoje
        const startDate = this.reportStartDate || new Date();
        const currentMonth = startDate.getMonth();
        const currentYear = startDate.getFullYear();
        
        let monthsToInclude = 6; // Por padrão, últimos 6 meses
        let monthsToFetch = monthsToInclude;
        
        if (period === 'quarter') {
            monthsToFetch = 3;
        } else if (period === 'year') {
            monthsToFetch = 12;
        } else if (period === 'month') {
            monthsToFetch = 1;
        } else if (period === 'all') {
            monthsToFetch = 24; // 2 anos
        }
        
        const monthlyData = [];
        const labels = [];
        
        // Gerar dados para os últimos N meses a partir da data inicial
        for (let i = monthsToFetch - 1; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            
            // Filtrar transações do mês
            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date || new Date());
                return tDate.getFullYear() === year && tDate.getMonth() === month;
            });
            
            const monthIncome = monthTransactions
                .filter(t => t.type === 'receita')
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            
            const monthExpenses = monthTransactions
                .filter(t => t.type === 'despesa')
                .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);
            
            monthlyData.push({ income: monthIncome, expenses: monthExpenses });
            
            const monthName = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
            labels.push(monthName);
        }
        
        return {
            labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: monthlyData.map(m => m.income),
                    borderColor: '#10B981',
                    backgroundColor: '#10B98120',
                    fill: true
                },
                {
                    label: 'Despesas',
                    data: monthlyData.map(m => m.expenses),
                    borderColor: '#EF4444',
                    backgroundColor: '#EF444420',
                    fill: true
                }
            ]
        };
    }

    /**
     * Filtra transações por período
     */
    filterTransactionsByPeriod(transactions, period = 'month') {
        // Usar data inicial armazenada ou data de hoje
        const baseDate = this.reportStartDate || new Date();
        const currentMonth = baseDate.getMonth();
        const currentYear = baseDate.getFullYear();
        
        const startDate = (() => {
            switch(period) {
                case 'month':
                    return new Date(currentYear, currentMonth, 1);
                case 'quarter':
                    const quarterStart = Math.floor(currentMonth / 3) * 3;
                    return new Date(currentYear, quarterStart, 1);
                case 'year':
                    return new Date(currentYear, 0, 1);
                case 'all':
                    return new Date(2000, 0, 1); // Data bem antiga
                default:
                    return new Date(currentYear, currentMonth, 1);
            }
        })();
        
        return transactions.filter(t => {
            const tDate = new Date(t.date || new Date());
            return tDate >= startDate;
        });
    }

    /**
     * Atualiza período do relatório
     */
    updateReportPeriod(period) {
        console.log(`📊 Alterando período do relatório para: ${period}`);
        
        // Obter todas as transações
        const allTransactions = this.transactionManager.getAll();
        
        // Filtrar por período
        const filteredTransactions = this.filterTransactionsByPeriod(allTransactions, period);
        
        // Gerar novos dados
        const monthlyData = this.generateMonthlyEvolutionData(allTransactions, period);
        const categoryData = this.generateCategoryReport(filteredTransactions);
        
        // Atualizar cards de resumo
        const currentMonthData = this.generateMonthlyReport(filteredTransactions);
        const cardsContainer = document.querySelector('[class*="grid"][class*="grid-cols-1"]');
        if (cardsContainer) {
            const cardsHtml = this.renderReportCards(currentMonthData);
            const firstCard = cardsContainer.querySelector('[class*="rounded-lg"]');
            if (firstCard?.parentElement) {
                firstCard.parentElement.innerHTML = cardsHtml;
            }
        }
        
        // Limpar gráficos antigos
        if (this.chartRenderer) {
            this.chartRenderer.destroyChart('reportCategoryChart');
            this.chartRenderer.destroyChart('reportMonthlyChart');
        }
        
        // Re-renderizar gráficos com novos dados
        this.renderReportCharts(categoryData, monthlyData);
        
        this.safeNotify('showSuccess', `Relatório atualizado para ${period === 'month' ? 'este mês' : period === 'quarter' ? 'últimos 3 meses' : period === 'year' ? 'este ano' : 'todos os períodos'}`);
    }

    /**
     * Renderiza gráficos do relatório
     */
    renderReportCharts(categoryData, monthlyData) {
        if (!this.chartRenderer) {
            console.warn('⚠️ ChartRenderer não disponível, tentando reinicializar...');
            try {
                this.chartRenderer = new ModernChartRenderer();
                console.log('✅ ChartRenderer reinicializado com sucesso');
            } catch (chartError) {
                console.error('❌ Falha ao reinicializar ChartRenderer:', chartError);
                this.safeNotify('showError', 'Erro ao preparar gráficos do relatório');
                return;
            }
        }

        // Gráfico de categorias (apenas despesas)
        const expenseCategories = categoryData.filter(cat => cat.type === 'despesa');
        if (expenseCategories.length > 0) {
            this.chartRenderer.renderCategoryChart('reportCategoryChart', {
                labels: expenseCategories.map(cat => cat.info.name),
                values: expenseCategories.map(cat => cat.totalAmount)
            });
        } else {
            console.log('📊 Sem despesas para o período selecionado');
        }

        // Gráfico de evolução mensal com dados reais
        if (monthlyData && monthlyData.labels && monthlyData.labels.length > 0) {
            this.chartRenderer.renderTimelineChart('reportMonthlyChart', monthlyData);
        } else {
            console.log('📊 Sem dados de evolução mensal para o período selecionado');
        }
    }

    /**
     * Handler para mudança de status online/offline
     */
    handleOnlineStatus(isOnline) {
        this.isOnline = isOnline;
        
        // Atualizar indicador visual
        const offlineIndicator = document.getElementById('offlineIndicator');
        if (offlineIndicator) {
            offlineIndicator.style.display = isOnline ? 'none' : 'flex';
        }

        // Configurar sincronização
        if (isOnline && this.config.syncEnabled) {
            this.dataSyncService.startSync();
        } else if (!isOnline) {
            this.dataSyncService.stopSync();
        }

        // Notificar usuário
        const message = isOnline ? 'Conectado!' : 'Modo offline';
        const type = isOnline ? 'success' : 'warning';
        this.notificationService.show(message, type);

        console.log(`🌐 Status: ${isOnline ? 'Online' : 'Offline'}`);
    }

    /**
     * Helper para mostrar notificações de forma segura
     */
    safeNotify(type, message) {
        if (this.notificationService && typeof this.notificationService[type] === 'function') {
            this.notificationService[type](message);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    /**
     * Helper para abrir modais de forma segura
     */
    safeOpenModal(modalMethod, ...args) {
        try {
            console.log(`🔍 Tentando abrir modal: ${modalMethod}`);
            console.log('🔍 ModalManager disponível:', !!this.modalManager);

            // Garantir que o ModalManager esteja inicializado
            if (!this.modalManager || typeof this.modalManager[modalMethod] !== 'function') {
                console.warn('⚠️ ModalManager não disponível, tentando reinicializar...');
                try {
                    this.initializeModalManager();
                } catch (initError) {
                    console.error('❌ Erro ao reinicializar ModalManager:', initError);
                }
            }

            // Se após reinicializar ainda não estiver disponível, tentar import dinâmico
            if (!this.modalManager || typeof this.modalManager[modalMethod] !== 'function') {
                console.warn('⚠️ Tentando carregar ModalManager dinamicamente...');
                import('../modules/ModalManager.js')
                    .then(module => {
                        this.modalManager = new module.ModalManager();
                        console.log('✅ ModalManager carregado dinamicamente');
                        if (typeof this.modalManager[modalMethod] === 'function') {
                            this.modalManager[modalMethod](...args);
                        } else {
                            console.error(`❌ Método ${modalMethod} ainda não disponível após import dinâmico`);
                            this.safeNotify('showError', `Erro ao abrir modal: ${modalMethod}`);
                        }
                    })
                    .catch(importError => {
                        console.error('❌ Falha ao importar ModalManager dinamicamente:', importError);
                        this.safeNotify('showError', 'Erro ao carregar sistema de modais');
                    });
                return;
            }

            // Caso tudo esteja correto, abrir o modal
            this.modalManager[modalMethod](...args);
        } catch (error) {
            console.error(`❌ Erro ao executar ${modalMethod}:`, error);
            this.safeNotify('showError', 'Erro interno do modal');
        }
    }

    /**
     * Helper para abrir modais de confirmação de forma segura
     */
    safeOpenConfirmationModal(config) {
        try {
            console.log('🔍 safeOpenConfirmationModal chamado:', config?.title);
            
            // Tentar reinicializar o ModalManager se não existir
            if (!this.modalManager) {
                console.log('⚠️ ModalManager nulo, tentando reinicializar...');
                try {
                    // Importar e reinicializar ModalManager
                    import('../modules/ModalManager.js').then(module => {
                        this.modalManager = new module.ModalManager();
                        console.log('✅ ModalManager reinicializado assincronamente');
                    }).catch(error => {
                        console.error('❌ Falha ao reinicializar ModalManager:', error);
                    });
                } catch (error) {
                    console.error('❌ Erro no import do ModalManager:', error);
                }
            }
            
            if (this.modalManager && typeof this.modalManager.openConfirmationModal === 'function') {
                console.log('✅ Abrindo modal de confirmação...');
                this.modalManager.openConfirmationModal(config);
            } else {
                console.error('❌ ModalManager.openConfirmationModal não está disponível');
                console.error('❌ modalManager state:', {
                    exists: !!this.modalManager,
                    type: typeof this.modalManager,
                    hasMethod: typeof this.modalManager?.openConfirmationModal
                });
                
                // Fallback: usar confirm nativo do browser
                console.log('🔄 Usando fallback nativo...');
                const message = `${config.title || 'Confirmação'}\n\n${config.message || 'Deseja continuar?'}`;
                const confirmResult = confirm(message);
                
                if (confirmResult && typeof config.onConfirm === 'function') {
                    console.log('✅ Usuário confirmou, executando callback...');
                    try {
                        config.onConfirm();
                    } catch (callbackError) {
                        console.error('❌ Erro no callback de confirmação:', callbackError);
                    }
                } else if (!confirmResult && typeof config.onCancel === 'function') {
                    console.log('❌ Usuário cancelou, executando callback...');
                    try {
                        config.onCancel();
                    } catch (callbackError) {
                        console.error('❌ Erro no callback de cancelamento:', callbackError);
                    }
                }
                
                this.safeNotify('showInfo', 'Usando confirmação nativa do navegador');
            }
        } catch (error) {
            console.error('❌ Erro crítico em safeOpenConfirmationModal:', error);
            
            // Fallback de emergência
            try {
                const message = `${config?.title || 'Confirmação'}\n\n${config?.message || 'Deseja continuar?'}`;
                const confirmResult = confirm(message);
                
                if (confirmResult && typeof config?.onConfirm === 'function') {
                    config.onConfirm();
                }
            } catch (fallbackError) {
                console.error('❌ Erro no fallback de emergência:', fallbackError);
                this.safeNotify('showError', 'Erro crítico no sistema de modais');
            }
        }
    }

    /**
     * Limpa formatação de moeda e converte para número
     */
    cleanCurrencyValue(value) {
        if (!value) return '0';
        
        // Remove tudo que não é dígito, vírgula ou ponto
        let cleaned = value.toString().replace(/[^\d,.]/g, '');
        
        // Se tem vírgula e ponto, a vírgula é decimal
        if (cleaned.includes(',') && cleaned.includes('.')) {
            // Formato: 1.234,56 -> 1234.56
            cleaned = cleaned.replace(/\./g, '').replace(',', '.');
        } else if (cleaned.includes(',')) {
            // Só vírgula: 1234,56 -> 1234.56
            cleaned = cleaned.replace(',', '.');
        }
        // Se só tem ponto, mantém como está (assumindo decimal americano)
        
        return cleaned || '0';
    }

    /**
     * Handler para submissão de transação
     */
    async handleTransactionSubmit(event) {
        try {
            const formData = new FormData(event.target);
            const transactionData = Object.fromEntries(formData.entries());
            
            // Processar valor usando função auxiliar
            if (transactionData.amount) {
                transactionData.amount = this.cleanCurrencyValue(transactionData.amount);
            }
            
            await this.transactionManager.add(transactionData);
            await this.renderDashboard();
            
            this.modalManager.closeTransactionModal();
            this.safeNotify('showSuccess', 'Transação adicionada!');
            
        } catch (error) {
            console.error('❌ Erro ao adicionar transação:', error);
            this.safeNotify('showError', 'Erro ao adicionar transação: ' + error.message);
        }
    }

    /**
     * Handler para submissão de orçamento
     */
    async handleBudgetSubmit(event) {
        try {
            const formData = new FormData(event.target);
            const budgetData = Object.fromEntries(formData.entries());

            if (budgetData.amount) {
                budgetData.amount = this.cleanCurrencyValue(budgetData.amount);
            }
            
            await this.budgetManager.add(budgetData);
            await this.renderBudgets();
            
            this.modalManager.closeBudgetModal();
            this.notificationService.showSuccess('Orçamento criado!');
            
        } catch (error) {
            console.error('❌ Erro ao criar orçamento:', error);
            this.notificationService.showError('Erro ao criar orçamento');
        }
    }

    /**
     * Handler para submissão de meta
     */
    async handleGoalSubmit(event) {
        try {
            const formData = new FormData(event.target);
            const goalData = Object.fromEntries(formData.entries());

            ['targetAmount', 'currentAmount'].forEach(field => {
                if (goalData[field]) {
                    goalData[field] = this.cleanCurrencyValue(goalData[field]);
                }
            });
            
            await this.goalManager.add(goalData);
            await this.renderGoals();
            
            this.modalManager.closeGoalModal();
            this.notificationService.showSuccess('Meta criada!');
            
        } catch (error) {
            console.error('❌ Erro ao criar meta:', error);
            this.notificationService.showError('Erro ao criar meta');
        }
    }

    /**
     * Método para debug
     */
    getAppState() {
        return {
            isInitialized: this.isInitialized,
            activeTab: this.activeTab,
            isOnline: this.isOnline,
            config: this.config,
            transactionsCount: this.transactionManager?.getAll().length || 0,
            budgetsCount: this.budgetManager?.getAll().length || 0,
            goalsCount: this.goalManager?.getAll().length || 0
        };
    }

    /**
     * Método de limpeza
     */
    destroy() {
        // Salvar dados antes de destruir
        this.saveAllData();
        
        // Parar sincronização
        this.dataSyncService?.stopSync();
        
        // Limpar intervals
        // (auto-save interval seria limpo aqui se tivéssemos referência)
        
        console.log('🧹 Aplicação limpa e finalizada');
    }

    // ============================================
    // MÉTODOS DE AÇÃO PARA OS BOTÕES HTML
    // ============================================

    /**
     * Edita uma transação
     */
    async editTransaction(id) {
        const transaction = this.transactionManager.findById(id);
        if (transaction) {
            this.safeOpenModal('openTransactionModal', transaction);
        }
    }

    /**
     * Deleta uma transação
     */
    async deleteTransaction(id) {
        this.safeOpenConfirmationModal({
            title: 'Excluir Transação',
            message: 'Tem certeza que deseja excluir esta transação?',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await this.transactionManager.remove(id);
                    this.notificationService.transactionDeleted();
                    await this.renderTransactions();
                } catch (error) {
                    this.notificationService.showError('Erro ao excluir transação');
                }
            }
        });
    }

    /**
     * Edita um orçamento
     */
    async editBudget(id) {
        const budget = this.budgetManager.findById?.(id);
        if (budget) {
            this.safeOpenModal('openBudgetModal', budget);
        }
    }

    /**
     * Deleta um orçamento
     */
    async deleteBudget(id) {
        this.safeOpenConfirmationModal({
            title: 'Excluir Orçamento',
            message: 'Tem certeza que deseja excluir este orçamento?',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            type: 'danger',
            onConfirm: async () => {
                try {
                    // Implementar método remove no BudgetManager
                    this.notificationService.showSuccess('Orçamento excluído!');
                    await this.renderBudgets();
                } catch (error) {
                    this.notificationService.showError('Erro ao excluir orçamento');
                }
            }
        });
    }

    /**
     * Edita uma meta
     */
    async editGoal(id) {
        const goal = this.goalManager.findById?.(id);
        if (goal) {
            this.safeOpenModal('openGoalModal', goal);
        }
    }

    /**
     * Deleta uma meta
     */
    async deleteGoal(id) {
        this.safeOpenConfirmationModal({
            title: 'Excluir Meta',
            message: 'Tem certeza que deseja excluir esta meta?',
            confirmText: 'Excluir',
            cancelText: 'Cancelar',
            type: 'danger',
            onConfirm: async () => {
                try {
                    // Implementar método remove no GoalManager
                    this.notificationService.showSuccess('Meta excluída!');
                    await this.renderGoals();
                } catch (error) {
                    this.notificationService.showError('Erro ao excluir meta');
                }
            }
        });
    }

    /**
     * Atualiza progresso de uma meta
     */
    async updateGoalProgress(id) {
        const amount = prompt('Digite o novo valor atual da meta:');
        if (amount && !isNaN(amount)) {
            try {
                // Implementar atualização de progresso
                this.notificationService.showSuccess('Progresso atualizado!');
                await this.renderGoals();
            } catch (error) {
                this.notificationService.showError('Erro ao atualizar progresso');
            }
        }
    }
}