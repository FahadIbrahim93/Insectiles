// ═══════════════════════════════════════════════════════════════════
// SPATIAL GRID — High-performance O(1) entity proximity lookup
// Same algorithm as the original but fully typed and encapsulated
// ═══════════════════════════════════════════════════════════════════

export interface HasPosition { x: number; y: number; }

export class SpatialGrid<T extends HasPosition> {
  private readonly cell: number;
  private map = new Map<number, T[]>();

  constructor(cellSize: number) {
    this.cell = cellSize;
  }

  private key(x: number, y: number): number {
    return ((x / this.cell | 0) & 0xffff) | (((y / this.cell | 0) & 0xffff) << 16);
  }

  clear(): void {
    this.map.clear();
  }

  insert(entity: T): void {
    const k = this.key(entity.x, entity.y);
    let bucket = this.map.get(k);
    if (!bucket) { bucket = []; this.map.set(k, bucket); }
    bucket.push(entity);
  }

  query(x: number, y: number, radius: number): T[] {
    const results: T[] = [];
    const cr = Math.ceil(radius / this.cell);
    const cx = x / this.cell | 0;
    const cy = y / this.cell | 0;
    for (let dx = -cr; dx <= cr; dx++) {
      for (let dy = -cr; dy <= cr; dy++) {
        const k = ((cx + dx) & 0xffff) | (((cy + dy) & 0xffff) << 16);
        const bucket = this.map.get(k);
        if (bucket) for (const e of bucket) results.push(e);
      }
    }
    return results;
  }
}
