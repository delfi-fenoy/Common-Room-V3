import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

@Component({
    selector: 'app-login-page',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './login-page.html',
    styleUrl: '../styles/auth-forms.css',
})
export class LoginPage {
    // * ---- Inyección de Dependencias ----
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);

    // * ---- Estados Reactivos con Signals ----
    loginError = signal<boolean>(false);
    isSubmitting = signal<boolean>(false);

    // * ---- Formulario Reactivo ----
    loginForm = this.fb.nonNullable.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    // * -------- Metodo de Formulario --------
    onSubmit(): void {
        if (this.loginForm.invalid) return;

        this.isSubmitting.set(true);
        this.loginError.set(false);

        this.authService.login(this.loginForm.getRawValue()).subscribe({
            next: () => {
                this.loginForm.reset();
                this.isSubmitting.set(false);
                this.router.navigate(['/']);
            },
            error: (e) => {
                console.error(e);
                this.loginError.set(true);
                this.isSubmitting.set(false);
            },
        });
    }
}
