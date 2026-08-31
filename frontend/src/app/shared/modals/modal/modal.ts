import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal-services';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [],
    templateUrl: './modal.html',
    styleUrl: './modal.css',
})
export class Modal {
    // * ======== Inyección de Servicios ========
    public modalService = inject(ModalService);
}