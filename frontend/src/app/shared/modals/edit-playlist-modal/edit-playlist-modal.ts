import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaylistDetails } from '../../../core/models';
import { PlaylistService } from '../../../core/services/playlist-service';
import { ModalService } from '../../services/modal-services';
import { Modal } from '../modal/modal';

@Component({
    selector: 'app-edit-playlist-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, Modal],
    templateUrl: './edit-playlist-modal.html',
    styleUrl: './edit-playlist-modal.css',
})
export class EditPlaylistModal implements OnInit {
    // * ======== Inyección de Servicios ========
    private fb = inject(FormBuilder);
    private pService = inject(PlaylistService);
    public modalService = inject(ModalService);

    // * ======== Inputs y Outputs ========
    @Input({ required: true }) playlist!: PlaylistDetails;
    @Output() submitted = new EventEmitter<void>();

    // * ======== Formulario Reactivo y Estado ========
    editForm!: FormGroup;
    isSaving = false;

    ngOnInit(): void {
        this.initForm();
    }

    // <----- Inicializar Formulario con Límites de BDD ----->
    private initForm(): void {
        this.editForm = this.fb.group({
            name: [this.playlist?.name || '', [Validators.required, Validators.maxLength(30)]],
            description: [this.playlist?.description || '', [Validators.maxLength(255)]],
            pictureUrl: [
                this.playlist?.pictureUrl || '',
                [Validators.pattern(/^(https?:\/\/)?([\w\-]+\.)+[a-z]{2,6}(:\d+)?(\/[^\s]*)?$/i)],
            ],
            isPrivate: [this.playlist?.isPrivate ?? false],
        });
    }

    onCancel(): void {
        this.modalService.close();
    }

    onSubmit(): void {
        if (this.editForm.invalid) {
            this.editForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const updatedData: Partial<PlaylistDetails> = this.editForm.value;

        // <----- Modify Playlist ----->
        this.pService.modifyPlaylist(this.playlist.id, updatedData).subscribe({
            next: () => {
                this.isSaving = false;
                this.modalService.openAlert('Success', 'Playlist updated successfully.', 'success');
                this.submitted.emit();
            },
            error: (err) => {
                console.error('Error updating playlist:', err);
                this.isSaving = false;
                this.modalService.openAlert('Error', 'Could not update the playlist.', 'error');
            },
        });
    }
}
