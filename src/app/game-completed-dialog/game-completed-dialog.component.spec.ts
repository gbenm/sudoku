import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GameCompletedDialogComponent } from './game-completed-dialog.component';

describe('GameCompletedDialogComponent', () => {
  let component: GameCompletedDialogComponent;
  let fixture: ComponentFixture<GameCompletedDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GameCompletedDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GameCompletedDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
