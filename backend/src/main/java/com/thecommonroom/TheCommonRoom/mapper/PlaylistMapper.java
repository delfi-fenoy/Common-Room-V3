package com.thecommonroom.TheCommonRoom.mapper;

import com.thecommonroom.TheCommonRoom.dto.PlaylistPreviewDTO;
import com.thecommonroom.TheCommonRoom.dto.PlaylistRequestDTO;
import com.thecommonroom.TheCommonRoom.dto.PlaylistResponseDTO;
import com.thecommonroom.TheCommonRoom.dto.UserPreviewDTO;
import com.thecommonroom.TheCommonRoom.model.Playlist;
import com.thecommonroom.TheCommonRoom.model.User;

import java.util.List;
import java.util.stream.Collectors;

public class PlaylistMapper {

    public static Playlist toEntity(PlaylistRequestDTO playlistRequestDTO, User user){
        return Playlist.builder()
                .name(playlistRequestDTO.getName())
                .description(playlistRequestDTO.getDescription())
                .isPrivate(playlistRequestDTO.isPrivate())
                .pictureUrl(playlistRequestDTO.getPictureUrl())
                .user(user)
                .build();
    }

    public static PlaylistResponseDTO entityToResponseDTO(Playlist playlist, UserPreviewDTO userPreviewDTO){
        return PlaylistResponseDTO.builder()
                .id(playlist.getId())
                .name(playlist.getName())
                .description(playlist.getDescription())
                .isPrivate(playlist.isPrivate())
                .pictureUrl(playlist.getPictureUrl())
                .createdAt(playlist.getCreatedAt())
                .userPreviewDTO(userPreviewDTO)
                .build();
    }

    public static PlaylistPreviewDTO entityToPreviewDTO(Playlist playlist){
        UserPreviewDTO userPreviewDTO = UserMapper.toPreviewDTO(playlist.getUser());
        return PlaylistPreviewDTO.builder()
                .id(playlist.getId())
                .name(playlist.getName())
                .isPrivate(playlist.isPrivate())
                .pictureUrl(playlist.getPictureUrl())
                .userPreviewDTO(userPreviewDTO)
                .build();
    }

    public static List<PlaylistPreviewDTO> entityToPreviewDTOList(List<Playlist> playlists){
        return playlists.stream()
                .map(PlaylistMapper::entityToPreviewDTO)
                .collect(Collectors.toList());
    }
}
