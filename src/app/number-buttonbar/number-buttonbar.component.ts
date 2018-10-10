///<reference path="../board.service.ts"/>
import {Component, OnInit} from '@angular/core';
import {BoardService} from '../board.service';
import {Board, ReadonlyBoard} from '../board';
import {HelperService} from '../helper.service';

// TODO disable button when its number is all set

@Component({
  selector: 'app-number-buttonbar',
  templateUrl: './number-buttonbar.component.html',
  styleUrls: ['./number-buttonbar.component.scss']
})
export class NumberButtonbarComponent implements OnInit {

  board: ReadonlyBoard;

  constructor(private boardService: BoardService, private helper: HelperService) {
  }

  ngOnInit() {
    this.boardService.getBoard().subscribe((board) => {
      this.board = board;
    });
  }

  get buttons(): Array<number> {
    return this.helper.progr(this.board.size, 1);
  }

  get disabled(): boolean {
    return !this.board.selected || !this.board.selected.modifiable;
  }

  get unsetNumberDisabled(): boolean {
    return !this.board.selected || this.board.selected.num === -1 || !this.board.selected.modifiable;
  }

  setNumber(num: number) {
    console.log(`button set number ${num}`);
    this.boardService.setNumber(num);
  }

  unsetNumber() {
    console.log(`button unset number`);
    this.boardService.unsetNumber();
  }

}
