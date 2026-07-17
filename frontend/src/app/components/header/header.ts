import { Component, OnInit,  } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit{
  // * ---- Variables----
  searchForm !: FormGroup
  isLoggedIn : boolean = false;
  currentUser: string | null = null

  // * ====== Contructor | ngOnInit ======
  constructor(
    private router : Router, 
    private fb : FormBuilder,
    private auth : AuthService
  ) {}

  ngOnInit(): void {
    // Se ejecuta al inicio y se actualiza cada vez que cambie el estado (en auth service)
    this.auth.loggedIn$.subscribe(value => {
      this.isLoggedIn = value;
    });

    this.auth.username$.subscribe(username => {
      this.currentUser = username;
    });

    this.searchForm = this.fb.group({
      searchQuery: ['', Validators.required]
    })
  }

  // * -------- Metodo para la barra de busqueda -------- 
  onSearch() {
    if(this.searchForm.valid) {
      this.router.navigate(['/movies/search', this.searchForm.value.searchQuery])
      console.log(this.searchForm.value.searchQuery)
      this.searchForm.reset()
    }
  }

  logout(){
    alert('Log out...')
    this.auth.logout()
  }
}
