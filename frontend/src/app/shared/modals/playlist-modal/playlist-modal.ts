import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    inject,
    ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { PlaylistService } from '../../../core/services/playlist-service';
import { ModalService } from '../../services/modal-services';
import { MovieDetails, PlaylistDetails, PlaylistPreview } from '../../../core/models';

@Component({
    selector: 'app-playlist-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './playlist-modal.html',
    styleUrl: './playlist-modal.css',
})
export class PlaylistModal implements OnInit {
    // * ======== Inyección de Servicios ========
    private playlistService = inject(PlaylistService);
    public modalService = inject(ModalService);
    private cdr = inject(ChangeDetectorRef);

    // * ======== Inputs y Outputs ========
    @Input() mode: 'create' | 'add-movie' = 'add-movie';
    @Input() movie: MovieDetails | null = null;
    @Output() playlistCreated = new EventEmitter<PlaylistDetails>();

    // * ======== Estado para Modo 'add-movie' ========
    playlists: PlaylistPreview[] = [];
    initialMovieMap: Map<number, boolean> = new Map();
    selectedMovieMap: Map<number, boolean> = new Map();
    searchQuery: string = '';
    isLoadingPlaylists: boolean = true;
    isSavingChanges: boolean = false;

    // * ======== Estado para Modo 'create' ========
    playlistName: string = '';
    playlistDescription: string = '';
    isPrivate: boolean = false;
    isSubmitting: boolean = false;

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        if (this.mode === 'add-movie' && this.movie) {
            this.loadUserPlaylists();
        }
    }

    // <----- Carga Inicial de Playlists del Usuario ----->
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
            },
        });
    }

    // <----- Verificar si la Película ya Pertenece a las Playlists ----->
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
                    const isPresent =
                        moviesPage.content?.some((m) => m.id === this.movie?.id) ?? false;
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
                },
            });
        });
    }

    // <----- Getters para Filtrar Listas según Selección y Búsqueda ----->
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

    // <----- Confirmar y Guardar Cambios de Películas en Playlists ----->
    onConfirmSave(): void {
        if (!this.movie || this.isSavingChanges) return;

        this.isSavingChanges = true;
        const requests: Observable<any>[] = [];

        this.playlists.forEach((playlist) => {
            const initialStatus = this.initialMovieMap.get(playlist.id) || false;
            const currentStatus = this.selectedMovieMap.get(playlist.id) || false;

            if (!initialStatus && currentStatus) {
                // Agregar película
                requests.push(this.playlistService.addMovieToPlaylist(playlist.id, this.movie!.id));
            } else if (initialStatus && !currentStatus) {
                // Eliminar película
                requests.push(
                    this.playlistService.deleteMovieFromPlaylist(playlist.id, this.movie!.id),
                );
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
                this.modalService.openAlert(
                    'Success',
                    'Playlists updated successfully!',
                    'success',
                );
            },
            error: (err) => {
                console.error('Error updating movie in playlists:', err);
                this.isSavingChanges = false;
                this.closeModal();
                this.modalService.openAlert('Error', 'Failed to update playlists.', 'error');
            },
        });
    }

    // <----- Cambiar a Vista de Crear Playlist ----->
    switchToCreateMode(): void {
        this.mode = 'create';
    }

    // <----- Crear Nueva Playlist ----->
    onCreateSubmit(): void {
        if (!this.playlistName.trim() || this.isSubmitting) return;

        this.isSubmitting = true;
        const newPlaylistData = {
            name: this.playlistName.trim(),
            description: this.playlistDescription.trim(),
            isPrivate: this.isPrivate,
        };

        this.playlistService.createPlaylist(newPlaylistData as PlaylistDetails).subscribe({
            next: (created) => {
                this.isSubmitting = false;
                this.playlistCreated.emit(created);

                // Si viene de agregarse desde una película, vincularla inmediatamente
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
                        },
                    });
                } else {
                    this.closeModal();
                    this.modalService.openAlert(
                        'Success',
                        'Playlist created successfully!',
                        'success',
                    );
                }
            },
            error: (err) => {
                console.error('Error creating playlist:', err);
                this.isSubmitting = false;
                this.closeModal();
                this.modalService.openAlert('Error', 'Could not create playlist.', 'error');
                this.cdr.markForCheck();
            },
        });
    }

    // <----- Cerrar Modal ----->
    closeModal(): void {
        this.modalService.close();
    }
}