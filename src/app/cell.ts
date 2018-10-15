export const emptyCell = 0;

export interface ReadonlyCell {

  readonly num: number;
  readonly hints: Set<number>;
  readonly i: number;
  readonly j: number;
  readonly valid: boolean;
  readonly modifiable: boolean;
  readonly key: string;
  readonly k: number;
  manualHints: Set<number>;

  isEmpty(): boolean;
  compare(other: ReadonlyCell): number;
}

export class Cell implements ReadonlyCell {
  k: number;
  manualHints: Set<number> = new Set<number>();

  constructor(public readonly key: string, public readonly i: number, public readonly j: number,
              private _hints: Set<number> = new Set<number>(), public num: number = emptyCell,
              public valid: boolean = false, public modifiable: boolean = false) {
  }

  get hints(): Set<number> {
    return this._hints;
  }

  compare(other: ReadonlyCell): number {
    const h1 = this.hints.size;
    const h2 = other.hints.size;
    let s = Math.sign(h1 - h2);
    if (s !== 0) {
      return s;
    } else {
      s = Math.sign(this.k - other.k);
      return s;
    }
  }

  toString() {
    return `(${this.i},${this.j} ${this.num} ${this.valid ? 'V' : 'X'})`;
  }

  isEmpty(): boolean {
    return this.num === emptyCell;
  }
}
