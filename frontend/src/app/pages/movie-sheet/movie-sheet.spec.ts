import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieSheet } from './movie-sheet';

describe('MovieSheet', () => {
  let component: MovieSheet;
  let fixture: ComponentFixture<MovieSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieSheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
