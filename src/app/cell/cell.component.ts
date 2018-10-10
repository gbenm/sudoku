import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Cell, ReadonlyCell} from '../cell';
import {BoardService} from '../board.service';
import {HelperService} from '../helper.service';
import {ReadonlyBoard} from '../board';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit, OnChanges {

  @Input() cell: ReadonlyCell;
  hints: Array<number>;
  board: ReadonlyBoard;

  constructor(private boardService: BoardService, private helper: HelperService) {
  }

  ngOnInit() {
    this.boardService.getBoard().subscribe((board) => {
      this.board = board;
    });
    this.calcHints();
  }

  private calcHints() {
    this.hints = new Array<number>(9);
    this.cell.hints.forEach((val, i, set) => this.hints[val - 1] = val);
  }

  get invalid(): boolean {
    return !this.cell.valid;
  }

  get modifiable(): boolean {
    return this.cell.modifiable;
  }

  get selected(): boolean {
    const sel = this.board.selected;
    return sel && sel === this.cell;
  }

  get highlighted(): boolean {
    return this.board.highlighted.has(this.cell);
  }

  get number(): number {
    return this.cell.num;
  }

  rowsIndex(): Array<number> {
    // FIXME
    return this.helper.progr(3);
  }

  rowHints(i: number): Array<number> {
    return this.hints.slice(i * 3, i * 3 + 3);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(`change ${changes}`);
    this.calcHints();
  }

}
