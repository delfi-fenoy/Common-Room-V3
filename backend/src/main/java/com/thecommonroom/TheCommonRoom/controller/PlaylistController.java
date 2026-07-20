package com.thecommonroom.TheCommonRoom.controller;

import com.thecommonroom.TheCommonRoom.dto.PlaylistRequestDTO;
import com.thecommonroom.TheCommonRoom.dto.PlaylistResponseDTO;
import com.thecommonroom.TheCommonRoom.service.PlaylistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
}
