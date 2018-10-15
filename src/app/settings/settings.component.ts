import {Component, OnInit} from '@angular/core';
import {SettingsService} from '../settings.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor(private settings: SettingsService, private location: Location) {
  }

  ngOnInit() {
  }

  get manualHints(): boolean {
    return this.settings.manualHints;
  }

  set manualHints(v: boolean) {
    this.settings.manualHints = v;
  }

  get theme(): string {
    return this.settings.theme;
  }

  set theme(theme: string) {
    this.settings.theme = theme;
  }

  back() {
    this.location.back();
  }

}
