import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend2');

  // Estado para la barra lateral/sidebar
  isSidebarOpen = signal(false);

  onToggleSidebar(): void {
    // <----- Toggle Sidebar State ----->
    this.isSidebarOpen.update(prev => !prev);
  }
}