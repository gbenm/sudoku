import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  manualHints = false;
  level = 0;

  constructor() { }
}
