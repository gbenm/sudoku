import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Board, ReadonlyBoard} from './board';
import {HelperService} from './helper.service';
import {emptyCell, ReadonlyCell} from './cell';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private board: Board;
  private history: Array<[string, ReadonlyCell, number, number]>;
  private historyPos: number;
  private boardObs: BehaviorSubject<ReadonlyBoard>;
  private cellObs: Map<string, BehaviorSubject<ReadonlyCell>>;
  private _selected: ReadonlyCell;
  private _highlighted: Set<ReadonlyCell>;
  private _numbers: Map<number, Set<ReadonlyCell>>;
  private _level = 0;


  constructor(private helper: HelperService) {
    this.init(0);
  }

  private init(num: number) {
    console.log(`generate`);
    Board.setHelper(this.helper);
    this.createNewBoard();
    this.boardObs = new BehaviorSubject<ReadonlyBoard>(this.board);
    this.cellObs = new Map<string, BehaviorSubject<ReadonlyCell>>();
    this.board.forEach(c => this.cellObs.set(c.key, new BehaviorSubject<ReadonlyCell>(c)));
  }

  private createNewBoard() {
    this.board = new Board();
    this.board.generateSolution(true);
    this.board.prepareBoardForGameplay(this.level);
    this.history = new Array<[string, ReadonlyCell, number, number]>();
    this.historyPos = 0;
    this._selected = null;
    this._highlighted = new Set<ReadonlyCell>();
    this._numbers = new Map<number, Set<ReadonlyCell>>();
    for (let i = 1; i <= this.boardSize; i++) {
      this._numbers.set(i, new Set<ReadonlyCell>());
    }
    this.board.forEach(c => {
      if (!c.isEmpty()) {
        this._numbers.get(c.num).add(c);
      }
    });
  }

  get level(): number {
    return this._level;
  }

  get boardSize(): number {
    return this.board.size;
  }

  get selected(): ReadonlyCell {
    return this._selected;
  }

  set selected(cell: ReadonlyCell) {
    console.log(`select ${cell}`);
    this._highlighted.clear();
    if (!cell || cell === this._selected) {
      this._selected = null;
    } else {
      this._selected = cell;
      this.calcHighlighted(cell);
    }
  }

  // private calcHighlighted(cell: ReadonlyCell) {
  //   this._highlighted.add(cell);
  //   if (!cell.isEmpty()) {
  //     this.board.forEach((c) => {
  //       if (c.num === cell.num) {
  //         this._highlighted.add(c);
  //       }
  //     });
  //   }
  //   const ll = new Set<ReadonlyCell>();
  //   this._highlighted.forEach((c) => this.board.iterateOverRelatedCells(c, (fc) => ll.add(fc)));
  //   ll.forEach((c) => this._highlighted.add(c));
  //   this._highlighted.delete(cell);
  // }

  private calcHighlighted(cell: ReadonlyCell) {
    if (!cell.isEmpty()) {
      this._numbers.get(cell.num).forEach(c => this._highlighted.add(c));
    }
    this.board.iterateOverRelatedCells(cell, (c) => this._highlighted.add(c));
    this._highlighted.delete(cell);
  }

  get highlighted(): Set<ReadonlyCell> {
    return this._highlighted;
  }

  get numbers(): Map<number, Set<ReadonlyCell>> {
    return this._numbers;
  }

  setNumber(num: number, skipHistory = false) {
    if (num !== this.selected.num) {
      console.log(`set number ${this.selected} ${num}`);
      this.pushMoveInHistory(['N', this.selected, this.selected.num, num], skipHistory);
      if (!this._selected.isEmpty()) {
        this._numbers.get(this._selected.num).delete(this._selected);
      }
      if (num !== emptyCell) {
        this._numbers.get(num).add(this._selected);
      }
      this.board.setNum(this.selected, num);
      // hack to force highlights update
      const sel = this.selected;
      this.selected = null;
      this.selected = sel;
      this.cellObs.get(this.selected.key).next(this.selected);
      this._highlighted.forEach(c => this.cellObs.get(c.key).next(c));
    }
  }

  setHint(num: number, skipHistory = false) {
    if (this.selected && this.selected.isEmpty()) {
      console.log(`set hint ${this.selected} ${num}`);
      this.pushMoveInHistory(['H', this.selected, num, null], skipHistory);
      this.board.setHint(this.selected, num);
      this.cellObs.get(this.selected.key).next(this.selected);
    }
  }

  private pushMoveInHistory(move: [string, ReadonlyCell, number, number], skip = false) {
    if (!skip) {
      if (this.historyPos < this.history.length) {
        this.history.splice(this.historyPos);
      }
      this.history.push(move);
      this.historyPos = this.history.length;
    }
  }

  private applyMoveFromHistory(isRedo = false) {
    const op = this.history[this.historyPos];
    if (op) {
      this._selected = null;
      this.selected = op[1];
      if (op[0] === 'N') {
        this.setNumber(isRedo ? op[3] : op[2], true);
      } else {
        this.setHint(op[2], true);
      }
    }
  }

  undo(): boolean {
    if (this.history.length && this.historyPos > 0) {
      this.historyPos -= 1;
      this.applyMoveFromHistory(false);
      return true;
    }
    return false;
  }

  redo(): boolean {
    if (this.history.length && this.historyPos < this.history.length) {
      this.applyMoveFromHistory(true);
      this.historyPos += 1;
      return true;
    }
    return false;
  }

  isUndoAvailable(): boolean {
    return this.historyPos > 0;
  }

  isRedoAvailable(): boolean {
    return this.history.length && this.historyPos < this.history.length;
  }

  getBoard(): Observable<ReadonlyBoard> {
    return this.boardObs.asObservable();
  }

  getCell(cell: ReadonlyCell): Observable<ReadonlyCell> {
    return this.cellObs.get(cell.key).asObservable();
  }

  newBoard() {
    this.createNewBoard();
    this.boardObs.next(this.board);
  }

  verify() {
    const b = new Board(this.board);
    b.generateSolution(false);
  }
}
