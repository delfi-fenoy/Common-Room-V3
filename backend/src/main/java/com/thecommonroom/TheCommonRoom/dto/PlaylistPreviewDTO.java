package com.thecommonroom.TheCommonRoom.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PlaylistPreviewDTO {

    private Long id;
    private String name;
    private boolean isPrivate;
    private String pictureUrl;
    private UserPreviewDTO userPreviewDTO;
}
