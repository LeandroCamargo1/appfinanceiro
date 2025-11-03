// Firebase Configuration - Modo Demonstração
// Este arquivo contém uma configuração de teste para GitHub Pages
// Para usar em produção com dados reais, copie firebase-config.example.js e adicione suas credenciais

const firebaseConfig = {
    apiKey: "AIzaSyDEMO1234567890",
    authDomain: "demo.firebaseapp.com",
    projectId: "demo-project",
    storageBucket: "demo-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123"
};

// Inicializar Firebase
try {
    if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase carregado (modo demonstração)');
    }
} catch (error) {
    console.warn('⚠️ Firebase não disponível - app em modo offline');
}

// Fallback se Firebase não estiver disponível
if (typeof firebase === 'undefined') {
    window.firebase = {
        auth: () => ({}),
        firestore: () => ({})
    };
}
