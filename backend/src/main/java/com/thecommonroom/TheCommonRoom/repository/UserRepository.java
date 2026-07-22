package com.thecommonroom.TheCommonRoom.repository;

import com.thecommonroom.TheCommonRoom.model.Role;
import com.thecommonroom.TheCommonRoom.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    //Buscar por nombre ignorando mayus y que no esten ban (paginados)
    Page<User> findByUsernameContainingIgnoreCaseAndIsBannedFalse(String query, Pageable pageable);

    // Búsqueda por rol (admin/user)
    Page<User> findByUsernameContainingIgnoreCaseAndRoleAndIsBannedFalse(String query, Role role, Pageable pageable);

    // Listar usuarios no baneados (para la página específica de users)
    Page<User> findByIsBannedFalse(Pageable pageable);
    Page<User> findByRoleAndIsBannedFalse(Role role, Pageable pageable);

    // Listar baneados (solo para admins)
    Page<User> findByIsBannedTrue(Pageable pageable);
    Page<User> findByUsernameContainingIgnoreCaseAndIsBannedTrue(String query, Pageable pageable);
}
