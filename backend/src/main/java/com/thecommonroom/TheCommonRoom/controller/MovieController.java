package com.thecommonroom.TheCommonRoom.controller;

import com.thecommonroom.TheCommonRoom.dto.MovieDetailsDTO;
import com.thecommonroom.TheCommonRoom.dto.MoviePreviewDTO;
import com.thecommonroom.TheCommonRoom.service.MovieService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    // ----- LISTADO / BUSQUEDA PELICULAS -----

    // Lista paginada de todas las películas
    @GetMapping("/all")
    @ResponseStatus(HttpStatus.OK)
    public List<MoviePreviewDTO> getAllMovies(@RequestParam(defaultValue = "1") int page) {
        return movieService.getAllMovies(page);
    }

    // Agregamos parámetro año y género, opcionales
    @GetMapping("/search/{query}")
    @ResponseStatus(HttpStatus.OK)
    public List<MoviePreviewDTO> searchMovies(@PathVariable String query, @RequestParam(defaultValue = "1") int page, @RequestParam(required = false) String year, @RequestParam(required = false) String genre) {
        return movieService.searchMovies(query, page, year, genre);
    }

    // ----- FILTRADO PELICULAS -----

    // Lista paginada de películas populares
    @GetMapping("/popular")
    @ResponseStatus(HttpStatus.OK)
    public List<MoviePreviewDTO> getPopularMovies(@RequestParam(defaultValue = "1") int page) {
        return movieService.getPopularMovies(page);
    }

    // Lista paginada de películas recientes
    @GetMapping("/recent")
    @ResponseStatus(HttpStatus.OK)
    public List<MoviePreviewDTO> getRecentMovies(@RequestParam(defaultValue = "1") int page) {
        return movieService.getRecentMovies(page);
    }

    // Lista paginada de próximos estrenos
    @GetMapping("/upcoming")
    @ResponseStatus(HttpStatus.OK)
    public List<MoviePreviewDTO> getUpcomingMovies(@RequestParam(defaultValue = "1") int page) {
        return movieService.getUpcomingMovies(page);
    }

    // ----- OBTENER PELICULA SEGUN ID -----

    // Devuelve una película por ID
    @GetMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public MovieDetailsDTO getMovieById(@PathVariable Long id) {
        return movieService.findMovieDetailsById(id);
    }
}
