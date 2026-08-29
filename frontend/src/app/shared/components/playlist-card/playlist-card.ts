import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PlaylistPreview } from '../../../core/models';

@Component({
    selector: 'app-playlist-card',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './playlist-card.html',
    styleUrl: './playlist-card.css',
})
export class PlaylistCard {
    // <----- Entrada de la Playlist a mostrar ----->
    @Input({ required: true }) playlist!: PlaylistPreview;

    // <----- Métodos para reemplazar imágenes fallidas ----->
    noPlaylistPicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/playlist-noimg.jpg';
    }

    noUserPicture(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/img/default-img/user-noimg.jpg';
    }
}