package com.thecommonroom.TheCommonRoom.service;

import com.thecommonroom.TheCommonRoom.dto.PlaylistRequestDTO;
import com.thecommonroom.TheCommonRoom.dto.PlaylistResponseDTO;
import com.thecommonroom.TheCommonRoom.dto.UserPreviewDTO;
import com.thecommonroom.TheCommonRoom.mapper.PlaylistMapper;
import com.thecommonroom.TheCommonRoom.mapper.UserMapper;
import com.thecommonroom.TheCommonRoom.model.Playlist;
import com.thecommonroom.TheCommonRoom.model.User;
import com.thecommonroom.TheCommonRoom.repository.MovieListRepository;
import com.thecommonroom.TheCommonRoom.repository.PlaylistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final MovieListRepository movieListRepository;
    private final UserService userService;

    @Transactional // rollback en caso de error
    public PlaylistResponseDTO createPlaylist(PlaylistRequestDTO playlistRequestDTO){
        // Obtener el user logueado
        User currentUser = userService.getCurrentUser();
        // Guardar playlist en bdd
        Playlist playlist = playlistRepository.save(PlaylistMapper.toEntity(playlistRequestDTO, currentUser));

        UserPreviewDTO userPreviewDTO = UserMapper.toPreviewDTO(currentUser);
        return PlaylistMapper.entityToResponseDTO(playlist, userPreviewDTO);
    }
}
