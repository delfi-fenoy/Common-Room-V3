package com.thecommonroom.TheCommonRoom.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "playlists")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Playlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // la bdd genera el id
    private Long id;

    @NotBlank(message = "El nombre de la lista no debe estar vacío") // validacion java
    @Column(nullable = false) // validacion bdd
    @Size(max = 30)
    private String name;

    @Size(max = 255, message = "La descripción debe tener como máximo 255 caracteres")
    private String description;

    @Column(name = "is_private", nullable = false)
    private boolean isPrivate; // por defecto es falso

    @URL(message = "La URL de la portada debe ser válida")
    private String pictureUrl;

    @CreationTimestamp // agarrar la fecha y hora exacta
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "playlist", fetch = FetchType.LAZY, cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<MovieList> movieList;
}
