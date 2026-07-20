package com.thecommonroom.TheCommonRoom.service;

import com.thecommonroom.TheCommonRoom.dto.PlaylistRequestDTO;
import com.thecommonroom.TheCommonRoom.dto.PlaylistResponseDTO;
import com.thecommonroom.TheCommonRoom.dto.UserPreviewDTO;
import com.thecommonroom.TheCommonRoom.exception.PlaylistNotFoundException;
import com.thecommonroom.TheCommonRoom.mapper.PlaylistMapper;
import com.thecommonroom.TheCommonRoom.mapper.UserMapper;
import com.thecommonroom.TheCommonRoom.model.Playlist;
import com.thecommonroom.TheCommonRoom.model.User;
import com.thecommonroom.TheCommonRoom.repository.MovieListRepository;
import com.thecommonroom.TheCommonRoom.repository.PlaylistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

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
        if(!originalPlaylist.getUser().equals(currentUser)){
            throw new AccessDeniedException("You are not allowed to edit this playlist");
        }

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

    public Playlist getPlaylistById(Long playlistId){
        return playlistRepository.findById(playlistId)
                .orElseThrow(() -> new PlaylistNotFoundException("Playlist does not exist."));
    }
}
