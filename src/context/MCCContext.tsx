import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { MCC } from '../types';
import { defaultMCCs } from '../data/mccCatalog';
import { lookupMCC, suggestMCC } from '../data/fullMCCReference';
import { offlineDB } from '../lib/offline';

interface MCCState {
  mccs: MCC[];
  addMCC: (code: string, description: string, base_risk_score: number) => void;
  findMCC: (code: string) => MCC | undefined;
  searchMCC: (query: string) => MCC[];
  removeMCC: (code: string) => void;
  synced: boolean;
  lookupFullCatalog: (code: string) => string | undefined;
  suggestFullCatalog: (query: string) => Array<{ code: string; description: string }>;
}

const MCCContext = createContext<MCCState | null>(null);

export function MCCProvider({ children }: { children: ReactNode }) {
  const [mccs, setMccs] = useState<MCC[]>(defaultMCCs);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    (async () => {
      const cached = await offlineDB.getMCCs();
      if (cached.length > 0) {
        setMccs(cached);
      } else {
        await offlineDB.saveMCCs(defaultMCCs);
      }

      try {
        const { db } = await import('../lib/supabase');
        const remote = await db.mcc.list();
        if (remote.length > 0) {
          setMccs(remote);
          await offlineDB.saveMCCs(remote);
        }
      } catch { /* offline */ }
      setSynced(true);
    })();
  }, []);

  const persist = useCallback(async (updated: MCC[]) => {
    await offlineDB.saveMCCs(updated);
    try {
      const { db } = await import('../lib/supabase');
      for (const mcc of updated) {
        await db.mcc.findByCode(mcc.code).then((existing: any) => {
          if (!existing) db.mcc.insert(mcc);
        });
      }
    } catch { /* offline */ }
  }, []);

  const addMCC = useCallback((code: string, description: string, base_risk_score: number) => {
    setMccs(prev => {
      if (prev.some(m => m.code === code)) return prev;
      const updated = [...prev, { code, description, base_risk_score }];
      persist(updated);
      return updated;
    });
  }, [persist]);

  const findMCC = useCallback((code: string) => {
    return mccs.find(m => m.code === code);
  }, [mccs]);

  const searchMCC = useCallback((query: string) => {
    const q = query.toLowerCase();
    return mccs.filter(m => m.code.includes(q) || m.description.toLowerCase().includes(q));
  }, [mccs]);

  const removeMCC = useCallback((code: string) => {
    setMccs(prev => {
      const updated = prev.filter(m => m.code !== code);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const lookupFullCatalog = useCallback((code: string) => {
    return lookupMCC(code);
  }, []);

  const suggestFromFullCatalog = useCallback((query: string) => {
    return suggestMCC(query);
  }, []);

  return (
    <MCCContext.Provider value={{ mccs, addMCC, findMCC, searchMCC, removeMCC, synced, lookupFullCatalog, suggestFullCatalog: suggestFromFullCatalog }}>
      {children}
    </MCCContext.Provider>
  );
}

export function useMCC() {
  const ctx = useContext(MCCContext);
  if (!ctx) throw new Error('useMCC must be used within MCCProvider');
  return ctx;
}
