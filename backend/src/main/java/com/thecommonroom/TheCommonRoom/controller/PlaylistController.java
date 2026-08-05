package com.thecommonroom.TheCommonRoom.controller;

import com.thecommonroom.TheCommonRoom.dto.MovieListResponseDTO;
import com.thecommonroom.TheCommonRoom.dto.PlaylistPreviewDTO;
import com.thecommonroom.TheCommonRoom.dto.PlaylistRequestDTO;
import com.thecommonroom.TheCommonRoom.dto.PlaylistResponseDTO;
import com.thecommonroom.TheCommonRoom.service.PlaylistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    // ----- ABM LISTAS -----

    @PostMapping("/playlists")
    public ResponseEntity<PlaylistResponseDTO> createPlaylist(@Valid @RequestBody PlaylistRequestDTO playlistRequestDTO){
        // Crear la playlist
        PlaylistResponseDTO playlistResponseDTO = playlistService.createPlaylist(playlistRequestDTO);

        // Construir nueva URL con la playlist creada
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(playlistResponseDTO.getId())
                .toUri();

        return ResponseEntity.created(location).body(playlistResponseDTO);
    }

    @DeleteMapping("/playlists/{playlistId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@userSecurity.canDeletePlaylist(#playlistId, authentication)") // Validar si puede eliminar la lista
    public void deletePlaylist(@PathVariable Long playlistId){
        playlistService.deletePlaylist(playlistId);
    }

    @PutMapping("/playlists/{playlistId}")
    public ResponseEntity<PlaylistResponseDTO> modifyPlaylist(@PathVariable Long playlistId, @Valid @RequestBody PlaylistRequestDTO playlistUpdate){
        PlaylistResponseDTO playlistResponseDTO = playlistService.modifyPlaylist(playlistId, playlistUpdate);

        return ResponseEntity.ok(playlistResponseDTO);
    }

    // ----- AGREGAR/ELIMINAR PELICULAS DE LISTAS -----

    @PostMapping("/playlists/{playlistId}/movies/{movieId}")
    public ResponseEntity<MovieListResponseDTO> addMovieToPlaylist(@PathVariable Long playlistId, @PathVariable Long movieId){
        MovieListResponseDTO movieListResponseDTO = playlistService.addMovieToPlaylist(playlistId, movieId);
        return ResponseEntity.ok(movieListResponseDTO);
    }

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/playlists/{playlistId}/movies/{movieId}")
    public void deleteMovieFromPlaylist(@PathVariable Long playlistId, @PathVariable Long movieId){
        playlistService.deleteMovieFromPlaylist(playlistId, movieId);
    }

    // ----- LISTADO/BUSQUEDA DE LISTAS -----

    // Listado de playlists de usuario (publicas)
    @GetMapping("/users/{username}/playlists")
    public ResponseEntity<Page<PlaylistPreviewDTO>> getUserPlaylists(
            @PathVariable String username,
            @RequestParam(defaultValue = "1") int page){
        Page<PlaylistPreviewDTO> playlists = playlistService.getUserPlaylists(username, page);
        return ResponseEntity.ok(playlists);
    }

    // Listado de playlists propias (privadas y publicas)
    @GetMapping("/users/me/playlists")
    public ResponseEntity<Page<PlaylistPreviewDTO>> getMyPlaylists(@RequestParam(defaultValue = "1") int page){
        Page<PlaylistPreviewDTO> playlists = playlistService.getMyPlaylists(page);
        return ResponseEntity.ok(playlists);
    }

    @GetMapping("/playlists/all")
    public ResponseEntity<Page<PlaylistPreviewDTO>> getPublicPlaylists(@RequestParam(defaultValue = "1") int page){
        Page<PlaylistPreviewDTO> playlists = playlistService.getPublicPlaylists(page);
        return ResponseEntity.ok(playlists);
    }

    @GetMapping("/playlists/{playlistId}")
    public ResponseEntity<PlaylistResponseDTO> getPlaylistResponseById(@PathVariable Long playlistId){
        PlaylistResponseDTO playlistResponse = playlistService.getPlaylistResponseById(playlistId);
        return ResponseEntity.ok(playlistResponse);
    }
}
