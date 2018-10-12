import {Component, Input, OnInit} from '@angular/core';
import {BoardService} from '../board.service';
import {HelperService} from '../helper.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {

  buttonMode: boolean;

  constructor(private boardService: BoardService, private helper: HelperService) {
  }

  ngOnInit() {
  }

  new() {
    this.boardService.newBoard();
  }

  replay() {
    this.boardService.resetBoard();
  }

  undoLastMove() {
    this.boardService.undo();
  }

  isUndoAvailable(): boolean {
    return this.boardService.isUndoAvailable();
  }

  verify() {
    this.boardService.verify();
  }

  buttons(): Array<number> {
    console.log(`buttons`);
    return this.helper.progr(this.boardService.boardSize, 1);
  }

  buttonClicked(num: number) {
    if (this.boardService.selected) {
      if (this.buttonMode) {
        this.boardService.setHint(num);
      } else if (this.boardService.selected.modifiable) {
        //   console.log(`button set number ${num}`);
        this.boardService.setNumber(num);
      }
    }
  }

  // disabled(num: number): boolean {
  //   return !this.boardService.selected || !this.boardService.selected.modifiable || !this.numbersAvailable(num);
  // }

  unsetNumberDisabled(): boolean {
    return !this.boardService.selected || this.boardService.selected.isEmpty() || !this.boardService.selected.modifiable;
  }

  numbers(num: number): number {
    return this.boardService.numbers.get(num).size;
  }

  numbersAvailable(num: number): boolean {
    return this.numbers(num) < this.boardService.boardSize;
  }

  // setNumber(num: number) {
  //   console.log(`button set number ${num}`);
  //   this.boardService.setNumber(num);
  // }

  unsetNumber() {
    console.log(`button unset number`);
    this.boardService.unsetNumber();
  }

  // setHint(num: number) {
  //   this.boardService.setHint(num);
  // }

}
