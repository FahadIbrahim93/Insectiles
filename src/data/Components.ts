/**
 * Core Logic Components
 */

export interface Position {
    x: number;
    y: number;
}

export interface Velocity {
    vx: number;
    vy: number;
}

export interface Renderable {
    spriteId: string;
    containerName: string; // Background, Main, FX, HUD
}

export interface Health {
    current: number;
    max: number;
}
