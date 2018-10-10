import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HintButtonbarComponent } from './hint-buttonbar.component';

describe('HintButtonbarComponent', () => {
  let component: HintButtonbarComponent;
  let fixture: ComponentFixture<HintButtonbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HintButtonbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HintButtonbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
