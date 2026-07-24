import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {
  // IDs y parámetros dummy para probar rutas dinámicas
  sampleMovieId = 1;
  sampleSearchQuery = 'batman';
  sampleUsername = 'ianfrancano';
}