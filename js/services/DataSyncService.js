/**
 * DataSyncService - Serviço de sincronização de dados
 * Versão inicial simplificada
 */

export class DataSyncService {
    constructor() {
        this.isActive = false;
        this.syncInterval = null;
    }

    startSync() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('🔄 Sincronização iniciada (mock)');
        
        // Mock - não faz nada por enquanto
        this.syncInterval = setInterval(() => {
            console.log('🔄 Sync tick...');
        }, 30000);
    }

    stopSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
        
        this.isActive = false;
        console.log('⏹️ Sincronização parada');
    }
}