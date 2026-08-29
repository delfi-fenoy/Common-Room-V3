import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistSheet } from './playlist-sheet';

describe('PlaylistSheet', () => {
    let component: PlaylistSheet;
    let fixture: ComponentFixture<PlaylistSheet>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlaylistSheet],
        }).compileComponents();

        fixture = TestBed.createComponent(PlaylistSheet);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
