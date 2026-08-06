package com.thecommonroom.TheCommonRoom.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("isPrivate")
    private boolean isPrivate;
    private String pictureUrl;
    private UserPreviewDTO userPreviewDTO;
}
