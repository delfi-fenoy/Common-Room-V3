package com.thecommonroom.TheCommonRoom.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // ignorar los null
public class PlaylistResponseDTO {

    private Long id;
    private String name;
    private String description;
    @JsonProperty("isPrivate")
    private boolean isPrivate;
    private String pictureUrl;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    private UserPreviewDTO userPreviewDTO;
}
