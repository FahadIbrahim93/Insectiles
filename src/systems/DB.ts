// ═══════════════════════════════════════════════════════════════════
// PERSISTENT STORAGE — localStorage wrapper with typed keys
// ═══════════════════════════════════════════════════════════════════

const KEY = {
  AMBER:    'i3_amber',
  HI:       'i3_hi',
  BEST_TIME:'i3_besttime',
  HIVE:     (id: string) => `i3_h_${id}`,
} as const;

export const DB = {
  getAmber():          number { return +(localStorage.getItem(KEY.AMBER)    ?? 0); },
  setAmber(v: number): void   { localStorage.setItem(KEY.AMBER, String(v)); },

  getHi():             number { return +(localStorage.getItem(KEY.HI)       ?? 0); },
  setHi(v: number):    void   { localStorage.setItem(KEY.HI, String(v)); },

  getBestTime():       number { return +(localStorage.getItem(KEY.BEST_TIME) ?? 0); },
  setBestTime(v: number): void { localStorage.setItem(KEY.BEST_TIME, String(v)); },

  getHiveLv(id: string):          number { return +(localStorage.getItem(KEY.HIVE(id)) ?? 0); },
  setHiveLv(id: string, v: number): void { localStorage.setItem(KEY.HIVE(id), String(v)); },
};
