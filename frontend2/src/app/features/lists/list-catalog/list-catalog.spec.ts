import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCatalog } from './list-catalog';

describe('ListCatalog', () => {
  let component: ListCatalog;
  let fixture: ComponentFixture<ListCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCatalog],
    }).compileComponents();

    fixture = TestBed.createComponent(ListCatalog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
