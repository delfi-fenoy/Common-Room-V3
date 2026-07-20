package com.thecommonroom.TheCommonRoom.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.validator.constraints.URL;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PlaylistRequestDTO {

    @Size(max = 30, message = "El nombre no debe superar los 30 caracteres")
    @NotBlank(message = "El nombre de la lista no debe estar vacío")
    private String name;

    @Size(max = 255, message = "La descripcion no debe superar los 255 caracteres")
    private String description;

    private boolean isPrivate;

    @URL(message = "La URL no es valida")
    private String pictureUrl;
}
