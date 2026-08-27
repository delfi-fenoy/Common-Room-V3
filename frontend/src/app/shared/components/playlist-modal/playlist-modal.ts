import { Component, Input, Output, EventEmitter, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { PlaylistService } from '../../../core/services/playlist-service';
import { ModalService } from '../../services/modal-services';
import { Modal } from '../modal/modal';
import { MovieDetails, PlaylistDetails, PlaylistPreview } from '../../../core/models';

@Component({
    selector: 'app-playlist-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, Modal],
    templateUrl: './playlist-modal.html',
    styleUrl: './playlist-modal.css',
})
export class PlaylistModal implements OnInit {
    // * ======== Inputs & Outputs ========
    @Input() mode: 'create' | 'add-movie' = 'add-movie';
    @Input() movie: MovieDetails | null = null;
    @Output() playlistCreated = new EventEmitter<PlaylistDetails>();

    // * ======== Inyección de Servicios ========
    private playlistService = inject(PlaylistService);
    public modalService = inject(ModalService);
    private cdr = inject(ChangeDetectorRef);

    // * ======== Estado de 'add-movie' Mode ========
    playlists: PlaylistPreview[] = [];
    
    // <----- Tracking Local para Confirmar Cambios ----->
    initialMovieMap: Map<number, boolean> = new Map();
    selectedMovieMap: Map<number, boolean> = new Map();

    searchQuery: string = '';
    isLoadingPlaylists: boolean = true;
    isSavingChanges: boolean = false;

    // * ======== Estado de Formulario 'create' Mode ========
    playlistName: string = '';
    playlistDescription: string = '';
    isPrivate: boolean = false;
    isSubmitting: boolean = false;

    ngOnInit(): void {
        if (this.mode === 'add-movie' && this.movie) {
            this.loadUserPlaylists();
        }
    }

    // <----- Carga de Playlists del Usuario ----->
    loadUserPlaylists(): void {
        this.isLoadingPlaylists = true;
        this.playlistService.getMyPlaylists(1).subscribe({
            next: (response) => {
                this.playlists = response.content || [];
                this.checkMovieInPlaylists();
            },
            error: (err) => {
                console.error('Error fetching playlists:', err);
                this.isLoadingPlaylists = false;
                this.cdr.markForCheck();
            }
        });
    }

    // <----- Verificar Presencia de la Película en cada Playlist ----->
    private checkMovieInPlaylists(): void {
        if (!this.movie || this.playlists.length === 0) {
            this.isLoadingPlaylists = false;
            this.cdr.markForCheck();
            return;
        }

        let pendingChecks = this.playlists.length;

        this.playlists.forEach((playlist) => {
            this.playlistService.getMovieListByPlaylistId(playlist.id, 1).subscribe({
                next: (moviesPage) => {
                    const isPresent = moviesPage.content?.some((m) => m.id === this.movie?.id) ?? false;
                    this.initialMovieMap.set(playlist.id, isPresent);
                    this.selectedMovieMap.set(playlist.id, isPresent);
                    pendingChecks--;
                    if (pendingChecks === 0) {
                        this.isLoadingPlaylists = false;
                        this.cdr.markForCheck();
                    }
                },
                error: () => {
                    this.initialMovieMap.set(playlist.id, false);
                    this.selectedMovieMap.set(playlist.id, false);
                    pendingChecks--;
                    if (pendingChecks === 0) {
                        this.isLoadingPlaylists = false;
                        this.cdr.markForCheck();
                    }
                }
            });
        });
    }

    // <----- Filtrar Listas según Estado y Búsqueda ----->
    get inPlaylists(): PlaylistPreview[] {
        const query = this.searchQuery.trim().toLowerCase();
        return this.playlists.filter((p) => {
            const isSelected = this.selectedMovieMap.get(p.id) || false;
            const matchesSearch = !query || p.name.toLowerCase().includes(query);
            return isSelected && matchesSearch;
        });
    }

    get notInPlaylists(): PlaylistPreview[] {
        const query = this.searchQuery.trim().toLowerCase();
        return this.playlists.filter((p) => {
            const isSelected = this.selectedMovieMap.get(p.id) || false;
            const matchesSearch = !query || p.name.toLowerCase().includes(query);
            return !isSelected && matchesSearch;
        });
    }

    // <----- Seleccionar / Desseleccionar Playlist Localmente ----->
    togglePlaylistSelection(playlistId: number): void {
        const current = this.selectedMovieMap.get(playlistId) || false;
        this.selectedMovieMap.set(playlistId, !current);
        this.cdr.markForCheck();
    }

    // <----- Confirmar y Guardar Cambios en Servidor ----->
    onConfirmSave(): void {
        if (!this.movie || this.isSavingChanges) return;

        this.isSavingChanges = true;
        const requests: Observable<any>[] = [];

        this.playlists.forEach((playlist) => {
            const initialStatus = this.initialMovieMap.get(playlist.id) || false;
            const currentStatus = this.selectedMovieMap.get(playlist.id) || false;

            if (!initialStatus && currentStatus) {
                // <----- Agregar Película a la Lista ----->
                requests.push(this.playlistService.addMovieToPlaylist(playlist.id, this.movie!.id));
            } else if (initialStatus && !currentStatus) {
                // <----- Eliminar Película de la Lista ----->
                requests.push(this.playlistService.deleteMovieFromPlaylist(playlist.id, this.movie!.id));
            }
        });

        if (requests.length === 0) {
            this.isSavingChanges = false;
            this.closeModal();
            return;
        }

        forkJoin(requests).subscribe({
            next: () => {
                this.isSavingChanges = false;
                this.closeModal();
                this.modalService.openAlert('Success', 'Playlists updated successfully!', 'success');
            },
            error: (err) => {
                console.error('Error updating movie in playlists:', err);
                this.isSavingChanges = false;
                this.closeModal();
                this.modalService.openAlert('Error', 'Failed to update playlists.', 'error');
            }
        });
    }

    // <----- Cambiar a Modo Crear Playlist ----->
    switchToCreateMode(): void {
        this.mode = 'create';
    }

    // <----- Submit de Formulario Crear Playlist ----->
    onCreateSubmit(): void {
        if (!this.playlistName.trim() || this.isSubmitting) return;

        this.isSubmitting = true;
        const newPlaylistData = {
            name: this.playlistName.trim(),
            description: this.playlistDescription.trim(),
            isPrivate: this.isPrivate
        };

        this.playlistService.createPlaylist(newPlaylistData as PlaylistDetails).subscribe({
            next: (created) => {
                this.isSubmitting = false;
                this.playlistCreated.emit(created);

                if (this.movie) {
                    this.playlistService.addMovieToPlaylist(created.id, this.movie.id).subscribe({
                        next: () => {
                            this.mode = 'add-movie';
                            this.playlistName = '';
                            this.playlistDescription = '';
                            this.isPrivate = false;
                            this.loadUserPlaylists();
                        },
                        error: () => {
                            this.mode = 'add-movie';
                            this.loadUserPlaylists();
                        }
                    });
                } else {
                    this.closeModal();
                    this.modalService.openAlert('Success', 'Playlist created successfully!', 'success');
                }
            },
            error: (err) => {
                console.error('Error creating playlist:', err);
                this.isSubmitting = false;
                this.closeModal();
                this.modalService.openAlert('Error', 'Could not create playlist.', 'error');
                this.cdr.markForCheck();
            }
        });
    }

    // <----- Cerrar Modal ----->
    closeModal(): void {
        this.modalService.close();
    }
}