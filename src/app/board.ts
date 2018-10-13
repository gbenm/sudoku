import {Cell, emptyCell, ReadonlyCell} from './cell';
import {HelperService} from './helper.service';
import * as assert from 'assert';

const squareSize = 3;
const boardSize = squareSize * 3;

export interface ReadonlyBoard {
  readonly completed: boolean;
  readonly size: number;
  getCell(i: number, j: number): ReadonlyCell;
}

export class Board implements ReadonlyBoard {

  private static helper: HelperService;
  private _completed: boolean;
  private cells: Map<string, Cell>;

  constructor(board?: Board) {
    this.deepCopy(board);
  }

  get size(): number {
    return boardSize;
  }

  get completed(): boolean {
    return this._completed;
  }

  static setHelper(helper: HelperService) {
    Board.helper = helper;
  }

  generateSolutionRecursive(keys: Array<string>): boolean {
    if (keys.length > 0) {
      // order keys to have the cells with minimum number of hints first
      keys.sort((k1, k2) => this.get(k1).compare(this.get(k2)));
      const key = keys.shift();
      const cell = this.get(key);
      const hints = Array.from(this.get(key).hints);
      Board.helper.shuffle(hints);
      console.log(`[${keys.length}] k ${key} hints ${hints}`);
      while (hints.length) {
        const num = hints.shift();
        assert(this.setNumber(cell, num));
        this.generateSolutionRecursive(keys);
        console.log(`${this._completed} [${keys.length}] ${key} => ${num} hints [${hints}]`);
        if (this.completed) {
          return true;
        }
        this.setNumber(cell, emptyCell);
      }
      keys.unshift(key);
    }
    this._completed = keys.length === 0;
    return this.completed;
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
        this.setNumber(c, emptyCell);
        c.modifiable = true;
      }
    }
  }

  generateSolution() {
    const keys = new Array<string>();
    this.cells.forEach((c) => {
      if (c.isEmpty()) {
        keys.push(c.key);
      }
    });
    Board.helper.shuffle(keys);
    // assign a random value to cell.k to randomly select rowHints with same hint size
    keys.forEach((key, i) => this.get(key).k = i);
    const res = this.generateSolutionRecursive(keys);
    if (res) {
      this.prepareBoardForGameplay();
    }
  }

  setNum(cell: ReadonlyCell, num: number) {
    this.setNumber(cell as Cell, num);
  }

  private setNumber(cell: Cell, num: number): boolean {
    const origNum = cell.num;
    console.log(`set ${cell} ${origNum} => ${num}`);
    cell.valid = num !== emptyCell && this.isMoveCorrect(cell, num);
    cell.num = num;
    if (num === emptyCell) {
      this.updateHintsAfterUnset(cell, origNum);
    } else {
      this.updateHints(cell, num);
    }
    return cell.valid;
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
        if ((i !== cell.i || j !== cell.j) && this.getCell(i, j).num === num) {
          return false;
        }
      }
    }
    return true;
  }

  private deepCopy(board: Board) {
    const empty = !board;
    const hints = empty ? Board.helper.progr(boardSize, 1) : null;
    this.cells = new Map<string, Cell>();
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const key = this.genKey(i, j);
        const c = empty ? new Cell(key, i, j, new Set<number>(hints)) : board.get(key);
        this.set(key, empty ? c : new Cell(key, i, j, new Set<number>(c.hints), c.num, c.valid, c.modifiable));
      }
    }
    this._completed = !empty && board.completed;
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
      if (k !== c.i) {
        callback(this.getCell(k, c.j));
      }
      if (k !== c.j) {
        callback(this.getCell(c.i, k));
      }
    }
    const si = Math.floor(c.i / squareSize) * squareSize;
    const sj = Math.floor(c.j / squareSize) * squareSize;
    for (let i = si; i < si + squareSize; i++) {
      for (let j = sj; j < sj + squareSize; j++) {
        // console.log(`${i},${j}`);
        if (i !== c.i && j !== c.j) {
          callback(this.getCell(i, j));
        }
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
