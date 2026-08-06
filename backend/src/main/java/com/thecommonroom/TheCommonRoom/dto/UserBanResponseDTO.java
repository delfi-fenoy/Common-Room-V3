package com.thecommonroom.TheCommonRoom.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // Ocultar atributos nulos
public class UserBanResponseDTO {

    private Long id;
    private String bannedUsername;
    private String bannedByUsername;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime bannedAt;
    private String reason;

    // Atributos que pueden ser null (al banear)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime unbannedAt;
    private String unbannedByUsername;
}
