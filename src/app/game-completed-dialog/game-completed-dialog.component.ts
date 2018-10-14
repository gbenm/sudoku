import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-game-completed-dialog',
  templateUrl: './game-completed-dialog.component.html',
  styleUrls: ['./game-completed-dialog.component.scss']
})
export class GameCompletedDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<GameCompletedDialogComponent>) { }

  ngOnInit() {
  }

}
