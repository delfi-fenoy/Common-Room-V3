import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth-service';
import { ModalService } from '../../../shared/services/modal-services';
import { Modal } from '../../../shared/modals/modal/modal';

@Component({
    selector: 'app-register-page',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, Modal],
    templateUrl: './register-page.html',
    styleUrl: '../styles/auth-forms.css',
})
export class RegisterPage {
    // * ======== Inyección de Servicios ========
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private modalService = inject(ModalService);

    // * ======== Estados Reactivos con Signals ========
    isSubmitting = signal<boolean>(false);
    showPassword = signal<boolean>(false);

    // * ======== Formulario Reactivo ========
    registerForm = this.fb.nonNullable.group({
        username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        email: ['', [Validators.required, Validators.maxLength(50), Validators.email]],
        profilePictureUrl: [
            '',
            [Validators.pattern(/^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,6}(:\d+)?(\/[^\s]*)?$/i)],
        ],
    });

    // <----- Getter de Accesos Directos a Controles ----->
    get f() {
        return this.registerForm.controls;
    }

    // <----- Alternar Visibilidad de Contraseña ----->
    togglePassword(): void {
        this.showPassword.update((val) => !val);
    }

    // <----- Envío de Formulario de Registro ----->
    onSubmit(): void {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        this.isSubmitting.set(true);

        this.authService.register(this.registerForm.getRawValue()).subscribe({
            next: () => {
                this.modalService.openAlert('Success', 'Registration successful!', 'success');
                this.registerForm.reset();
                this.isSubmitting.set(false);
                this.router.navigate(['/']);
            },
            error: (e) => {
                console.error(e);
                this.isSubmitting.set(false);
                const errorMessage =
                    e?.error?.message || 'Error creating account. Please try again later.';
                this.modalService.openAlert('Registration Error', errorMessage, 'error');
            },
        });
    }
}