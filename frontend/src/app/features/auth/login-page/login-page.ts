import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth-service';
import { ModalService } from '../../../shared/services/modal-services';
import { Modal } from '../../../shared/modals/modal/modal';

@Component({
    selector: 'app-login-page',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, Modal],
    templateUrl: './login-page.html',
    styleUrl: '../styles/auth-forms.css',
})
export class LoginPage {
    // * ======== Inyección de Servicios ========
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private modalService = inject(ModalService);

    // * ======== Estados Reactivos con Signals ========
    loginError = signal<boolean>(false);
    isSubmitting = signal<boolean>(false);
    showPassword = signal<boolean>(false);

    // * ======== Formulario Reactivo ========
    loginForm = this.fb.nonNullable.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    // <----- Alternar Visibilidad de Contraseña ----->
    togglePassword(): void {
        this.showPassword.update((val) => !val);
    }

    // <----- Envío de Formulario de Inicio de Sesión ----->
    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.isSubmitting.set(true);
        this.loginError.set(false);

        this.authService.login(this.loginForm.getRawValue()).subscribe({
            next: () => {
                this.modalService.openAlert('Success', 'Login successful!', 'success');
                this.loginForm.reset();
                this.isSubmitting.set(false);
                this.router.navigate(['/']);
            },
            error: (e) => {
                console.error(e);
                this.isSubmitting.set(false);
                const errorMessage =
                    e?.error?.message ||
                    'Invalid access. Please check your credentials and try again.';
                this.modalService.openAlert('Login Failed', errorMessage, 'error');
            },
        });
    }
}