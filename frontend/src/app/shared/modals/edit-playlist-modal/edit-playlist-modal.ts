import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlaylistDetails } from '../../../core/models';
import { PlaylistService } from '../../../core/services/playlist-service';
import { ModalService } from '../../services/modal-services';

@Component({
    selector: 'app-edit-playlist-modal',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
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

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        this.initForm();
    }

    // <----- Inicializar Formulario Reactivo con Datos de la Playlist ----->
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

    // <----- Enviar Cambios de la Playlist al Servidor ----->
    onSubmit(): void {
        if (this.editForm.invalid) {
            this.editForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const updatedData: Partial<PlaylistDetails> = this.editForm.value;

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

    // <----- Cancelar y Cerrar Modal ----->
    onCancel(): void {
        this.modalService.close();
    }
}