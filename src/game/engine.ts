import { initAudio, sfxAttack, sfxKill, sfxHit, sfxAbility } from './audio';
import { player, HERO_CLASSES } from './player';
import { enemies, ENEMY_TYPES, setEnemies } from './enemies';
import { particles, spawnParticles } from './particles';
import { InsectRenderer } from './renderer';
import { UPGRADE_DEFS, RARITY, SYNERGY_DEFS } from './upgrades';
import { WORLD_SIZE, TAU, lerp, clamp, dist, angle, rand, randInt, seededRand, hsl, rgb } from './utils';

// Game State
let isPlaying = false;
let gameTime = 0;
let lastTime = 0;
let score = 0;
let wave = 1;
let enemiesKilled = 0;
let ctx: CanvasRenderingContext2D | null = null;
let minimapCtx: CanvasRenderingContext2D | null = null;
let canvasWidth = 0;
let canvasHeight = 0;
let projectiles: any[] = [];
let gems: any[] = [];
let damageNumbers: any[] = [];

// Input State
const keys: { [key: string]: boolean } = {};
let mouseX = 0;
let mouseY = 0;
let isMouseDown = false;

// Callbacks to React
let onGameOver: (score: number, wave: number) => void;
let onScoreUpdate: (score: number) => void;
let onLevelUp: () => void;
let onWaveUpdate: (wave: number) => void;

export function getPlayerState() {
  return {
    hp: player.hp,
    maxHp: player.maxHp,
    xp: player.xp,
    maxXp: player.maxXp,
    level: player.level,
    upgradePoints: 0, // Placeholder for now
    abilities: player.abilities
  };
}

export function initGame(
  canvas: HTMLCanvasElement, 
  minimap: HTMLCanvasElement,
  onGameOverCb: (score: number, wave: number) => void,
  onScoreUpdateCb: (score: number) => void,
  onLevelUpCb: () => void,
  onWaveUpdateCb: (wave: number) => void
) {
  ctx = canvas.getContext('2d');
  minimapCtx = minimap.getContext('2d');
  onGameOver = onGameOverCb;
  onScoreUpdate = onScoreUpdateCb;
  onLevelUp = onLevelUpCb;
  onWaveUpdate = onWaveUpdateCb;

  // Setup Canvas
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;
  };
  window.addEventListener('resize', resize);
  resize();

  // Input Listeners
  window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
  window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
  canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  canvas.addEventListener('mousedown', () => isMouseDown = true);
  canvas.addEventListener('mouseup', () => isMouseDown = false);

  // Start Loop
  requestAnimationFrame(gameLoop);
}

export function startGame(heroClass: any) {
  isPlaying = true;
  gameTime = 0;
  score = 0;
  wave = 1;
  enemiesKilled = 0;
  setEnemies([]);
  projectiles = [];
  gems = [];
  damageNumbers = [];
  
  // Reset Player
  player.x = WORLD_SIZE / 2;
  player.y = WORLD_SIZE / 2;
  player.hp = heroClass.stats.health * 100;
  player.maxHp = heroClass.stats.health * 100;
  player.health = player.hp;
  player.maxHealth = player.maxHp;
  player.heroClass = heroClass;
  player.attackDamage = heroClass.stats.damage * 25;
  player.attackRate = heroClass.stats.attackRate * 0.25;
  player.attackRange = heroClass.stats.range * 80;
  player.speed = heroClass.stats.speed * 220;
  player.xp = 0;
  player.maxXp = 100;
  player.level = 1;
  player.attackCooldown = 0;
  
  initAudio();
}

export function resumeGame() {
  isPlaying = true;
}

function gameLoop(timestamp: number) {
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (isPlaying && ctx) {
    update(dt);
    draw(ctx);
  }

  requestAnimationFrame(gameLoop);
}

let isAutoAttack = false;

export function setAutoAttack(val: boolean) {
  isAutoAttack = val;
}

function update(dt: number) {
  gameTime += dt;
  
  // Basic Player Movement
  let dx = 0;
  let dy = 0;
  if (keys['w'] || keys['arrowup']) dy -= 1;
  if (keys['s'] || keys['arrowdown']) dy += 1;
  if (keys['a'] || keys['arrowleft']) dx -= 1;
  if (keys['d'] || keys['arrowright']) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    player.x += (dx / len) * player.speed * dt;
    player.y += (dy / len) * player.speed * dt;
    player.x = clamp(player.x, 0, WORLD_SIZE);
    player.y = clamp(player.y, 0, WORLD_SIZE);
  }

  // Player Attack
  player.attackCooldown -= dt;
  if ((isMouseDown || isAutoAttack) && player.attackCooldown <= 0) {
    player.attackCooldown = player.attackRate;
    let targetAngle = angle(player.x, player.y, mouseX + player.x - canvasWidth/2, mouseY + player.y - canvasHeight/2);
    
    // Auto-attack logic
    if (isAutoAttack && enemies.length > 0) {
      const target = enemies.reduce((prev, curr) => dist(player.x, player.y, prev.x, prev.y) < dist(player.x, player.y, curr.x, curr.y) ? prev : curr);
      targetAngle = angle(player.x, player.y, target.x, target.y);
    }
    
    // Simple melee/ranged attack logic
    sfxAttack();
    
    if (player.heroClass.id === 'wasp' || player.heroClass.id === 'moth') {
      // Ranged attack
      projectiles.push({
        x: player.x,
        y: player.y,
        angle: targetAngle,
        speed: 500,
        damage: player.attackDamage,
        life: 2,
        size: 4,
        color: player.heroClass.color,
        pierce: false
      });
      spawnParticles(player.x + Math.cos(targetAngle) * 20, player.y + Math.sin(targetAngle) * 20, 5, { color: player.heroClass.color, speed: 2, life: 0.2 });
    } else {
      // Melee attack
      spawnParticles(player.x + Math.cos(targetAngle) * 20, player.y + Math.sin(targetAngle) * 20, 5, { color: '#fff', speed: 2, life: 0.2 });
      
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        const d = dist(player.x, player.y, e.x, e.y);
        if (d < player.attackRange) {
          // Check angle
          const angleToEnemy = angle(player.x, player.y, e.x, e.y);
          let angleDiff = Math.abs(targetAngle - angleToEnemy);
          if (angleDiff > Math.PI) angleDiff = TAU - angleDiff;
          
          if (angleDiff < Math.PI / 4) { // 90 degree cone
            e.hp -= player.attackDamage;
            sfxHit();
            spawnParticles(e.x, e.y, 10, { color: e.type.color, speed: 3 });
            damageNumbers.push({ x: e.x, y: e.y, val: Math.floor(player.attackDamage), life: 1 });
            
            if (e.hp <= 0) {
              sfxKill();
              score += e.type.score;
              onScoreUpdate(score);
              enemiesKilled++;
              spawnParticles(e.x, e.y, 20, { color: e.type.color, speed: 5 });
              
              // Drop Gem
              gems.push({ x: e.x, y: e.y, xp: e.type.score, color: e.type.gemColor });
              
              enemies.splice(i, 1);
            }
          }
        }
      }
    }
  }

  // Player Abilities
  for (const ab of player.abilities) {
    if (ab.cooldown > 0) ab.cooldown -= dt;
  }

  if (keys['q'] && player.abilities[0].cooldown <= 0) {
    // Venom Burst (Widow)
    if (player.heroClass.id === 'widow') {
      sfxAbility();
      player.abilities[0].cooldown = player.abilities[0].maxCooldown;
      spawnParticles(player.x, player.y, 30, { color: '#0f0', speed: 5, life: 1 });
      for (const e of enemies) {
        if (dist(player.x, player.y, e.x, e.y) < 150) {
          e.hp -= 50;
          damageNumbers.push({ x: e.x, y: e.y, val: 50, life: 1 });
        }
      }
    }
    keys['q'] = false; // Prevent holding
  }
  if (keys['w'] && player.abilities[1].cooldown <= 0) {
    // Lightning Sting (Mantis)
    if (player.heroClass.id === 'mantis') {
      sfxAbility();
      player.abilities[1].cooldown = player.abilities[1].maxCooldown;
      spawnParticles(player.x, player.y, 20, { color: '#ff0', speed: 8, life: 0.5 });
      if (enemies.length > 0) {
        const target = enemies.reduce((prev, curr) => dist(player.x, player.y, prev.x, prev.y) < dist(player.x, player.y, curr.x, curr.y) ? prev : curr);
        if (dist(player.x, player.y, target.x, target.y) < 300) {
          target.hp -= 100;
          damageNumbers.push({ x: target.x, y: target.y, val: 100, life: 1 });
          // Draw lightning bolt (handled in draw loop ideally, but this is a quick hack)
          ctx!.strokeStyle = '#ff0';
          ctx!.lineWidth = 3;
          ctx!.beginPath();
          ctx!.moveTo(player.x, player.y);
          ctx!.lineTo(target.x, target.y);
          ctx!.stroke();
        }
      }
    }
    keys['w'] = false;
  }
  if (keys['e'] && player.abilities[2].cooldown <= 0) {
    // Chitin Shield (Scarab)
    if (player.heroClass.id === 'scarab') {
      sfxAbility();
      player.abilities[2].cooldown = player.abilities[2].maxCooldown;
      player.hp = Math.min(player.maxHp, player.hp + 50);
      spawnParticles(player.x, player.y, 20, { color: '#888', speed: 2, life: 1, shape: 'ring' });
    }
    keys['e'] = false;
  }
  if (keys['r'] && player.abilities[3].cooldown <= 0) {
    // Death Swarm (All classes for now)
    sfxAbility();
    player.abilities[3].cooldown = player.abilities[3].maxCooldown;
    spawnParticles(player.x, player.y, 50, { color: '#f00', speed: 6, life: 2 });
    for (const e of enemies) {
      if (dist(player.x, player.y, e.x, e.y) < 200) {
        e.hp -= 80;
        damageNumbers.push({ x: e.x, y: e.y, val: 80, life: 1 });
      }
    }
    keys['r'] = false;
  }

  // Basic Enemy Spawning
  if (Math.random() < 0.05 * wave && enemies.length < 50 + wave * 10) {
    const spawnAngle = Math.random() * TAU;
    const spawnDist = Math.max(canvasWidth, canvasHeight) / 2 + 100;
    
    // Choose enemy type based on wave
    let type = ENEMY_TYPES.beetle;
    if (wave > 2 && Math.random() < 0.3) type = ENEMY_TYPES.hornet;
    if (wave > 4 && Math.random() < 0.2) type = ENEMY_TYPES.spider;
    if (wave > 6 && Math.random() < 0.1) type = ENEMY_TYPES.centipede;
    
    enemies.push({
      x: player.x + Math.cos(spawnAngle) * spawnDist,
      y: player.y + Math.sin(spawnAngle) * spawnDist,
      hp: type.health * (1 + wave * 0.2),
      maxHp: type.health * (1 + wave * 0.2),
      type: type,
      vx: 0,
      vy: 0,
      animPhase: Math.random() * TAU,
      state: 'chase',
      stateTimer: 0,
      id: Math.random().toString()
    });
  }

  // Wave progression logic
  if (enemiesKilled >= wave * 20) {
    wave++;
    enemiesKilled = 0;
    onWaveUpdate(wave);
    // Spawn Boss every 5 waves
    if (wave % 5 === 0) {
      const spawnAngle = Math.random() * TAU;
      const spawnDist = Math.max(canvasWidth, canvasHeight) / 2 + 100;
      enemies.push({
        x: player.x + Math.cos(spawnAngle) * spawnDist,
        y: player.y + Math.sin(spawnAngle) * spawnDist,
        hp: ENEMY_TYPES.mantis.health * (1 + wave * 0.5),
        maxHp: ENEMY_TYPES.mantis.health * (1 + wave * 0.5),
        type: ENEMY_TYPES.mantis,
        vx: 0,
        vy: 0,
        animPhase: Math.random() * TAU,
        state: 'chase',
        stateTimer: 0,
        id: Math.random().toString()
      });
    }
  }

  // Update Enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    const d = dist(e.x, e.y, player.x, player.y);
    const a = angle(e.x, e.y, player.x, player.y);

    e.stateTimer -= dt;

    if (e.type.id === 'hornet') {
      if (d > 300) {
        e.x += Math.cos(a) * e.type.speed * dt;
        e.y += Math.sin(a) * e.type.speed * dt;
      } else if (e.stateTimer <= 0) {
        // Ranged attack
        e.stateTimer = 2; // Cooldown
        projectiles.push({
          x: e.x,
          y: e.y,
          angle: a,
          speed: 300,
          damage: e.type.damage,
          life: 2,
          size: 4,
          color: e.type.color,
          pierce: false,
          isEnemy: true
        });
      }
    } else {
      // Melee chase
      e.x += Math.cos(a) * e.type.speed * dt;
      e.y += Math.sin(a) * e.type.speed * dt;
    }

    if (d < 20) {
      player.hp -= e.type.damage * dt;
      if (player.hp <= 0) {
        isPlaying = false;
        onGameOver(score, wave);
      }
    }
  }

  // Update Projectiles
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    p.x += Math.cos(p.angle) * p.speed * dt;
    p.y += Math.sin(p.angle) * p.speed * dt;
    p.life -= dt;
    
    let hit = false;

    if (p.isEnemy) {
      // Check collision with player
      if (dist(p.x, p.y, player.x, player.y) < player.size + p.size) {
        player.hp -= p.damage;
        sfxHit();
        spawnParticles(player.x, player.y, 5, { color: p.color, speed: 2 });
        damageNumbers.push({ x: player.x, y: player.y, val: Math.floor(p.damage), life: 1 });
        hit = true;
        if (player.hp <= 0) {
          isPlaying = false;
          onGameOver(score, wave);
        }
      }
    } else {
      // Check collision with enemies
      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        if (dist(p.x, p.y, e.x, e.y) < e.type.size + p.size) {
          e.hp -= p.damage;
          sfxHit();
          spawnParticles(e.x, e.y, 5, { color: e.type.color, speed: 2 });
          damageNumbers.push({ x: e.x, y: e.y, val: Math.floor(p.damage), life: 1 });
          
          if (e.hp <= 0) {
            sfxKill();
            score += e.type.score;
            onScoreUpdate(score);
            enemiesKilled++;
            spawnParticles(e.x, e.y, 20, { color: e.type.color, speed: 5 });
            gems.push({ x: e.x, y: e.y, xp: e.type.score, color: e.type.gemColor });
            enemies.splice(j, 1);
          }
          hit = true;
          if (!p.pierce) break;
        }
      }
    }
    
    if (hit && !p.pierce) {
      projectiles.splice(i, 1);
    } else if (p.life <= 0) {
      projectiles.splice(i, 1);
    }
  }

  // Update Gems
  for (let i = gems.length - 1; i >= 0; i--) {
    const g = gems[i];
    const d = dist(g.x, g.y, player.x, player.y);
    if (d < 100) { // Pickup radius
      const a = angle(g.x, g.y, player.x, player.y);
      g.x += Math.cos(a) * 400 * dt;
      g.y += Math.sin(a) * 400 * dt;
      if (d < 20) {
        player.xp += g.xp;
        gems.splice(i, 1);
        if (player.xp >= player.maxXp) {
          player.level++;
          player.xp -= player.maxXp;
          player.maxXp *= 1.5;
          isPlaying = false;
          onLevelUp();
        }
      }
    }
  }

  // Update Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    if (!particles[i].update(dt, gameTime)) {
      particles.splice(i, 1);
    }
  }

  // Update Damage Numbers
  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const dn = damageNumbers[i];
    dn.y -= 50 * dt;
    dn.life -= dt;
    if (dn.life <= 0) damageNumbers.splice(i, 1);
  }
}

function draw(ctx: CanvasRenderingContext2D) {
  // Camera logic (centered on player)
  const camX = player.x - canvasWidth / 2;
  const camY = player.y - canvasHeight / 2;

  // Clear screen
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  // Camera transform
  ctx.translate(-camX, -camY);

  // Draw Grid
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 1;
  const gridSize = 100;
  const startX = Math.floor(camX / gridSize) * gridSize;
  const startY = Math.floor(camY / gridSize) * gridSize;
  
  ctx.beginPath();
  for (let x = startX; x < startX + canvasWidth + gridSize; x += gridSize) {
    ctx.moveTo(x, camY);
    ctx.lineTo(x, camY + canvasHeight);
  }
  for (let y = startY; y < startY + canvasHeight + gridSize; y += gridSize) {
    ctx.moveTo(camX, y);
    ctx.lineTo(camX + canvasWidth, y);
  }
  ctx.stroke();

  // Draw Gems
  for (const g of gems) {
    ctx.fillStyle = g.color;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 4, 0, TAU);
    ctx.fill();
    ctx.shadowColor = g.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Draw Enemies
  for (const e of enemies) {
    InsectRenderer.drawBeetle(ctx, e.x, e.y, e.type.size, angle(e.x, e.y, player.x, player.y), e.animPhase, e.hp, e.maxHp, e.type.rendType, camX, camY, canvasWidth, canvasHeight);
  }

  // Draw Projectiles
  for (const p of projectiles) {
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, TAU);
    ctx.fill();
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  // Draw Particles
  for (const p of particles) {
    p.draw(ctx, camX, camY);
  }

  // Draw Player
  let playerAngle = angle(player.x, player.y, mouseX + camX, mouseY + camY);
  if (isAutoAttack && enemies.length > 0) {
    const target = enemies.reduce((prev, curr) => dist(player.x, player.y, prev.x, prev.y) < dist(player.x, player.y, curr.x, curr.y) ? prev : curr);
    playerAngle = angle(player.x, player.y, target.x, target.y);
  }
  InsectRenderer.drawBeetle(ctx, player.x, player.y, 15, playerAngle, gameTime * 10, player.hp, player.maxHp, 'basic', camX, camY, canvasWidth, canvasHeight);

  // Draw Damage Numbers
  ctx.font = '14px "Rajdhani", sans-serif';
  ctx.textAlign = 'center';
  for (const dn of damageNumbers) {
    ctx.fillStyle = `rgba(255, 255, 255, ${dn.life})`;
    ctx.fillText(dn.val.toString(), dn.x, dn.y);
  }

  ctx.restore();

  // Draw Minimap
  if (minimapCtx) {
    minimapCtx.fillStyle = '#111';
    minimapCtx.fillRect(0, 0, 140, 140);
    
    const scale = 140 / WORLD_SIZE;
    
    // Draw enemies on minimap
    for (const e of enemies) {
      minimapCtx.fillStyle = e.type.color;
      minimapCtx.fillRect(e.x * scale, e.y * scale, 2, 2);
    }
    
    // Draw player on minimap
    minimapCtx.fillStyle = '#fff';
    minimapCtx.fillRect(player.x * scale, player.y * scale, 3, 3);
  }
}
