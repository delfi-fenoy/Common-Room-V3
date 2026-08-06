package com.thecommonroom.TheCommonRoom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserBanRequestDTO {

    @NotBlank(message = "Es obligatorio agregar un motivo de baneo.")
    @Size(max = 255, message = "El motivo puede contener como maximo 255 caracteres.")
    private String reason;

    // El usuario a banear viene en la URL
}
