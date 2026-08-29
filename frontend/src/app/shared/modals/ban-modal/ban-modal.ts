import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserbanService } from '../../../core/services/userban-service';
import { UserBanResponseDTO } from '../../../core/models/bans/user-ban-response';
import { ModalService } from '../../../shared/services/modal-services';

@Component({
    selector: 'app-ban-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ban-modal.html',
    styleUrl: './ban-modal.css',
})
export class BanModal implements OnInit {
    // * ======== Inyección de Servicios ========
    private userBanService = inject(UserbanService);
    public modalService = inject(ModalService);

    // * ======== Estado ========
    searchQuery: string = '';
    bannedUsers: UserBanResponseDTO[] = [];
    isLoading = false;

    ngOnInit(): void {
        // Inicialización si es requerida
    }

    // <----- Buscar ban activo de un usuario por username ----->
    onSearch(): void {
        if (!this.searchQuery.trim()) return;

        this.isLoading = true;
        this.userBanService.getUserLastBanInfo(this.searchQuery.trim()).subscribe({
            next: (banInfo) => {
                this.isLoading = false;
                // Si el usuario está actualmente baneado (no tiene unbannedAt)
                if (!banInfo.unbannedAt) {
                    if (!this.bannedUsers.some(u => u.id === banInfo.id)) {
                        this.bannedUsers.unshift(banInfo);
                    }
                } else {
                    this.modalService.openAlert('Info', 'This user is currently not banned.', 'success');
                }
            },
            error: (err) => {
                this.isLoading = false;
                console.error('Ban record not found:', err);
                this.modalService.openAlert('Not Found', 'No active ban record found for this username.', 'error');
            }
        });
    }

    // <----- Desbanear usuario directamente ----->
    unbanUser(username: string): void {
        this.userBanService.unbanUser(username).subscribe({
            next: () => {
                this.modalService.openAlert('Success', `User ${username} has been unbanned.`, 'success');
                // Remover de la lista visual local
                this.bannedUsers = this.bannedUsers.filter(b => b.bannedUsername !== username);
            },
            error: (err) => {
                console.error('Error unbanning user:', err);
                this.modalService.openAlert('Error', 'Could not unban the user.', 'error');
            }
        });
    }

    onClose(): void {
        this.modalService.close();
    }
}