import { Component, HostListener, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { PlaylistPreview } from '../../../core/models';
import { PlaylistService } from '../../../core/services/playlist-service';

@Component({
    selector: 'app-playlists-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './playlists-list.html',
    styleUrl: './playlists-list.css',
})
export class PlaylistsList implements OnInit {
    // * ======== Inyección de Servicios ========
    private pService = inject(PlaylistService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private titleService = inject(Title);
    private cdr = inject(ChangeDetectorRef);

    // * ======== Variables de Estado ========
    playlists: PlaylistPreview[] = [];
    currentPage = 1;
    hasMorePages = true;
    isLoading = false;
    showScrollTopBtn = false;

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        this.titleService.setTitle('Playlists | Common Room');

        // Redirección a 404 si la URL contiene query params no permitidos
        if (Object.keys(this.route.snapshot.queryParams).length > 0) {
            this.router.navigate(['/404']);
            return;
        }

        this.loadPlaylists();
    }

    // ! -------- Método para cargar Playlists Públicas desde el Backend --------
    loadPlaylists(): void {
        if (this.isLoading || !this.hasMorePages) return;
        this.isLoading = true;

        this.pService.getPublicPlaylists(this.currentPage).subscribe({
            next: (pageResponse) => {
                this.playlists = [...this.playlists, ...pageResponse.content];
                this.hasMorePages = !pageResponse.last;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (e) => {
                console.error('Error al obtener la lista pública de playlists:', e);
                this.isLoading = false;
                this.cdr.detectChanges();
            },
        });
    }

    // ! -------- Listener de Scroll Global para Infinito --------
    @HostListener('window:scroll', [])
    onWindowScroll(): void {
        this.showScrollTopBtn = window.scrollY > 400;

        const scrollPosition = window.innerHeight + window.scrollY;
        const threshold = document.documentElement.scrollHeight - 600;

        if (
            scrollPosition >= threshold &&
            !this.isLoading &&
            this.hasMorePages &&
            this.playlists.length > 0
        ) {
            this.currentPage++;
            this.loadPlaylists();
        }
    }

    // ? ----- Método para volver hacia arriba -----
    scrollToTop(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // * -------- Métodos para reemplazar imágenes fallidas --------
    noPlaylistPicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/playlist-noimg.jpg';
    }

    noUserPicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/user-noimg.jpg';
    }
}