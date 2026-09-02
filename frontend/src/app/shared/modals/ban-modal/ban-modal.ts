import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user-service';
import { UserbanService } from '../../../core/services/userban-service';
import { UserBanPreview, UserPreview } from '../../../core/models';
import { UserBanResponse } from '../../../core/models/bans/user-ban-response';
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
    isLoadingList: boolean = true;
    currentPage: number = 1;
    totalPages: number = 1;

    // * ======== Estado Vista 2: Detalle Baneo ========
    selectedUser: UserPreview | null = null;
    currentBan: UserBanResponse | null = null;
    isLoadingDetail: boolean = false;
    isUnbanning: boolean = false;

    // * ======== Estado Vista 3: Historial de Baneos ========
    banHistory: UserBanPreview[] = [];
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
                console.log('GET /users/banned:', response);
                this.bannedUsers = response.content || [];
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

    onListPageChange(newPage: number): void {
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.fetchBannedUsers(newPage);
        }
    }

    // <----- Vista 2: Seleccionar Usuario e ir a Detalle ----->
    selectUser(user: UserPreview): void {
        this.selectedUser = user;
        this.currentView = 'detail';
        this.isLoadingDetail = true;

        this.userBanService.getUserLastBanInfo(user.username).subscribe({
            next: (banInfo) => {
                console.log(`GET /users/${user.username}/ban:`, banInfo);
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

    // <----- Desbanear Usuario ----->
    onUnbanUser(): void {
        if (!this.selectedUser || this.isUnbanning) return;

        this.isUnbanning = true;
        this.userBanService.unbanUser(this.selectedUser.username).subscribe({
            next: () => {
                this.isUnbanning = false;
                this.modalService.openAlert('Success', `User @${this.selectedUser?.username} has been unbanned.`, 'success');
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

    // <----- Vista 3: Ir al Historial Paginado ----->
    goToHistory(page: number = 1): void {
        if (!this.selectedUser) return;

        this.currentView = 'history';
        this.isLoadingHistory = true;

        this.userBanService.getUserBanHistory(this.selectedUser.username, page).subscribe({
            next: (response) => {
                console.log(`GET /users/${this.selectedUser?.username}/ban/history:`, response);
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

    onHistoryPageChange(newPage: number): void {
        if (newPage >= 1 && newPage <= this.historyTotalPages) {
            this.goToHistory(newPage);
        }
    }

    // <----- Navegación de Vistas ----->
    backToList(): void {
        this.currentView = 'list';
        this.selectedUser = null;
        this.currentBan = null;
        this.banHistory = [];
    }

    backToDetail(): void {
        this.currentView = 'detail';
        this.banHistory = [];
    }

    onClose(): void {
        this.modalService.close();
    }
}