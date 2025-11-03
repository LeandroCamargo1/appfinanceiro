/**
 * CacheManager - Gerenciador de cache
 * Versão inicial simplificada
 */

export class CacheManager {
    constructor() {
        this.cache = new Map();
        this.maxAge = 300000; // 5 minutos
    }

    set(key, value, ttl = this.maxAge) {
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            ttl
        });
    }

    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    clear() {
        this.cache.clear();
        console.log('🧹 Cache limpo');
    }
}