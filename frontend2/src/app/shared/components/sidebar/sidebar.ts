import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.css',
})
export class Sidebar {
    // * ---- Estado Recibido desde App Component ----
    @Input() isOpen: boolean = false;

    // * ---- Evento para Notificar el Cierre ----
    @Output() closeSidebarEvent = new EventEmitter<void>();

    // * -------- Método para Emitir Cierre --------
    closeSidebar(): void {
        // <----- Close Sidebar ----->
        this.closeSidebarEvent.emit();
    }
}
