import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, catchError, of } from 'rxjs';
import { UserbanService } from '../../../core/services/userban-service';
import { UserBanResponse } from '../../../core/models/bans/user-ban-response';
import { UserBanPreview } from '../../../core/models/bans/user-ban-preview';
import { ModalService } from '../../../shared/services/modal-services';
import { Modal } from '../modal/modal';

@Component({
    selector: 'app-ban-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, Modal],
    templateUrl: './ban-modal.html',
    styleUrl: './ban-modal.css',
})
export class BanModal {
    // * ======== Inyección de Servicios ========
    private userBanService = inject(UserbanService);
    public modalService = inject(ModalService);
    private cdr = inject(ChangeDetectorRef);

    // * ======== Estado de Búsqueda y Resultados ========
    searchQuery: string = '';
    lastBan: UserBanResponse | null = null;
    historyBans: UserBanPreview[] = [];

    // * ======== Estado de Paginación Simple (4 por página) ========
    historyCurrentPage: number = 1;
    hasMorePages: boolean = false;
    isLoadingHistory: boolean = false;

    // * ======== Estado de Desplegables ========
    isLastBanExpanded: boolean = true;
    isHistoryExpanded: boolean = false;

    // * ======== Indicadores de Carga y Flujo ========
    isLoading = false;
    isProcessing = false;
    hasSearched = false;

    // <----- Normalizar Arreglo / Respuesta Paginada Backend ----->
    private extractBanArray(data: any): UserBanPreview[] {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        if (Array.isArray(data.content)) return data.content;
        return [];
    }

    // <----- Búsqueda Manual por Nombre de Usuario ----->
    onSearch(): void {
        const query = this.searchQuery.trim();
        if (!query) return;
        this.isLoading = true;
        this.hasSearched = true;
        this.lastBan = null;
        this.historyBans = [];
        this.historyCurrentPage = 1;
        this.hasMorePages = false;

        forkJoin({
            lastBan: this.userBanService.getUserLastBanInfo(query).pipe(catchError(() => of(null))),
            history: this.userBanService.getUserBanHistory(query, 1).pipe(catchError(() => of([]))),
        }).subscribe({
            next: (res) => {
                this.isLoading = false;
                this.lastBan = res.lastBan;
                const bans = this.extractBanArray(res.history);
                this.historyBans = bans;
                this.hasMorePages = bans.length === 4;
                this.cdr.detectChanges();
            },

            error: (err) => {
                this.isLoading = false;
                this.lastBan = null;
                this.historyBans = [];
                this.hasMorePages = false;
                this.cdr.detectChanges();
                console.error('Error fetching user ban data:', err);
            },
        });
    }

    // <----- Cargar Página Específica del Historial ----->
    loadHistoryPage(page: number): void {
        const query = this.searchQuery.trim();
        if (!query || page < 1) return;
        this.isLoadingHistory = true;

        this.userBanService.getUserBanHistory(query, page).subscribe({
            next: (data) => {
                const bans = this.extractBanArray(data);
                if (bans.length === 0) {
                    this.hasMorePages = false;
                    this.isLoadingHistory = false;
                    this.cdr.detectChanges();
                    return;
                }
                this.historyBans = bans;
                this.historyCurrentPage = page;
                this.hasMorePages = bans.length === 4;
                this.isLoadingHistory = false;
                this.cdr.detectChanges();
            },

            error: (err) => {
                this.isLoadingHistory = false;

                console.error('Error fetching ban history page:', err);

                this.cdr.detectChanges();
            },
        });
    }

    // <----- Alternar Apertura del Último Baneo ----->
    toggleLastBan(): void {
        this.isLastBanExpanded = !this.isLastBanExpanded;
    }

    // <----- Alternar Apertura del Historial de Baneos ----->
    toggleHistory(): void {
        this.isHistoryExpanded = !this.isHistoryExpanded;
    }

    // <----- Desbanear Usuario Activo ----->
    unbanUser(username: string): void {
        this.isProcessing = true;

        this.userBanService.unbanUser(username).subscribe({
            next: () => {
                this.isProcessing = false;

                this.modalService.openAlert(
                    'Success',
                    `User @${username} has been unbanned.`,
                    'success',
                );

                this.onSearch();
            },

            error: (err) => {
                this.isProcessing = false;

                console.error('Error unbanning user:', err);

                this.modalService.openAlert('Error', 'Could not unban the user.', 'error');
            },
        });
    }

    // <----- Cerrar Modal ----->
    onClose(): void {
        this.modalService.close();
    }
}
