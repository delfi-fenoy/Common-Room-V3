package com.thecommonroom.TheCommonRoom.controller;

import com.thecommonroom.TheCommonRoom.dto.ReviewRequestDTO;
import com.thecommonroom.TheCommonRoom.dto.ReviewResponseDTO;
import com.thecommonroom.TheCommonRoom.dto.ReviewUpdateDTO;
import com.thecommonroom.TheCommonRoom.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;

@RestController
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // ----- ABM RESEÑAS -----

    @PostMapping("/reviews")
    public ResponseEntity<ReviewResponseDTO> createReview(@Valid @RequestBody ReviewRequestDTO reviewRequestDTO){
        ReviewResponseDTO reviewResponseDTO = reviewService.createReview(reviewRequestDTO); // Crear reseña

        // Construir la URI donde se puede acceder a la reseña recién creada
        URI location = ServletUriComponentsBuilder
                .fromCurrentRequest() // Toma la URL actual (/reviews)
                .path("/{id}") // Agrega "/{id}" al final para indicar ruta del nuevo recurso
                .buildAndExpand(reviewResponseDTO.getId()) // Reemplaza {id} por el id de la reseña creada
                .toUri(); // Convierte el resultado a un objeto URI

        return ResponseEntity.created(location).body(reviewResponseDTO); // Devolver código de estado + reseña completa
    }

    // Llamar metodo de UserSecurity, para comprobar permisos
    @PreAuthorize("@userSecurity.canDeleteReview(#reviewId, authentication)")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/reviews/{reviewId}")
    public void deleteReview(@PathVariable Long reviewId){
        reviewService.deleteReview(reviewId);
    }

    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<ReviewResponseDTO> modifyReview(@PathVariable Long reviewId, @Valid @RequestBody ReviewUpdateDTO reviewUpdateDTO){
        ReviewResponseDTO reviewResponseDTO = reviewService.modifyReview(reviewId, reviewUpdateDTO);
        return ResponseEntity.ok(reviewResponseDTO);
    }

    // ----- LISTADO / BUSQUEDA RESEÑAS -----

    // Obtener reseñas por usuario
    @GetMapping("/users/{username}/reviews")
    public ResponseEntity<Page<ReviewResponseDTO>> getUserReviews(@PathVariable String username, @RequestParam(defaultValue = "1") int page){
        return ResponseEntity.ok(reviewService.getReviewsByUsername(username, page));
    }

    @GetMapping("/users/me/reviews")
    public ResponseEntity<Page<ReviewResponseDTO>> getMyReviews(@RequestParam(defaultValue = "1") int page){
        Page<ReviewResponseDTO> reviews = reviewService.getMyReviews(page);
        return ResponseEntity.ok(reviews);
    }

    // Obtener reseñas por película
    @GetMapping("/movies/{id}/reviews")
    public ResponseEntity<Page<ReviewResponseDTO>> getMovieReviews(@PathVariable Long id, @RequestParam(defaultValue = "1") int page){
        return ResponseEntity.ok(reviewService.getReviewsByMovieId(id, page));
    }

    @GetMapping("users/{username}/reviews/{movieId}")
    public ResponseEntity<ReviewResponseDTO> getReviewByUserAndMovie(@PathVariable String username,
                                                                     @PathVariable Long movieId){
        return reviewService.getUserReviewForMovie(username, movieId)
                .map(ResponseEntity::ok) // Si hay reseña, devuelve codigo 200 + reseñaResponse
                .orElse(ResponseEntity.noContent().build()); // Si no hay reseña, devuelve código 204
    }
}
