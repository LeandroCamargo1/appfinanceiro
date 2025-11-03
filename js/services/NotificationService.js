/**
 * NotificationService - Serviço de notificações toast
 * Responsável por exibir mensagens de feedback para o usuário
 */

export class NotificationService {
    constructor() {
        this.notifications = [];
        this.container = null;
        this.maxNotifications = 5;
        this.defaultDuration = 5000; // 5 segundos
        
        this.init();
    }

    /**
     * Inicializa o serviço de notificações
     */
    init() {
        try {
            // Verificar se o DOM está pronto
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.createContainer();
                    this.injectStyles();
                });
            } else {
                this.createContainer();
                this.injectStyles();
            }
            console.log('📢 NotificationService inicializado');
        } catch (error) {
            console.warn('⚠️ NotificationService: DOM não está pronto, usando fallback');
            // Fallback para console
            this.showSuccess = (msg) => console.log('✅', msg);
            this.showError = (msg) => console.error('❌', msg);
            this.showWarning = (msg) => console.warn('⚠️', msg);
            this.showInfo = (msg) => console.info('ℹ️', msg);
        }
    }

    /**
     * Cria container das notificações
     */
    createContainer() {
        try {
            // Verificar se já existe
            this.container = document.getElementById('notificationContainer');
            
            if (!this.container) {
                this.container = document.createElement('div');
                this.container.id = 'notificationContainer';
                this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
                document.body.appendChild(this.container);
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível criar container de notificações:', error);
            this.container = null;
        }
    }

    /**
     * Mostra notificação de sucesso
     */
    showSuccess(message, options = {}) {
        return this.show(message, 'success', options);
    }

    /**
     * Mostra notificação de erro
     */
    showError(message, options = {}) {
        return this.show(message, 'error', options);
    }

    /**
     * Mostra notificação de aviso
     */
    showWarning(message, options = {}) {
        return this.show(message, 'warning', options);
    }

    /**
     * Mostra notificação de informação
     */
    showInfo(message, options = {}) {
        return this.show(message, 'info', options);
    }

    /**
     * Método genérico para mostrar notificações
     */
    show(message, type = 'info', options = {}) {
        // Fallback para console se não houver container
        if (!this.container) {
            const prefix = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };
            console.log(`${prefix[type] || 'ℹ️'} ${message}`);
            return null;
        }

        const {
            duration = this.defaultDuration,
            persistent = false,
            actionText = null,
            onAction = null,
            icon = null
        } = options;

        // Limitar número de notificações
        if (this.notifications.length >= this.maxNotifications) {
            this.removeOldest();
        }

        const notification = this.createNotification(message, type, {
            duration,
            persistent,
            actionText,
            onAction,
            icon
        });

        this.notifications.push(notification);
        this.container.appendChild(notification.element);

        // Animar entrada
        this.animateIn(notification.element);

        // Auto-remover se não for persistente
        if (!persistent && duration > 0) {
            notification.timeoutId = setTimeout(() => {
                this.remove(notification.id);
            }, duration);
        }

        console.log(`📢 Notificação ${type}: ${message}`);
        return notification.id;
    }

    /**
     * Cria elemento de notificação
     */
    createNotification(message, type, options) {
        const id = this.generateId();
        const { actionText, onAction, icon } = options;

        const element = document.createElement('div');
        element.className = `notification notification-${type} max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`;
        element.dataset.notificationId = id;

        const typeConfig = this.getTypeConfig(type);
        const displayIcon = icon || typeConfig.icon;

        element.innerHTML = `
            <div class="p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background-color: ${typeConfig.bgColor}">
                            <span class="text-white text-sm">${displayIcon}</span>
                        </div>
                    </div>
                    <div class="ml-3 w-0 flex-1 pt-0.5">
                        <p class="text-sm font-medium text-gray-900">
                            ${message}
                        </p>
                        ${actionText && onAction ? `
                            <div class="mt-3 flex space-x-2">
                                <button class="notification-action bg-white rounded-md text-sm font-medium text-${typeConfig.textColor} hover:text-${typeConfig.hoverColor} focus:outline-none">
                                    ${actionText}
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    <div class="ml-4 flex-shrink-0 flex">
                        <button class="notification-close bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
                            <span class="sr-only">Fechar</span>
                            <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Configurar eventos
        const closeBtn = element.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => this.remove(id));

        if (actionText && onAction) {
            const actionBtn = element.querySelector('.notification-action');
            actionBtn.addEventListener('click', () => {
                onAction();
                this.remove(id);
            });
        }

        return {
            id,
            element,
            type,
            message,
            timeoutId: null
        };
    }

    /**
     * Obtém configuração do tipo de notificação
     */
    getTypeConfig(type) {
        const configs = {
            success: {
                icon: '✅',
                bgColor: '#10B981',
                textColor: 'green-600',
                hoverColor: 'green-500'
            },
            error: {
                icon: '❌',
                bgColor: '#EF4444',
                textColor: 'red-600',
                hoverColor: 'red-500'
            },
            warning: {
                icon: '⚠️',
                bgColor: '#F59E0B',
                textColor: 'yellow-600',
                hoverColor: 'yellow-500'
            },
            info: {
                icon: 'ℹ️',
                bgColor: '#3B82F6',
                textColor: 'blue-600',
                hoverColor: 'blue-500'
            }
        };

        return configs[type] || configs.info;
    }

    /**
     * Remove notificação por ID
     */
    remove(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (!notification) return;

        // Limpar timeout se existir
        if (notification.timeoutId) {
            clearTimeout(notification.timeoutId);
        }

        // Animar saída
        this.animateOut(notification.element, () => {
            // Remover do DOM
            if (notification.element.parentNode) {
                notification.element.parentNode.removeChild(notification.element);
            }

            // Remover da lista
            this.notifications = this.notifications.filter(n => n.id !== id);
        });
    }

    /**
     * Remove todas as notificações
     */
    removeAll() {
        const notificationIds = this.notifications.map(n => n.id);
        notificationIds.forEach(id => this.remove(id));
    }

    /**
     * Remove a notificação mais antiga
     */
    removeOldest() {
        if (this.notifications.length > 0) {
            this.remove(this.notifications[0].id);
        }
    }

    /**
     * Anima entrada da notificação
     */
    animateIn(element) {
        element.style.transform = 'translateX(100%)';
        element.style.opacity = '0';
        
        // Forçar reflow
        element.offsetHeight;
        
        element.style.transition = 'all 0.3s ease-out';
        element.style.transform = 'translateX(0)';
        element.style.opacity = '1';
    }

    /**
     * Anima saída da notificação
     */
    animateOut(element, callback) {
        element.style.transition = 'all 0.3s ease-in';
        element.style.transform = 'translateX(100%)';
        element.style.opacity = '0';
        
        setTimeout(callback, 300);
    }

    /**
     * Notificações pré-definidas para operações comuns
     */
    
    // Transações
    transactionAdded() {
        return this.showSuccess('Transação adicionada com sucesso!');
    }

    transactionUpdated() {
        return this.showSuccess('Transação atualizada com sucesso!');
    }

    transactionDeleted() {
        return this.showSuccess('Transação removida com sucesso!');
    }

    // Orçamentos
    budgetCreated() {
        return this.showSuccess('Orçamento criado com sucesso!');
    }

    budgetUpdated() {
        return this.showSuccess('Orçamento atualizado com sucesso!');
    }

    budgetExceeded(budgetName, amount) {
        return this.showWarning(`Orçamento "${budgetName}" excedido em ${this.formatCurrency(amount)}!`, {
            duration: 8000,
            actionText: 'Ver detalhes',
            onAction: () => {
                document.dispatchEvent(new CustomEvent('switchTab', { 
                    detail: { tab: 'orcamento' } 
                }));
            }
        });
    }

    // Metas
    goalCreated() {
        return this.showSuccess('Meta criada com sucesso!');
    }

    goalUpdated() {
        return this.showSuccess('Meta atualizada com sucesso!');
    }

    goalAchieved(goalName) {
        return this.showSuccess(`🎉 Parabéns! Meta "${goalName}" alcançada!`, {
            duration: 10000,
            actionText: 'Ver metas',
            onAction: () => {
                document.dispatchEvent(new CustomEvent('switchTab', { 
                    detail: { tab: 'metas' } 
                }));
            }
        });
    }

    // Sistema
    dataLoaded() {
        return this.showInfo('Dados carregados com sucesso!', { duration: 3000 });
    }

    dataSaved() {
        return this.showSuccess('Dados salvos automaticamente!', { duration: 3000 });
    }

    syncStarted() {
        return this.showInfo('Sincronização iniciada...', { duration: 3000 });
    }

    syncCompleted() {
        return this.showSuccess('Sincronização concluída!', { duration: 3000 });
    }

    syncError() {
        return this.showError('Erro na sincronização. Tentando novamente...', {
            duration: 8000,
            actionText: 'Tentar agora',
            onAction: () => {
                document.dispatchEvent(new CustomEvent('forcSync'));
            }
        });
    }

    // Conectividade
    goingOffline() {
        return this.showWarning('Você está offline. Os dados serão salvos localmente.', {
            persistent: true,
            icon: '📱'
        });
    }

    backOnline() {
        return this.showSuccess('Conexão restaurada! Sincronizando dados...', {
            duration: 5000,
            icon: '🌐'
        });
    }

    // Erros
    networkError() {
        return this.showError('Erro de conexão. Verifique sua internet.', {
            duration: 8000,
            actionText: 'Tentar novamente',
            onAction: () => {
                location.reload();
            }
        });
    }

    storageError() {
        return this.showError('Erro ao salvar dados. Espaço insuficiente?', {
            duration: 10000,
            actionText: 'Limpar cache',
            onAction: () => {
                document.dispatchEvent(new CustomEvent('clearCache'));
            }
        });
    }

    validationError(field) {
        return this.showError(`Por favor, preencha o campo: ${field}`, {
            duration: 5000
        });
    }

    // Utilitários
    loading(message = 'Carregando...') {
        return this.showInfo(message, {
            persistent: true,
            icon: '⏳'
        });
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
     * Gera ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Injeta estilos CSS necessários
     */
    injectStyles() {
        const styles = `
            #notificationContainer {
                max-height: calc(100vh - 2rem);
                overflow-y: auto;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }
            
            #notificationContainer::-webkit-scrollbar {
                display: none;
            }
            
            .notification {
                transition: all 0.3s ease;
            }
            
            .notification:hover {
                transform: translateX(-4px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
            }
            
            @media (max-width: 640px) {
                #notificationContainer {
                    left: 1rem;
                    right: 1rem;
                    top: 1rem;
                }
                
                .notification {
                    max-width: none;
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * Obtém estatísticas das notificações
     */
    getStats() {
        const stats = {
            total: this.notifications.length,
            byType: {}
        };

        this.notifications.forEach(notification => {
            stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
        });

        return stats;
    }

    /**
     * Configura duração padrão
     */
    setDefaultDuration(duration) {
        this.defaultDuration = duration;
    }

    /**
     * Configura número máximo de notificações
     */
    setMaxNotifications(max) {
        this.maxNotifications = max;
        
        // Remover excesso se necessário
        while (this.notifications.length > max) {
            this.removeOldest();
        }
    }

    /**
     * Pausa todas as notificações com timeout
     */
    pauseAll() {
        this.notifications.forEach(notification => {
            if (notification.timeoutId) {
                clearTimeout(notification.timeoutId);
                notification.timeoutId = null;
            }
        });
    }

    /**
     * Resume todas as notificações pausadas
     */
    resumeAll() {
        this.notifications.forEach(notification => {
            if (!notification.timeoutId && notification.duration > 0) {
                notification.timeoutId = setTimeout(() => {
                    this.remove(notification.id);
                }, this.defaultDuration);
            }
        });
    }

    /**
     * Método de limpeza
     */
    destroy() {
        this.removeAll();
        
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        
        console.log('📢 NotificationService destruído');
    }
}