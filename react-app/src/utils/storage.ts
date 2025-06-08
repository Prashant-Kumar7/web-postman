import type {  Collection, Environment, RequestHistory } from '../types/api';

const STORAGE_KEYS = {
  COLLECTIONS: 'api-client-collections',
  ENVIRONMENTS: 'api-client-environments',
  HISTORY: 'api-client-history',
  ACTIVE_ENVIRONMENT: 'api-client-active-env',
};

export class StorageService {
  static saveCollections(collections: Collection[]): void {
    localStorage.setItem(STORAGE_KEYS.COLLECTIONS, JSON.stringify(collections));
  }

  static loadCollections(): Collection[] {
    const data = localStorage.getItem(STORAGE_KEYS.COLLECTIONS);
    return data ? JSON.parse(data) : [];
  }

  static saveEnvironments(environments: Environment[]): void {
    localStorage.setItem(STORAGE_KEYS.ENVIRONMENTS, JSON.stringify(environments));
  }

  static loadEnvironments(): Environment[] {
    const data = localStorage.getItem(STORAGE_KEYS.ENVIRONMENTS);
    return data ? JSON.parse(data) : [];
  }

  static saveHistory(history: RequestHistory[]): void {
    // Keep only last 100 requests
    const limitedHistory = history.slice(-100);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(limitedHistory));
  }

  static loadHistory(): RequestHistory[] {
    const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return data ? JSON.parse(data) : [];
  }

  static saveActiveEnvironment(envId: string | null): void {
    if (envId) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ENVIRONMENT, envId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ENVIRONMENT);
    }
  }

  static loadActiveEnvironment(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ENVIRONMENT);
  }

  static exportData() {
    return {
      collections: this.loadCollections(),
      environments: this.loadEnvironments(),
      history: this.loadHistory(),
    };
  }

  static importData(data: any) {
    if (data.collections) {
      this.saveCollections(data.collections);
    }
    if (data.environments) {
      this.saveEnvironments(data.environments);
    }
    if (data.history) {
      this.saveHistory(data.history);
    }
  }
}