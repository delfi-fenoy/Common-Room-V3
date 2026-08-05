import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { Modal } from '../../../shared/components/modal/modal';
import { ModalService } from '../../../shared/services/modal.services';

@Component({
    selector: 'app-register-page',
    imports: [ReactiveFormsModule, RouterLink, Modal],
    templateUrl: './register-page.html',
    styleUrl: '../styles/auth-forms.css',
})
export class RegisterPage {
    // * ---- Inyección de Dependencias ----
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    private modalService = inject(ModalService);

    // * ---- Estados Reactivos con Signals ----
    // Permite deshabilitar el botón mostrando un "spinner" en el mouse, mientras se procesa la solicitud.
    isSubmitting = signal<boolean>(false);

    // * ---- Formulario Reactivo ----
    // nonNullable = Garantiza que las propiedades del formulario nunca sean 'null' o 'undefined'.
    registerForm = this.fb.nonNullable.group({
        username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        email: ['', [Validators.required, Validators.maxLength(50), Validators.email]],
        profilePictureUrl: [
            '',
            [Validators.pattern(/^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,6}(:\d+)?(\/[^\s]*)?$/i)],
        ],
    });

    // ? <----- Helper/Getter de Accesos Directos ----->
    // Devuelve los controles del formulario (this.registerForm.controls) para simplificar la sintaxis en el HTML al validar errores (Ej: 'f.username' en lugar de 'registerForm.get("username")').
    get f() {
        return this.registerForm.controls;
    }

    // * -------- Metodo de Formulario --------
    onSubmit(): void {
        if (this.registerForm.invalid) {
            // Setea el estado 'touched' en todos los controles para forzar que el HTML muestre los errores
            this.registerForm.markAllAsTouched();
            return;
        }

        //Sirve para deshabilitar botones y evitar múltiples clicks
        this.isSubmitting.set(true);

        this.authService.register(this.registerForm.getRawValue()).subscribe({
            next: () => {
                // <----- New Modal Success Alert ----->
                this.modalService.openAlert('Success', 'Registration successful!', 'success');
                
                this.registerForm.reset();
                this.isSubmitting.set(false);
                this.router.navigate(['/']);
            },
            error: (e) => {
                console.error(e);
                this.isSubmitting.set(false);

                // <----- New Modal Error Alert ----->
                const errorMessage = e?.error?.message || 'Error creating account. Please try again later.';
                this.modalService.openAlert('Registration Error', errorMessage, 'error');
            },
        });
    }
}
