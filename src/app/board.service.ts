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
  private history: Array<[string, ReadonlyCell, number]>;
  private boardObs: BehaviorSubject<ReadonlyBoard>;
  private cellObs: Map<string, BehaviorSubject<ReadonlyCell>>;
  private _selected: ReadonlyCell;
  private _highlighted: Set<ReadonlyCell>;
  private _numbers: Map<number, Set<ReadonlyCell>>;


  constructor(private helper: HelperService) {
    this.init(0);
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
    this.board.generateSolution();
    this.history = new Array<[string, ReadonlyCell, number]>();
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

  setNumber(num: number, skipHistory = false) {
    if (num !== this.selected.num) {
      console.log(`set number ${this.selected} ${num}`);
      if (!skipHistory) {
        this.history.push(['N', this.selected, this.selected.num]);
      }
      if (!this._selected.isEmpty()) {
        this._numbers.get(this._selected.num).delete(this._selected);
      }
      this._numbers.get(num).add(this._selected);
      this.board.setNum(this.selected, num);
      // hack to force highlights update
      const sel = this.selected;
      this.selected = null;
      this.selected = sel;
      this.cellObs.get(this.selected.key).next(this.selected);
      this._highlighted.forEach(c => this.cellObs.get(c.key).next(c));
    }
  }

  unsetNumber(skipHistory = false) {
    console.log(`unset number ${this.selected}`);
    if (!skipHistory) {
      this.history.push(['N', this.selected, this.selected.num]);
    }
    // this.board = new Board(this.board);
    this._numbers.get(this.selected.num).delete(this.selected);
    this.board.unsetNum(this.selected);
    const sel = this.selected;
    this.selected = null;
    this.selected = sel;
    // this.boardObs.next(this.board);
    this.cellObs.get(this.selected.key).next(this.selected);
    this._highlighted.forEach(c => this.cellObs.get(c.key).next(c));
  }

  setHint(num: number, skipHistory = false) {
    console.log(`set hint ${this.selected} ${num}`);
    if (!skipHistory) {
      this.history.push(['H', this.selected, num]);
    }
    // this.board = new Board(this.board);
    this.board.setHint(this.selected, num);
    // this.boardObs.next(this.board);
    this.cellObs.get(this.selected.key).next(this.selected);
  }

  undo() {
    const op = this.history.pop();
    if (op) {
      this._selected = null;
      this.selected = op[1];
      if (op[0] === 'N') {
        if (op[2] === emptyCell) {
          this.unsetNumber(true);
        } else {
          this.setNumber(op[2], true);
        }
      } else {
        this.setHint(op[2], true);
      }
    }
  }

  isUndoAvailable(): boolean {
    return this.history.length > 0;
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

  resetBoard() {
    while (this.history.length) {
      this.undo();
    }
  }

  verify() {
    const b = new Board(this.board);
    b.generateSolution();
  }
}
