import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup
  loginError: boolean = false // variable en caso que los datos del login sean incorrectos

  constructor(private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ){}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  onSubmit(){
    this.auth.login(this.loginForm.value).subscribe({
      next: (data) => {
        this.loginForm.reset()
        this.router.navigate(['/'])
      },
      error: (e) => {
        console.error(e)
        this.loginError = true
      }
    })
  }
}
