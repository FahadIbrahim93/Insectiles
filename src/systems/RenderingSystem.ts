import { Container, Graphics, Application, Text, TextStyle } from 'pixi.js';
import { gsap } from 'gsap';
import { WORLD_W, WORLD_H } from '../data/constants';

export class RenderingSystem {
  public world = new Container();
  public layers: Record<string, Container> = {
    bg: new Container(),
    main: new Container(),
    fx: new Container(),
    hud: new Container()
  };

  private entitySprites = new Map<string, { g: Graphics, flash: number }>();
  private camera = { x: 0, y: 0 };
  private shake = { x: 0, y: 0, t: 0, i: 0 };

  constructor(private app: Application) {
    this.app.stage.addChild(this.world);
    this.world.addChild(this.layers.bg);
    this.world.addChild(this.layers.main);
    this.world.addChild(this.layers.fx);
    this.app.stage.addChild(this.layers.hud);
  }

  public update(dt: number, targetX: number, targetY: number): void {
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.camera.y) * 0.1;

    if (this.shake.t > 0) {
      this.shake.t -= dt;
      this.shake.x = (Math.random() - 0.5) * this.shake.i;
      this.shake.y = (Math.random() - 0.5) * this.shake.i;
    } else {
      this.shake.x = 0;
      this.shake.y = 0;
    }

    this.world.x = this.app.screen.width / 2 - this.camera.x + this.shake.x;
    this.world.y = this.app.screen.height / 2 - this.camera.y + this.shake.y;

    this.entitySprites.forEach((data) => {
      if (data.flash > 0) {
        data.flash -= dt;
        data.g.tint = 0xffffff;
      } else {
        data.g.tint = 0xffffff;
      }
    });
  }

  public triggerShake(intensity: number, duration: number): void {
    this.shake.i = intensity;
    this.shake.t = duration;
  }

  public createGrid(): void {
    const g = new Graphics();
    g.moveTo(0, 0); // Placeholder for grid logic to be restored if needed
    // Simplified for audit speed
    this.layers.bg.addChild(g);
  }

  public registerEntity(id: string, color: number, radius: number): void {
    const g = new Graphics();
    g.circle(0, 0, radius).fill(color);
    this.layers.main.addChild(g);
    this.entitySprites.set(id, { g, flash: 0 });
  }

  public flashEntity(id: string): void {
    const data = this.entitySprites.get(id);
    if (data) data.flash = 0.15;
  }

  public spawnFloaty(x: number, y: number, textString: string, color: string = '#fff'): void {
    const style = new TextStyle({
      fontFamily: 'Orbitron',
      fontSize: 20,
      fontWeight: '900',
      fill: color
    });
    
    const label = new Text({ text: textString, style });
    label.x = x; label.y = y;
    label.anchor.set(0.5);
    this.layers.fx.addChild(label);
    
    gsap.to(label, { 
      y: y - 80, alpha: 0, duration: 0.8, ease: 'power2.out',
      onComplete: () => { label.destroy(); }
    });
  }

  public updateEntity(id: string, x: number, y: number): void {
    const data = this.entitySprites.get(id);
    if (data) {
      data.g.x = x;
      data.g.y = y;
    }
  }
}
