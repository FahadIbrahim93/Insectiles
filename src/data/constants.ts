// ═══════════════════════════════════════════════════════════════════
// INSECTILES: APEX SWARM — GAME DATA CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const WORLD_W = 3200;
export const WORLD_H = 3200;
export const PLAYER_R = 17;
export const COLL_R = 72;
export const GRID_CELL = 110;
export const BASE_CRIT = 0.12;
export const CRIT_MULT = 2.2;
export const XP_TABLE = [0,24,58,105,168,250,355,485,645,840,1080,1370,1720,2140,2640,3240,3960,4820,5850,7100];

// ─── Difficulty ────────────────────────────────────────────────────
export interface DifficultyDef {
  id: string; name: string; icon: string; col: string;
  hpMult: number; dmgMult: number; xpMult: number; amberMult: number; desc: string;
}
export const DIFFS: DifficultyDef[] = [
  { id:'normal',    name:'NORMAL',    icon:'🌿', col:'#00ff88', hpMult:1,   dmgMult:1,   xpMult:1,   amberMult:1,   desc:'Standard experience' },
  { id:'hard',      name:'HARD',      icon:'🔥', col:'#ffaa00', hpMult:1.3, dmgMult:1.4, xpMult:1.2, amberMult:1.8, desc:'+30% enemy HP, +40% DMG' },
  { id:'nightmare', name:'NIGHTMARE', icon:'💀', col:'#ff2222', hpMult:1.7, dmgMult:2,   xpMult:1.5, amberMult:3.5, desc:'For the truly deranged' },
];

// ─── Player Classes ────────────────────────────────────────────────
export interface ClassDef {
  name: string; role: string; icon: string; col: string; glow: string;
  hp: number; spd: number; dmg: number; as: number; range: number;
  ranged: boolean; abilName: string; abilCd: number; desc: string;
  projCol: string | null; projR: number;
}
export const CLASSES: Record<string, ClassDef> = {
  mantis: { name:'Mantis',    role:'Assassin',  icon:'🦗', col:'#00ff88', glow:'0,255,136',   hp:80,  spd:208, dmg:18, as:2.6, range:92,  ranged:false, abilName:'LIGHTNING STING',  abilCd:5, desc:'Speed demon. Devastating burst melee.',   projCol:null,       projR:5 },
  scarab: { name:'Scarab',    role:'Tank',       icon:'🪲', col:'#ffd700', glow:'255,215,0',   hp:230, spd:96,  dmg:25, as:.88, range:85,  ranged:false, abilName:'CHITIN SHIELD',    abilCd:8, desc:'Fortress class. Maximum durability.',    projCol:null,       projR:5 },
  widow:  { name:'Blk Widow', role:'Controller', icon:'🕷', col:'#ff0066', glow:'255,0,102',   hp:90,  spd:144, dmg:12, as:1.55,range:300, ranged:true,  abilName:'VENOM BURST',      abilCd:6, desc:'Poison mistress. AoE devastation.',      projCol:'#ff0066',  projR:5 },
  wasp:   { name:'Wasp',      role:'Skirmisher', icon:'🐝', col:'#ffaa00', glow:'255,170,0',   hp:68,  spd:232, dmg:8,  as:3.3, range:240, ranged:true,  abilName:'STINGER BARRAGE',  abilCd:4, desc:'Rapid fire. Extreme mobility.',          projCol:'#ffaa00',  projR:4 },
  moth:   { name:'Moth',      role:'Mage',       icon:'🦋', col:'#aa88ff', glow:'170,136,255', hp:74,  spd:152, dmg:9,  as:.78, range:360, ranged:true,  abilName:'DUST CLOUD',       abilCd:5, desc:'AoE mage. Slows entire swarms.',         projCol:'#cc88ff',  projR:10 },
};

// ─── Enemy Types ───────────────────────────────────────────────────
export interface EnemyTypeDef {
  col: string; r: number; hp: number; spd: number; dmg: number;
  xp: number; sc: number; elite: boolean; ranged: boolean;
}
export const ETYPES: Record<string, EnemyTypeDef> = {
  ant:     { col:'#cc2200', r:10, hp:12,  spd:90,  dmg:5,  xp:2,  sc:8,  elite:false, ranged:false },
  beetle:  { col:'#994400', r:14, hp:24,  spd:60,  dmg:9,  xp:3,  sc:11, elite:false, ranged:false },
  soldier: { col:'#aa0000', r:18, hp:68,  spd:70,  dmg:16, xp:9,  sc:28, elite:true,  ranged:false },
  hornet:  { col:'#ffaa00', r:12, hp:40,  spd:138, dmg:13, xp:7,  sc:22, elite:true,  ranged:false },
  spitter: { col:'#00cc44', r:15, hp:50,  spd:50,  dmg:11, xp:8,  sc:24, elite:true,  ranged:true  },
  shaman:  { col:'#cc00ff', r:15, hp:58,  spd:52,  dmg:8,  xp:11, sc:32, elite:true,  ranged:false },
  phantom: { col:'#4488ff', r:13, hp:35,  spd:115, dmg:14, xp:12, sc:38, elite:true,  ranged:false },
};

// ─── Boss Definitions ──────────────────────────────────────────────
export interface BossPhase { pct: number; label: string; sr: number; spd?: number; }
export interface BossDef {
  id: string; name: string; wave: number; col: string;
  hp: number; spd: number; dmg: number; r: number; xp: number; sc: number;
  phases: BossPhase[];
}
export const BOSSES: BossDef[] = [
  { id:'hiveMother', name:'HIVE MOTHER', wave:5, col:'#ff2222', hp:2400, spd:58, dmg:22, r:42, xp:180, sc:800,
    phases:[{pct:1,label:'Phase I — Charging',sr:1.8},{pct:.6,label:'Phase II — Enraged',sr:.8,spd:1.4},{pct:.3,label:'Phase III — FRENZY',sr:.4,spd:1.8}] },
  { id:'voidQueen',  name:'VOID QUEEN',  wave:10,col:'#aa00ff', hp:5500, spd:68, dmg:32, r:52, xp:380, sc:2200,
    phases:[{pct:1,label:'Phase I — Invocation',sr:1.5},{pct:.5,label:'Phase II — Corruption',sr:.65,spd:1.5},{pct:.25,label:'Phase III — OBLITERATION',sr:.3,spd:2.1}] },
];

// ─── Upgrades ──────────────────────────────────────────────────────
export interface UpgradeDef {
  id: string; name: string; icon: string; maxLv: number;
  syn: string | null; desc: (lv: number) => string;
  apply: (p: PlayerStats) => void;
}
export const UPGRADES: UpgradeDef[] = [
  { id:'dmg',    name:'Venom Fang',      icon:'⚔️', maxLv:5, syn:'venomLord',  desc:l=>`+${l*20}% Damage`,          apply:p=>{p.dmgMult+=.2} },
  { id:'as',     name:'Frenzy Glands',   icon:'⚡', maxLv:5, syn:'bladeStorm', desc:l=>`+${l*15}% Attack Speed`,     apply:p=>{p.asMult+=.15} },
  { id:'spd',    name:'Fleet Carapace',  icon:'💨', maxLv:5, syn:null,          desc:l=>`+${l*15}% Move Speed`,       apply:p=>{p.spdMult+=.15} },
  { id:'hp',     name:'Iron Chitin',     icon:'🛡', maxLv:5, syn:'ironHide',   desc:l=>`+${l*35} Max HP`,            apply:p=>{p.bonusHp+=35} },
  { id:'cd',     name:'Neural Accel',    icon:'⚗️', maxLv:5, syn:'venomLord',  desc:l=>`-${l*18}% Cooldowns`,        apply:p=>{p.cdMult=Math.max(.12,p.cdMult-.18)} },
  { id:'ls',     name:'Hemolymph Drain', icon:'🩸', maxLv:3, syn:'apexPred',   desc:l=>`+${l*6}% Lifesteal`,         apply:p=>{p.lifesteal+=.06} },
  { id:'thorn',  name:'Spike Mantle',    icon:'🌵', maxLv:3, syn:'ironHide',   desc:l=>`Reflect ${l*15}% dmg`,       apply:p=>{p.thorns+=.15} },
  { id:'multi',  name:'Compound Strike', icon:'✦',  maxLv:3, syn:'bladeStorm', desc:l=>`+${l} extra hit(s)`,         apply:p=>{p.multiStrike+=1} },
  { id:'poison', name:'Toxic Glands',    icon:'☠️', maxLv:3, syn:'venomLord',  desc:l=>`Poison ${l*2}/s on hit`,     apply:p=>{p.poisonDps+=2} },
  { id:'revive', name:'Resurrection',    icon:'✨', maxLv:1, syn:null,          desc:()=>'Revive once at 50% HP',     apply:p=>{p.revive=true} },
  { id:'crit',   name:'Predator Eyes',   icon:'👁', maxLv:3, syn:'apexPred',   desc:l=>`+${l*12}% Crit Chance`,      apply:p=>{p.critChance+=.12} },
  { id:'aoe',    name:'Shockwave Plate', icon:'💥', maxLv:3, syn:null,          desc:l=>`Melee AoE +${l*18}`,         apply:p=>{p.aoeRadius+=18} },
  { id:'magnet', name:'Gem Magnet',      icon:'🧲', maxLv:3, syn:null,          desc:l=>`Gem range +${l*35}`,         apply:p=>{p.gemMagnet+=35} },
  { id:'regen',  name:'Bio Regen',       icon:'💚', maxLv:3, syn:null,          desc:l=>`Regen ${Math.floor(l*1.5)} HP/s`, apply:p=>{p.regen+=1.5} },
];

// ─── Synergies ─────────────────────────────────────────────────────
export interface SynergyDef {
  id: string; name: string; icon: string; col: string;
  req: Record<string, number>; desc: string;
}
export const SYNERGIES: SynergyDef[] = [
  { id:'venomLord',  name:'VENOM LORD',    icon:'☣️', col:'#00ff88', req:{dmg:5,poison:3}, desc:'Kills explode into poison clouds' },
  { id:'bladeStorm', name:'BLADE STORM',   icon:'🌪️', col:'#ffaa00', req:{as:5,multi:3},   desc:'Permanent orbiting blade aura' },
  { id:'apexPred',   name:'APEX PREDATOR', icon:'👑', col:'#ff0066', req:{dmg:5,ls:3},     desc:'Elite kills restore 15% max HP' },
  { id:'ironHide',   name:'IRON HIDE',     icon:'⚙️', col:'#ffd700', req:{hp:5,thorn:3},   desc:'55% less damage + thorns amplified' },
];

// ─── Hive Meta-Upgrades ────────────────────────────────────────────
export interface HiveUpgradeDef {
  id: string; name: string; icon: string; maxLv: number;
  cost: (lv: number) => number; desc: (lv: number) => string;
}
export const HIVE_UPGRADES: HiveUpgradeDef[] = [
  { id:'h_hp',    name:'Hive Vitality',   icon:'❤️', maxLv:5, cost:lv=>[40,90,160,260,400][lv]!,  desc:lv=>`+${[10,20,30,40,50][lv]} base HP` },
  { id:'h_dmg',   name:'Royal Venom',     icon:'☠️', maxLv:5, cost:lv=>[50,110,180,280,450][lv]!, desc:lv=>`+${[5,10,15,20,25][lv]}% base DMG` },
  { id:'h_spd',   name:'Scout Training',  icon:'💨', maxLv:5, cost:lv=>[35,80,140,220,350][lv]!,  desc:lv=>`+${[4,8,12,16,20][lv]}% base Speed` },
  { id:'h_crit',  name:'Hunter Instinct', icon:'👁', maxLv:3, cost:lv=>[80,180,350][lv]!,          desc:lv=>`+${[4,8,12][lv]}% base Crit` },
  { id:'h_start', name:'Hive Resources',  icon:'💎', maxLv:3, cost:lv=>[120,250,500][lv]!,         desc:lv=>`Start with ${[1,2,3][lv]} free upgrades` },
  { id:'h_xp',    name:'Royal Jelly',     icon:'⭐', maxLv:3, cost:lv=>[60,140,280][lv]!,          desc:lv=>`+${[15,30,45][lv]}% XP gain` },
];

// ─── Player Stats (mutable runtime state) ─────────────────────────
export interface PlayerStats {
  dmgMult: number; asMult: number; spdMult: number; cdMult: number;
  bonusHp: number; lifesteal: number; thorns: number; multiStrike: number;
  poisonDps: number; revive: boolean; reviveUsed: boolean; critChance: number;
  aoeRadius: number; gemMagnet: number; regen: number; xpMult: number;
}
export function defaultPlayerStats(hive: { hp:number; dmg:number; spd:number; crit:number; xp:number }): PlayerStats {
  return {
    dmgMult:   1 + hive.dmg * 0.05,
    asMult:    1,
    spdMult:   1 + hive.spd * 0.04,
    cdMult:    1,
    bonusHp:   hive.hp * 10,
    lifesteal: 0,
    thorns:    0,
    multiStrike: 0,
    poisonDps: 0,
    revive:    false,
    reviveUsed:false,
    critChance:BASE_CRIT + hive.crit * 0.04,
    aoeRadius: 0,
    gemMagnet: 0,
    regen:     0,
    xpMult:    1 + hive.xp * 0.15,
  };
}

// ─── Chest Rewards ─────────────────────────────────────────────────
export interface ChestReward { name: string; }
export const CHEST_REWARDS: ChestReward[] = [
  { name:'HEALTH SURGE'  },
  { name:'SHIELD SURGE'  },
  { name:'DAMAGE BOOST'  },
  { name:'SPEED RUSH'    },
  { name:'XP SURGE'      },
  { name:'FRENZY CHARGE' },
];
