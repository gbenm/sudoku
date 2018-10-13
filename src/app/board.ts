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

class Stats {
  moves = 0;
  choiceRange: Array<number> = new Array<number>(boardSize + 1).fill(0);
  backMoves = 0;

  toString(): string {
    return `{moves: ${this.moves}, backMoves=${this.backMoves}, choiceRange: [${this.choiceRange}]`;
  }
}

export class Board implements ReadonlyBoard {

  private static helper: HelperService;
  private static levels: Array<[number, number, number]> = [[40, 4, 1.6], [50, 3, 1.6], [62, 2, 1.8]];

  private _completed: boolean;
  private cells: Map<string, Cell>;
  stats: Stats;

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

  setNum(cell: ReadonlyCell, num: number) {
    this.setNumber(cell as Cell, num);
  }

  private setNumber(cell: Cell, num: number): boolean {
    const origNum = cell.num;
    // console.log(`set ${cell} => ${num}`);
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

  private generateSolutionRecursive(keys: Array<string>): boolean {
    if (keys.length > 0) {
      // order keys to have the cells with minimum number of hints first
      keys.sort((k1, k2) => this.get(k1).compare(this.get(k2)));
      const key = keys.shift();
      const cell = this.get(key);
      const hints = Array.from(this.get(key).hints);
      Board.helper.shuffle(hints);
      const choiceRange = hints.length;
      this.stats.choiceRange[choiceRange]++;
      // console.log(`[${keys.length}] k ${key} hints ${hints}`);
      while (hints.length) {
        const num = hints.shift();
        assert(this.setNumber(cell, num));
        this.generateSolutionRecursive(keys);
        this.stats.moves++;
        // console.log(`${this._completed} [${keys.length}] ${key} => ${num} hints [${hints}]`);
        if (this.completed) {
          return true;
        }
        this.stats.backMoves++;
        this.setNumber(cell, emptyCell);
      }
      keys.unshift(key);
    }
    this._completed = keys.length === 0;
    return this.completed;
  }

  generateSolution(fromScratch: boolean): boolean {
    if (fromScratch) {
      for (let k = 0; k < squareSize; k++) {
        const nums = Board.helper.progr(this.size, 1);
        Board.helper.shuffle(nums);
        for (let i = k * squareSize; i < k * squareSize + squareSize; i++) {
          for (let j = k * squareSize; j < k * squareSize + squareSize; j++) {
            this.setNumber(this.getCell(i, j), nums.pop());
          }
        }
      }
    }
    this.stats = new Stats();
    const keys = [];
    this.cells.forEach((c) => {
      if (c.isEmpty()) {
        keys.push(c.key);
      }
    });
    Board.helper.shuffle(keys);
    // assign a random value to cell.k to randomly select rowHints with same hint size
    keys.forEach((key, i) => this.get(key).k = i);
    const res = this.generateSolutionRecursive(keys);
    console.log(`STATS ${this.stats}`);
    return res;
  }

  prepareBoardForGameplay(level: number = 0) {
    const [minCnt, minBoxCnt, minDist] = Board.levels[level];

    const cells = Array.from(this.cells.values());
    Board.helper.shuffle(cells);

    const numMap = new Map<number, Array<Cell>>();
    for (let n = 1; n <= this.size; n++) {
      numMap.set(n, []);
    }
    cells.forEach((c) => numMap.get(c.num).push(c));

    const nums = [];
    const boxCnt = new Array<number>(this.size).fill(this.size);
    let cnt = 0;
    while (cells.length && cnt < minCnt) {
      const c = cells.shift();
      const bi = Math.floor(c.i / squareSize) * squareSize + Math.floor(c.j / squareSize);
      if (boxCnt[bi] > minBoxCnt && this.checkDistance(c, numMap, minDist)) {
        cnt++;
        boxCnt[bi]--;
        const arr = numMap.get(c.num);
        arr.splice(arr.indexOf(c), 1);
        this.setNumber(c, emptyCell);
        c.modifiable = true;
        console.log(`removed ${c}`);
      }
    }
    console.log(`removed ${cnt} numbers`);
  }

  private checkDistance(c: Cell, numMap: Map<number, Array<Cell>>, minDist: number): boolean {
    let arr = numMap.get(c.num);
    if (arr.length > 4) {
      return true;
    }
    if (arr.length < 3) {
      return false;
    }
    arr = Array.from(arr);
    arr.splice(arr.indexOf(c), 1);
    let dist = 0;
    let cnt = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      const a = arr[i];
      const ai = Math.floor(a.i / squareSize);
      const aj = Math.floor(a.j / squareSize);
      for (let j = i + 1; j < arr.length; j++) {
        const b = arr[j];
        const bi = Math.floor(b.i / squareSize);
        const bj = Math.floor(b.j / squareSize);
        dist += Math.sign(Math.abs(ai - bi)) + Math.sign(Math.abs(aj - bj));
        cnt++;
      }
    }
    console.log(`dist ${c} = ${dist / cnt} [${arr}]`);
    return (dist / cnt) < minDist;
  }

}
