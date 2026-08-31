import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../shared/services/modal-services';

@Component({
    selector: 'app-ban-reason-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ban-reason-modal.html',
    styleUrl: './ban-reason-modal.css',
})
export class BanReasonModal {
    // * ======== Inyección de Servicios ========
    public modalService = inject(ModalService);

    // * ======== Inputs y Outputs ========
    @Input({ required: true }) username!: string;
    @Output() confirmed = new EventEmitter<string>();

    // * ======== Estado del Formulario ========
    reason: string = '';

    // <----- Confirmar Motivo de Baneo y Emitir Evento ----->
    onConfirm(): void {
        if (this.reason.trim()) {
            this.confirmed.emit(this.reason.trim());
        }
    }

    // <----- Cancelar y Cerrar Modal ----->
    onCancel(): void {
        this.modalService.close();
    }
}