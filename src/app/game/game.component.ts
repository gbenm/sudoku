import {Component, OnDestroy, OnInit} from '@angular/core';
import {BoardService} from '../board.service';
import {HelperService} from '../helper.service';
import {emptyCell, ReadonlyCell} from '../cell';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog, MatSnackBar} from '@angular/material';
import {GameCompletedDialogComponent} from '../game-completed-dialog/game-completed-dialog.component';
import {Subscription} from 'rxjs';
import {SettingsService} from '../settings.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {

  buttonMode: boolean;
  private subscriptions: Array<Subscription>;
  showSpinner = false;

  constructor(private boardService: BoardService, private helper: HelperService, private route: ActivatedRoute,
              private snackBar: MatSnackBar, private dialog: MatDialog, private router: Router, private settings: SettingsService) {
  }

  ngOnInit() {
    console.log('game init');
    this.subscriptions = [];
    this.subscriptions.push(this.boardService.getHintAvailable().subscribe(c => this.showHint(c)));
    this.subscriptions.push(this.boardService.getGameCompleted().subscribe(() => this.gameCompleted()));
    this.subscriptions.push(this.boardService.getBoardSolvableCheck().subscribe((res) => this.solvableCheck(res)));
    if (!this.boardService.boardExists) {
      this.newBoard();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private newBoard() {
    this.showSpinner = true;
    this.boardService.newBoard().subscribe(b => { this.showSpinner = false; });
  }

  new() {
    this.newBoard();
  }

  replay() {
    while (this.boardService.undo()) {
    }
  }

  undo() {
    console.log(`undo`);
    this.boardService.undo();
  }

  undoDisabled(): boolean {
    return !this.boardService.isUndoAvailable();
  }

  redo() {
    console.log(`redo`);
    this.boardService.redo();
  }

  redoDisabled(): boolean {
    return !this.boardService.isRedoAvailable();
  }

  verify() {
    this.boardService.checkForSolvability();
  }

  buttons(): Array<number> {
    return this.helper.progr(this.boardService.boardSize, 1);
  }

  buttonClicked(num: number) {
    if (this.boardService.selected) {
      if (this.buttonMode) {
        if (this.settings.manualHints) {
          this.boardService.setHint(num);
        }
      } else if (this.boardService.selected.modifiable) {
        //   console.log(`button set number ${num}`);
        this.boardService.setNumber(num);
      }
    }
  }

  // disabled(num: number): boolean {
  //   return !this.boardService.selected || !this.boardService.selected.modifiable || !this.numbersAvailable(num);
  // }

  buttonModeDisabled(): boolean {
    return !this.settings.manualHints;
  }

  unsetNumberDisabled(): boolean {
    return !this.boardService.selected || this.boardService.selected.isEmpty() || !this.boardService.selected.modifiable || this.buttonMode;
  }

  numbers(num: number): number {
    return this.boardService.numbers.get(num).size;
  }

  numbersAvailable(num: number): boolean {
    return this.numbers(num) < this.boardService.boardSize;
  }

  unsetNumber() {
    console.log(`button unset number`);
    this.boardService.setNumber(emptyCell);
  }

  hint() {
    this.boardService.calculateHint();
  }

  private showHint(c: ReadonlyCell) {
    if (c && c.hints.size) {
      this.boardService.selected = c;
      const num = c.hints.values().next().value;
      const numMsg = c.hints.size > 1 ? `numbers ${c.hints}` : `number ${num}`;
      const snackBarRef = this.snackBar.open(`The ${numMsg} can be set in position (${c.i + 1}, ${c.j + 1})`, 'Set number',
        {duration: this.helper.snackBarDuration});
      snackBarRef.onAction().subscribe(() => {
        console.log(`execute hint ${num}`);
        if (this.boardService.selected !== c) {
          this.boardService.selected = c;
        }
        this.boardService.setNumber(num);
      });
    } else {
      this.snackBar.open('The board contains some errors. Resolve them first!',
        'Got it', {duration: this.helper.snackBarDuration});
    }
  }

  private gameCompleted() {
    console.log(`game completed`);
    const dialog = this.dialog.open(GameCompletedDialogComponent);
    dialog.afterClosed().subscribe(result => {
      console.log(`result ${result}`);
      if (result) {
        this.newBoard();
      } else {
        this.boardService.clearBoard();
        this.router.navigate(['/home']);
      }
    });
  }

  private solvableCheck(res: [boolean, boolean]) {
    if (!res[1]) {
      const snackBarRef = this.snackBar.open('The board is not correct! Try clearing all invalid cells', 'Clear all invalid cells',
        {duration: this.helper.snackBarDuration});
      snackBarRef.onAction().subscribe(() => {
        this.boardService.clearInvalidCells();
      });
    } else if (!res[0]) {
      const snackBarRef = this.snackBar.open('The board is not solvable! Check again after correction', 'Undo last move',
        {duration: this.helper.snackBarDuration});
      snackBarRef.onAction().subscribe(() => this.undo());
    } else {
      this.snackBar.open('The board is solvable!', 'Got it', {duration: this.helper.snackBarDuration});
    }
  }
}
