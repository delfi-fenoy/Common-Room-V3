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
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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
        movieService.validateMovieExists(reviewRequestDTO.getMovieId());
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
        reviewRepository.deleteById(reviewId);
    }

    @Transactional
    public ReviewResponseDTO modifyReview(Long reviewId, ReviewUpdateDTO reviewUpdateDTO){
        // Obtener review antigua completa y usuario autenticado
        Review originalReview = getReviewById(reviewId);
        User currentUser = userService.getCurrentUser();

        // Comprobar que la reseña a modificar pertenezca al usuario autenticado
        if(!originalReview.getUser().equals(currentUser))
            throw new AccessDeniedException("You are not allowed to edit this review");

        // Validar rating y comment
        validateReview(reviewUpdateDTO.getRating(), reviewUpdateDTO.getComment());

        // Settear valores y guardar en bdd
        if(!Objects.equals(reviewUpdateDTO.getRating(), originalReview.getRating())){
            originalReview.setRating(reviewUpdateDTO.getRating());
        }
        if(!Objects.equals(reviewUpdateDTO.getComment(), originalReview.getComment())){
            originalReview.setComment(reviewUpdateDTO.getComment());
        }

        // Al usar @Transactional, los cambios de la reseña se guardan automaticamente

        // Devolver response de review
        MoviePreviewDTO moviePreviewDTO = movieService.findMoviePreviewById(originalReview.getMovieId());
        return ReviewMapper.entityToResponseDTO(originalReview,
                                            moviePreviewDTO,
                                            UserMapper.toPreviewDTO(originalReview.getUser()));
    }

    // ========== OBTENER REVIEWS ==========
    // Obtener reseñas por username (paginado)
    @Transactional(readOnly = true) // Para mayor rendimiento
    public Page<ReviewResponseDTO> getReviewsByUsername(String username, int page){
        User foundUser = userService.findUserByUsername(username); // Obtener usuario buscado
        userService.validateUserNotBanned(username, // Verificar que el user no este baneado
                "Cannot view reviews for this user as their account has been suspended.");
        List<Review> entityReviews = reviewRepository.findByUser(foundUser); // Obtener reseñas completas (entidad) de usuario

        Pageable pageable = PageRequest.of(page -1, 20);
        Page<Review> entityPage = reviewRepository.findByUser(foundUser, pageable);

        return entityPage.map(review -> {
            MoviePreviewDTO moviePreviewDTO = movieService.findMoviePreviewById(review.getMovieId());
            UserPreviewDTO userPreviewDTO = UserMapper.toPreviewDTO(foundUser);
            return ReviewMapper.entityToResponseDTO(review, moviePreviewDTO, userPreviewDTO);
        });
    }

    public List<ReviewResponseDTO> getMyReviews(){
        User currentUser = userService.getCurrentUser();
        return getReviewsByUsername(currentUser.getUsername());
    }

    // Obtener reseñas por película (paginado)
    @Transactional(readOnly = true)
    public Page<ReviewResponseDTO> getReviewsByMovieId(Long movieId, int page){
        Pageable pageable = PageRequest.of(page -1, 20);
        // Obtener reseñas completas de película (de usuarios no baneados)
        Page<Review> entityPage = reviewRepository.findByMovieIdAndUserIsBannedFalse(movieId, pageable);

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
        userService.validateUserExists(username); // Validar que el usuario exista
        userService.validateUserNotBanned(username, // Validar que el usuario no este baneado
                "Cannot view this review as the user's account has been suspended.");

        UserPreviewDTO userPreview = userService.getUserPreview(username);
        MoviePreviewDTO moviePreview = movieService.findMoviePreviewById(movieId);

        return reviewRepository.findByUserIdAndMovieId(userPreview.getId(), movieId)
                .map(review ->
                        ReviewMapper.entityToResponseDTO(review, moviePreview, userPreview)
                );
    }

    // ========== VALIDACIONES ==========

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
