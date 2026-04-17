/**
 * Principal Engineer Standard: Fixed-Timestep Accumulator
 * Ensures physics and logic run at exactly X frames per second regardless of monitor Hz.
 */
export class GameTicker {
    private lastTime: number = 0;
    private accumulator: number = 0;
    private readonly step: number = 1 / 60; // Locked 60FPS simulation

    constructor(private onUpdate: (dt: number) => void) {}

    public tick(currentTime: number): void {
        const delta = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Limit delta to avoid "Spiral of Death" after tab-resume
        this.accumulator += Math.min(delta, 0.25);

        while (this.accumulator >= this.step) {
            this.onUpdate(this.step);
            this.accumulator -= this.step;
        }
    }
}
