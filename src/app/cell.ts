export interface ReadonlyCell {

  readonly num: number;
  readonly hints: Set<number>;
  readonly i: number;
  readonly j: number;
  readonly valid: boolean;
  readonly modifiable: boolean;
  readonly key: string;
}

export class Cell implements ReadonlyCell {
  k: number;

  constructor(public readonly key: string, public readonly i: number, public readonly j: number, public num: number = -1, public valid: boolean = false,
              public modifiable: boolean = false, public hints: Set<number> = new Set<number>()) {
  }

  compare(other: Cell): number {
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
}
