import { hsl, rgb, TAU } from './utils';

export class InsectRenderer {
  static drawBeetle(cx: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, animPhase: number, health: number, maxHealth: number, type = 'basic', cameraX: number, cameraY: number, W: number, H: number) {
    const sx = x - cameraX, sy = y - cameraY;
    if (sx < -200 || sx > W + 200 || sy < -200 || sy > H + 200) return;

    cx.save();
    cx.translate(sx, sy);
    cx.rotate(angle);

    const s = size;
    const legAnim = Math.sin(animPhase * 8) * 0.4;
    const breathe = Math.sin(animPhase * 2) * 0.03 + 1;
    const palette = InsectRenderer.getPalette(type);

    // SHADOW (volumetric)
    cx.save();
    cx.scale(1, 0.3);
    cx.beginPath(); cx.ellipse(0, s * 2, s * 1.2, s * 0.8, 0, 0, TAU);
    cx.fillStyle = rgb(0, 0, 0, 0.25); cx.fill();
    cx.restore();

    // LEGS (skeletal rigged)
    cx.strokeStyle = palette.leg;
    cx.lineWidth = Math.max(1.5, s * 0.08);
    cx.lineCap = 'round';
    for (let side = -1; side <= 1; side += 2) {
      for (let i = 0; i < 3; i++) {
        const baseAngle = side * (0.6 + i * 0.4);
        const legPhase = legAnim * ((i % 2 === 0) ? 1 : -1) * side;
        const jointX = Math.cos(baseAngle + legPhase) * s * 0.5;
        const jointY = Math.sin(baseAngle + legPhase) * s * 0.5;
        const tipX = Math.cos(baseAngle + legPhase * 1.5) * s * 1.1;
        const tipY = Math.sin(baseAngle + legPhase * 1.5) * s * 1.1;
        cx.beginPath();
        cx.moveTo(Math.cos(baseAngle) * s * 0.2, Math.sin(baseAngle) * s * 0.2);
        cx.quadraticCurveTo(jointX, jointY, tipX, tipY);
        cx.stroke();
      }
    }

    // ABDOMEN (back segment with PBR-like shading)
    cx.save(); cx.scale(breathe, breathe);
    const abdG = cx.createRadialGradient(-s * 0.05, -s * 0.15, s * 0.05, 0, 0, s * 0.7);
    abdG.addColorStop(0, palette.highlight);
    abdG.addColorStop(0.4, palette.body);
    abdG.addColorStop(1, palette.shadow);
    cx.beginPath(); cx.ellipse(-s * 0.3, 0, s * 0.55, s * 0.4, 0, 0, TAU);
    cx.fillStyle = abdG; cx.fill();

    // Abdomen segment lines (normal map hint)
    cx.strokeStyle = palette.segment;
    cx.lineWidth = 0.8;
    for (let i = 1; i < 4; i++) {
      cx.beginPath();
      cx.ellipse(-s * 0.3 + i * s * 0.12, 0, s * 0.05, s * (0.35 - i * 0.05), 0, 0, TAU);
      cx.stroke();
    }
    cx.restore();

    // THORAX (middle)
    const thorG = cx.createRadialGradient(s * 0.1, -s * 0.1, s * 0.02, s * 0.15, 0, s * 0.35);
    thorG.addColorStop(0, palette.highlight);
    thorG.addColorStop(0.5, palette.body);
    thorG.addColorStop(1, palette.shadow);
    cx.beginPath(); cx.ellipse(s * 0.15, 0, s * 0.3, s * 0.3, 0, 0, TAU);
    cx.fillStyle = thorG; cx.fill();

    // HEAD
    const headG = cx.createRadialGradient(s * 0.45, -s * 0.05, s * 0.02, s * 0.5, 0, s * 0.25);
    headG.addColorStop(0, palette.highlight);
    headG.addColorStop(0.5, palette.head);
    headG.addColorStop(1, palette.shadow);
    cx.beginPath(); cx.ellipse(s * 0.5, 0, s * 0.22, s * 0.2, 0, 0, TAU);
    cx.fillStyle = headG; cx.fill();

    // EYES (with specular reflection)
    for (let side = -1; side <= 1; side += 2) {
      cx.beginPath(); cx.ellipse(s * 0.6, side * s * 0.1, s * 0.08, s * 0.09, 0, 0, TAU);
      cx.fillStyle = palette.eye; cx.fill();
      cx.beginPath(); cx.arc(s * 0.62, side * s * 0.08, s * 0.03, 0, TAU);
      cx.fillStyle = 'rgba(255,255,255,0.7)'; cx.fill();
    }

    // MANDIBLES
    const mandAnim = Math.sin(animPhase * 4) * 0.15;
    for (let side = -1; side <= 1; side += 2) {
      cx.save();
      cx.translate(s * 0.65, side * s * 0.05);
      cx.rotate(side * (0.3 + mandAnim));
      cx.beginPath();
      cx.moveTo(0, 0);
      cx.quadraticCurveTo(s * 0.15, side * s * 0.05, s * 0.2, side * s * 0.02);
      cx.strokeStyle = palette.mandible;
      cx.lineWidth = Math.max(1.5, s * 0.06);
      cx.lineCap = 'round';
      cx.stroke();
      cx.restore();
    }

    // ANTENNAE
    for (let side = -1; side <= 1; side += 2) {
      const antWave = Math.sin(animPhase * 3 + side) * 0.2;
      cx.beginPath();
      cx.moveTo(s * 0.6, side * s * 0.12);
      cx.quadraticCurveTo(s * 0.8 + Math.cos(antWave) * s * 0.1, side * s * 0.3, s * 0.9, side * (s * 0.35 + Math.sin(antWave) * s * 0.1));
      cx.strokeStyle = palette.antenna;
      cx.lineWidth = Math.max(1, s * 0.04);
      cx.lineCap = 'round';
      cx.stroke();
      cx.beginPath(); cx.arc(s * 0.9, side * (s * 0.35 + Math.sin(antWave) * s * 0.1), s * 0.03, 0, TAU);
      cx.fillStyle = palette.antenna; cx.fill();
    }

    // SPECULAR RIM LIGHT
    cx.beginPath(); cx.ellipse(s * 0.15, 0, s * 0.3, s * 0.3, 0, -0.5, 0.5);
    cx.strokeStyle = `rgba(255,255,255,0.08)`;
    cx.lineWidth = s * 0.15;
    cx.stroke();

    // WING SHIMMER (for flying types)
    if (type === 'wasp' || type === 'moth') {
      cx.save();
      cx.globalAlpha = 0.15 + Math.sin(animPhase * 20) * 0.1;
      for (let side = -1; side <= 1; side += 2) {
        cx.beginPath();
        cx.ellipse(s * 0.05, side * s * 0.3, s * 0.5, s * 0.2, side * 0.2 + Math.sin(animPhase * 15) * 0.3, 0, TAU);
        cx.fillStyle = hsl(palette.wingHue || 200, 30, 80, 0.3);
        cx.fill();
      }
      cx.restore();
    }

    cx.restore();

    // HEALTH BAR (if damaged)
    if (health < maxHealth) {
      const bw = s * 1.6, bh = 3;
      const bx = sx - bw / 2, by = sy - s - 12;
      cx.fillStyle = rgb(0, 0, 0, 0.5);
      cx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
      const pct = health / maxHealth;
      cx.fillStyle = pct > 0.5 ? hsl(120, 70, 50) : pct > 0.25 ? hsl(40, 80, 50) : hsl(0, 80, 50);
      cx.fillRect(bx, by, bw * pct, bh);
    }
  }

  static getPalette(type: string) {
    const palettes: Record<string, any> = {
      basic: {
        body: '#2a5c2a', highlight: '#4a8c4a', shadow: '#0a2a0a', head: '#1a4a1a',
        segment: 'rgba(0,0,0,0.25)', leg: '#1a3a1a', eye: '#cc0000', mandible: '#3a2a1a',
        antenna: '#2a4a2a'
      },
      soldier: {
        body: '#5c2a2a', highlight: '#8c4a4a', shadow: '#2a0a0a', head: '#4a1a1a',
        segment: 'rgba(0,0,0,0.3)', leg: '#3a1a1a', eye: '#ffcc00', mandible: '#5a3a2a',
        antenna: '#4a2a2a'
      },
      wasp: {
        body: '#8c7a1a', highlight: '#ccbb44', shadow: '#3a3000', head: '#6a5a10',
        segment: 'rgba(0,0,0,0.35)', leg: '#4a4010', eye: '#ff3300', mandible: '#5a4a1a',
        antenna: '#6a5a1a', wingHue: 50
      },
      moth: {
        body: '#4a3a6a', highlight: '#7a6a9a', shadow: '#1a1030', head: '#3a2a5a',
        segment: 'rgba(100,80,160,0.2)', leg: '#2a2040', eye: '#88ff88', mandible: '#4a3a5a',
        antenna: '#5a4a7a', wingHue: 270
      },
      queen: {
        body: '#1a4a3a', highlight: '#3a8a7a', shadow: '#002a1a', head: '#0a3a2a',
        segment: 'rgba(0,255,200,0.15)', leg: '#0a2a1a', eye: '#ff00ff', mandible: '#2a5a3a',
        antenna: '#1a5a4a', wingHue: 160
      }
    };
    return palettes[type] || palettes.basic;
  }
}
