import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user-service';
import { UserbanService } from '../../../core/services/userban-service';
import { UserBanPreview, UserPreview } from '../../../core/models';
import { UserBanDetails } from '../../../core/models/bans/user-ban-detail';
import { ModalService } from '../../../shared/services/modal-services';
import { Modal } from '../modal/modal';
import { Subject, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

export interface UserSearchItem extends UserPreview {
    isBanned?: boolean;
}

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

    // * ======== Estado Vista 1: Lista y Búsqueda ========
    bannedUsers: UserSearchItem[] = [];
    unbannedUsers: UserSearchItem[] = [];
    searchQuery: string = '';
    isLoadingList: boolean = true;
    currentPage: number = 1;
    totalPages: number = 1;
    private searchSubject = new Subject<string>();

    // * ======== Estado Vista 2: Detalle Baneo Actual ========
    selectedUser: UserSearchItem | null = null;
    currentBan: UserBanDetails | null = null;
    isLoadingDetail: boolean = false;
    isUnbanning: boolean = false;

    // * ======== Estado Vista 3: Historial ========
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
        this.setupSearchObservable();
    }

    // <----- Búsqueda Dual con Debounce ----->
    private setupSearchObservable(): void {
        this.searchSubject
            .pipe(
                debounceTime(300),
                distinctUntilChanged(),
                switchMap((query) => {
                    const trimmed = query.trim();
                    if (!trimmed) return of(null);

                    this.isLoadingList = true;
                    this.cdr.markForCheck();

                    return forkJoin({
                        banned: this.userService.getBannedUsers(trimmed, 1).pipe(catchError(() => of(null))),
                        all: this.userService.searchUsers(trimmed, 'all', 1).pipe(catchError(() => of(null))),
                    });
                }),
            )
            .subscribe({
                next: (results) => {
                    if (!results) {
                        this.fetchBannedUsers(1);
                        return;
                    }

                    const bannedList: UserSearchItem[] = (results.banned?.content || []).map((u) => ({
                        ...u,
                        isBanned: true,
                    }));

                    const bannedIds = new Set(bannedList.map((u) => u.id));

                    const unbannedList: UserSearchItem[] = (results.all?.content || [])
                        .filter((u) => !bannedIds.has(u.id))
                        .map((u) => ({ ...u, isBanned: false }));

                    this.bannedUsers = bannedList;
                    this.unbannedUsers = unbannedList;
                    this.isLoadingList = false;
                    this.cdr.markForCheck();
                },
                error: (err) => {
                    console.error('Error in search:', err);
                    this.isLoadingList = false;
                    this.cdr.markForCheck();
                },
            });
    }

    // <----- Vista 1: Obtener Usuarios Baneados ----->
    fetchBannedUsers(page: number = 1): void {
        this.isLoadingList = true;
        this.unbannedUsers = [];
        this.userService.getBannedUsers('', page).subscribe({
            next: (response) => {
                this.bannedUsers = (response.content || []).map((u) => ({
                    ...u,
                    isBanned: true,
                }));
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

    onSearchInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchQuery = input.value;
        this.searchSubject.next(this.searchQuery);
    }

    onListPageChange(newPage: number): void {
        if (newPage >= 1 && newPage <= this.totalPages) {
            this.fetchBannedUsers(newPage);
        }
    }

    // <----- Vista 2: Detalle del Usuario ----->
    selectUser(user: UserSearchItem): void {
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

    // <----- Vista 3: Historial ----->
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

    // <----- Navegación ----->
    backToList(): void {
        this.currentView = 'list';
        this.selectedUser = null;
        this.currentBan = null;
        this.banHistory = [];
        this.expandedBanId = null;

        if (this.searchQuery.trim()) {
            this.searchSubject.next(this.searchQuery);
        } else {
            this.fetchBannedUsers(1);
        }
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