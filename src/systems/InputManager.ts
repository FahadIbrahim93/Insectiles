// ═══════════════════════════════════════════════════════════════════
// INSECTILES: APEX SWARM — INPUT MANAGER (Enhanced)
// ═══════════════════════════════════════════════════════════════════

import { InputState } from '../data/types';

export class InputManager {
  private keys = new Set<string>();
  private _abilityPressed = false;
  private _pausePressed = false;
  
  // Mouse/Touch aim position
  private _aimX = 0;
  private _aimY = 0;
  private _shootPressed = false;
  private _mouseDown = false;
  
  // Touch joystick state
  public joy = { active: false, dx: 0, dy: 0, tid: -1, sx: 0, sy: 0 };
  private readonly JOY_RADIUS = 38;
  
  // Input state for game systems
  public state: InputState = {
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    aimX: 0,
    aimY: 0,
    shoot: false,
    ability: false,
    pause: false,
  };

  constructor() {
    this.setupKeyboard();
    this.setupMouse();
    this.setupTouch();
  }

  // ─── Keyboard ───────────────────────────────────────────────────────
  
  private setupKeyboard(): void {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      
      // Ability (Space)
      if (e.code === 'Space') { 
        e.preventDefault(); 
        this._abilityPressed = true; 
      }
      
      // Pause (Escape)
      if (e.code === 'Escape') { 
        this._pausePressed = true; 
      }
      
      // Prevent scrolling with arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
  }

  // ─── Mouse ─────────────────────────────────────────────────────────
  
  private setupMouse(): void {
    window.addEventListener('mousemove', (e) => {
      this._aimX = e.clientX;
      this._aimY = e.clientY;
    });

    window.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left click
        this._mouseDown = true;
        this._shootPressed = true;
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this._mouseDown = false;
      }
    });

    // Prevent context menu on right click
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // ─── Touch ─────────────────────────────────────────────────────────
  
  private setupTouch(): void {
    const joyZone = document.getElementById('joyZone');
    const joyKnob = document.getElementById('joyKnob');
    const touchAbil = document.getElementById('touchAbil');
    
    if (!joyZone || !joyKnob) return;

    // Joystick
    joyZone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.changedTouches[0]!;
      this.joy.active = true;
      this.joy.tid = t.identifier;
      const rc = joyZone.getBoundingClientRect();
      this.joy.sx = rc.left + rc.width / 2;
      this.joy.sy = rc.top + rc.height / 2;
    }, { passive: false });

    window.addEventListener('touchmove', (e) => {
      if (!this.joy.active) return;
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === this.joy.tid) {
          const dx = touch.clientX - this.joy.sx;
          const dy = touch.clientY - this.joy.sy;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const cl = Math.min(len, this.JOY_RADIUS);
          this.joy.dx = (dx / len) * (cl / this.JOY_RADIUS);
          this.joy.dy = (dy / len) * (cl / this.JOY_RADIUS);
          joyKnob.style.transform = `translate(calc(-50% + ${(dx / len) * cl}px), calc(-50% + ${(dy / len) * cl}px))`;
        }
      }
    }, { passive: false });

    window.addEventListener('touchend', (e) => {
      for (const touch of Array.from(e.changedTouches)) {
        if (touch.identifier === this.joy.tid) {
          this.joy = { active: false, dx: 0, dy: 0, tid: -1, sx: 0, sy: 0 };
          joyKnob.style.transform = 'translate(-50%, -50%)';
        }
      }
    });

    // Ability button
    touchAbil?.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this._abilityPressed = true;
    }, { passive: false });
  }

  // ─── Update State ──────────────────────────────────────────────────

  public update(): void {
    // Movement
    this.state.moveUp = this.keys.has('KeyW') || this.keys.has('ArrowUp');
    this.state.moveDown = this.keys.has('KeyS') || this.keys.has('ArrowDown');
    this.state.moveLeft = this.keys.has('KeyA') || this.keys.has('ArrowLeft');
    this.state.moveRight = this.keys.has('KeyD') || this.keys.has('ArrowRight');
    
    // Add joystick movement
    if (this.joy.active) {
      if (this.joy.dx < -0.3) this.state.moveLeft = true;
      if (this.joy.dx > 0.3) this.state.moveRight = true;
      if (this.joy.dy < -0.3) this.state.moveUp = true;
      if (this.joy.dy > 0.3) this.state.moveDown = true;
    }

    // Aim position
    this.state.aimX = this._aimX;
    this.state.aimY = this._aimY;

    // Shooting
    this.state.shoot = this._mouseDown;
    
    // Ability (consume after reading)
    this.state.ability = this.consumeAbility();
    
    // Pause (consume after reading)
    this.state.pause = this.consumePause();
  }

  // ─── Consume Methods (one-shot inputs) ─────────────────────────────

  consumeAbility(): boolean {
    const v = this._abilityPressed;
    this._abilityPressed = false;
    return v;
  }

  consumePause(): boolean {
    const v = this._pausePressed;
    this._pausePressed = false;
    return v;
  }

  consumeShoot(): boolean {
    const v = this._shootPressed;
    this._shootPressed = false;
    return v;
  }

  // ─── Helper Methods ─────────────────────────────────────────────────

  getMoveVector(): { mx: number; my: number } {
    let mx = 0, my = 0;
    
    if (this.state.moveUp) my -= 1;
    if (this.state.moveDown) my += 1;
    if (this.state.moveLeft) mx -= 1;
    if (this.state.moveRight) mx += 1;

    // Normalize
    const len = Math.sqrt(mx * mx + my * my);
    if (len > 1) { mx /= len; my /= len; }
    
    return { mx, my };
  }

  getAimAngle(canvasWidth: number, canvasHeight: number, playerX: number, playerY: number): number {
    // Convert screen aim to world space angle
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    return Math.atan2(this._aimY - centerY, this._aimX - centerX);
  }

  isMobile(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // ─── Cleanup ────────────────────────────────────────────────────────

  destroy(): void {
    this.keys.clear();
    // Event listeners will be cleaned up automatically
  }
}