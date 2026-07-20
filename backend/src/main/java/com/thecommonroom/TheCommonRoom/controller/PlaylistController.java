package com.thecommonroom.TheCommonRoom.controller;

import com.thecommonroom.TheCommonRoom.dto.PlaylistRequestDTO;
import com.thecommonroom.TheCommonRoom.dto.PlaylistResponseDTO;
import com.thecommonroom.TheCommonRoom.service.PlaylistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequiredArgsConstructor
public class PlaylistController {

    private final PlaylistService playlistService;

    @PostMapping("/lists")
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
}
