import { Component, input, OnInit, output } from '@angular/core';
import { User } from '../../models/User';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user-service';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modify-user-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './modify-user-modal.html',
  styleUrl: './modify-user-modal.css'
})
export class ModifyUserModal implements OnInit{
  // * ======== Variables ========
  user = input<User>();
  close = output<void>();
  submitted = output<void>();
  editProfileForm!: FormGroup;

  // * ======== Contructor | ngOnInit ========
  constructor(
    private router : Router,
    private uService: UserService,
    private auth: AuthService,
    private fb: FormBuilder,
  ){}

  ngOnInit(): void {
    this.editProfileForm = this.fb.group({
      username:[this.user()?.username ?? '',  
        [Validators.required, Validators.minLength(5), Validators.maxLength(20)]],
      email:[this.user()?.email ?? '', 
        [Validators.required, Validators.maxLength(50), Validators.email]],
        description: [this.user()?.description ?? '', 
          Validators.maxLength(255)],
      profilePictureUrl:[this.user()?.profilePictureUrl ?? '', 
        Validators.pattern(/^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,6}(:\d+)?(\/[^\s]*)?$/i)]
    })
  }

  // ! ====== Metodo Submit ======
  onSubmit(){
    const dto: User = this.editProfileForm.value
    const currentUsername = this.user()?.username
    console.log("Antes Update - CurrentUsername (Viejo): " + currentUsername)
    
    this.uService.updateUser(currentUsername!, dto).subscribe({
      next: (data) =>{
        console.log("Despues Update: DTO (Nuevo): " + dto.username)

        if(currentUsername !== dto.username){
          this.auth.saveTokens(data!)
          this.router.navigate(['/users', dto.username])
        } else {
          this.submitted.emit();
        }
        alert("Profile updated!")
        this.closeModal();
      },
      error: (e) =>{console.error("Error en el Llamado de Modal" + e)}
    })
  }

  closeModal(){ // Agregar animacion | Caso contrario moverlo a OnSubmit
    this.close.emit();
  }

}
