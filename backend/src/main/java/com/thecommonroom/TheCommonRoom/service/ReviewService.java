package com.thecommonroom.TheCommonRoom.service;

import com.thecommonroom.TheCommonRoom.dto.*;
import com.thecommonroom.TheCommonRoom.exception.*;
import com.thecommonroom.TheCommonRoom.mapper.ReviewMapper;
import com.thecommonroom.TheCommonRoom.mapper.UserMapper;
import com.thecommonroom.TheCommonRoom.model.Review;
import com.thecommonroom.TheCommonRoom.model.User;
import com.thecommonroom.TheCommonRoom.repository.ReviewRepository;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserService userService;
    private final MovieService movieService;

    // ========== ABM REVIEWS ==========

    @Transactional
    public ReviewResponseDTO createReview(ReviewRequestDTO reviewRequestDTO){

        // Obtener el usuario actual
        User currentUser = userService.getCurrentUser();

        // Validaciones
        validateMovieExists(reviewRequestDTO.getMovieId());
        validateUserHasNotReviewedMovie(currentUser.getId(), reviewRequestDTO.getMovieId());
        validateReview(reviewRequestDTO.getRating(), reviewRequestDTO.getComment()); // Validar rating y comment

        // Guardar reseña en la base de datos, mapeandola a su entidad
        Review review = reviewRepository.save(ReviewMapper.toEntity(reviewRequestDTO, currentUser));

        // Devolver response de reseña
        MoviePreviewDTO moviePreviewDTO = movieService.findMoviePreviewById(review.getMovieId()); // Obtener pre-visualización de película
        UserPreviewDTO userPreviewDTO = UserMapper.toPreviewDTO(currentUser); // Obtener pre-visualización de user
        return ReviewMapper.entityToResponseDTO(review, moviePreviewDTO, userPreviewDTO); // Mapear reseña a responseDTO
    }

    @Transactional
    public void deleteReview(Long reviewId){
        Review review = getReviewById(reviewId);
        reviewRepository.delete(review);
    }

    @Transactional
    public ReviewResponseDTO modifyReview(Long reviewId, ReviewUpdateDTO reviewUpdateDTO){
        // Obtener review antigua completa y usuario autenticado
        Review review = getReviewById(reviewId);
        User currentUser = userService.getCurrentUser();

        // Comprobar que la reseña a modificar pertenezca al usuario autenticado
        if(!review.getUser().equals(currentUser))
            throw new AccessDeniedException("You are not allowed to edit this review");

        // Validar rating y comment
        validateReview(reviewUpdateDTO.getRating(), reviewUpdateDTO.getComment());

        // Settear valores y guardar en bdd
        if(reviewUpdateDTO.getRating() != null){
            review.setRating(reviewUpdateDTO.getRating());
        }
        if(reviewUpdateDTO.getComment() != null){
            review.setComment(reviewUpdateDTO.getComment());
        }
        reviewRepository.save(review);

        // Devolver response de review
        MoviePreviewDTO moviePreviewDTO = movieService.findMoviePreviewById(review.getMovieId());
        return ReviewMapper.entityToResponseDTO(review,
                                            moviePreviewDTO,
                                            UserMapper.toPreviewDTO(review.getUser()));
    }

    // ========== OBTENER REVIEWS ==========
    // Obtener reseñas por username (paginado)
    @Transactional(readOnly = true) // Para mayor rendimiento
    public Page<ReviewResponseDTO> getReviewsByUsername(String username, int page){
        User foundUser = userService.findUserByUsername(username); // Obtener usuario buscado

        Pageable pageable = PageRequest.of(page -1, 20);
        Page<Review> entityPage = reviewRepository.findByUser(foundUser, pageable);

        return entityPage.map(review -> {
            MoviePreviewDTO moviePreviewDTO = movieService.findMoviePreviewById(review.getMovieId());
            UserPreviewDTO userPreviewDTO = UserMapper.toPreviewDTO(foundUser);
            return ReviewMapper.entityToResponseDTO(review, moviePreviewDTO, userPreviewDTO);
        });
    }


    // Obtener reseñas por película (paginado)
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getReviewsByMovieId(Long movieId, int page){
        Pageable pageable = PageRequest.of(page -1, 20);
        Page<Review> entityPage = reviewRepository.findByMovieId(movieId, pageable);

        return entityPage.map(review ->
                ReviewMapper.entityToResponseDTO(
                        review,
                        null,
                        UserMapper.toPreviewDTO(review.getUser())
                ));
    }

    @Transactional(readOnly = true) // Operación solo de lectura
    public Review getReviewById(Long reviewId){
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ReviewNotFoundException("Review does not exist"));
    }

    @Transactional(readOnly = true)
    public Optional<ReviewResponseDTO> getUserReviewForMovie(String username, Long movieId){
        /*
        validar user - validar movie - buscar review - mapear review
         */

        UserPreviewDTO userPreview = userService.getUserPreview(username);
        MoviePreviewDTO moviePreview = movieService.findMoviePreviewById(movieId);

        return reviewRepository.findByUserIdAndMovieId(userPreview.getId(), movieId)
                .map(review ->
                        ReviewMapper.entityToResponseDTO(review, moviePreview, userPreview)
                );
    }

    // ========== VALIDACIONES ==========

    public void validateMovieExists(Long movieId){
        // Comprobar existencia de película
        if(!movieService.existsMovieById(movieId))
            throw new MovieNotFoundException("Movie does not exist");
    }

    @Transactional(readOnly = true)
    public void validateUserHasNotReviewedMovie(Long userId, Long movieId){
        // Comprobar que el usuario no haya reseñado esta película anteriormente
        if(reviewRepository.findByUserIdAndMovieId(userId, movieId)
                .isPresent())
            throw new ReviewAlreadyExistsException("User has already reviewed this movie");
    }

    public void validateReview(Double rating, String comment){
        // Comprobar que el rating sea múltiplo válido de 0.5 (0.5, 1, 1.5, etc)
        if(rating != null && rating % 0.5 != 0)
            throw new InvalidReviewException("Rating must be a multiple of 0.5 between 0.5 and 5");

        // Si se incluye un comentario (opcional), chequear que no sean solo espacios en blanco
        if(comment != null && comment.isBlank())
            throw new InvalidReviewException("Comment cannot contain only whitespace");
    }
}
