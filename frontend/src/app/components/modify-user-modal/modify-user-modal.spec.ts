import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyUserModal } from './modify-user-modal';

describe('ModifyUserModal', () => {
  let component: ModifyUserModal;
  let fixture: ComponentFixture<ModifyUserModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyUserModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyUserModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
