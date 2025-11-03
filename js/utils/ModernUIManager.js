/**
 * ModernThemeManager - Sistema de temas moderno com animações
 */
export class ModernThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'light';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeToggle();
        this.setupSystemThemeDetection();
        console.log('🎨 ModernThemeManager inicializado');
    }

    getStoredTheme() {
        return localStorage.getItem('theme');
    }

    storeTheme(theme) {
        localStorage.setItem('theme', theme);
    }

    applyTheme(theme) {
        const root = document.documentElement;
        
        // Remove tema anterior
        root.removeAttribute('data-theme');
        
        // Aplica novo tema
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        }
        
        this.currentTheme = theme;
        this.storeTheme(theme);
        
        // Atualiza gráficos se existirem
        this.updateChartsTheme();
        
        console.log(`🌟 Tema alterado para: ${theme}`);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
        
        // Animação de transição suave
        document.body.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        setTimeout(() => {
            document.body.style.transition = '';
        }, 300);
    }

    setupThemeToggle() {
        const toggleButton = document.getElementById('themeToggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', () => this.toggleTheme());
        }
    }

    setupSystemThemeDetection() {
        // Detectar mudanças no tema do sistema
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                if (!this.getStoredTheme()) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    updateChartsTheme() {
        // Atualizar cores dos gráficos baseado no tema
        if (window.app && window.app.chartRenderer) {
            window.app.chartRenderer.updateTheme(this.currentTheme);
        }
    }

    getThemeColors() {
        const style = getComputedStyle(document.documentElement);
        
        return {
            primary: style.getPropertyValue('--bg-primary').trim(),
            secondary: style.getPropertyValue('--bg-secondary').trim(),
            text: style.getPropertyValue('--text-primary').trim(),
            textSecondary: style.getPropertyValue('--text-secondary').trim(),
            accent: style.getPropertyValue('--accent-primary').trim(),
            border: style.getPropertyValue('--border-color').trim(),
        };
    }
}

/**
 * ModernAnimationManager - Gerenciador de animações e interações
 */
export class ModernAnimationManager {
    constructor() {
        this.observers = new Map();
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupHoverEffects();
        this.setupParallaxEffects();
        console.log('✨ ModernAnimationManager inicializado');
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    
                    // Animação específica para cards
                    if (entry.target.classList.contains('modern-card')) {
                        setTimeout(() => {
                            entry.target.classList.add('slide-up');
                        }, Math.random() * 200);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observar elementos que precisam de animação
        document.querySelectorAll('.modern-card, .stat-card, .chart-container').forEach(el => {
            observer.observe(el);
        });

        this.observers.set('intersection', observer);
    }

    setupHoverEffects() {
        // Efeito de hover nos cartões
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest('.modern-card')) {
                const card = e.target.closest('.modern-card');
                card.style.transform = 'translateY(-4px) scale(1.02)';
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('.modern-card')) {
                const card = e.target.closest('.modern-card');
                card.style.transform = '';
            }
        });
    }

    setupParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelectorAll('.parallax');
            
            parallax.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    animateValue(element, start, end, duration = 2000) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easeOutCubic;
            
            element.textContent = this.formatNumber(current);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return Math.round(num).toLocaleString('pt-BR');
    }

    createRippleEffect(event) {
        const button = event.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('span');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        button.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    addLoadingEffect(element, text = 'Carregando...') {
        element.classList.add('loading');
        const originalContent = element.innerHTML;
        
        element.innerHTML = `
            <div class="flex items-center justify-center">
                <div class="loading-spinner"></div>
                <span class="ml-2">${text}</span>
            </div>
        `;
        
        return () => {
            element.classList.remove('loading');
            element.innerHTML = originalContent;
        };
    }

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div class="flex items-center space-x-3">
                <span class="text-lg">${icons[type]}</span>
                <span class="font-medium">${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Animar saída
        setTimeout(() => {
            toast.style.transform = 'translateX(full)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

/**
 * ModernInteractionManager - Gerenciador de interações avançadas
 */
export class ModernInteractionManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupSmartScroll();
        this.setupKeyboardShortcuts();
        this.setupGestures();
        this.setupAccessibility();
        console.log('🎮 ModernInteractionManager inicializado');
    }

    setupSmartScroll() {
        let lastScrollY = window.scrollY;
        let ticking = false;
        
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const header = document.querySelector('.nav-modern');
            
            if (header) {
                if (currentScrollY > lastScrollY && currentScrollY > 100) {
                    // Escrolando para baixo - esconder header
                    header.style.transform = 'translateY(-100%)';
                } else {
                    // Escrolando para cima - mostrar header
                    header.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = currentScrollY;
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(handleScroll);
                ticking = true;
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K - Pesquisa rápida
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.openQuickSearch();
            }
            
            // Ctrl/Cmd + N - Nova transação
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                if (window.app) {
                    window.app.openTransactionModal();
                }
            }
            
            // Ctrl/Cmd + D - Toggle tema
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                if (window.themeManager) {
                    window.themeManager.toggleTheme();
                }
            }
        });
    }

    setupGestures() {
        let startX, startY, endX, endY;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            endX = e.changedTouches[0].clientX;
            endY = e.changedTouches[0].clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Swipe horizontal para navegar entre abas
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
                if (deltaX > 0) {
                    // Swipe right - aba anterior
                    this.navigateTab('prev');
                } else {
                    // Swipe left - próxima aba
                    this.navigateTab('next');
                }
            }
        });
    }

    setupAccessibility() {
        // Melhorar navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });
        
        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
        
        // Anunciar mudanças para leitores de tela
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'sr-only';
        document.body.appendChild(announcer);
        
        this.announcer = announcer;
    }

    announce(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }

    openQuickSearch() {
        // Implementar busca rápida
        console.log('🔍 Abrindo busca rápida...');
    }

    navigateTab(direction) {
        const tabs = document.querySelectorAll('.nav-tab');
        const activeTab = document.querySelector('.nav-tab.active');
        
        if (tabs.length && activeTab) {
            const currentIndex = Array.from(tabs).indexOf(activeTab);
            let newIndex;
            
            if (direction === 'next') {
                newIndex = (currentIndex + 1) % tabs.length;
            } else {
                newIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
            }
            
            tabs[newIndex].click();
        }
    }
}