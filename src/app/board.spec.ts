import {TestBed} from '@angular/core/testing';

import {BoardService} from './board.service';
import {Board, generateSolution} from './board';

describe('Board', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const board: Board = new Board();
    expect(board).toBeTruthy();
    expect(board.completed).toBeFalsy();
    expect(board.cells.size).toEqual(81);
    board.cells.forEach((cell, key, map) => expect(cell.num).toEqual(-1));
  });

  it('should be filled correctly', () => {
    const board: Board = generateSolution();
    expect(board).toBeTruthy();
    expect(board.completed).toBeTruthy();
    expect(board.cells.size).toEqual(81);
    board.cells.forEach((cell, key, map) => expect(cell.num).toBeGreaterThan(0));
  });

});
