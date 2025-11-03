/**
 * Componente de Autenticação Firebase
 * Interface moderna para login e registro
 */
export class AuthComponent {
    constructor(firebaseService) {
        this.firebaseService = firebaseService;
        this.isVisible = false;
        this.currentMode = 'login'; // 'login' ou 'register'
        
        this.setupEventListeners();
        this.createAuthModal();
    }

    /**
     * Cria o modal de autenticação
     */
    createAuthModal() {
        const modalHTML = `
            <div id="authModal" class="fixed inset-0 bg-black bg-opacity-50 z-50 hidden flex items-center justify-center p-4">
                <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 opacity-0">
                    <!-- Header -->
                    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 id="authTitle" class="text-lg font-semibold text-gray-900 dark:text-white">Entrar</h3>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">Acesse sua conta</p>
                                </div>
                            </div>
                            <button id="closeAuthModal" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="p-6">
                        <!-- Login com Google -->
                        <button id="googleSignInBtn" class="w-full flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors mb-4">
                            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continuar com Google
                        </button>

                        <div class="relative mb-4">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
                            </div>
                            <div class="relative flex justify-center text-sm">
                                <span class="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">ou</span>
                            </div>
                        </div>

                        <!-- Formulário -->
                        <form id="authForm" class="space-y-4">
                            <!-- Nome (apenas no registro) -->
                            <div id="nameField" class="hidden">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nome completo</label>
                                <input type="text" id="displayName" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="Seu nome completo">
                            </div>

                            <!-- Email -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                                <input type="email" id="email" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="seu@email.com">
                            </div>

                            <!-- Senha -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Senha</label>
                                <div class="relative">
                                    <input type="password" id="password" required class="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" placeholder="••••••••" minlength="6">
                                    <button type="button" id="togglePassword" class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                        </svg>
                                    </button>
                                </div>
                                <p id="passwordHelp" class="mt-1 text-xs text-gray-500 dark:text-gray-400 hidden">A senha deve ter pelo menos 6 caracteres</p>
                            </div>

                            <!-- Loading e Error -->
                            <div id="authError" class="hidden p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                                <div class="flex">
                                    <svg class="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                                    </svg>
                                    <span id="authErrorText" class="text-sm text-red-700 dark:text-red-200"></span>
                                </div>
                            </div>

                            <!-- Botão Submit -->
                            <button type="submit" id="authSubmitBtn" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                <span id="authSubmitText">Entrar</span>
                                <svg id="authLoading" class="hidden animate-spin ml-2 w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </button>
                        </form>

                        <!-- Switch Mode -->
                        <div class="mt-6 text-center">
                            <button id="switchModeBtn" class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium transition-colors">
                                Não tem conta? Criar conta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Adiciona o modal ao body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Aguarda o DOM estar pronto
        document.addEventListener('DOMContentLoaded', () => {
            this.attachEventListeners();
        });

        // Se o DOM já estiver pronto
        if (document.readyState !== 'loading') {
            this.attachEventListeners();
        }
    }

    /**
     * Anexa event listeners aos elementos
     */
    attachEventListeners() {
        // Fechar modal
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeAuthModal' || e.target.id === 'authModal') {
                this.hide();
            }
        });

        // Google Sign In
        document.addEventListener('click', (e) => {
            if (e.target.id === 'googleSignInBtn' || e.target.closest('#googleSignInBtn')) {
                this.handleGoogleSignIn();
            }
        });

        // Form submit
        document.addEventListener('submit', (e) => {
            if (e.target.id === 'authForm') {
                e.preventDefault();
                this.handleFormSubmit();
            }
        });

        // Switch mode
        document.addEventListener('click', (e) => {
            if (e.target.id === 'switchModeBtn') {
                this.switchMode();
            }
        });

        // Toggle password visibility
        document.addEventListener('click', (e) => {
            if (e.target.id === 'togglePassword' || e.target.closest('#togglePassword')) {
                this.togglePasswordVisibility();
            }
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    /**
     * Mostra o modal de login
     */
    show() {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        this.isVisible = true;
        modal.classList.remove('hidden');
        
        // Animação de entrada
        setTimeout(() => {
            const content = modal.querySelector('div > div');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 10);

        // Foco no primeiro campo
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        }, 300);
    }

    /**
     * Esconde o modal
     */
    hide() {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        const content = modal.querySelector('div > div');
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            modal.classList.add('hidden');
            this.isVisible = false;
            this.clearForm();
        }, 300);
    }

    /**
     * Alterna entre modo login e registro
     */
    switchMode() {
        this.currentMode = this.currentMode === 'login' ? 'register' : 'login';
        this.updateModeUI();
        this.clearError();
    }

    /**
     * Atualiza interface baseado no modo
     */
    updateModeUI() {
        const title = document.getElementById('authTitle');
        const submitText = document.getElementById('authSubmitText');
        const submitBtn = document.getElementById('authSubmitBtn');
        const switchBtn = document.getElementById('switchModeBtn');
        const nameField = document.getElementById('nameField');
        const passwordHelp = document.getElementById('passwordHelp');

        if (this.currentMode === 'register') {
            title.textContent = 'Criar Conta';
            submitText.textContent = 'Criar Conta';
            switchBtn.textContent = 'Já tem conta? Fazer login';
            nameField.classList.remove('hidden');
            passwordHelp.classList.remove('hidden');
        } else {
            title.textContent = 'Entrar';
            submitText.textContent = 'Entrar';
            switchBtn.textContent = 'Não tem conta? Criar conta';
            nameField.classList.add('hidden');
            passwordHelp.classList.add('hidden');
        }
    }

    /**
     * Alterna visibilidade da senha
     */
    togglePasswordVisibility() {
        const passwordInput = document.getElementById('password');
        const toggleBtn = document.getElementById('togglePassword');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"></path>
                </svg>
            `;
        } else {
            passwordInput.type = 'password';
            toggleBtn.innerHTML = `
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
            `;
        }
    }

    /**
     * Manipula login com Google
     */
    async handleGoogleSignIn() {
        this.showLoading(document.getElementById('googleSignInBtn'));
        
        const result = await this.firebaseService.signInWithGoogle();
        
        this.hideLoading(document.getElementById('googleSignInBtn'));
        
        if (result.success) {
            this.hide();
            this.onAuthSuccess(result.user);
        } else {
            this.showError(result.error);
        }
    }

    /**
     * Manipula submit do formulário
     */
    async handleFormSubmit() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const displayName = document.getElementById('displayName').value;

        if (!this.validateForm(email, password, displayName)) {
            return;
        }

        const submitBtn = document.getElementById('authSubmitBtn');
        this.showLoading(submitBtn);
        
        let result;
        if (this.currentMode === 'register') {
            result = await this.firebaseService.createUserWithEmail(email, password, displayName);
        } else {
            result = await this.firebaseService.signInWithEmail(email, password);
        }
        
        this.hideLoading(submitBtn);
        
        if (result.success) {
            this.hide();
            this.onAuthSuccess(result.user);
        } else {
            this.showError(result.error);
        }
    }

    /**
     * Valida formulário
     */
    validateForm(email, password, displayName) {
        this.clearError();

        if (!email || !password) {
            this.showError('Preencha todos os campos obrigatórios');
            return false;
        }

        if (password.length < 6) {
            this.showError('A senha deve ter pelo menos 6 caracteres');
            return false;
        }

        if (this.currentMode === 'register' && !displayName) {
            this.showError('Nome é obrigatório para criar conta');
            return false;
        }

        return true;
    }

    /**
     * Mostra loading no botão
     */
    showLoading(button) {
        const text = button.querySelector('span');
        const spinner = button.querySelector('svg') || document.getElementById('authLoading');
        
        if (text) text.classList.add('opacity-0');
        if (spinner) spinner.classList.remove('hidden');
        button.disabled = true;
    }

    /**
     * Esconde loading do botão
     */
    hideLoading(button) {
        const text = button.querySelector('span');
        const spinner = button.querySelector('svg') || document.getElementById('authLoading');
        
        if (text) text.classList.remove('opacity-0');
        if (spinner) spinner.classList.add('hidden');
        button.disabled = false;
    }

    /**
     * Mostra erro
     */
    showError(message) {
        const errorDiv = document.getElementById('authError');
        const errorText = document.getElementById('authErrorText');
        
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }

    /**
     * Limpa erro
     */
    clearError() {
        const errorDiv = document.getElementById('authError');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }

    /**
     * Limpa formulário
     */
    clearForm() {
        const form = document.getElementById('authForm');
        if (form) {
            form.reset();
        }
        this.clearError();
    }

    /**
     * Callback de sucesso na autenticação
     */
    onAuthSuccess(user) {
        console.log('✅ Usuário autenticado:', user.email);
        
        // Notifica o app principal
        if (window.app && typeof window.app.onUserAuthenticated === 'function') {
            window.app.onUserAuthenticated(user);
        }

        // Dispara evento customizado
        document.dispatchEvent(new CustomEvent('userAuthenticated', {
            detail: { user }
        }));
    }
}