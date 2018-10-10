import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Board, ReadonlyBoard} from './board';
import {HelperService} from './helper.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  private current: Board;
  private history: Board[];
  private board: BehaviorSubject<ReadonlyBoard>;

  constructor(private helper: HelperService) {
    this.init(0);
  }

  private init(num: number) {
    console.log(`generate`);
    Board.setHelper(this.helper);
    this.current = new Board();
    this.current.generateSolution();
    this.history = [];
    this.board = new BehaviorSubject<ReadonlyBoard>(this.current);
  }

  setNumber(num: number) {
    if (num !== this.current.selected.num) {
      console.log(`set number ${this.current.selected.i},${this.current.selected.j} ${num}`);
      this.history.push(this.current);
      this.current = new Board(this.current);
      this.current.setNumber(this.current.selected, num);
      const sel = this.current.selected;
      this.current.selected = null;
      this.current.selected = sel;
      this.board.next(this.current);
    }
  }

  unsetNumber() {
    console.log(`unset number (${this.current.selected.i},${this.current.selected.j})`);
    this.history.push(this.current);
    this.current = new Board(this.current);
    this.current.unsetNumber(this.current.selected);
    const sel = this.current.selected;
    this.current.selected = null;
    this.current.selected = sel;
    this.board.next(this.current);
  }

  setHint(num: number) {
    console.log(`set hint ${this.current.selected.i},${this.current.selected.j} ${num}`);
    this.history.push(this.current);
    this.current = new Board(this.current);
    this.current.setHint(this.current.selected, num);
    this.board.next(this.current);
  }

  undo() {
    const res = this.history.pop();
    // FIXME handle case empty history
    this.board.next(this.current);
  }

  getBoard(): Observable<ReadonlyBoard> {
    return this.board.asObservable();
  }
}
