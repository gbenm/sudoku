import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {ReadonlyCell} from '../cell';
import {BoardService} from '../board.service';
import {HelperService} from '../helper.service';

@Component({
  selector: 'app-cell',
  templateUrl: './cell.component.html',
  styleUrls: ['./cell.component.scss']
})
export class CellComponent implements OnInit {

  @Input() cell: ReadonlyCell;
  hints: Array<number>;

  constructor(private boardService: BoardService, private helper: HelperService) {
  }

  ngOnInit() {
    this.boardService.getCell(this.cell).subscribe((c) => {
      // console.log(`${this.cell}: observe change ${c}`);
      this.calcHints();
    });
  }

  private calcHints() {
    // console.log(`calc hints ${this.cell}`);
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
    const sel = this.boardService.selected;
    return sel && sel === this.cell;
  }

  get highlighted(): boolean {
    return this.boardService.highlighted.has(this.cell) && !this.sameNumber;
  }

  get sameNumber(): boolean {
    return this.boardService.selected && !this.boardService.selected.isEmpty() && this.cell !== this.boardService.selected &&
      this.cell.num === this.boardService.selected.num;
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

  selectCell(cell: ReadonlyCell) {
    this.boardService.selected = cell;
  }

}
