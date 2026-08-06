import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlaylistService } from '../../../core/services/playlist-service';
import { AuthService } from '../../../core/services/auth-service';
import { PlaylistRequest, PlaylistPreview, PlaylistResponse, MovieBase } from '../../../core/models';

@Component({
    selector: 'app-playlists-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './playlists-list.html',
    styleUrl: './playlists-list.css',
})
export class PlaylistsList implements OnInit {
    activeTab = signal<'public' | 'my' | 'user' | 'search'>('public');

    playlists = signal<PlaylistPreview[]>([]);
    isLoading = signal<boolean>(false);
    errorMessage = signal<string | null>(null);
    successMessage = signal<string | null>(null);

    targetUsername = signal<string>('');
    searchQuery = signal<string>('');
    currentPage = signal<number>(1);
    totalPages = signal<number>(1);

    showForm = signal<boolean>(false);
    editingPlaylistId = signal<number | null>(null);
    formData: PlaylistRequest = {
        name: '',
        description: '',
        isPrivate: false,
        pictureUrl: '',
    };

    // <----- Estado Reactivo para Gestión de Películas ----->
    showMoviesModal = signal<boolean>(false);
    selectedPlaylist = signal<PlaylistPreview | null>(null);
    playlistMovies = signal<MovieBase[]>([]);
    movieIdInput = signal<number | null>(null);
    isLoadingMovies = signal<boolean>(false);

    constructor(
        private playlistService: PlaylistService,
        public authService: AuthService
    ) {}

    ngOnInit(): void {
        this.loadPublicPlaylists();
    }

    private mapPreviews(items: PlaylistPreview[]): PlaylistPreview[] {
        return items.map((item: any) => ({
            ...item,
            isPrivate: item.isPrivate ?? item.private ?? false,
        }));
    }

    private handleError(error: any): void {
        this.isLoading.set(false);
        this.isLoadingMovies.set(false);
        if (error.error && typeof error.error === 'object' && error.error.message) {
            this.errorMessage.set(`[${error.status}] ${error.error.message}`);
        } else if (typeof error.error === 'string') {
            this.errorMessage.set(`[${error.status}] ${error.error}`);
        } else {
            this.errorMessage.set(`Error (${error.status}): No se pudo completar la operación.`);
        }
    }

    private clearMessages(): void {
        this.errorMessage.set(null);
        this.successMessage.set(null);
    }

    // * -------- Carga de Listas --------

    loadPublicPlaylists(page: number = 1): void {
        this.clearMessages();
        this.activeTab.set('public');
        this.isLoading.set(true);
        this.currentPage.set(page);

        this.playlistService.getPublicPlaylists(page).subscribe({
            next: (res) => {
                this.playlists.set(this.mapPreviews(res.content));
                this.totalPages.set(res.totalPages);
                this.isLoading.set(false);
            },
            error: (err) => this.handleError(err),
        });
    }

    loadMyPlaylists(page: number = 1): void {
        this.clearMessages();
        this.activeTab.set('my');
        this.isLoading.set(true);
        this.currentPage.set(page);

        this.playlistService.getMyPlaylists(page).subscribe({
            next: (res) => {
                this.playlists.set(this.mapPreviews(res.content));
                this.totalPages.set(res.totalPages);
                this.isLoading.set(false);
            },
            error: (err) => this.handleError(err),
        });
    }

    loadUserPlaylists(page: number = 1): void {
        const username = this.targetUsername().trim();
        if (!username) return;

        this.clearMessages();
        this.activeTab.set('user');
        this.isLoading.set(true);
        this.currentPage.set(page);

        this.playlistService.getUserPlaylists(username, page).subscribe({
            next: (res) => {
                this.playlists.set(this.mapPreviews(res.content));
                this.totalPages.set(res.totalPages);
                this.isLoading.set(false);
            },
            error: (err) => this.handleError(err),
        });
    }

    searchPlaylists(page: number = 1): void {
        const query = this.searchQuery().trim();
        if (!query) return;

        this.clearMessages();
        this.activeTab.set('search');
        this.isLoading.set(true);
        this.currentPage.set(page);

        this.playlistService.searchPlaylists(query, page).subscribe({
            next: (res) => {
                this.playlists.set(this.mapPreviews(res.content));
                this.totalPages.set(res.totalPages);
                this.isLoading.set(false);
            },
            error: (err) => this.handleError(err),
        });
    }

    // * -------- ABM Formulario Playlist --------

    openCreateForm(): void {
        this.clearMessages();
        this.editingPlaylistId.set(null);
        this.formData = { name: '', description: '', isPrivate: false, pictureUrl: '' };
        this.showForm.set(true);
    }

    openEditForm(preview: PlaylistPreview): void {
        this.clearMessages();
        this.isLoading.set(true);

        this.playlistService.getPlaylistById(preview.id).subscribe({
            next: (fullPlaylist: PlaylistResponse) => {
                this.editingPlaylistId.set(fullPlaylist.id);
                const isPrivateVal = fullPlaylist.isPrivate ?? (fullPlaylist as any).private ?? false;

                this.formData = {
                    name: fullPlaylist.name || '',
                    description: fullPlaylist.description || '',
                    isPrivate: Boolean(isPrivateVal),
                    pictureUrl: fullPlaylist.pictureUrl || '',
                };

                this.isLoading.set(false);
                this.showForm.set(true);
            },
            error: (err) => this.handleError(err),
        });
    }

    closeForm(): void {
        this.showForm.set(false);
        this.editingPlaylistId.set(null);
    }

    savePlaylist(): void {
        this.clearMessages();
        this.isLoading.set(true);

        const payload: any = {
            name: this.formData.name,
            description: this.formData.description,
            pictureUrl: this.formData.pictureUrl,
            isPrivate: Boolean(this.formData.isPrivate),
            private: Boolean(this.formData.isPrivate),
        };

        const editId = this.editingPlaylistId();

        if (editId) {
            this.playlistService.modifyPlaylist(editId, payload).subscribe({
                next: () => {
                    this.successMessage.set('Playlist modificada con éxito');
                    this.isLoading.set(false);
                    this.closeForm();
                    this.refreshCurrentTab();
                },
                error: (err) => this.handleError(err),
            });
        } else {
            this.playlistService.createPlaylist(payload).subscribe({
                next: () => {
                    this.successMessage.set('Playlist creada con éxito');
                    this.isLoading.set(false);
                    this.closeForm();
                    this.loadMyPlaylists();
                },
                error: (err) => this.handleError(err),
            });
        }
    }

    deletePlaylist(id: number): void {
        if (!confirm('¿Estás seguro de que deseas eliminar esta playlist?')) return;
        this.clearMessages();
        this.isLoading.set(true);

        this.playlistService.deletePlaylist(id).subscribe({
            next: () => {
                this.successMessage.set('Playlist eliminada correctamente');
                this.isLoading.set(false);
                this.refreshCurrentTab();
            },
            error: (err) => this.handleError(err),
        });
    }

    // <----- GESTIÓN DE PELÍCULAS EN LA PLAYLIST ----->

    openMoviesModal(playlist: PlaylistPreview): void {
        this.clearMessages();
        this.selectedPlaylist.set(playlist);
        this.showMoviesModal.set(true);
        this.loadPlaylistMovies(playlist.id);
    }

    closeMoviesModal(): void {
        this.showMoviesModal.set(false);
        this.selectedPlaylist.set(null);
        this.playlistMovies.set([]);
        this.movieIdInput.set(null);
    }

    loadPlaylistMovies(playlistId: number): void {
        this.isLoadingMovies.set(true);
        this.playlistService.getMovieListByPlaylistId(playlistId).subscribe({
            next: (res) => {
                this.playlistMovies.set(res.content);
                this.isLoadingMovies.set(false);
            },
            error: (err) => this.handleError(err),
        });
    }

    addMovieToPlaylist(): void {
        const playlist = this.selectedPlaylist();
        const movieId = this.movieIdInput();

        if (!playlist || !movieId) return;

        this.clearMessages();
        this.isLoadingMovies.set(true);

        this.playlistService.addMovieToPlaylist(playlist.id, movieId).subscribe({
            next: () => {
                this.successMessage.set(`Película ID ${movieId} agregada correctamente`);
                this.movieIdInput.set(null);
                this.loadPlaylistMovies(playlist.id);
            },
            error: (err) => this.handleError(err),
        });
    }

    removeMovieFromPlaylist(movieId: number): void {
        const playlist = this.selectedPlaylist();
        if (!playlist) return;

        this.clearMessages();
        this.isLoadingMovies.set(true);

        this.playlistService.deleteMovieFromPlaylist(playlist.id, movieId).subscribe({
            next: () => {
                this.successMessage.set(`Película ID ${movieId} eliminada de la lista`);
                this.loadPlaylistMovies(playlist.id);
            },
            error: (err) => this.handleError(err),
        });
    }

    private refreshCurrentTab(): void {
        const tab = this.activeTab();
        if (tab === 'public') this.loadPublicPlaylists(this.currentPage());
        else if (tab === 'my') this.loadMyPlaylists(this.currentPage());
        else if (tab === 'user') this.loadUserPlaylists(this.currentPage());
        else if (tab === 'search') this.searchPlaylists(this.currentPage());
    }
}