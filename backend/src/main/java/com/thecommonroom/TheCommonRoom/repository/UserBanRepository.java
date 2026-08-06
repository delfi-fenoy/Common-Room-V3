package com.thecommonroom.TheCommonRoom.repository;

import com.thecommonroom.TheCommonRoom.model.UserBan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserBanRepository extends JpaRepository<UserBan, Long> {
}
