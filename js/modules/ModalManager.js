/**
 * ModalManager - Gerenciador de modais da aplicação
 * Responsável por abrir, fechar e gerenciar todos os modais
 */

export class ModalManager {
    constructor() {
        this.activeModal = null;
        this.modalStack = [];
        this.isTransitioning = false;
        
        // Bind dos métodos
        this.handleEscKey = this.handleEscKey.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
        
        this.init();
    }

    /**
     * Inicialização do manager
     */
    init() {
        // Listener global para ESC
        document.addEventListener('keydown', this.handleEscKey);
        
        // Configurar todos os modais existentes
        this.setupExistingModals();
        
        console.log('🎭 ModalManager inicializado');
    }

    /**
     * Configura modais existentes no DOM
     */
    setupExistingModals() {
        const modals = document.querySelectorAll('[data-modal]');
        modals.forEach(modal => {
            this.setupModal(modal);
        });
    }

    /**
     * Configura um modal específico
     */
    setupModal(modal) {
        const modalId = modal.dataset.modal;
        
        // Adicionar overlay se não existir
        if (!modal.querySelector('.modal-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            overlay.addEventListener('click', this.handleOverlayClick);
            
            // Mover conteúdo do modal para dentro do overlay
            const content = modal.innerHTML;
            modal.innerHTML = '';
            overlay.innerHTML = content;
            modal.appendChild(overlay);
        }

        // Garantir que modal está escondido inicialmente
        modal.style.display = 'none';
        
        // Configurar botões de fechar
        const closeButtons = modal.querySelectorAll('[data-close-modal]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.close(modalId));
        });

        console.log(`🎭 Modal ${modalId} configurado`);
    }

    /**
     * Abre modal de transação
     */
    openTransactionModal(transactionData = null) {
        return this.open('transactionModal', {
            title: transactionData ? 'Editar Transação' : 'Nova Transação',
            data: transactionData
        });
    }

    /**
     * Abre modal de orçamento
     */
    openBudgetModal(budgetData = null) {
        return this.open('budgetModal', {
            title: budgetData ? 'Editar Orçamento' : 'Novo Orçamento',
            data: budgetData
        });
    }

    /**
     * Abre modal de meta
     */
    openGoalModal(goalData = null) {
        return this.open('goalModal', {
            title: goalData ? 'Editar Meta' : 'Nova Meta',
            data: goalData
        });
    }

    /**
     * Abre modal de confirmação
     */
    openConfirmationModal(options = {}) {
        const {
            title = 'Confirmar ação',
            message = 'Tem certeza que deseja continuar?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            onConfirm = () => {},
            onCancel = () => {},
            type = 'warning' // success, warning, danger, info
        } = options;

        return this.open('confirmationModal', {
            title,
            message,
            confirmText,
            cancelText,
            onConfirm,
            onCancel,
            type
        });
    }

    /**
     * Método genérico para abrir modais
     */
    async open(modalId, options = {}) {
        if (this.isTransitioning) {
            console.warn('⚠️ Modal transition em andamento');
            return;
        }

        try {
            this.isTransitioning = true;

            const modal = document.getElementById(modalId);
            if (!modal) {
                throw new Error(`Modal ${modalId} não encontrado`);
            }

            // Preparar modal com dados
            await this.prepareModal(modalId, options);

            // Fechar modal ativo se houver
            if (this.activeModal && this.activeModal !== modalId) {
                await this.close(this.activeModal, false);
            }

            // Adicionar à pilha
            if (!this.modalStack.includes(modalId)) {
                this.modalStack.push(modalId);
            }

            // Mostrar modal
            await this.showModal(modal);
            
            this.activeModal = modalId;
            console.log(`🎭 Modal ${modalId} aberto`);

            // Disparar evento personalizado
            document.dispatchEvent(new CustomEvent('modalOpened', {
                detail: { modalId, options }
            }));

        } catch (error) {
            console.error(`❌ Erro ao abrir modal ${modalId}:`, error);
        } finally {
            this.isTransitioning = false;
        }
    }

    /**
     * Fecha modal específico
     */
    async close(modalId, removeFromStack = true) {
        if (this.isTransitioning) {
            console.warn('⚠️ Modal transition em andamento');
            return;
        }

        try {
            this.isTransitioning = true;

            const modal = document.getElementById(modalId);
            if (!modal) {
                console.warn(`⚠️ Modal ${modalId} não encontrado para fechar`);
                return;
            }

            // Esconder modal
            await this.hideModal(modal);

            // Remover da pilha
            if (removeFromStack) {
                this.modalStack = this.modalStack.filter(id => id !== modalId);
            }

            // Atualizar modal ativo
            if (this.activeModal === modalId) {
                this.activeModal = this.modalStack.length > 0 
                    ? this.modalStack[this.modalStack.length - 1] 
                    : null;
            }

            // Limpar formulário se for modal de formulário
            this.clearModalForm(modal);

            console.log(`🎭 Modal ${modalId} fechado`);

            // Disparar evento personalizado
            document.dispatchEvent(new CustomEvent('modalClosed', {
                detail: { modalId }
            }));

        } catch (error) {
            console.error(`❌ Erro ao fechar modal ${modalId}:`, error);
        } finally {
            this.isTransitioning = false;
        }
    }

    /**
     * Fecha todos os modais
     */
    async closeAll() {
        const modalsToClose = [...this.modalStack];
        
        for (const modalId of modalsToClose) {
            await this.close(modalId);
        }

        this.modalStack = [];
        this.activeModal = null;
        
        console.log('🎭 Todos os modais fechados');
    }

    /**
     * Fecha modal de transação
     */
    closeTransactionModal() {
        return this.close('transactionModal');
    }

    /**
     * Fecha modal de orçamento
     */
    closeBudgetModal() {
        return this.close('budgetModal');
    }

    /**
     * Fecha modal de meta
     */
    closeGoalModal() {
        return this.close('goalModal');
    }

    /**
     * Fecha modal de confirmação
     */
    closeConfirmationModal() {
        return this.close('confirmationModal');
    }

    /**
     * Prepara modal com dados específicos
     */
    async prepareModal(modalId, options) {
        const modal = document.getElementById(modalId);
        
        switch (modalId) {
            case 'transactionModal':
                await this.prepareTransactionModal(modal, options);
                break;
                
            case 'budgetModal':
                await this.prepareBudgetModal(modal, options);
                break;
                
            case 'goalModal':
                await this.prepareGoalModal(modal, options);
                break;
                
            case 'confirmationModal':
                await this.prepareConfirmationModal(modal, options);
                break;
        }
    }

    /**
     * Prepara modal de transação
     */
    async prepareTransactionModal(modal, options) {
        const { title, data } = options;
        
        // Atualizar título
        const titleElement = modal.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title;
        }

        // Preencher formulário com dados se for edição
        if (data) {
            const form = modal.querySelector('#transactionForm');
            if (form) {
                Object.keys(data).forEach(key => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field) {
                        field.value = data[key];
                    }
                });
            }
        }

        // Configurar campos específicos
        await this.setupTransactionForm(modal);
    }

    /**
     * Configura formulário de transação
     */
    async setupTransactionForm(modal) {
        const form = modal.querySelector('#transactionForm');
        if (!form) return;

        // Campo de tipo (receita/despesa)
        const typeField = form.querySelector('[name="type"]');
        if (typeField) {
            typeField.addEventListener('change', (e) => {
                this.updateCategoryOptions(form, e.target.value);
            });
        }

        // Campo de parcelas
        const installmentsField = form.querySelector('[name="installments"]');
        if (installmentsField) {
            installmentsField.addEventListener('input', (e) => {
                this.updateInstallmentPreview(form, e.target.value);
            });
        }

        // Campo de valor
        const amountField = form.querySelector('[name="amount"]');
        if (amountField) {
            amountField.addEventListener('input', (e) => {
                this.formatCurrencyInput(e.target);
            });
        }

        console.log('📝 Formulário de transação configurado');
    }

    /**
     * Prepara modal de orçamento
     */
    async prepareBudgetModal(modal, options) {
        const { title, data } = options;

        const titleElement = modal.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title || 'Novo Orçamento';
        }

        const form = modal.querySelector('#budgetForm');
        if (form) {
            form.reset();

            const selectedCategory = data?.category || '';
            this.populateBudgetCategories(form, selectedCategory);

            if (data) {
                Object.entries(data).forEach(([key, value]) => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field) {
                        if (key === 'amount' && typeof value === 'number') {
                            field.value = this.formatCurrency(value);
                        } else {
                            field.value = value ?? '';
                        }
                    }
                });
            }

            this.setupBudgetForm(modal);

            const amountField = form.querySelector('[name="amount"]');
            if (amountField && data?.amount) {
                this.formatCurrencyInput(amountField);
            }
        }
    }

    /**
     * Configura formulário de orçamento
     */
    setupBudgetForm(modal) {
        const form = modal.querySelector('#budgetForm');
        if (!form) return;

        const amountField = form.querySelector('[name="amount"]');
        if (amountField && !amountField.dataset.currencyBound) {
            amountField.addEventListener('input', (event) => {
                this.formatCurrencyInput(event.target);
            });
            amountField.dataset.currencyBound = 'true';
        }
    }

    populateBudgetCategories(form, selectedCategory = '') {
        const categoryField = form.querySelector('[name="category"]');
        if (!categoryField) return;

        const categories = [
            { value: 'Alimentação', name: 'Alimentação' },
            { value: 'Moradia', name: 'Moradia' },
            { value: 'Transporte', name: 'Transporte' },
            { value: 'Lazer', name: 'Lazer' },
            { value: 'Saúde', name: 'Saúde' },
            { value: 'Educação', name: 'Educação' },
            { value: 'Contas', name: 'Contas' }
        ];

        categoryField.innerHTML = '<option value="">Selecione uma categoria</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.value;
            option.textContent = category.name;
            categoryField.appendChild(option);
        });

        if (selectedCategory) {
            categoryField.value = selectedCategory;
        }
    }

    /**
     * Prepara modal de meta
     */
    async prepareGoalModal(modal, options) {
        const { title, data } = options;

        const titleElement = modal.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = title || 'Nova Meta';
        }

        const form = modal.querySelector('#goalForm');
        if (form) {
            form.reset();

            if (data) {
                Object.entries(data).forEach(([key, value]) => {
                    const field = form.querySelector(`[name="${key}"]`);
                    if (field) {
                        if (key.toLowerCase().includes('amount') && typeof value === 'number') {
                            field.value = this.formatCurrency(value);
                        } else {
                            field.value = value || '';
                        }
                    }
                });
            } else {
                const currentAmountField = form.querySelector('[name="currentAmount"]');
                if (currentAmountField && !currentAmountField.value) {
                    currentAmountField.value = '0';
                }
            }

            this.setupGoalForm(modal);

            const currencyFields = form.querySelectorAll('[name="targetAmount"], [name="currentAmount"]');
            currencyFields.forEach(field => {
                if (field.value && !field.value.startsWith('R$')) {
                    this.formatCurrencyInput(field);
                }
            });
        }
    }

    /**
     * Configura formulário de metas
     */
    setupGoalForm(modal) {
        const form = modal.querySelector('#goalForm');
        if (!form) return;

        const currencyFields = form.querySelectorAll('[name="targetAmount"], [name="currentAmount"]');
        currencyFields.forEach(field => {
            if (!field.dataset.currencyBound) {
                field.addEventListener('input', (event) => {
                    this.formatCurrencyInput(event.target);
                });
                field.dataset.currencyBound = 'true';
            }
        });
    }

    /**
     * Atualiza opções de categoria baseado no tipo
     */
    updateCategoryOptions(form, type) {
        const categoryField = form.querySelector('[name="category"]');
        if (!categoryField) return;

        // Categories seria obtido do TransactionManager
        const categories = {
            receita: [
                { id: 'salario', name: 'Salário' },
                { id: 'freelance', name: 'Freelance' },
                { id: 'investimentos', name: 'Investimentos' }
            ],
            despesa: [
                { id: 'alimentacao', name: 'Alimentação' },
                { id: 'transporte', name: 'Transporte' },
                { id: 'moradia', name: 'Moradia' }
            ]
        };

        categoryField.innerHTML = '<option value="">Selecione uma categoria</option>';
        
        (categories[type] || []).forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryField.appendChild(option);
        });
    }

    /**
     * Atualiza preview de parcelas
     */
    updateInstallmentPreview(form, installments) {
        const preview = form.querySelector('#installmentPreview');
        const amountField = form.querySelector('[name="amount"]');
        
        if (!preview || !amountField) return;

        const totalAmount = parseFloat(amountField.value.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        const installmentAmount = totalAmount / (parseInt(installments) || 1);

        if (installments > 1 && totalAmount > 0) {
            preview.innerHTML = `
                <div class="mt-2 p-2 bg-blue-50 rounded text-sm">
                    <strong>${installments}x</strong> de 
                    <strong>${this.formatCurrency(installmentAmount)}</strong>
                </div>
            `;
            preview.style.display = 'block';
        } else {
            preview.style.display = 'none';
        }
    }

    /**
     * Formata input de moeda
     */
    formatCurrencyInput(input) {
        let value = input.value.replace(/\D/g, '');
        value = (value / 100).toFixed(2) + '';
        value = value.replace('.', ',');
        value = value.replace(/(\d)(\d{3})(\d{3}),/g, '$1.$2.$3,');
        value = value.replace(/(\d)(\d{3}),/g, '$1.$2,');
        input.value = 'R$ ' + value;
    }

    /**
     * Prepara modal de confirmação
     */
    async prepareConfirmationModal(modal, options) {
        const {
            title,
            message,
            confirmText,
            cancelText,
            onConfirm,
            onCancel,
            type
        } = options;

        // Atualizar conteúdo
        const titleElement = modal.querySelector('.confirmation-title');
        const messageElement = modal.querySelector('.confirmation-message');
        const confirmBtn = modal.querySelector('.confirm-btn');
        const cancelBtn = modal.querySelector('.cancel-btn');

        if (titleElement) titleElement.textContent = title;
        if (messageElement) messageElement.textContent = message;
        if (confirmBtn) confirmBtn.textContent = confirmText;
        if (cancelBtn) cancelBtn.textContent = cancelText;

        // Aplicar estilo baseado no tipo
        const typeClasses = {
            success: 'bg-green-600 hover:bg-green-700',
            warning: 'bg-yellow-600 hover:bg-yellow-700',
            danger: 'bg-red-600 hover:bg-red-700',
            info: 'bg-blue-600 hover:bg-blue-700'
        };

        if (confirmBtn && typeClasses[type]) {
            confirmBtn.className = `confirm-btn px-4 py-2 text-white rounded-lg ${typeClasses[type]}`;
        }

        // Configurar callbacks
        if (confirmBtn) {
            confirmBtn.onclick = async () => {
                await onConfirm();
                this.closeConfirmationModal();
            };
        }

        if (cancelBtn) {
            cancelBtn.onclick = async () => {
                await onCancel();
                this.closeConfirmationModal();
            };
        }
    }

    /**
     * Mostra modal com animação
     */
    async showModal(modal) {
        return new Promise((resolve) => {
            modal.style.display = 'flex';
            
            // Forçar reflow para garantir que display: flex seja aplicado
            modal.offsetHeight;
            
            modal.classList.add('modal-fade-in');
            
            setTimeout(() => {
                resolve();
            }, 150);
        });
    }

    /**
     * Esconde modal com animação
     */
    async hideModal(modal) {
        return new Promise((resolve) => {
            modal.classList.add('modal-fade-out');
            
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('modal-fade-in', 'modal-fade-out');
                resolve();
            }, 150);
        });
    }

    /**
     * Limpa formulário do modal
     */
    clearModalForm(modal) {
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            
            // Limpar previews específicos
            const previews = modal.querySelectorAll('[id$="Preview"]');
            previews.forEach(preview => {
                preview.style.display = 'none';
                preview.innerHTML = '';
            });
        }
    }

    /**
     * Handler para tecla ESC
     */
    handleEscKey(event) {
        if (event.key === 'Escape' && this.activeModal) {
            this.close(this.activeModal);
        }
    }

    /**
     * Handler para clique no overlay
     */
    handleOverlayClick(event) {
        if (event.target.classList.contains('modal-overlay')) {
            if (this.activeModal) {
                this.close(this.activeModal);
            }
        }
    }

    /**
     * Verifica se algum modal está aberto
     */
    get hasActiveModal() {
        return this.activeModal !== null;
    }

    /**
     * Obtém modal ativo
     */
    get currentModal() {
        return this.activeModal;
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
     * Aplica estilos CSS necessários
     */
    injectStyles() {
        const styles = `
            .modal-fade-in {
                animation: modalFadeIn 0.15s ease-out;
            }
            
            .modal-fade-out {
                animation: modalFadeOut 0.15s ease-in;
            }
            
            @keyframes modalFadeIn {
                from {
                    opacity: 0;
                    transform: scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            @keyframes modalFadeOut {
                from {
                    opacity: 1;
                    transform: scale(1);
                }
                to {
                    opacity: 0;
                    transform: scale(0.95);
                }
            }
        `;

        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    /**
     * Método de limpeza
     */
    destroy() {
        document.removeEventListener('keydown', this.handleEscKey);
        this.closeAll();
        console.log('🎭 ModalManager destruído');
    }
}