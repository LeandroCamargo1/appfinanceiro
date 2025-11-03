/**
 * Serviço Firebase para Nós na Conta PRO
 * Gerencia autenticação e sincronização de dados
 */
export class FirebaseService {
    constructor() {
        this.auth = null;
        this.db = null;
        this.user = null;
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        this.listeners = [];
        
        this.setupNetworkListeners();
        this.initializeFirebase();
    }

    /**
     * Inicializa o Firebase
     */
    async initializeFirebase() {
        try {
            // Verifica se o Firebase está disponível
            if (typeof firebase === 'undefined') {
                console.warn('🔥 Firebase não carregado, funcionando offline');
                return false;
            }

            this.auth = firebase.auth();
            this.db = firebase.firestore();

            // Configura persistência offline
            await this.db.enablePersistence({
                synchronizeTabs: true
            }).catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('🔥 Persistência Firebase: múltiplas abas abertas');
                } else if (err.code === 'unimplemented') {
                    console.warn('🔥 Persistência Firebase: não suportada pelo navegador');
                }
            });

            // Configura listener de autenticação
            this.auth.onAuthStateChanged((user) => {
                this.user = user;
                this.notifyListeners('authStateChanged', user);
                
                if (user) {
                    console.log('✅ Usuário autenticado:', user.email);
                    this.processSyncQueue();
                } else {
                    console.log('🚪 Usuário deslogado');
                }
            });

            console.log('✅ Firebase inicializado com sucesso');
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar Firebase:', error);
            return false;
        }
    }

    /**
     * Configura listeners de rede
     */
    setupNetworkListeners() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Conexão restaurada');
            this.processSyncQueue();
            this.notifyListeners('networkStatusChanged', true);
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📵 Conexão perdida, modo offline');
            this.notifyListeners('networkStatusChanged', false);
        });
    }

    /**
     * Adiciona listener para eventos do Firebase
     */
    addListener(event, callback) {
        this.listeners.push({ event, callback });
    }

    /**
     * Remove listener
     */
    removeListener(event, callback) {
        this.listeners = this.listeners.filter(
            listener => !(listener.event === event && listener.callback === callback)
        );
    }

    /**
     * Notifica listeners
     */
    notifyListeners(event, data) {
        this.listeners
            .filter(listener => listener.event === event)
            .forEach(listener => {
                try {
                    listener.callback(data);
                } catch (error) {
                    console.error('❌ Erro em listener:', error);
                }
            });
    }

    /**
     * Autentica com Google
     */
    async signInWithGoogle() {
        try {
            if (!this.auth) {
                throw new Error('Firebase não inicializado');
            }

            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('email');
            provider.addScope('profile');

            const result = await this.auth.signInWithPopup(provider);
            
            console.log('✅ Login Google realizado:', result.user.email);
            return {
                success: true,
                user: result.user
            };
        } catch (error) {
            console.error('❌ Erro no login Google:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Autentica com email e senha
     */
    async signInWithEmail(email, password) {
        try {
            if (!this.auth) {
                throw new Error('Firebase não inicializado');
            }

            const result = await this.auth.signInWithEmailAndPassword(email, password);
            
            console.log('✅ Login email realizado:', result.user.email);
            return {
                success: true,
                user: result.user
            };
        } catch (error) {
            console.error('❌ Erro no login email:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    /**
     * Cria conta com email e senha
     */
    async createUserWithEmail(email, password, displayName) {
        try {
            if (!this.auth) {
                throw new Error('Firebase não inicializado');
            }

            const result = await this.auth.createUserWithEmailAndPassword(email, password);
            
            // Atualiza o perfil do usuário
            if (displayName) {
                await result.user.updateProfile({
                    displayName: displayName
                });
            }

            console.log('✅ Conta criada:', result.user.email);
            return {
                success: true,
                user: result.user
            };
        } catch (error) {
            console.error('❌ Erro ao criar conta:', error);
            return {
                success: false,
                error: this.getErrorMessage(error.code)
            };
        }
    }

    /**
     * Desloga o usuário
     */
    async signOut() {
        try {
            if (!this.auth) {
                throw new Error('Firebase não inicializado');
            }

            await this.auth.signOut();
            console.log('✅ Logout realizado');
            return { success: true };
        } catch (error) {
            console.error('❌ Erro no logout:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Salva dados do usuário no Firestore
     */
    async saveUserData(collection, data) {
        try {
            if (!this.user) {
                // Se não está autenticado, adiciona à fila de sincronização
                this.syncQueue.push({
                    type: 'save',
                    collection,
                    data,
                    timestamp: Date.now()
                });
                return { success: true, offline: true };
            }

            if (!this.db) {
                throw new Error('Firestore não inicializado');
            }

            const docRef = this.db
                .collection('users')
                .doc(this.user.uid)
                .collection(collection);

            if (data.id) {
                // Atualiza documento existente
                await docRef.doc(data.id).set(data, { merge: true });
            } else {
                // Cria novo documento
                const newDoc = await docRef.add({
                    ...data,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                data.id = newDoc.id;
            }

            console.log(`✅ Dados salvos no Firebase: ${collection}`);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Erro ao salvar no Firebase:', error);
            
            // Adiciona à fila de sincronização em caso de erro
            this.syncQueue.push({
                type: 'save',
                collection,
                data,
                timestamp: Date.now(),
                error: error.message
            });

            return {
                success: false,
                error: error.message,
                queued: true
            };
        }
    }

    /**
     * Carrega dados do usuário do Firestore
     */
    async loadUserData(collection) {
        try {
            if (!this.user || !this.db) {
                return { success: false, data: [] };
            }

            const snapshot = await this.db
                .collection('users')
                .doc(this.user.uid)
                .collection(collection)
                .orderBy('createdAt', 'desc')
                .get();

            const data = [];
            snapshot.forEach((doc) => {
                data.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            console.log(`✅ Dados carregados do Firebase: ${collection} (${data.length} items)`);
            return { success: true, data };
        } catch (error) {
            console.error('❌ Erro ao carregar do Firebase:', error);
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }

    /**
     * Remove dados do usuário do Firestore
     */
    async removeUserData(collection, id) {
        try {
            if (!this.user) {
                this.syncQueue.push({
                    type: 'remove',
                    collection,
                    id,
                    timestamp: Date.now()
                });
                return { success: true, offline: true };
            }

            if (!this.db) {
                throw new Error('Firestore não inicializado');
            }

            await this.db
                .collection('users')
                .doc(this.user.uid)
                .collection(collection)
                .doc(id)
                .delete();

            console.log(`✅ Dados removidos do Firebase: ${collection}/${id}`);
            return { success: true };
        } catch (error) {
            console.error('❌ Erro ao remover do Firebase:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Processa fila de sincronização
     */
    async processSyncQueue() {
        if (!this.user || !this.isOnline || this.syncQueue.length === 0) {
            return;
        }

        console.log(`🔄 Processando fila de sincronização (${this.syncQueue.length} items)`);

        const processedItems = [];
        
        for (const item of this.syncQueue) {
            try {
                switch (item.type) {
                    case 'save':
                        await this.saveUserData(item.collection, item.data);
                        break;
                    case 'remove':
                        await this.removeUserData(item.collection, item.id);
                        break;
                }
                processedItems.push(item);
            } catch (error) {
                console.error('❌ Erro ao processar item da fila:', error);
            }
        }

        // Remove itens processados da fila
        this.syncQueue = this.syncQueue.filter(item => !processedItems.includes(item));
        
        if (processedItems.length > 0) {
            console.log(`✅ Sincronizados ${processedItems.length} itens`);
            this.notifyListeners('syncCompleted', processedItems.length);
        }
    }

    /**
     * Converte códigos de erro do Firebase para mensagens amigáveis
     */
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'Usuário não encontrado',
            'auth/wrong-password': 'Senha incorreta',
            'auth/email-already-in-use': 'Este email já está em uso',
            'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres',
            'auth/invalid-email': 'Email inválido',
            'auth/user-disabled': 'Conta desabilitada',
            'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde',
            'auth/network-request-failed': 'Erro de conexão',
            'auth/popup-closed-by-user': 'Login cancelado pelo usuário',
            'auth/cancelled-popup-request': 'Popup de login cancelado'
        };

        return errorMessages[errorCode] || 'Erro desconhecido';
    }

    /**
     * Verifica se o usuário está autenticado
     */
    isAuthenticated() {
        return !!this.user;
    }

    /**
     * Obtém informações do usuário atual
     */
    getCurrentUser() {
        return this.user;
    }

    /**
     * Verifica se está online
     */
    isFirebaseOnline() {
        return this.isOnline && !!this.db;
    }

    /**
     * Obtém status da fila de sincronização
     */
    getSyncQueueStatus() {
        return {
            count: this.syncQueue.length,
            items: this.syncQueue.map(item => ({
                type: item.type,
                collection: item.collection,
                timestamp: item.timestamp
            }))
        };
    }
}