package com.thecommonroom.TheCommonRoom.repository;

import com.thecommonroom.TheCommonRoom.model.Playlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, Long> {

    List<Playlist> findByUserUsername(String username);
    List<Playlist> findByUserUsernameAndIsPrivateFalse(String username);
}
