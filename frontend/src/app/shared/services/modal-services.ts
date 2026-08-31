import { Injectable, signal } from '@angular/core';

export type ModalType = 'success' | 'error' | 'confirm' | 'custom' | 'ban';
@Injectable({
    providedIn: 'root',
})

/* 
    ModalService es un servicio que gestiona la apertura, cierre y estado de los modales en la aplicación.
    Proporciona métodos para abrir modales de alerta, confirmación y personalizados, 
    así como para manejarla acción de confirmación y cerrar el modal. 
    Esto nos permite centralizar la lógica de los modales y mantener un estado reactivo utilizando signals,
    lo que facilita la interacción con los componentes que consumen este servicio.
*/
export class ModalService {
    // * ---- Estado Reactivo con Signals ----
    isOpen = signal<boolean>(false);
    title = signal<string>('');
    message = signal<string>('');
    type = signal<ModalType>('custom');

    // Callback para confirmaciones (Ej: "Aceptar/Cancelar")
    private onConfirmCallback: (() => void) | null = null;

    // * -------- Abrir Modal de Alerta / Notificación --------
    openAlert(title: string, message: string, type: 'success' | 'error' = 'success'): void {
        this.title.set(title);
        this.message.set(message);
        this.type.set(type);
        this.isOpen.set(true);
        console.log("Modal alerta abierto");
    }

    // * -------- Abrir Modal de Confirmación --------
    openConfirm(title: string, message: string, onConfirm: () => void): void {
        this.title.set(title);
        this.message.set(message);
        this.type.set('confirm');
        this.onConfirmCallback = onConfirm;
        this.isOpen.set(true);
        console.log("Modal confirmacion abierto");
    }

    // * -------- Abrir Modal Personalizado (Formularios) --------
    openCustom(title: string): void {
        this.title.set(title);
        this.type.set('custom');
        this.isOpen.set(true);
        console.log("Modal Custom abierto");
    }

    // * -------- Abrir Modal de Baneos / Admin --------
        openBan(title: string = 'Manage Banned Users'): void {
            this.title.set(title);
            this.type.set('ban');
            this.isOpen.set(true);
            console.log("Modal Ban abierto");
        }

    // * -------- Ejecutar Acción de Confirmación --------
    confirm(): void {
        if (this.onConfirmCallback) {
            this.onConfirmCallback();
        }
        this.close();
    }

    // * -------- Cierra el Modal --------
    close(): void {
        this.isOpen.set(false);
        this.onConfirmCallback = null;
    }
}
