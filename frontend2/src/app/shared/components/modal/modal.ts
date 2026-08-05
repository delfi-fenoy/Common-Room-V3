import { Component, inject } from '@angular/core';
import { ModalService } from '../../services/modal.services';

@Component({
    selector: 'app-modal',
    imports: [],
    templateUrl: './modal.html',
    styleUrl: './modal.css',
})
export class Modal {
    // * ---- Inyección de Dependencias ----
    public modalService = inject(ModalService);
}
