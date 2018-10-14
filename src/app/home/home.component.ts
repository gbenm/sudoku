import { Component, OnInit } from '@angular/core';
import {BoardService} from '../board.service';
import {SettingsService} from '../settings.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private boardService: BoardService, private settings: SettingsService) { }

  ngOnInit() {
  }

  isLevel(level) {
    return this.settings.level === level;
  }

  get level() {
    return this.settings.level;
  }

  setLevel(level) {
    this.settings.level = level;
  }

  gameExists() {
    return this.boardService.boardExists;
  }
}
