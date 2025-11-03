/**
 * ChartRenderer - Renderizador de gráficos com Chart.js
 * Versão inicial simplificada
 */

export class ChartRenderer {
    constructor() {
        this.charts = new Map();
        this.defaultColors = [
            '#EF4444', '#F97316', '#F59E0B', '#EAB308',
            '#84CC16', '#22C55E', '#10B981', '#14B8A6',
            '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
            '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
        ];
    }

    /**
     * Renderiza gráfico de categorias (doughnut)
     */
    renderCategoryChart(canvasId, data) {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) {
                console.warn(`Canvas ${canvasId} não encontrado`);
                return;
            }

            // Destruir gráfico existente se houver
            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            const ctx = canvas.getContext('2d');
            
            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: data.labels || [],
                    datasets: [{
                        data: data.values || [],
                        backgroundColor: this.defaultColors.slice(0, data.labels?.length || 0),
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });

            this.charts.set(canvasId, chart);
            console.log(`📊 Gráfico ${canvasId} renderizado`);

        } catch (error) {
            console.error(`❌ Erro ao renderizar gráfico ${canvasId}:`, error);
        }
    }

    /**
     * Renderiza gráfico de linha temporal
     */
    renderTimelineChart(canvasId, data) {
        try {
            const canvas = document.getElementById(canvasId);
            if (!canvas) return;

            if (this.charts.has(canvasId)) {
                this.charts.get(canvasId).destroy();
            }

            const ctx = canvas.getContext('2d');
            
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.labels || [],
                    datasets: data.datasets || []
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return new Intl.NumberFormat('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    }).format(value);
                                }
                            }
                        }
                    }
                }
            });

            this.charts.set(canvasId, chart);

        } catch (error) {
            console.error(`❌ Erro ao renderizar timeline ${canvasId}:`, error);
        }
    }

    /**
     * Destrói todos os gráficos
     */
    destroyAll() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }
}