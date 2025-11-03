// ⚠️ IMPORTANTE: Este é um arquivo de EXEMPLO
// Para usar este projeto, você precisa:
// 1. Criar um projeto no Firebase Console (https://console.firebase.google.com)
// 2. Copiar este arquivo para firebase-config.js
// 3. Adicionar suas credenciais do Firebase

// Seu objeto de configuração do Firebase
// Obtenha esses valores em: Firebase Console > Project Settings > SDK setup and configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto-id",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "seu-messaging-sender-id",
    appId: "seu-app-id"
};

// Inicializar Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase inicializado com sucesso!');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    console.warn('⚠️ O app funcionará em modo offline. Para sincronização, configure o Firebase.');
}

// Exportar instâncias para uso no app
const db = firebase.firestore();
const auth = firebase.auth();

// Configurações opcionais do Firestore
if (db) {
    db.settings({
        cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
    });
}
