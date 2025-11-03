// main.js - Versão simplificada para debug
console.log('🔍 Iniciando debug do main.js');

// Teste 1: Import básico
try {
    console.log('📦 Tentando importar FinanceApp...');
    const { FinanceApp } = await import('./core/FinanceApp.js');
    console.log('✅ FinanceApp importado com sucesso');
    
    console.log('📦 Tentando importar CriticalAppLoader...');
    const { CriticalAppLoader } = await import('./utils/CriticalAppLoader.js');
    console.log('✅ CriticalAppLoader importado com sucesso');
    
    console.log('📦 Tentando importar SampleDataGenerator...');
    const { SampleDataGenerator } = await import('./utils/SampleDataGenerator.js');
    console.log('✅ SampleDataGenerator importado com sucesso');
    
    // Se chegou até aqui, todos os imports básicos funcionam
    console.log('✅ Todos os imports básicos funcionaram!');
    
    // Agora tenta inicializar
    console.log('🚀 Tentando inicializar aplicação...');
    const loader = new CriticalAppLoader();
    await loader.startLoading();
    
    const app = new FinanceApp();
    await app.initialize();
    
    window.app = app;
    window.SampleDataGenerator = SampleDataGenerator;
    
    // Carregar dados de exemplo se necessário
    if (!SampleDataGenerator.hasExistingData()) {
        console.log('📊 Carregando dados de exemplo...');
        SampleDataGenerator.loadSampleData();
        await app.renderDashboard();
    }
    
    console.log('🎉 Aplicação inicializada com sucesso!');
    
} catch (error) {
    console.error('❌ Erro durante inicialização:', error);
    console.error('📍 Stack trace:', error.stack);
    
    // Mostrar erro na interface
    document.body.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: red;">❌ Erro de Carregamento</h2>
            <p><strong>Erro:</strong> ${error.message}</p>
            <details>
                <summary>Detalhes técnicos</summary>
                <pre style="background: #f5f5f5; padding: 10px; overflow: auto;">${error.stack}</pre>
            </details>
            <button onclick="location.reload()" style="margin-top: 10px; padding: 10px 20px;">
                🔄 Recarregar
            </button>
        </div>
    `;
}

// Aguardar DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM carregado, mas inicialização já foi tentada');
    });
} else {
    console.log('📄 DOM já estava carregado');
}