import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalService } from '../../../shared/services/modal-services';

@Component({
    selector: 'app-ban-reason-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ban-reason-modal.html',
    styleUrl: './ban-reason-modal.css'
})
export class BanReasonModal {
    @Input({ required: true }) username!: string;
    @Output() confirmed = new EventEmitter<string>();

    public modalService = inject(ModalService);
    reason: string = '';

    onConfirm(): void {
        if (this.reason.trim()) {
            this.confirmed.emit(this.reason.trim());
        }
    }

    onCancel(): void {
        this.modalService.close();
    }
}