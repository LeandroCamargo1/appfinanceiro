// main.js - Arquivo principal que orquestra toda a aplicação

console.log('🔍 Iniciando main.js...');

// Testar imports um por vez
async function testImports() {
    try {
        console.log('📦 Importando CriticalAppLoader...');
        const { CriticalAppLoader } = await import('./utils/CriticalAppLoader.js');
        console.log('✅ CriticalAppLoader OK');
        
        console.log('📦 Importando SampleDataGenerator...');
        const { SampleDataGenerator } = await import('./utils/SampleDataGenerator.js');
        console.log('✅ SampleDataGenerator OK');
        
        console.log('📦 Importando FinanceApp...');
        const { FinanceApp } = await import('./core/FinanceApp.js');
        console.log('✅ FinanceApp OK');
        
        return { FinanceApp, CriticalAppLoader, SampleDataGenerator };
    } catch (error) {
        console.error('❌ Erro no import:', error);
        throw error;
    }
}

// Função principal de inicialização
async function initApp() {
    try {
        console.log('🚀 Iniciando aplicação...');
        
        // Importar dependências
        const { FinanceApp, CriticalAppLoader, SampleDataGenerator } = await testImports();
        
        // Mostrar loading screen
        const loader = new CriticalAppLoader();
        await loader.startLoading();
        
        // Inicializar a aplicação principal
        const app = new FinanceApp();
        await app.initialize();
        
        // Disponibilizar globalmente para os botões HTML
        window.app = app;
        
        // Carregar dados de exemplo se não houver dados existentes
        if (!SampleDataGenerator.hasExistingData()) {
            console.log('📊 Carregando dados de exemplo...');
            SampleDataGenerator.loadSampleData();
            // Recarregar o dashboard com os novos dados
            await app.renderDashboard();
        }
        
        // Disponibilizar gerador de dados de exemplo globalmente
        window.SampleDataGenerator = SampleDataGenerator;
        
        console.log('🎉 Nós na Conta PRO inicializado com sucesso!');
        
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

// Aguardar carregamento do DOM
document.addEventListener('DOMContentLoaded', initApp);

// Registrar Service Worker para funcionalidade offline (futuro)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('Service Worker registrado:', registration);
            })
            .catch((error) => {
                console.log('Falha ao registrar Service Worker:', error);
            });
    });
}