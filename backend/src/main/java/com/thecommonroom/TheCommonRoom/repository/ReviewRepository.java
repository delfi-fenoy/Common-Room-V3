package com.thecommonroom.TheCommonRoom.repository;

import com.thecommonroom.TheCommonRoom.model.Review;
import com.thecommonroom.TheCommonRoom.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByUserIdAndMovieId(Long userId, Long movieId);

    // Se cambia por page y pageable para poder paginar más facil
    Page<Review> findByUser(User user, Pageable pageable); // Obtener listas de reseñas de un usuario determinado
    Page<Review> findByMovieId(Long movieId, Pageable pageable); // Obtener listas de reseñas de una película determinada
}
