import {Cell, emptyCell, ReadonlyCell} from './cell';
import {HelperService} from './helper.service';

const squareSize = 3;
const boardSize = squareSize * 3;

export interface ReadonlyBoard {

  readonly valid: boolean;
  readonly size: number;
  getCell(i: number, j: number): ReadonlyCell;
}

export class Board implements ReadonlyBoard {

  private static helper: HelperService;
  valid: boolean;
  private cells: Map<string, Cell>;

  constructor(board?: Board) {
    this.deepCopy(board);
  }

  get size(): number {
    return boardSize;
  }

  static setHelper(helper: HelperService) {
    Board.helper = helper;
  }

  generateSolutionRecursive(keys: Array<string>) {
    if (keys.length > 0) {
      // const keys = Array.from(keys);
      keys.sort((k1, k2) => this.get(k1).compare(this.get(k2)));
      const key = keys.shift();
      const cell = this.get(key);
      // console.log(`k ${keys}`);
      // const [i, j] = board.genIndex(key);
      const numbers = Array.from(this.get(key).hints);
      Board.helper.shuffle(numbers);
      console.log(`[${keys.length}] k ${key} hints ${numbers}`);
      while (numbers.length) {
        const num = numbers.shift();
        if (this.setNumber(cell, num)) {
          this.generateSolutionRecursive(keys);
          console.log(`${this.valid} [${keys.length}] ${key} => ${num} hints [${numbers}]`);
          if (this.valid) {
            return;
          }
        }
        this.unsetNumber(cell);
      }
      keys.unshift(key);
    }
    this.valid = keys.length === 0;
  }

  prepareBoardForGameplay() {
    const cells = Array.from(this.cells.values());
    Board.helper.shuffle(cells);
    const nums = [];
    let cnt = 0;
    for (let i = 1; i <= this.size; i++) {
      const n = 2 + Math.floor(Math.random() * 5);
      cnt += n;
      nums.push(n);
    }
    while (cnt && cells.length) {
      const c = cells.shift();
      if (nums[c.num - 1] > 0) {
        cnt--;
        nums[c.num - 1] -= 1;
        this.unsetNumber(c);
        c.modifiable = true;
      }
    }
  }

  generateSolution() {
    this.initializeHints();
    const keys = new Array<string>();
    this.cells.forEach((c) => {
      if (c.isEmpty()) {
        keys.push(c.key);
      }
    });
    // const keys = Array.from(this.cells.keys());
    Board.helper.shuffle(keys);
    // assign a random value to cell.k to randomly select rowHints with same hint size
    keys.forEach((key, i) => this.get(key).k = i);
    this.generateSolutionRecursive(keys);
    this.prepareBoardForGameplay();
  }

  setNum(cell: ReadonlyCell, num: number) {
    this.setNumber(cell as Cell, num);
  }

  unsetNum(cell: ReadonlyCell) {
    this.unsetNumber(cell as Cell);
  }

  private setNumber(cell: Cell, num: number): boolean {
    console.log(`set ${cell} => ${num}`);
    cell.valid = this.isMoveCorrect(cell, num);
    cell.num = num;
    this.updateHints(cell, num);
    return cell.valid;
  }

  // genIndex(key: string): Array<number> {
  //   return [+key.substr(1, 1), +key.substr(2, 1)];
  // }

  private unsetNumber(cell: Cell) {
    console.log(`unset ${cell}`);
    const num = cell.num;
    cell.num = emptyCell;
    cell.valid = false;
    this.updateHintsAfterUnset(cell, num);
  }

  setHint(cell: ReadonlyCell, num: number) {
    if (cell.hints.has(num)) {
      cell.hints.delete(num);
    } else {
      cell.hints.add(num);
    }
  }

  getCell(i: number, j: number): Cell {
    const k = this.genKey(i, j);
    return this.cells.get(k);
  }

  private get(key: string): Cell {
    return this.cells.get(key);
  }

  private isMoveCorrect(cell: ReadonlyCell, num: number): boolean {
    for (let i = 0; i < boardSize; i++) {
      if (i !== cell.i && this.getCell(i, cell.j).num === num) {
        return false;
      }
    }
    for (let j = 0; j < boardSize; j++) {
      if (j !== cell.j && this.getCell(cell.i, j).num === num) {
        return false;
      }
    }
    const si = Math.floor(cell.i / squareSize) * squareSize;
    const sj = Math.floor(cell.j / squareSize) * squareSize;
    for (let i = si; i < si + squareSize; i++) {
      for (let j = sj; j < sj + squareSize; j++) {
        if (i !== cell.i && j !== cell.j && this.getCell(i, j).num === num) {
          return false;
        }
      }
    }
    return true;
  }

  private initializeHints() {
    const h = new Array<number>(boardSize);
    for (let i = 1; i <= boardSize; i++) {
      h[i - 1] = i;
    }
    this.cells.forEach((c) => c.hints = new Set<number>(h));
  }

  private deepCopy(board: Board) {
    const empty = !board;
    this.cells = new Map<string, Cell>();
    // this._highlighted = new Set<Cell>();
    // this._selected = null;
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const key = this.genKey(i, j);
        const c = empty ? new Cell(key, i, j) : board.get(key);
        this.set(key, empty ? c : new Cell(key, i, j, c.num, c.valid, c.modifiable, new Set<number>(c.hints)));
      }
    }
    this.valid = !empty && board.valid;
    // if (!empty) {
    //   this._selected = board.selected ? this.getCell(board.selected.i, board.selected.j) : null;
    //   this._highlighted.clear();
    //   board._highlighted.forEach((c, k, set) => this._highlighted.add(this.getCell(c.i, c.j)));
    // }
  }

  private set(key: string, cell: Cell) {
    this.cells.set(key, cell);
  }

  private genKey(i: number, j: number): string {
    return `k${i}${j}`;
  }

  private updateHints(cell: Cell, num: number) {
    this.iterateOverRelatedCells(cell, (c) => c.hints.delete(num));
  }

  private updateHintsAfterUnset(cell: Cell, num: number) {
    this.iterateOverRelatedCells(cell, (c) => {
      if (this.isMoveCorrect(c, num)) {
        c.hints.add(num);
      }
    });
  }

  iterateOverRelatedCells(c: ReadonlyCell, callback: (cell: ReadonlyCell) => void) {
    for (let k = 0; k < boardSize; k++) {
      // console.log(`${k} => ${this.getCell(k, c.j)}`);
      callback(this.getCell(k, c.j));
      callback(this.getCell(c.i, k));
    }
    const si = Math.floor(c.i / squareSize) * squareSize;
    const sj = Math.floor(c.j / squareSize) * squareSize;
    for (let i = si; i < si + squareSize; i++) {
      for (let j = sj; j < sj + squareSize; j++) {
        // console.log(`${i},${j}`);
        callback(this.getCell(i, j));
      }
    }
  }

  forEach(callback: (cell: ReadonlyCell) => void) {
    this.cells.forEach(c => callback(c));
  }

  cellList(): Array<ReadonlyCell> {
    return Array.from(this.cells.values());
  }
}

