import {Cell, ReadonlyCell} from './cell';
import {HelperService} from './helper.service';

const squareSize = 3;
const boardSize = squareSize * 3;

export interface ReadonlyBoard {

  readonly valid: boolean;
  selected: ReadonlyCell;
  readonly highlighted: Set<ReadonlyCell>;
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

  _selected: Cell;

  get selected(): Cell {
    return this._selected;
  }

  set selected(cell: Cell) {
    this._highlighted.clear();
    if (!cell || cell === this._selected) {
      this._selected = null;
    } else {
      this._selected = cell;
      this._highlighted.add(cell);
      if (cell.num > 0) {
        this.cells.forEach((c, k, m) => {
          if (c.num === cell.num) {
            this._highlighted.add(c);
          }
        });
      }
      const ll = new Set<Cell>();
      this._highlighted.forEach((c, k, s) => this.iterateOverRelatedCells(c, (fc) => {
        ll.add(fc);
        return true;
      }));
      ll.forEach((c) => this._highlighted.add(c));
      this._highlighted.delete(cell);
    }
  }

  _highlighted: Set<Cell>;

  get highlighted(): Set<Cell> {
    return this._highlighted;
  }

  get size(): number {
    return boardSize;
  }

  static generateSolutionRecursive(board: Board, remainingKeys: Array<string>): Board {
    if (remainingKeys.length > 0) {
      // const remainingKeys = Array.from(keys);
      remainingKeys.sort((k1, k2) => board.get(k1).compare(board.get(k2)));
      const key = remainingKeys.shift();
      // console.log(`k ${remainingKeys}`);
      // const [i, j] = board.genIndex(key);
      const hints = board.get(key).hints;
      const numbers = Array.from(hints);
      this.helper.shuffle(numbers);
      console.log(`[${remainingKeys.length}] k ${key} hints ${numbers}`);
      while (numbers.length) {
        const num = numbers.shift();
        // let newBoard = new Board(board);
        board.setNumber(board.get(key), num);
        board = Board.generateSolutionRecursive(board, remainingKeys);
        console.log(`${board.valid} [${remainingKeys.length}] ${key} => ${num} hints [${numbers}]`);
        if (board.valid) {
          return board;
        }
        board.unsetNumber(board.get(key));
      }
      remainingKeys.unshift(key);
    }
    board.valid = remainingKeys.length === 0;
    return board;
  }

  static prepareBoard(board: Board) {
    const cells = Array.from(board.cells.values());
    this.helper.shuffle(cells);
    for (let i = 0; i < 50; i++) {
      const c = cells.shift();
      board.unsetNumber(c);
      c.modifiable = true;
    }
  }

  static generateSolution(): Board {
    let board = new Board();
    board.initializeHints();
    const keys = Array.from(board.cells.keys());
    this.helper.shuffle(keys);
    // assign a random value to cell.k to randomly select rowHints with same hint size
    keys.forEach((key, i, a) => board.get(key).k = i);
    board = Board.generateSolutionRecursive(board, keys);
    Board.prepareBoard(board);
    return board;
  }

  static setHelper(helper: HelperService) {
    Board.helper = helper;
  }

  setNumber(cell: Cell, num: number) {
    console.log(`set (${cell.i}, ${cell.j}) => ${num}`);
    cell.valid = this.isMoveCorrect(cell, num);
    cell.num = num;
    this.updateHints(cell, num);
  }

  // genIndex(key: string): Array<number> {
  //   return [+key.substr(1, 1), +key.substr(2, 1)];
  // }

  unsetNumber(cell: Cell) {
    console.log(`unset (${cell.i}, ${cell.j}) <= ${cell.num}`);
    const num = cell.num;
    cell.num = -1;
    cell.valid = false;
    this.updateHintsAfterUnset(cell, num);
  }

  setHint(cell: Cell, num: number) {
    cell.hints.add(num);
  }

  private get(key: string): Cell {
    return this.cells.get(key);
  }

  getCell(i: number, j: number): Cell {
    const k = this.genKey(i, j);
    return this.cells.get(k);
  }

  private isMoveCorrect(cell: Cell, num: number): boolean {
    return this.iterateOverRelatedCells(cell, (c) => {
      if (c.i !== cell.i && c.j === cell.j && c.num === num) {
        return false;
      }
      if (c.j !== cell.j && c.i === cell.i && c.num === num) {
        return false;
      }
      if (c.i !== cell.i && c.j !== cell.j && c.num === num) {
        return false;
      }
      return true;
    });

    // for (let qi = 0; qi < boardSize; qi++) {
    //   if (qi !== i && this.getCell(qi, j).num === num) {
    //     return false;
    //   }
    // }
    // for (let qj = 0; qj < boardSize; qj++) {
    //   if (qj !== j && this.getCell(i, qj).num === num) {
    //     return false;
    //   }
    // }
    // const si = Math.floor(i / squareSize) * squareSize;
    // const sj = Math.floor(j / squareSize) * squareSize;
    // for (let qi = si; qi < si + squareSize; qi++) {
    //   for (let qj = sj; qj < sj + squareSize; qj++) {
    //     if (qi !== i && qj !== j && this.getCell(qi, qj).num === num) {
    //       return false;
    //     }
    //   }
    // }
    // return true;
  }

  private initializeHints() {
    const h = new Array<number>(boardSize);
    for (let i = 1; i <= boardSize; i++) {
      h[i - 1] = i;
    }
    this.cells.forEach((v, k, map) => v.hints = new Set<number>(h));
  }

  private deepCopy(board: Board) {
    const empty = !board;
    this.cells = new Map<string, Cell>();
    this._highlighted = new Set<Cell>();
    this._selected = null;
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        const key = this.genKey(i, j);
        const c = empty ? new Cell(i, j) : board.get(key);
        this.set(key, empty ? c : new Cell(i, j, c.num, c.valid, c.modifiable, new Set<number>(c.hints)));
      }
    }
    this.valid = !empty && board.valid;
    if (!empty) {
      this._selected = board.selected ? this.getCell(board.selected.i, board.selected.j) : null;
      this._highlighted.clear();
      board._highlighted.forEach((c, k, set) => this._highlighted.add(this.getCell(c.i, c.j)));
    }
  }

  private set(key: string, cell: Cell) {
    this.cells.set(key, cell);
  }

  private genKey(i: number, j: number): string {
    return `k${i}${j}`;
  }

  private updateHints(cell: Cell, num: number) {
    this.iterateOverRelatedCells(cell, (c) => {
      c.hints.delete(num);
      return true;
    });
  }

  private updateHintsAfterUnset(cell: Cell, num: number) {
    this.iterateOverRelatedCells(cell, (c) => {
      if (this.isMoveCorrect(c, num)) {
        c.hints.add(num);
      }
      return true;
    });
  }

  private iterateOverRelatedCells(c: Cell, callback: (cell: Cell) => boolean): boolean {
    for (let k = 0; k < boardSize; k++) {
      // console.log(`${k} => ${this.getCell(k, c.j)}`);
      if (!callback(this.getCell(k, c.j)) || !callback(this.getCell(c.i, k))) {
        return false;
      }
    }
    const si = Math.floor(c.i / squareSize) * squareSize;
    const sj = Math.floor(c.j / squareSize) * squareSize;
    for (let i = si; i < si + squareSize; i++) {
      for (let j = sj; j < sj + squareSize; j++) {
        // console.log(`${i},${j}`);
        if (!callback(this.getCell(i, j))) {
          return false;
        }
      }
    }
    return true;
  }
}

