import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './core/interceptors/token-interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(
            routes,
            withComponentInputBinding(), // Binding automático de parámetros de ruta a inputs
            withViewTransitions(), // Transiciones suaves entre vistas
            withInMemoryScrolling({
                scrollPositionRestoration: 'enabled',
            })
        ),
        provideHttpClient(
            withFetch(), // API fetch nativa para llamadas HTTP
            withInterceptors([tokenInterceptor])
        ),
    ],
};