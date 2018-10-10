import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Board, ReadonlyBoard} from './board';
import {HelperService} from './helper.service';
import {Cell, ReadonlyCell} from './cell';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private current: Board;
  private history: Array<[string, ReadonlyCell, number]>;
  private board: BehaviorSubject<ReadonlyBoard>;
  private cell: Map<string, BehaviorSubject<ReadonlyCell>>;
  private _selected: ReadonlyCell;
  private _highlighted: Set<ReadonlyCell>;

  constructor(private helper: HelperService) {
    this.init(0);
  }

  get selected(): ReadonlyCell {
    return this._selected;
  }

  set selected(cell: ReadonlyCell) {
    this._highlighted.clear();
    if (!cell || cell === this._selected) {
      this._selected = null;
    } else {
      this._selected = cell;
      this._highlighted.add(cell);
      if (cell.num > 0) {
        this.current.forEach((c) => {
          if (c.num === cell.num) {
            this._highlighted.add(c);
          }
        });
      }
      const ll = new Set<ReadonlyCell>();
      this._highlighted.forEach((c) => this.current.iterateOverRelatedCells(c, (fc) => ll.add(fc)));
      ll.forEach((c) => this._highlighted.add(c));
      this._highlighted.delete(cell);
    }
  }

  get highlighted(): Set<ReadonlyCell> {
    return this._highlighted;
  }

  private init(num: number) {
    console.log(`generate`);
    Board.setHelper(this.helper);
    this.createNewBoard();
    this.board = new BehaviorSubject<ReadonlyBoard>(this.current);
    this.cell = new Map<string, BehaviorSubject<ReadonlyCell>>();
    this.current.forEach(c => this.cell.set(c.key, new BehaviorSubject<ReadonlyCell>(c)));
  }

  private createNewBoard() {
    this.current = new Board();
    this.current.generateSolution();
    this.history = new Array<[string, Cell, number]>();
    this._selected = null;
    this._highlighted = new Set<ReadonlyCell>();
  }

  setNumber(num: number, skipHistory = false) {
    if (num !== this.selected.num) {
      console.log(`set number ${this.selected.i},${this.selected.j} ${num}`);
      if (!skipHistory) {
        this.history.push(['N', this.selected, this.selected.num]);
      }
      // this.current = new Board(this.current);
      this.current.setNum(this.selected, num);
      const sel = this.selected;
      this.selected = null;
      this.selected = sel;
      // this.board.next(this.current);
      this.cell.get(this.selected.key).next(this.selected);
      this._highlighted.forEach(c => this.cell.get(c.key).next(c));
    }
  }

  unsetNumber(skipHistory = false) {
    console.log(`unset number (${this.selected.i},${this.selected.j})`);
    if (!skipHistory) {
      this.history.push(['N', this.selected, this.selected.num]);
    }
    // this.current = new Board(this.current);
    this.current.unsetNum(this.selected);
    const sel = this.selected;
    this.selected = null;
    this.selected = sel;
    // this.board.next(this.current);
    this.cell.get(this.selected.key).next(this.selected);
    this._highlighted.forEach(c => this.cell.get(c.key).next(c));
  }

  setHint(num: number, skipHistory = false) {
    console.log(`set hint ${this.selected.i},${this.selected.j} ${num}`);
    if (!skipHistory) {
      this.history.push(['H', this.selected, num]);
    }
    // this.current = new Board(this.current);
    this.current.setHint(this.selected, num);
    // this.board.next(this.current);
    this.cell.get(this.selected.key).next(this.selected);
  }

  undo() {
    const op = this.history.pop();
    if (op) {
      this._selected = null;
      this.selected = op[1];
      if (op[0] === 'N') {
        if (op[2] === -1) {
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
    return this.board.asObservable();
  }

  getCell(cell: ReadonlyCell): Observable<ReadonlyCell> {
    return this.cell.get(cell.key).asObservable();
  }

  newBoard() {
    this.createNewBoard();
    this.board.next(this.current);
  }

  resetBoard() {
    while (this.history.length) {
      this.undo();
    }
  }
}
