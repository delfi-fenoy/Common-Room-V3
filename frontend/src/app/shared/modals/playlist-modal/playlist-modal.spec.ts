import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaylistModal } from './playlist-modal';

describe('PlaylistModal', () => {
    let component: PlaylistModal;
    let fixture: ComponentFixture<PlaylistModal>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlaylistModal],
        }).compileComponents();

        fixture = TestBed.createComponent(PlaylistModal);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
