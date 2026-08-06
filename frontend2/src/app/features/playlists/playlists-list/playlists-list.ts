import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-playlists-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './playlists-list.html',
    styleUrl: './playlists-list.css',
})
export class PlaylistsList implements OnInit {
    ngOnInit(): void {
        throw new Error('Method not implemented.');
    }
  
}