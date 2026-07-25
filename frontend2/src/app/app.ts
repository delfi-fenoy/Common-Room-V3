import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Sidebar } from './shared/components/sidebar/sidebar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend2');

  // Estado para la barra lateral/sidebar
  isSidebarOpen = signal(false);

  // <----- Toggle Sidebar State ----->
  onToggleSidebar(): void {
    this.isSidebarOpen.update(prev => !prev);
  }

  // <----- Close Sidebar ----->
  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }
}