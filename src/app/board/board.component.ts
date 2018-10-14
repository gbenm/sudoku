import {Component, Input, OnInit} from '@angular/core';
import {ReadonlyBoard} from '../board';
import {BoardService} from '../board.service';
import {ReadonlyCell} from '../cell';
import {HelperService} from '../helper.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {

  @Input() board: ReadonlyBoard;

  constructor(private boardService: BoardService, private helper: HelperService) {
  }

  ngOnInit() {
    this.boardService.getBoard().subscribe((board) => {
      this.board = board;
    });
  }

  rows(): Array<number> {
    return this.helper.progr(this.boardService.boardSize);
  }

  cells(i: number): Array<ReadonlyCell> {
    const cells = new Array<ReadonlyCell>(this.boardService.boardSize);
    for (let j = 0; j < this.boardService.boardSize; j++) {
      cells[j] = this.board.getCell(i, j);
    }

    return cells;
  }

  tdClass(cell): string {
    const vert = ['top', 'center', 'center'];
    const hor = ['middle', 'middle', 'right'];
    return `board-${cell.i === this.boardService.boardSize - 1 ? 'bottom' : vert[cell.i % 3]}-${cell.j === 0 ? 'left' : hor[cell.j % 3]}`;
  }

  invalid(): boolean {
    return !this.boardService.solvable;
  }
}
