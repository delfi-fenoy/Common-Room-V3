/* ! ======== Barrel Export de Modelos / DTOs ======== */
/* Centraliza la exportación de todos los modelos del proyecto. */

/* ------ Modulo de Autenticación ------ */
export * from './auth/change-passwords';
export * from './auth/login-request';
export * from './auth/register-request';
export * from './auth/token-response';

/* ------ Modulo de Películas ------ */
export * from './movies/movie-preview';
export * from './movies/movie-details';

/* ------ Modulo de Reseñas ------ */
export * from './reviews/review';

/* ------ Modulo de Playlists ------ */
export * from './playlists/playlist-preview';
export * from './playlists/playlist-details';

/* ------ Modulo de Usuarios ------ */
export * from './users/user';
export * from './users/user-preview';

/* ------ Modulo de Usuarios Baneados ------ */
export * from './bans/user-ban-preview';
export * from './bans/user-ban-detail';

/* ------ Modulo Compartido / General ------ */
export * from './common/not-found-item';
export * from './common/page-response';
