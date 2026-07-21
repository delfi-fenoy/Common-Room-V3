package com.thecommonroom.TheCommonRoom.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class MovieListResponseDTO {

    private Long id;
    private Long movieId;
    private Long playlistId;
}
