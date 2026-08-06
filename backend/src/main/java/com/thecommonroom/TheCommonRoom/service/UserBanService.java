package com.thecommonroom.TheCommonRoom.service;

import com.thecommonroom.TheCommonRoom.dto.UserBanRequestDTO;
import com.thecommonroom.TheCommonRoom.dto.UserBanResponseDTO;
import com.thecommonroom.TheCommonRoom.exception.IllegalOperationException;
import com.thecommonroom.TheCommonRoom.mapper.UserBanMapper;
import com.thecommonroom.TheCommonRoom.model.Role;
import com.thecommonroom.TheCommonRoom.model.User;
import com.thecommonroom.TheCommonRoom.model.UserBan;
import com.thecommonroom.TheCommonRoom.repository.UserBanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class UserBanService {

    private final UserBanRepository userBanRepository;
    private final UserService userService;

    // ----- BANEO DE USUARIOS -----

    @Transactional
    public UserBanResponseDTO banUser(String username, UserBanRequestDTO userBanRequestDTO){
        // Conseguir admin actual y usuario a banear
        User targetUser = userService.findUserByUsername(username);
        User currentAdmin = userService.getCurrentUser();

        // Comprobaciones
        validateNotAutoBan(targetUser, currentAdmin, "You cannot ban your own account.");
        userService.validateUserNotBanned(username, "This user is already banned");
            validateUserNotAdmin(targetUser, "You cannot ban an admin");

        targetUser.setBanned(true); // Cambiar estado del usuario
        userService.revokeUserTokens(targetUser); // Invalidar los tokens del usuario baneado
        // Guardar en la bdd el ban mapeado
        UserBan userBan = userBanRepository.save(
                UserBanMapper.toEntity(
                        targetUser, currentAdmin, userBanRequestDTO.getReason()));
        return UserBanMapper.entityToResponseDto(userBan); // Retornar response dto
    }

    // ----- DESBANEO DE USUARIOS -----

    // ----- COMPROBACIONES -----

    private void validateUserNotAdmin(User user, String errorMsg){
        if(user.getRole() == Role.ADMIN){
            throw new IllegalOperationException(errorMsg);
        }
    }

    private void validateNotAutoBan(User user, User admin, String errorMsg){
        if(Objects.equals(user.getId(), admin.getId())){
            throw new IllegalOperationException(errorMsg);
        }
    }
}
