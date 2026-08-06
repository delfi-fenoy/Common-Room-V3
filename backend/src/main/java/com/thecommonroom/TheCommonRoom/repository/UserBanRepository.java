package com.thecommonroom.TheCommonRoom.repository;

import com.thecommonroom.TheCommonRoom.model.UserBan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserBanRepository extends JpaRepository<UserBan, Long> {
    // Traer el ban mas reciente de un usuario
    Optional<UserBan> findFirstByBannedUserIdOrderByBannedAtDesc(Long userId);

    // Traer los ban de un usuario, junto con el admin que los realizo
    @Query(value = "SELECT b FROM UserBan b JOIN FETCH b.bannedByUser WHERE b.bannedUser.id = :userId " +
            "ORDER BY b.bannedAt DESC",
            countQuery = "SELECT count(b) FROM UserBan b WHERE b.bannedUser.id = :userId")
    Page<UserBan> findByBannedUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT b FROM UserBan b " +
            "JOIN FETCH b.bannedUser " +
            "JOIN FETCH b.bannedByUser " +
            "LEFT JOIN FETCH b.unbannedByUser " +
            "WHERE b.id = :banId")
    Optional<UserBan> findByIdWithDetails(@Param("banId") Long banId);
}
