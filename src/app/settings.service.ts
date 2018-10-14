import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  manualHints = false;
  level = 'easy';

  constructor() { }
}
