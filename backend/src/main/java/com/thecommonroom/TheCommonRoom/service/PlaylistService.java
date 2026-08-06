package com.thecommonroom.TheCommonRoom.service;

import com.thecommonroom.TheCommonRoom.dto.*;
import com.thecommonroom.TheCommonRoom.exception.MovieAlreadyInPlaylistException;
import com.thecommonroom.TheCommonRoom.exception.MovieNotInPlaylistException;
import com.thecommonroom.TheCommonRoom.exception.PlaylistNotFoundException;
import com.thecommonroom.TheCommonRoom.mapper.MovieListMapper;
import com.thecommonroom.TheCommonRoom.mapper.PlaylistMapper;
import com.thecommonroom.TheCommonRoom.mapper.UserMapper;
import com.thecommonroom.TheCommonRoom.model.MovieList;
import com.thecommonroom.TheCommonRoom.model.Playlist;
import com.thecommonroom.TheCommonRoom.model.User;
import com.thecommonroom.TheCommonRoom.repository.MovieListRepository;
import com.thecommonroom.TheCommonRoom.repository.PlaylistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final MovieListRepository movieListRepository;
    private final UserService userService;
    private final MovieService movieService;

    // ----- ABM LISTAS -----

    @Transactional // rollback en caso de error
    public PlaylistResponseDTO createPlaylist(PlaylistRequestDTO playlistRequestDTO){
        // Obtener el user logueado
        User currentUser = userService.getCurrentUser();
        // Guardar playlist en bdd
        Playlist playlist = playlistRepository.save(PlaylistMapper.toEntity(playlistRequestDTO, currentUser));

        UserPreviewDTO userPreviewDTO = UserMapper.toPreviewDTO(currentUser);
        return PlaylistMapper.entityToResponseDTO(playlist, userPreviewDTO);
    }

    @Transactional
    public void deletePlaylist(Long playlistId){
        playlistRepository.deleteById(playlistId);
    }

    @Transactional
    public PlaylistResponseDTO modifyPlaylist(Long playlistId, PlaylistRequestDTO playlistUpdate){
        // Conseguir playlist original y user logueado
        Playlist originalPlaylist = getPlaylistById(playlistId);
        User currentUser = userService.getCurrentUser();

        // Comprobar que el user logueado sea el dueño de la lista
        validateOwnership(originalPlaylist, currentUser.getId(), "You are not allowed to edit this playlist");

        // Setear los valores (si son diferentes al original)
        if(!Objects.equals(playlistUpdate.getName(), originalPlaylist.getName())){
            originalPlaylist.setName(playlistUpdate.getName());
        }
        if(!Objects.equals(playlistUpdate.getDescription(), originalPlaylist.getDescription())){
            originalPlaylist.setDescription(playlistUpdate.getDescription());
        }
        if(playlistUpdate.isPrivate() != originalPlaylist.isPrivate()){ // != porq es dato primitivo (boolean)
            originalPlaylist.setPrivate(playlistUpdate.isPrivate());
        }
        if(!Objects.equals(playlistUpdate.getPictureUrl(), originalPlaylist.getPictureUrl())){
            originalPlaylist.setPictureUrl(playlistUpdate.getPictureUrl());
        }

        // Devolver la preview de la lista
        UserPreviewDTO userPreviewDTO = UserMapper.toPreviewDTO(currentUser);
        return PlaylistMapper.entityToResponseDTO(originalPlaylist, userPreviewDTO);
    }

    // ----- AGREGAR/ELIMINAR PELICULAS DE LISTAS -----

    @Transactional
    public MovieListResponseDTO addMovieToPlaylist(Long playlistId, Long movieId){

        // Conseguir datos completos
        Playlist playlist = getPlaylistById(playlistId); // si no existe, lanza excepcion
        User currentUser = userService.getCurrentUser();

        // Verificar que la playlist pertenezca al user logueado
        validateOwnership(playlist, currentUser.getId(),
                "You are not allowed to add movies to this playlist");

        validateMovieNotInPlaylist(playlistId, movieId);
        movieService.validateMovieExists(movieId); // Verificar existencia de pelicula, lanzar excepcion en caso contrario
        // Por ultimo la peticion a la API por tema de rendimiento

        // Guardar MovieList y devolver dto
        MovieList movieList = movieListRepository.save(MovieListMapper.toEntity(movieId, playlist));
        return MovieListMapper.entityToResponseDTO(movieList);
    }

    @Transactional
    public void deleteMovieFromPlaylist(Long playlistId, Long movieId){
        // Comprobaciones
        Playlist playlist = getPlaylistById(playlistId);
        User currentUser = userService.getCurrentUser();
        validateOwnership(playlist, currentUser.getId(),
                "You are not allowed to delete movies from this playlist");
        validateMovieInPlaylist(playlistId, movieId);

        // Eliminar pelicula
        movieListRepository.deleteByPlaylistIdAndMovieId(playlistId, movieId);
    }

    // ----- LISTADO/BUSQUEDA DE LISTAS -----

    @Transactional(readOnly = true)
    public Playlist getPlaylistById(Long playlistId){
        return playlistRepository.findById(playlistId)
                .orElseThrow(() -> new PlaylistNotFoundException("Playlist does not exist."));
    }

    // Devuelve pagina de PREVIEW DTO de las playlists
    @Transactional(readOnly = true)
    public Page<PlaylistPreviewDTO> getUserPlaylists(String username, int page){
        // Comprobaciones
        userService.validateUserExists(username); // Validar que el usuario exista
        userService.validateUserNotBanned(username, // Validar que el usuario no este baneado
                "Cannot view playlists for this user as their account has been suspended.");

        Optional<User> currentUser = userService.findCurrentUser();
        // Verificar si el user logueado (si es que hay) es el mismo que el que se busca
        boolean isOwner = currentUser
                .map(user -> username.equalsIgnoreCase(user.getUsername()))
                .orElse(false);

        Pageable pageable = PageRequest.of(page-1, 10);

        Page<Playlist> playlists = findUserPlaylists(username, isOwner, pageable); // Conseguir las listas
        long totalElements = playlists.getTotalElements();

        // Devolver listas mapeadas al dto
        return PlaylistMapper.entityToPreviewDTOPage(playlists, pageable, totalElements);
    }

    // Devuelve las playlists
    private Page<Playlist> findUserPlaylists(String username, boolean isOwner, Pageable pageable){
        // Si es el dueño de la lista, devuelve todas
        if(isOwner){
            return playlistRepository.findByUserUsername(username, pageable);
        }
        // Si no es el dueño de la lista, devuelve solo las publicas
        return playlistRepository.findByUserUsernameAndIsPrivateFalse(username, pageable);
    }

    // Devuelve listado de PREVIEW DTO de las playlists del user logueado (si es que hay)
    public Page<PlaylistPreviewDTO> getMyPlaylists(int page){
        User currentUser = userService.getCurrentUser();

        Pageable pageable = PageRequest.of(page-1, 10);
        Page<Playlist> playlists = findUserPlaylists(currentUser.getUsername(), true, pageable);
        long totalElements = playlists.getTotalElements();

        return PlaylistMapper.entityToPreviewDTOPage(playlists, pageable, totalElements);
    }

    @Transactional(readOnly = true)
    public Page<PlaylistPreviewDTO> getPublicPlaylists(int page){
        Pageable pageable = PageRequest.of(page-1, 20);
        Page<Playlist> playlists = playlistRepository.findByIsPrivateFalse(pageable);
        long totalElements = playlists.getTotalElements();

        return PlaylistMapper.entityToPreviewDTOPage(playlists, pageable, totalElements);
    }

    @Transactional(readOnly = true)
    public PlaylistResponseDTO getPlaylistResponseById(Long playlistId){
        Playlist playlist = getPlaylistById(playlistId); // Obtener los datos de la playlist
        userService.validateUserNotBanned(playlist.getUser().getUsername(), "Unable to access content from this user account.");
        checkPlaylistAccess(playlist); // Si la playlist es privada

        return PlaylistMapper.entityToResponseDTO(playlist, UserMapper.toPreviewDTO(playlist.getUser()));
    }

    @Transactional(readOnly = true)
    public Page<MoviePreviewDTO> getMovieListByPlaylistId(Long playlistId, int page){
        Playlist playlist = getPlaylistById(playlistId); // Verificar que la playlist existe
        userService.validateUserNotBanned(playlist.getUser().getUsername(), "Unable to access content from this user account.");
        checkPlaylistAccess(playlist); // Si la playlist es privada

        Pageable pageable = PageRequest.of(page-1, 5);
        Page<MovieList> movies = movieListRepository.findByPlaylistId(playlistId, pageable);
        return movies.map(movieList -> movieService.findMoviePreviewById(movieList.getMovieId()));
    }

    // ----- COMPROBACIONES -----

    public boolean isOwnedBy(Playlist playlist, Long userId){
        return Objects.equals(playlist.getUser().getId(), userId);
    }

    public void validateOwnership(Playlist playlist, Long userId, String errorMessage){
        if(!isOwnedBy(playlist, userId)){
            throw new AccessDeniedException(errorMessage);
        }
    }

    @Transactional(readOnly = true)
    public void validateMovieNotInPlaylist(Long playlistId, Long movieId){
        // Verificar que la pelicula no este en la playlist
        if(movieListRepository.existsByPlaylistIdAndMovieId(playlistId, movieId)){
            throw new MovieAlreadyInPlaylistException("This movie is already in the playlist");
        }
    }

    @Transactional(readOnly = true)
    public void validateMovieInPlaylist(Long playlistId, Long movieId){
        if(!movieListRepository.existsByPlaylistIdAndMovieId(playlistId, movieId)){
            throw new MovieNotInPlaylistException("This movie is not in the playlist");
        }
    }

    @Transactional(readOnly = true)
    private void checkPlaylistAccess(Playlist playlist){
        if(playlist.isPrivate()){
            Long currentUserId = userService.findCurrentUser()
                    .map(User::getId)
                    .orElse(null);
            // Validar que el usuario logueado sea el dueño de la playlist
            validateOwnership(playlist, currentUserId, "You do not have permission to view this private playlist.");
        }
    }
}
