/**
 * ModernChartRenderer - Renderizador de gráficos modernos
 * Responsável por criar gráficos usando Chart.js com design moderno
 */

export class ModernChartRenderer {
    constructor() {
        this.charts = new Map();
        this.currentTheme = 'light';
        this.modernColors = {
            light: {
                primary: ['#667eea', '#764ba2'],
                secondary: ['#f093fb', '#f5576c'],
                success: ['#4facfe', '#00f2fe'],
                warning: ['#ffecd2', '#fcb69f'],
                danger: ['#ff9a9e', '#fecfef'],
                gradients: [
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
                ],
                text: '#0f172a',
                grid: '#e2e8f0'
            },
            dark: {
                primary: ['#667eea', '#764ba2'],
                secondary: ['#f093fb', '#f5576c'],
                success: ['#4facfe', '#00f2fe'],
                warning: ['#ffecd2', '#fcb69f'],
                danger: ['#ff9a9e', '#fecfef'],
                gradients: [
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
                ],
                text: '#f8fafc',
                grid: '#475569'
            }
        };
        
        this.init();
    }

    init() {
        // Registrar plugins personalizados do Chart.js
        if (typeof Chart !== 'undefined') {
            try {
                if (typeof Chart.register === 'function' && Array.isArray(Chart.registerables)) {
                    Chart.register(...Chart.registerables);
                } else {
                    console.warn('⚠️ Chart.registerables indisponível, prosseguindo sem registro global.');
                }
                this.registerCustomPlugins();
            } catch (chartInitError) {
                console.error('❌ Erro ao configurar Chart.js:', chartInitError);
            }
        }
        console.log('📊 ModernChartRenderer inicializado');
    }

    registerCustomPlugins() {
        if (typeof Chart === 'undefined' || typeof Chart.register !== 'function') {
            console.warn('⚠️ Chart.register não disponível, pulando plugins personalizados.');
            return;
        }

        // Plugin para gradientes
        Chart.register({
            id: 'gradientBg',
            beforeDraw: (chart) => {
                if (chart.config.options.plugins?.gradientBg) {
                    const ctx = chart.ctx;
                    const chartArea = chart.chartArea;
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(103, 126, 234, 0.1)');
                    gradient.addColorStop(1, 'rgba(118, 75, 162, 0.1)');
                    
                    ctx.save();
                    ctx.fillStyle = gradient;
                    ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
                    ctx.restore();
                }
            }
        });
    }

    getModernOptions(type = 'line') {
        const colors = this.modernColors[this.currentTheme];
        
        const baseOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeInOutCubic'
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        color: colors.text,
                        font: {
                            family: 'Inter, sans-serif',
                            size: 12,
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: this.currentTheme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: colors.grid,
                    borderWidth: 1,
                    cornerRadius: 12,
                    displayColors: true,
                    titleFont: {
                        family: 'Inter, sans-serif',
                        size: 14,
                        weight: 'bold'
                    },
                    bodyFont: {
                        family: 'Inter, sans-serif',
                        size: 12
                    },
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const value = new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            }).format(context.parsed.y || context.parsed);
                            return `${label}: ${value}`;
                        }
                    }
                }
            }
        };

        // Configurações específicas por tipo
        if (type === 'line' || type === 'bar') {
            baseOptions.scales = {
                x: {
                    grid: {
                        display: true,
                        drawBorder: false,
                        color: colors.grid
                    },
                    ticks: {
                        color: colors.text,
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11
                        }
                    }
                },
                y: {
                    grid: {
                        display: true,
                        drawBorder: false,
                        color: colors.grid
                    },
                    ticks: {
                        color: colors.text,
                        font: {
                            family: 'Inter, sans-serif',
                            size: 11
                        },
                        callback: function(value) {
                            return new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(value);
                        }
                    }
                }
            };
        }

        return baseOptions;
    }

    createGradient(ctx, colorStart, colorEnd, vertical = true) {
        const gradient = vertical 
            ? ctx.createLinearGradient(0, 0, 0, 400)
            : ctx.createLinearGradient(0, 0, 400, 0);
            
        gradient.addColorStop(0, colorStart);
        gradient.addColorStop(1, colorEnd);
        return gradient;
    }

    renderModernLineChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const colors = this.modernColors[this.currentTheme];

        // Criar gradientes para as linhas
        const gradient1 = this.createGradient(ctx, 
            'rgba(103, 126, 234, 0.8)', 
            'rgba(103, 126, 234, 0.1)'
        );
        const gradient2 = this.createGradient(ctx, 
            'rgba(240, 147, 251, 0.8)', 
            'rgba(240, 147, 251, 0.1)'
        );

        const chartData = {
            labels: data.labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: data.receitas,
                    borderColor: '#667eea',
                    backgroundColor: gradient1,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Despesas',
                    data: data.despesas,
                    borderColor: '#f5576c',
                    backgroundColor: gradient2,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#f5576c',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        };

        const config = {
            type: 'line',
            data: chartData,
            options: {
                ...this.getModernOptions('line'),
                ...options,
                plugins: {
                    ...this.getModernOptions('line').plugins,
                    gradientBg: true
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set(canvasId, chart);
        return chart;
    }

    renderModernDoughnutChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        const colors = this.modernColors[this.currentTheme];

        // Cores modernas para o doughnut
        const modernColors = [
            '#667eea', '#f5576c', '#4facfe', '#43e97b',
            '#fa709a', '#a8edea', '#ff9a9e', '#ffecd2'
        ];

        const chartData = {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: modernColors.slice(0, data.labels.length),
                borderWidth: 0,
                hoverBorderWidth: 3,
                hoverBorderColor: '#ffffff',
                cutout: '70%'
            }]
        };

        const config = {
            type: 'doughnut',
            data: chartData,
            options: {
                ...this.getModernOptions('doughnut'),
                ...options,
                plugins: {
                    ...this.getModernOptions('doughnut').plugins,
                    legend: {
                        ...this.getModernOptions('doughnut').plugins.legend,
                        position: 'right'
                    }
                }
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set(canvasId, chart);
        return chart;
    }

    renderModernBarChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        const ctx = canvas.getContext('2d');
        
        // Criar gradientes para as barras
        const gradients = data.datasets.map((_, index) => {
            const colors = ['#667eea', '#f5576c', '#4facfe', '#43e97b'];
            return this.createGradient(ctx, 
                colors[index] || '#667eea', 
                colors[index] ? colors[index] + '80' : '#667eea80'
            );
        });

        const chartData = {
            labels: data.labels,
            datasets: data.datasets.map((dataset, index) => ({
                ...dataset,
                backgroundColor: gradients[index],
                borderRadius: 8,
                borderSkipped: false,
            }))
        };

        const config = {
            type: 'bar',
            data: chartData,
            options: {
                ...this.getModernOptions('bar'),
                ...options
            }
        };

        const chart = new Chart(ctx, config);
        this.charts.set(canvasId, chart);
        return chart;
    }

    updateTheme(theme) {
        this.currentTheme = theme;
        
        // Atualizar todos os gráficos existentes
        this.charts.forEach((chart, canvasId) => {
            const colors = this.modernColors[theme];
            
            // Atualizar cores dos textos e grid
            if (chart.options.scales) {
                Object.keys(chart.options.scales).forEach(scaleKey => {
                    if (chart.options.scales[scaleKey].ticks) {
                        chart.options.scales[scaleKey].ticks.color = colors.text;
                    }
                    if (chart.options.scales[scaleKey].grid) {
                        chart.options.scales[scaleKey].grid.color = colors.grid;
                    }
                });
            }
            
            if (chart.options.plugins?.legend?.labels) {
                chart.options.plugins.legend.labels.color = colors.text;
            }
            
            chart.update('none');
        });
        
        console.log(`📊 Gráficos atualizados para tema: ${theme}`);
    }

    destroyChart(canvasId) {
        const chart = this.charts.get(canvasId);
        if (chart) {
            chart.destroy();
            this.charts.delete(canvasId);
        }
    }

    destroyAllCharts() {
        this.charts.forEach((chart, canvasId) => {
            chart.destroy();
        });
        this.charts.clear();
    }

    // Método para compatibilidade com o código existente
    renderCategoryChart(canvasId, data) {
        return this.renderModernDoughnutChart(canvasId, data);
    }

    renderTrendChart(canvasId, data) {
        return this.renderModernLineChart(canvasId, data);
    }

    renderTimelineChart(canvasId, data, options = {}) {
        // Alias para renderModernLineChart com dados formatados para timeline
        const formattedData = {
            labels: data.labels || [],
            receitas: data.datasets?.[0]?.data || [],
            despesas: data.datasets?.[1]?.data || []
        };
        return this.renderModernLineChart(canvasId, formattedData, options);
    }
}