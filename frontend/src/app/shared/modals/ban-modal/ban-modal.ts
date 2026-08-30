import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserbanService } from '../../../core/services/userban-service';
import { UserBanResponse } from '../../../core/models/bans/user-ban-response';
import { ModalService } from '../../../shared/services/modal-services';
import { Modal } from '../modal/modal'; // <----- Importar Modal genérico

@Component({
    selector: 'app-ban-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, Modal], // <----- Agregar Modal a los imports
    templateUrl: './ban-modal.html',
    styleUrl: './ban-modal.css',
})
export class BanModal {
    private userBanService = inject(UserbanService);
    public modalService = inject(ModalService);

    searchQuery: string = '';
    
    // Estado del usuario buscado
    lastBan: UserBanResponse | null = null;
    historyBans: UserBanResponse[] = [];
    
    // Desplegables
    isLastBanExpanded: boolean = true;
    isHistoryExpanded: boolean = false;
    
    isLoading = false;
    isProcessing = false;
    hasSearched = false;

    // <----- Búsqueda manual por nombre de usuario ----->
    onSearch(): void {
        const query = this.searchQuery.trim();
        if (!query) return;

        this.isLoading = true;
        this.hasSearched = true;
        this.lastBan = null;
        this.historyBans = [];

        // Traemos la información del último ban o historial
        this.userBanService.getUserLastBanInfo(query).subscribe({
            next: (banInfo) => {
                this.isLoading = false;
                if (banInfo) {
                    this.lastBan = banInfo;
                    // Si existe un endpoint para el historial completo de bans del usuario, se asigna a historyBans
                }
            },
            error: () => {
                this.isLoading = false;
                this.lastBan = null;
                this.historyBans = [];
            }
        });
    }

    toggleLastBan(): void {
        this.isLastBanExpanded = !this.isLastBanExpanded;
    }

    toggleHistory(): void {
        this.isHistoryExpanded = !this.isHistoryExpanded;
    }

    unbanUser(username: string): void {
        this.isProcessing = true;
        this.userBanService.unbanUser(username).subscribe({
            next: () => {
                this.isProcessing = false;
                this.modalService.openAlert('Success', `User @${username} has been unbanned.`, 'success');
                this.onSearch(); // Recargar estado del usuario
            },
            error: (err) => {
                this.isProcessing = false;
                console.error('Error unbanning user:', err);
                this.modalService.openAlert('Error', 'Could not unban the user.', 'error');
            }
        });
    }

    onClose(): void {
        this.modalService.close();
    }
}