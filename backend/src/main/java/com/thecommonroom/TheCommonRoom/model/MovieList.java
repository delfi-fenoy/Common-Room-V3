package com.thecommonroom.TheCommonRoom.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Entity
@Table(name = "movie_list",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"movie_id", "playlist_id"})) // una pelicula no puede estar dos veces en la misma lista
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class MovieList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "movie_id", nullable = false)
    @NotNull
    private Long movieId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "playlist_id", nullable = false)
    private Playlist playlist;
}
