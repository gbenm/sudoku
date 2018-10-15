import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  manualHints = false;
  level = 'easy';
  _theme = 'theme';
  private themeObs: BehaviorSubject<string>;

  constructor() {
    this.themeObs = new BehaviorSubject<string>(this._theme);
  }

  get theme(): string {
    return this._theme;
  }

  set theme(theme: string) {
    this._theme = theme;
    this.themeObs.next(theme);
  }

  get theme$(): Observable<string> {
    return this.themeObs.asObservable();
  }

}
