import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user-service';
import { UserbanService } from '../../../core/services/userban-service';
import { UserBanPreview, UserPreview } from '../../../core/models';
import { UserBanDetails } from '../../../core/models/bans/user-ban-detail';
import { ModalService } from '../../../shared/services/modal-services';
import { Modal } from '../modal/modal';

@Component({
    selector: 'app-ban-modal',
    standalone: true,
    imports: [CommonModule, Modal],
    templateUrl: './ban-modal.html',
    styleUrl: './ban-modal.css',
})
export class BanModal implements OnInit {
    // * ======== Inyección de Servicios ========
    private userService = inject(UserService);
    private userBanService = inject(UserbanService);
    public modalService = inject(ModalService);
    private cdr = inject(ChangeDetectorRef);

    // * ======== Estado de Vistas ========
    currentView: 'list' | 'detail' | 'history' = 'list';

    // * ======== Estado Vista 1: Lista Baneados ========
    bannedUsers: UserPreview[] = [];
    filteredUsers: UserPreview[] = [];
    searchQuery: string = '';
    isLoadingList: boolean = true;
    currentPage: number = 1;
    totalPages: number = 1;

    // * ======== Estado Vista 2: Detalle Baneo Actual ========
    selectedUser: UserPreview | null = null;
    currentBan: UserBanDetails | null = null;
    isLoadingDetail: boolean = false;
    isUnbanning: boolean = false;

    // * ======== Estado Vista 3: Historial Desplegable ========
    banHistory: UserBanPreview[] = [];
    expandedBanId: number | null = null;
    banDetailsMap: Map<number, UserBanDetails> = new Map();
    loadingBanDetailsMap: Map<number, boolean> = new Map();
    isLoadingHistory: boolean = false;
    historyPage: number = 1;
    historyTotalPages: number = 1;

    // * ======== Lifecycle Hooks ========
    ngOnInit(): void {
        this.fetchBannedUsers(1);
    }

    // <----- Vista 1: Obtener Usuarios Baneados Paginados ----->
    fetchBannedUsers(page: number = 1): void {
        this.isLoadingList = true;
        this.userService.getBannedUsers('', page).subscribe({
            next: (response) => {
                this.bannedUsers = response.content || [];
                this.filterUsers();
                this.currentPage = page;
                this.totalPages = response.totalPages || 1;
                this.isLoadingList = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Error fetching banned users:', err);
                this.isLoadingList = false;
                this.cdr.markForCheck();
            },
        });
    }

    // <----- Vista 1: Búsqueda Local de Usuarios ----->
    onSearchInput(event: any): void {
        this.searchQuery = event.target.value;
        this.filterUsers();
    }

    filterUsers(): void {
        const query = this.searchQuery.toLowerCase().trim();
        if (!query) {
            this.filteredUsers = [...this.bannedUsers];
        } else {
            this.filteredUsers = this.bannedUsers.filter((user) =>
                user.username.toLowerCase().includes(query),
            );
        }
    }

    onListPageChange(newPage: number): void {
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.fetchBannedUsers(newPage);
        }
    }

    // <----- Vista 2: Seleccionar Usuario e Ir a Detalle ----->
    selectUser(user: UserPreview): void {
        this.selectedUser = user;
        this.currentView = 'detail';
        this.isLoadingDetail = true;

        this.userBanService.getUserLastBanInfo(user.username).subscribe({
            next: (banInfo) => {
                this.currentBan = banInfo;
                this.isLoadingDetail = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Error fetching last ban info:', err);
                this.currentBan = null;
                this.isLoadingDetail = false;
                this.cdr.markForCheck();
            },
        });
    }

    // <----- Vista 2: Desbanear Usuario ----->
    onUnbanUser(): void {
        if (!this.selectedUser || this.isUnbanning) return;

        this.isUnbanning = true;
        this.userBanService.unbanUser(this.selectedUser.username).subscribe({
            next: () => {
                this.isUnbanning = false;
                this.modalService.openAlert(
                    'Success',
                    `User @${this.selectedUser?.username} has been unbanned.`,
                    'success',
                );
                this.backToList();
                this.fetchBannedUsers(this.currentPage);
            },
            error: (err) => {
                console.error('Error unbanning user:', err);
                this.isUnbanning = false;
                this.modalService.openAlert('Error', 'Failed to unban user.', 'error');
                this.cdr.markForCheck();
            },
        });
    }

    // <----- Vista 3: Obtener Historial Paginado ----->
    goToHistory(page: number = 1): void {
        if (!this.selectedUser) return;

        this.currentView = 'history';
        this.isLoadingHistory = true;
        this.expandedBanId = null;

        this.userBanService.getUserBanHistory(this.selectedUser.username, page).subscribe({
            next: (response) => {
                this.banHistory = response.content || [];
                this.historyPage = page;
                this.historyTotalPages = response.totalPages || 1;
                this.isLoadingHistory = false;
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error('Error fetching ban history:', err);
                this.isLoadingHistory = false;
                this.cdr.markForCheck();
            },
        });
    }

    // <----- Vista 3: Desplegar y Cargar Detalle por ID ----->
    toggleBanDetails(banId: number): void {
        if (this.expandedBanId === banId) {
            this.expandedBanId = null;
            return;
        }

        this.expandedBanId = banId;

        if (this.banDetailsMap.has(banId)) return;

        this.loadingBanDetailsMap.set(banId, true);

        this.userBanService.getBanById(banId).subscribe({
            next: (banDetail) => {
                console.log('Baneo completo', banDetail);
                this.banDetailsMap.set(banId, banDetail);
                this.loadingBanDetailsMap.set(banId, false);
                this.cdr.markForCheck();
            },
            error: (err) => {
                console.error(`Error fetching ban detail for ID ${banId}:`, err);
                this.loadingBanDetailsMap.set(banId, false);
                this.cdr.markForCheck();
            },
        });
    }

    onHistoryPageChange(newPage: number): void {
        if (newPage >= 1 && newPage <= this.historyTotalPages) {
            this.goToHistory(newPage);
        }
    }

    // <----- Navegación entre Vistas y Cierre ----->
    backToList(): void {
        this.currentView = 'list';
        this.selectedUser = null;
        this.currentBan = null;
        this.banHistory = [];
        this.expandedBanId = null;
    }

    backToDetail(): void {
        this.currentView = 'detail';
        this.banHistory = [];
        this.expandedBanId = null;
    }

    onClose(): void {
        this.modalService.close();
    }
}