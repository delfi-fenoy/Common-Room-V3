import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BanReasonModal } from './ban-reason-modal';

describe('BanReasonModal', () => {
    let component: BanReasonModal;
    let fixture: ComponentFixture<BanReasonModal>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BanReasonModal],
        }).compileComponents();

        fixture = TestBed.createComponent(BanReasonModal);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
