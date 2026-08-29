import { TestBed } from '@angular/core/testing';

import { UserbanService } from './userban-service';

describe('UserbanService', () => {
    let service: UserbanService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UserbanService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
