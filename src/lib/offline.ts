import { openDB, type IDBPDatabase } from 'idb';
import type { MCC, RuleConfig, MerchantMemoryRecord } from '../types';

const DB_NAME = 'perfx-offline';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('mcc_catalog')) {
          db.createObjectStore('mcc_catalog', { keyPath: 'code' });
        }
        if (!db.objectStoreNames.contains('transaction_rules')) {
          db.createObjectStore('transaction_rules', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('merchant_memory')) {
          db.createObjectStore('merchant_memory', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('pending_sync')) {
          db.createObjectStore('pending_sync', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
}

export const offlineDB = {
  async saveMCCs(mccs: MCC[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('mcc_catalog', 'readwrite');
    for (const mcc of mccs) {
      await tx.store.put(mcc);
    }
    await tx.done;
  },

  async getMCCs(): Promise<MCC[]> {
    const db = await getDB();
    return db.getAll('mcc_catalog');
  },

  async searchMCCs(query: string): Promise<MCC[]> {
    const all = await this.getMCCs();
    const q = query.toLowerCase();
    return all.filter(m => m.code.includes(q) || m.description.toLowerCase().includes(q));
  },

  async addMCC(mcc: MCC): Promise<void> {
    const db = await getDB();
    await db.put('mcc_catalog', mcc);
  },

  async saveRules(rules: RuleConfig[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('transaction_rules', 'readwrite');
    for (const rule of rules) {
      await tx.store.put(rule);
    }
    await tx.done;
  },

  async getRules(): Promise<RuleConfig[]> {
    const db = await getDB();
    return db.getAll('transaction_rules');
  },

  async addMemoryRecord(record: MerchantMemoryRecord): Promise<void> {
    const db = await getDB();
    await db.add('merchant_memory', record);
  },

  async addPendingSync(payload: unknown): Promise<void> {
    const db = await getDB();
    await db.add('pending_sync', { payload, timestamp: new Date().toISOString() });
  },

  async getPendingSync(): Promise<Array<{ id: number; payload: unknown }>> {
    const db = await getDB();
    return db.getAll('pending_sync');
  },

  async clearPendingSync(id: number): Promise<void> {
    const db = await getDB();
    await db.delete('pending_sync', id);
  },
};
