import {TestBed} from '@angular/core/testing';

import {BoardService} from './board.service';

describe('BoardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BoardService = TestBed.get(BoardService);
    expect(service).toBeTruthy();
  });

  // it('createBoard should create an valid board', () => {
  //   const service: BoardService = TestBed.get(BoardService);
  //   service.createBoard(0);
  //   console.log(service.current);
  //   expect(service.current).toBeTruthy();
  //   expect(service.current.valid).toBeTruthy();
  // });

  // it('createBoard should fill board correctly', () => {
  //   const service: BoardService = TestBed.get(BoardService);
  //   service.createBoard(5);
  //   console.log(service.current);
  //   expect(service.current).toBeTruthy();
  //   expect(service.current.valid).toBeTruthy();
  // });

});
