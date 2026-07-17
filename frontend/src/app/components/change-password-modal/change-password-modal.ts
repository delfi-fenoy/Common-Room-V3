import { Component, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { AuthService } from '../../services/auth-service';
import ChangePassword from '../../models/ChangePassword';
import { User } from '../../models/User';

@Component({
  selector: 'app-change-password-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password-modal.html',
  styleUrl: './change-password-modal.css'
})
export class ChangePasswordModal implements OnInit{
  // * ======== Variables ========
  passwordForm!:FormGroup;
  user = input<User>();
  close = output<void>();
  submitted = output<void>();
  passwordError: string | null = null
  passwordSuccess: string | null = null

  // * ======== Contructor | ngOnInit ========
  constructor(
    private router: Router,
    private uService : UserService,
    private auth : AuthService,
    private fb: FormBuilder
  ){}

  ngOnInit(): void {
    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    })
  }

  // ! ====== Metodo Submit ======
  onSubmit(){
    const dto: ChangePassword = this.passwordForm.value
    const username = this.user()?.username

    this.uService.changePassword(username!, dto).subscribe({
      next: () => {
        alert("Password updated!")
        this.closeModal();
      },
      error: (e) => {
        console.error(e)
        this.passwordError = e.error.message || "Error changing password. Please check your old password and try again."
        this.passwordSuccess = null
      }
    })

  }

  closeModal(){ // Agregar animacion | Caso contrario moverlo a OnSubmit
    this.close.emit();
  }
}
