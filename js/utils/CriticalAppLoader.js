/**
 * CriticalAppLoader - Gerenciador de carregamento crítico da aplicação
 * Responsável pela tela de loading, skeleton e experiência de inicialização
 */

export class CriticalAppLoader {
    constructor() {
        this.loadingSteps = [
            { name: 'Inicializando sistema...', duration: 800 },
            { name: 'Carregando dados...', duration: 600 },
            { name: 'Configurando interface...', duration: 400 },
            { name: 'Finalizando...', duration: 300 }
        ];
        
        this.currentStep = 0;
        this.isLoading = false;
        this.loadingStartTime = null;
        this.minimumLoadingTime = 2000; // 2 segundos mínimo
    }

    /**
     * Inicia o processo de loading
     */
    async startLoading() {
        if (this.isLoading) {
            console.warn('⚠️ Loading já está em andamento');
            return;
        }

        this.isLoading = true;
        this.loadingStartTime = Date.now();
        this.currentStep = 0;

        console.log('🎬 Iniciando loading screen...');

        // Mostrar loading screen
        this.showLoadingScreen();
        
        // Iniciar animação de progresso
        this.animateProgress();
        
        // Simular etapas de carregamento
        await this.processLoadingSteps();
    }

    /**
     * Mostra a tela de loading
     */
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) {
            console.error('❌ Loading screen não encontrado');
            return;
        }

        // Garantir que está visível
        loadingScreen.style.display = 'flex';
        loadingScreen.classList.remove('opacity-0');
        loadingScreen.classList.add('opacity-100');

        // Inicializar elementos de progresso
        this.initializeProgressElements();
    }

    /**
     * Inicializa elementos de progresso
     */
    initializeProgressElements() {
        const progressBar = document.querySelector('.loading-progress-bar');
        const loadingText = document.querySelector('.loading-text');
        const loadingSubtext = document.querySelector('.loading-subtext');

        if (progressBar) {
            progressBar.style.width = '0%';
        }

        if (loadingText) {
            loadingText.textContent = 'Nós na Conta PRO';
        }

        if (loadingSubtext) {
            loadingSubtext.textContent = 'Preparando sua experiência financeira...';
        }
    }

    /**
     * Anima a barra de progresso
     */
    animateProgress() {
        const progressBar = document.querySelector('.loading-progress-bar');
        if (!progressBar) return;

        // Animação suave da barra
        let progress = 0;
        const increment = 100 / this.loadingSteps.length;

        const updateProgress = () => {
            if (this.currentStep < this.loadingSteps.length) {
                progress = (this.currentStep + 1) * increment;
                progressBar.style.width = `${progress}%`;
            }
        };

        // Atualizar progresso conforme steps
        this.progressUpdater = updateProgress;
    }

    /**
     * Processa as etapas de carregamento
     */
    async processLoadingSteps() {
        const loadingSubtext = document.querySelector('.loading-subtext');

        for (let i = 0; i < this.loadingSteps.length; i++) {
            const step = this.loadingSteps[i];
            this.currentStep = i;

            // Atualizar texto
            if (loadingSubtext) {
                loadingSubtext.textContent = step.name;
            }

            // Atualizar progresso
            if (this.progressUpdater) {
                this.progressUpdater();
            }

            console.log(`📋 Step ${i + 1}: ${step.name}`);

            // Aguardar duração do step
            await this.delay(step.duration);
        }

        // Finalizar loading
        await this.finishLoading();
    }

    /**
     * Finaliza o processo de loading
     */
    async finishLoading() {
        // Garantir tempo mínimo de loading
        const elapsedTime = Date.now() - this.loadingStartTime;
        const remainingTime = Math.max(0, this.minimumLoadingTime - elapsedTime);

        if (remainingTime > 0) {
            console.log(`⏱️ Aguardando ${remainingTime}ms para tempo mínimo de loading`);
            await this.delay(remainingTime);
        }

        // Completar barra de progresso
        const progressBar = document.querySelector('.loading-progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
        }

        // Aguardar um pouco para mostrar 100%
        await this.delay(200);

        // Esconder loading screen
        await this.hideLoadingScreen();

        this.isLoading = false;
        console.log('✅ Loading concluído');
    }

    /**
     * Esconde a tela de loading com animação
     */
    async hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (!loadingScreen) return;

        return new Promise((resolve) => {
            // Animação de fade out
            loadingScreen.classList.remove('opacity-100');
            loadingScreen.classList.add('opacity-0');

            // Aguardar animação CSS
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                resolve();
            }, 300);
        });
    }

    /**
     * Mostra skeleton loading para conteúdo específico
     */
    showSkeletonLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`⚠️ Container ${containerId} não encontrado para skeleton`);
            return;
        }

        const skeletonHTML = this.generateSkeletonHTML(containerId);
        container.innerHTML = skeletonHTML;
        
        console.log(`💀 Skeleton loading ativo em: ${containerId}`);
    }

    /**
     * Gera HTML do skeleton baseado no tipo de conteúdo
     */
    generateSkeletonHTML(containerId) {
        switch (containerId) {
            case 'resumoContent':
                return this.getDashboardSkeleton();
            case 'lancamentosContent':
                return this.getTransactionsSkeleton();
            case 'orcamentoContent':
                return this.getBudgetSkeleton();
            case 'metasContent':
                return this.getGoalsSkeleton();
            case 'relatoriosContent':
                return this.getReportsSkeleton();
            default:
                return this.getGenericSkeleton();
        }
    }

    /**
     * Skeleton do dashboard
     */
    getDashboardSkeleton() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                ${this.getCardSkeleton()}
                ${this.getCardSkeleton()}
                ${this.getCardSkeleton()}
                ${this.getCardSkeleton()}
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                ${this.getChartSkeleton()}
                ${this.getListSkeleton()}
            </div>
        `;
    }

    /**
     * Skeleton de transações
     */
    getTransactionsSkeleton() {
        return `
            <div class="mb-6">
                ${this.getButtonSkeleton()}
            </div>
            <div class="space-y-4">
                ${this.getListItemSkeleton()}
                ${this.getListItemSkeleton()}
                ${this.getListItemSkeleton()}
                ${this.getListItemSkeleton()}
                ${this.getListItemSkeleton()}
            </div>
        `;
    }

    /**
     * Skeleton de orçamento
     */
    getBudgetSkeleton() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${this.getProgressCardSkeleton()}
                ${this.getProgressCardSkeleton()}
                ${this.getProgressCardSkeleton()}
                ${this.getProgressCardSkeleton()}
            </div>
        `;
    }

    /**
     * Skeleton de metas
     */
    getGoalsSkeleton() {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${this.getGoalCardSkeleton()}
                ${this.getGoalCardSkeleton()}
                ${this.getGoalCardSkeleton()}
            </div>
        `;
    }

    /**
     * Skeleton de relatórios
     */
    getReportsSkeleton() {
        return `
            <div class="mb-6 flex space-x-4">
                ${this.getButtonSkeleton()}
                ${this.getButtonSkeleton()}
                ${this.getButtonSkeleton()}
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                ${this.getChartSkeleton()}
                ${this.getTableSkeleton()}
            </div>
        `;
    }

    /**
     * Elementos básicos de skeleton
     */
    getCardSkeleton() {
        return `
            <div class="bg-white rounded-lg shadow p-6 animate-pulse">
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/3"></div>
            </div>
        `;
    }

    getChartSkeleton() {
        return `
            <div class="bg-white rounded-lg shadow p-6 animate-pulse">
                <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div class="h-64 bg-gray-200 rounded"></div>
            </div>
        `;
    }

    getListSkeleton() {
        return `
            <div class="bg-white rounded-lg shadow p-6 animate-pulse">
                <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div class="space-y-3">
                    ${this.getListItemSkeleton()}
                    ${this.getListItemSkeleton()}
                    ${this.getListItemSkeleton()}
                    ${this.getListItemSkeleton()}
                </div>
            </div>
        `;
    }

    getListItemSkeleton() {
        return `
            <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                <div class="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div class="flex-1">
                    <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div class="h-6 bg-gray-200 rounded w-20"></div>
            </div>
        `;
    }

    getProgressCardSkeleton() {
        return `
            <div class="bg-white rounded-lg shadow p-6 animate-pulse">
                <div class="h-5 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div class="h-2 bg-gray-200 rounded mb-2"></div>
                <div class="flex justify-between">
                    <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        `;
    }

    getGoalCardSkeleton() {
        return `
            <div class="bg-white rounded-lg shadow p-6 animate-pulse">
                <div class="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div class="h-12 bg-gray-200 rounded mb-4"></div>
                <div class="h-2 bg-gray-200 rounded mb-2"></div>
                <div class="flex justify-between">
                    <div class="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div class="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        `;
    }

    getTableSkeleton() {
        return `
            <div class="bg-white rounded-lg shadow p-6 animate-pulse">
                <div class="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div class="space-y-3">
                    <div class="grid grid-cols-4 gap-4">
                        <div class="h-4 bg-gray-200 rounded"></div>
                        <div class="h-4 bg-gray-200 rounded"></div>
                        <div class="h-4 bg-gray-200 rounded"></div>
                        <div class="h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div class="grid grid-cols-4 gap-4">
                        <div class="h-4 bg-gray-200 rounded"></div>
                        <div class="h-4 bg-gray-200 rounded"></div>
                        <div class="h-4 bg-gray-200 rounded"></div>
                        <div class="h-4 bg-gray-200 rounded"></div>
                    </div>
                    <div class="grid grid-cols-4 gap-4">
                        <div class="h-4 bg-gray-200 rounded"></div>
                        <div class="h-4 bg-gray-200 rounded"></div>
                        <div class="h-4 bg-gray-200 rounded"></div>
                        <div class="h-4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        `;
    }

    getButtonSkeleton() {
        return `<div class="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>`;
    }

    getGenericSkeleton() {
        return `
            <div class="space-y-6 animate-pulse">
                <div class="h-8 bg-gray-200 rounded w-1/2"></div>
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-2/3"></div>
                <div class="h-64 bg-gray-200 rounded"></div>
            </div>
        `;
    }

    /**
     * Remove skeleton loading de um container
     */
    hideSkeletonLoading(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            // Remover skeletons será feito quando o conteúdo real for renderizado
            console.log(`💀 Skeleton loading removido de: ${containerId}`);
        }
    }

    /**
     * Utilitário para delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Verifica se está carregando
     */
    get loading() {
        return this.isLoading;
    }

    /**
     * Para o loading forçadamente (em caso de erro)
     */
    forceStop() {
        if (this.isLoading) {
            console.warn('⚠️ Parando loading forçadamente');
            this.hideLoadingScreen();
            this.isLoading = false;
        }
    }

    /**
     * Atualiza texto de loading dinâmicamente
     */
    updateLoadingText(text, subtext = null) {
        const loadingText = document.querySelector('.loading-text');
        const loadingSubtext = document.querySelector('.loading-subtext');

        if (loadingText && text) {
            loadingText.textContent = text;
        }

        if (loadingSubtext && subtext) {
            loadingSubtext.textContent = subtext;
        }
    }

    /**
     * Mostra loading personalizado para operações específicas
     */
    showCustomLoading(message, duration = 1000) {
        // Criar overlay temporário
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-sm mx-4">
                <div class="flex items-center space-x-4">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <div class="text-gray-800">${message}</div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Remover após duração
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, duration);

        return overlay;
    }
}