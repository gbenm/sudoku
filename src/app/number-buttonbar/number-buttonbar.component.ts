///<reference path="../board.service.ts"/>
import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';
import {BoardService} from '../board.service';
import {Board, ReadonlyBoard} from '../board';
import {HelperService} from '../helper.service';
import {ReadonlyCell} from '../cell';

// TODO disable button when its number is all set

@Component({
  selector: 'app-number-buttonbar',
  templateUrl: './number-buttonbar.component.html',
  styleUrls: ['./number-buttonbar.component.scss']
})
export class NumberButtonbarComponent implements OnInit {

  constructor(private boardService: BoardService, private helper: HelperService) {
  }

  ngOnInit() {
  }

  buttons(): Array<number> {
    console.log(`buttons`);
    return this.helper.progr(this.boardService.boardSize, 1);
  }

  disabled(num: number): boolean {
    return !this.boardService.selected || !this.boardService.selected.modifiable || !this.numbersAvailable(num);
  }

  unsetNumberDisabled(): boolean {
    return !this.boardService.selected || this.boardService.selected.isEmpty() || !this.boardService.selected.modifiable;
  }

  numbers(num: number): number {
    return this.boardService.numbers.get(num).size;
  }

  numbersAvailable(num: number): boolean {
    return this.numbers(num) < this.boardService.boardSize;
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
