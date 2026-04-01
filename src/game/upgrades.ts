export const UPGRADE_DEFS = [
  { id: 'rate_1', icon: '⚔️', name: 'FANG SPEED', desc: 'Attack faster between strikes', maxLevel: 5, rarity: 'common', costs: [100, 250, 500, 900, 1500], value: 0.1 },
  { id: 'spd_1', icon: '💨', name: 'SWIFT LEGS', desc: 'Increased movement velocity', maxLevel: 5, rarity: 'common', costs: [100, 250, 500, 900, 1500], value: 20 },
  { id: 'hp_1', icon: '❤️', name: 'EXOSKELETON', desc: 'Reinforced chitin plating', maxLevel: 5, rarity: 'common', costs: [120, 280, 550, 950, 1600], value: 20 },
  { id: 'dmg_1', icon: '🦷', name: 'VENOM FANGS', desc: 'Deadlier mandible strikes', maxLevel: 5, rarity: 'rare', costs: [150, 300, 600, 1000, 1800], value: 10 },
  { id: 'cooldown_1', icon: '🔄', name: 'NEURAL HIVE', desc: 'Faster ability recharge', maxLevel: 4, rarity: 'rare', costs: [200, 450, 800, 1400], value: 0.1 },
  { id: 'heal_1', icon: '🌿', name: 'REGENERATION', desc: 'Heal 50 HP immediately', maxLevel: 3, rarity: 'rare', costs: [300, 700, 1500], value: 50 },
  { id: 'comboTime_1', icon: '🔥', name: 'FRENZY', desc: 'Combo timer decays slower', maxLevel: 3, rarity: 'common', costs: [200, 500, 1100], value: 0.5 },
  { id: 'range_1', icon: '📏', name: 'LONG REACH', desc: 'Extended attack range', maxLevel: 3, rarity: 'common', costs: [250, 600, 1200], value: 20 },
  { id: 'lifeSteal_1', icon: '🩸', name: 'HEMOLYMPH DRAIN', desc: 'Attacks heal you for a portion of damage', maxLevel: 3, rarity: 'rare', costs: [350, 800, 1600], value: 0.05 },
  { id: 'critChance_1', icon: '💥', name: 'WEAK POINT', desc: 'Chance to deal double damage on hit', maxLevel: 4, rarity: 'rare', costs: [300, 650, 1200, 2000], value: 0.05 },
  { id: 'thorns_1', icon: '🪡', name: 'THORN CARAPACE', desc: 'Enemies take damage when they hit you', maxLevel: 3, rarity: 'legendary', costs: [500, 1200, 2500], value: 5 },
  { id: 'multiStrike_1', icon: '⚡', name: 'SWARM STRIKE', desc: 'Attacks hit all nearby enemies in range', maxLevel: 2, rarity: 'legendary', costs: [800, 2000], value: 1 },
  { id: 'secondWind_1', icon: '🦋', name: 'SECOND WIND', desc: 'Revive once per run with 50% HP on death', maxLevel: 1, rarity: 'legendary', costs: [1500], value: 1 },
];

export const RARITY: Record<string, any> = {
  common: { label: 'COMMON', weight: 60, costMult: 1.0, effectMult: 1.0 },
  rare: { label: 'RARE', weight: 28, costMult: 1.4, effectMult: 1.5 },
  legendary: { label: 'LEGENDARY', weight: 12, costMult: 2.0, effectMult: 2.2 },
};

export const SYNERGY_DEFS = [
  { id: 'berserker', name: 'BERSERKER', icon: '🔥', tier: 'bronze', desc: '+20% attack speed & +15% damage', requires: { critChance: 1, comboTime: 1 } },
  { id: 'juggernaut', name: 'JUGGERNAUT', icon: '🛡️', tier: 'bronze', desc: '+30 max HP & +10% damage reduction', requires: { maxHp: 2, regen: 1 } },
  { id: 'phantom', name: 'PHANTOM', icon: '👻', tier: 'bronze', desc: '+25% move speed & longer combo window', requires: { movSpeed: 2, comboTime: 1 } },
  { id: 'venomLord', name: 'VENOM LORD', icon: '☠️', tier: 'silver', desc: 'Poison deals 2× damage & spreads on kill', requires: { damage: 2, lifeSteal: 1 } },
  { id: 'ironHide', name: 'IRON HIDE', icon: '🪨', tier: 'silver', desc: 'Thorns reflect 50% more & shield lasts 2s longer', requires: { thorns: 1, maxHp: 2 } },
  { id: 'bladeStorm', name: 'BLADE STORM', icon: '⚔️', tier: 'silver', desc: 'Multi-strike at full power & +20% crit chance', requires: { multiStrike: 1, critChance: 2 } },
  { id: 'apex', name: 'APEX PREDATOR', icon: '👑', tier: 'gold', desc: 'All stats +10%, abilities recharge 20% faster', requires: { atkSpeed: 3, damage: 2, movSpeed: 2 } },
  { id: 'undying', name: 'UNDYING SWARM', icon: '♾️', tier: 'gold', desc: 'Regen 3× faster, Second Wind heals to 80%', requires: { regen: 2, secondWind: 1 } },
];
