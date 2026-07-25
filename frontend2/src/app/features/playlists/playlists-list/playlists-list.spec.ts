import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistsList } from './playlists-list';

describe('PlaylistsList', () => {
  let component: PlaylistsList;
  let fixture: ComponentFixture<PlaylistsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaylistsList],
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
