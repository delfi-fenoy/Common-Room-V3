import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPlaylistModal } from './edit-playlist-modal';

describe('EditPlaylistModal', () => {
    let component: EditPlaylistModal;
    let fixture: ComponentFixture<EditPlaylistModal>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditPlaylistModal],
        }).compileComponents();

        fixture = TestBed.createComponent(EditPlaylistModal);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
