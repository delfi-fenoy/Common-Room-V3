package com.thecommonroom.TheCommonRoom.mapper;

import com.thecommonroom.TheCommonRoom.dto.MovieListResponseDTO;
import com.thecommonroom.TheCommonRoom.model.MovieList;
import com.thecommonroom.TheCommonRoom.model.Playlist;

public class MovieListMapper {

    public static MovieList toEntity(Long movieId, Playlist playlist){
        return MovieList.builder()
                .movieId(movieId)
                .playlist(playlist)
                .build();
    }

    public static MovieListResponseDTO entityToResponseDTO(MovieList movieList){
        return MovieListResponseDTO.builder()
                .id(movieList.getId())
                .movieId(movieList.getMovieId())
                .playlistId(movieList.getPlaylist().getId())
                .build();
    }
}
