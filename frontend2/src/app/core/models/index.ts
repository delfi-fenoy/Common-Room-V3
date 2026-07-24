/* ! ======== Barrel Export de Modelos / DTOs ======== */
/* Centraliza la exportación de todos los modelos del proyecto. */
/* Permite importar cualquier interfaz usando la ruta limpia `@core/models`. */

/* ------ Modulo de Autenticación ------ */
export * from './auth/change-passwords';
export * from './auth/login-request';
export * from './auth/register-request';
export * from './auth/token-response';

/* ------ Modulo de Películas ------ */
export * from './movies/movie-base';
export * from './movies/movie-details';

/* ------ Modulo de Reseñas ------ */
export * from './reviews/Review';

/* ------ Modulo de Usuarios ------ */
export * from './users/User';
export * from './users/user-preview';

/* ------ Modulo Compartido / General ------ */
export * from './common/not-found-item';