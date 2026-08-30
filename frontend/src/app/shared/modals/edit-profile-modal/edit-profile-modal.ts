import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { User, ChangePassword, TokenResponse } from '../../../core/models';
import { UserService } from '../../../core/services/user-service';
import { AuthService } from '../../../core/services/auth-service';
import { ModalService } from '../../services/modal-services';
import { Modal } from '../modal/modal';

@Component({
    selector: 'app-edit-profile-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, Modal],
    templateUrl: './edit-profile-modal.html',
    styleUrl: './edit-profile-modal.css',
})
export class EditProfileModal implements OnInit {
    // * ======== Inyección de Servicios ========
    private fb = inject(FormBuilder);
    private uService = inject(UserService);
    private authService = inject(AuthService);
    public modalService = inject(ModalService);
    private router = inject(Router); 

    // * ======== Entradas y Salidas ========
    @Input({ required: true }) user!: User;
    @Output() submitted = new EventEmitter<string>();

    // * ======== Estado de Pestañas ========
    activeTab: 'profile' | 'password' = 'profile';

    // * ======== Formularios ========
    profileForm!: FormGroup;
    passwordForm!: FormGroup;

    isLoadingProfile = false;
    isLoadingPassword = false;

    // <----- Signals para visibilidad de contraseñas ----->
    showOldPassword = signal<boolean>(false);
    showNewPassword = signal<boolean>(false);
    showConfirmPassword = signal<boolean>(false);

    ngOnInit(): void {
        this.initProfileForm();
        this.initPasswordForm();
    }

    // <----- Inicializar Formulario de Perfil (Validadores unificados con Register) ----->
    private initProfileForm(): void {
        this.profileForm = this.fb.group({
            username: [
                this.user?.username || '', 
                [Validators.required, Validators.minLength(5), Validators.maxLength(20)]
            ],
            profilePictureUrl: [
                this.user?.profilePictureUrl || '', 
                [Validators.pattern(/^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,6}(:\d+)?(\/[^\s]*)?$/i)]
            ],
            description: [this.user?.description || '', [Validators.maxLength(250)]],
        });
    }

    // <----- Inicializar Formulario de Contraseña (Validadores unificados con Register) ----->
    private initPasswordForm(): void {
        this.passwordForm = this.fb.group(
            {
                oldPassword: ['', [Validators.required]],
                newPassword: ['', [Validators.required, Validators.minLength(8)]],
                confirmPassword: ['', [Validators.required]],
            },
            { validators: this.passwordMatchValidator },
        );
    }

    // <----- Validador Custom: Confirmar Contraseña ----->
    private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const newPass = control.get('newPassword')?.value;
        const confirmPass = control.get('confirmPassword')?.value;
        return newPass && confirmPass && newPass !== confirmPass
            ? { passwordMismatch: true }
            : null;
    }

    // <----- Métodos para alternar visibilidad de contraseñas ----->
    toggleOldPassword(): void {
        this.showOldPassword.update(val => !val);
    }

    toggleNewPassword(): void {
        this.showNewPassword.update(val => !val);
    }

    toggleConfirmPassword(): void {
        this.showConfirmPassword.update(val => !val);
    }

    // * ======== Cambio de Pestaña ========
    setTab(tab: 'profile' | 'password'): void {
        this.activeTab = tab;
    }

    // * ======== Submit Perfil ========
    onSaveProfile(): void {
        if (this.profileForm.invalid) {
            this.profileForm.markAllAsTouched();
            return;
        }

        this.isLoadingProfile = true;
        const currentUsername = this.user.username;
        const updatedData: User = {
            ...this.user,
            ...this.profileForm.value,
        };

        const newUsername = updatedData.username;

        this.uService.updateUser(currentUsername, updatedData).subscribe({
            next: (data: TokenResponse | void) => {
                this.isLoadingProfile = false;

                if (data) {
                    this.authService.updateSession(data);
                }

                this.submitted.emit(newUsername);

                this.modalService.openAlert('Success', 'Profile updated successfully!', 'success');

                if (currentUsername !== newUsername) {
                    this.router.navigate(['/users', newUsername]);
                }
            },
            error: (err) => {
                console.error('Error updating profile:', err);
                this.isLoadingProfile = false;
                this.modalService.openAlert(
                    'Error',
                    'Could not update profile information.',
                    'error',
                );
            },
        });
    }

    // * ======== Submit Contraseña ========
    onChangePassword(): void {
        if (this.passwordForm.invalid) {
            this.passwordForm.markAllAsTouched();
            return;
        }

        this.isLoadingPassword = true;
        const dto: ChangePassword = this.passwordForm.value;

        this.uService.changePassword(this.user.username, dto).subscribe({
            next: () => {
                this.isLoadingPassword = false;
                this.passwordForm.reset();

                this.modalService.openAlert('Success', 'Password changed successfully!', 'success');
            },
            error: (err) => {
                console.error('Error changing password:', err);
                this.isLoadingPassword = false;
                this.modalService.openAlert(
                    'Error',
                    'Incorrect current password or update failed.',
                    'error',
                );
            },
        });
    }

    close(): void {
        this.modalService.close();
    }
}