import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberButtonbarComponent } from './number-buttonbar.component';

describe('NumberButtonbarComponent', () => {
  let component: NumberButtonbarComponent;
  let fixture: ComponentFixture<NumberButtonbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberButtonbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberButtonbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
