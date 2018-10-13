import {TestBed} from '@angular/core/testing';
import {emptyCell} from './cell';
import {Board} from './board';
import {HelperService} from './helper.service';

describe('Board', () => {
  Board.setHelper(new HelperService());
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created empty', () => {
    const board: Board = new Board();
    expect(board).toBeTruthy();
    expect(board.completed).toBeFalsy();
    expect(board.size).toEqual(9);
    board.forEach((cell) => expect(cell.num).toEqual(emptyCell));
  });

  it('should be completed', () => {
    const board: Board = new Board();
    board.generateSolution(true);
    expect(board).toBeTruthy();
    expect(board.completed).toBeTruthy();
    expect(board.size).toEqual(9);
    board.forEach((cell) => expect(cell.valid).toBeTruthy());
    board.forEach((cell) => expect(cell.num).toBeGreaterThan(0));
  });

  it('should be an easly level', () => {
    const board: Board = new Board();
    board.generateSolution(true);
    board.prepareBoardForGameplay(0);
    board.generateSolution(false);
    expect(board.completed).toBeTruthy();
    expect(board.stats.moves - board.stats.backMoves).toBeGreaterThanOrEqual(40);
    // expect(board.stats.backMoves).toBeLessThanOrEqual(5);
    expect(board.stats.choiceRange[0]).toBeLessThanOrEqual(2);
    expect(board.stats.choiceRange[2]).toBeLessThanOrEqual(5);
  });

  it('should be an medium level', () => {
    const board: Board = new Board();
    board.generateSolution(true);
    board.prepareBoardForGameplay(1);
    board.generateSolution(false);
    expect(board.completed).toBeTruthy();
    expect(board.stats.moves - board.stats.backMoves).toBeGreaterThanOrEqual(50);
    // expect(board.stats.backMoves).toBeLessThanOrEqual(15);
    expect(board.stats.choiceRange[0]).toBeLessThanOrEqual(5);
    expect(board.stats.choiceRange[2]).toBeLessThanOrEqual(15);
  });

  it('should be an difficult level', () => {
    const board: Board = new Board();
    board.generateSolution(true);
    board.prepareBoardForGameplay(2);
    board.generateSolution(false);
    expect(board.completed).toBeTruthy();
    expect(board.stats.moves - board.stats.backMoves).toBeGreaterThanOrEqual(57);
    expect(board.stats.choiceRange[2]).toBeGreaterThanOrEqual(5);
  });

});
