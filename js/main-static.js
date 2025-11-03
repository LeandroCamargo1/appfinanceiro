// main.js - Versão com imports estáticos e design moderno
import { FinanceApp } from './core/FinanceApp.js';
import { CriticalAppLoader } from './utils/CriticalAppLoader.js';
import { SampleDataGenerator } from './utils/SampleDataGenerator.js';
import { ModernThemeManager, ModernAnimationManager, ModernInteractionManager } from './utils/ModernUIManager.js';

console.log('🔍 Main.js carregado com imports estáticos');

// Criar window.app temporário para evitar erros
window.app = {
    openTransactionModal: () => console.log('⏳ App ainda carregando...'),
    openBudgetModal: () => console.log('⏳ App ainda carregando...'),
    openGoalModal: () => console.log('⏳ App ainda carregando...'),
    renderDashboard: () => console.log('⏳ App ainda carregando...')
};

// Função principal de inicialização
async function initApp() {
    try {
        console.log('🚀 Iniciando aplicação...');
        
        // Mostrar loading screen
        const loader = new CriticalAppLoader();
        await loader.startLoading();
        
        // Inicializar a aplicação principal
        const app = new FinanceApp();
        await app.initialize();
        
        // Inicializar sistemas modernos
        const themeManager = new ModernThemeManager();
        const animationManager = new ModernAnimationManager();
        const interactionManager = new ModernInteractionManager();
        
        // Substituir window.app temporário pelo app real
        window.app = app;
        window.themeManager = themeManager;
        window.animationManager = animationManager;
        window.interactionManager = interactionManager;
        
        console.log('✅ window.app definido com métodos:', Object.getOwnPropertyNames(Object.getPrototypeOf(app)).filter(name => name.startsWith('open')));
        
        // Configurar event listeners para autenticação
        setupAuthListeners(app);
        
        // Configurar botão FAB
        setupFabButton(app);
        
        // Carregar dados de exemplo se não houver dados existentes
        if (!SampleDataGenerator.hasExistingData()) {
            console.log('📊 Carregando dados de exemplo...');
            SampleDataGenerator.loadSampleData();
            // Recarregar o dashboard com os novos dados
            await app.renderDashboard();
        }
        
        // Disponibilizar gerador de dados de exemplo globalmente
        window.SampleDataGenerator = SampleDataGenerator;
        
        // Adicionar efeito de ripple nos botões
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-modern')) {
                animationManager.createRippleEffect(e);
            }
        });
        
        console.log('🎉 Nós na Conta PRO Moderno inicializado com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao inicializar aplicação:', error);
        console.error('📍 Stack:', error.stack);
        
        // Mostrar mensagem de erro no container principal
        const mainContent = document.getElementById('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="flex items-center justify-center h-screen">
                    <div class="text-center">
                        <div class="text-6xl mb-4">⚠️</div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar aplicação</h2>
                        <p class="text-gray-600 mb-4">Erro: ${error.message}</p>
                        <details class="mb-4">
                            <summary class="cursor-pointer">Detalhes técnicos</summary>
                            <pre class="mt-2 p-2 bg-gray-100 text-xs text-left">${error.stack}</pre>
                        </details>
                        <button onclick="location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Recarregar página
                        </button>
                    </div>
                </div>
            `;
            mainContent.style.display = 'block';
        }
    }
}

/**
 * Configura event listeners para autenticação
 */
function setupAuthListeners(app) {
    // Botão de login
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            app.showLoginModal();
        });
    }
    
    // Botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            app.logout();
        });
    }
    
    // Event listener para autenticação bem-sucedida
    document.addEventListener('userAuthenticated', (event) => {
        console.log('👤 Evento de autenticação recebido:', event.detail.user);
        app.onUserAuthenticated(event.detail.user);
    });
    
    // Event listener para mudanças no Firebase
    if (app.firebaseService) {
        app.firebaseService.addListener('authStateChanged', (user) => {
            if (user && !app.currentUser) {
                // Usuário fez login
                app.onUserAuthenticated(user);
            } else if (!user && app.currentUser) {
                // Usuário fez logout
                app.currentUser = null;
                app.updateUserInterface(null);
            }
        });
        
        app.firebaseService.addListener('syncCompleted', (count) => {
            app.safeNotify('showSuccess', `${count} itens sincronizados`);
        });
        
        app.firebaseService.addListener('networkStatusChanged', (isOnline) => {
            const status = isOnline ? 'Online' : 'Offline';
            app.safeNotify('showInfo', `Status: ${status}`);
        });
    }
}

/**
 * Configura o botão FAB (Floating Action Button)
 */
function setupFabButton(app) {
    const fabButton = document.getElementById('fabButton');
    if (fabButton) {
        fabButton.addEventListener('click', () => {
            console.log('🎯 FAB clicked, chamando openTransactionModal');
            if (app && typeof app.openTransactionModal === 'function') {
                app.openTransactionModal();
            } else {
                console.error('❌ app.openTransactionModal não disponível:', {
                    appExists: !!app,
                    methodType: typeof app?.openTransactionModal,
                    appMethods: app ? Object.getOwnPropertyNames(Object.getPrototypeOf(app)).filter(m => m.startsWith('open')) : []
                });
                // Fallback para o método safeOpenModal se disponível
                if (app && typeof app.safeOpenModal === 'function') {
                    console.log('🔄 Usando fallback safeOpenModal');
                    app.safeOpenModal('openTransactionModal');
                } else {
                    alert('Sistema ainda carregando, tente novamente em alguns segundos.');
                }
            }
        });
        
        console.log('✅ FAB button event listener configurado');
    } else {
        console.warn('⚠️ FAB button não encontrado');
    }
}

// Aguardar carregamento do DOM
document.addEventListener('DOMContentLoaded', initApp);