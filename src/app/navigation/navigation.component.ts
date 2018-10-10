import {Component} from '@angular/core';
import {BreakpointObserver, Breakpoints, BreakpointState} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BoardService} from '../board.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches)
    );

  constructor(private breakpointObserver: BreakpointObserver, private boardService: BoardService) {
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

}
