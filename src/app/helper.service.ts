import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  snackBarDuration = 30000;

  constructor() { }

  progr(n: number, start: number = 0): Array<number> {
    return Array.from(new Array(n), (val, index) => start + index);
  }


  getRandom(size: number): number {
    return Math.floor(Math.random() * size);
  }

  shuffle<T>(a: Array<T>) {
    for (let k = 0; k < a.length; k++) {
      const r = k + Math.floor(Math.random() * (a.length - k));
      [a[k], a[r]] = [a[r], a[k]];
    }
  }

  cartesian(a: number[], b: number[]): number[][] {
    return [].concat(...a.map(d => b.map(e => [].concat(d, e))))
  }

}
