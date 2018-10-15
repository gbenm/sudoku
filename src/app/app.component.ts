import {Component, HostBinding, OnDestroy, OnInit} from '@angular/core';
import {OverlayContainer} from '@angular/cdk/overlay';
import {SettingsService} from './settings.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'sudoku';
  @HostBinding('class') componentCssClass;
  private subscription: Subscription;

  constructor(private overlayContainer: OverlayContainer, private settings: SettingsService) {
  }

  ngOnInit() {
    this.subscription = this.settings.theme$.subscribe(theme => this.onSetTheme(theme));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onSetTheme(theme) {
    this.overlayContainer.getContainerElement().classList.add(theme);
    this.componentCssClass = theme;
  }


}
