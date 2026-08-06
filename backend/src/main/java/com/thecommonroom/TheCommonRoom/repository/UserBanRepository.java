package com.thecommonroom.TheCommonRoom.repository;

import com.thecommonroom.TheCommonRoom.model.UserBan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserBanRepository extends JpaRepository<UserBan, Long> {
    // Traer el ban mas reciente de un usuario
    Optional<UserBan> findFirstByBannedUserIdOrderByBannedAtDesc(Long userId);
}
