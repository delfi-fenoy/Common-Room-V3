import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal-services'; 
import { AuthService } from '../../../core/services/auth-service';

@Component({
    selector: 'app-sidebar',
    imports: [RouterLink],
    templateUrl: './sidebar.html',
    styleUrl: './sidebar.css',
})
export class Sidebar {
    // * ---- Inyección de Dependencias ----
    private modalService = inject(ModalService);
    private authService = inject(AuthService);

    // * ---- Estado Recibido desde App Component ----
    @Input() isOpen: boolean = false;

    // * ---- Evento para Notificar el Cierre ----
    @Output() closeSidebarEvent = new EventEmitter<void>();

    // * -------- Método para Validar si es Admin --------
    isAdmin(): boolean {
        return this.authService.getUserRole() === 'ADMIN';
    }

    // * -------- Método para Emitir Cierre --------
    closeSidebar(): void {
        this.closeSidebarEvent.emit();
    }

    // * -------- Abrir el Modal de Baneos --------
    openBanModal(): void {
        this.closeSidebar(); 
        this.modalService.openCustom('Banned Users Management');
    }
}