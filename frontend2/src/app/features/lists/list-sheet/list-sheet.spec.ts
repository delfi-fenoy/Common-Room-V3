import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSheet } from './list-sheet';

describe('ListSheet', () => {
  let component: ListSheet;
  let fixture: ComponentFixture<ListSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSheet],
    }).compileComponents();

    fixture = TestBed.createComponent(ListSheet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
