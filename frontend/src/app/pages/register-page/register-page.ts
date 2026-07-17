import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css'
})
export class RegisterPage implements OnInit{
  registerForm!: FormGroup

  constructor(private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ){}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      email: ['', [Validators.required, Validators.maxLength(50), Validators.email]],
      profilePictureUrl: ['', Validators.pattern(/^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,6}(:\d+)?(\/[^\s]*)?$/i)]
    })
  }

  onSubmit(){
    this.auth.register(this.registerForm.value).subscribe({
      next: (data) => {
        alert('Registration successful!')
        this.registerForm.reset()
        console.log(this.registerForm.value)
        this.router.navigate(['/'])
      },
      error: (e) => {console.error(e)}
    })
  }
}
