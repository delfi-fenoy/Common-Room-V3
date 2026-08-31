package com.thecommonroom.TheCommonRoom.service;

import com.thecommonroom.TheCommonRoom.dto.UserBanPreviewDTO;
import com.thecommonroom.TheCommonRoom.dto.UserBanRequestDTO;
import com.thecommonroom.TheCommonRoom.dto.UserBanResponseDTO;
import com.thecommonroom.TheCommonRoom.exception.IllegalOperationException;
import com.thecommonroom.TheCommonRoom.exception.UserBanNotFoundException;
import com.thecommonroom.TheCommonRoom.mapper.UserBanMapper;
import com.thecommonroom.TheCommonRoom.model.Role;
import com.thecommonroom.TheCommonRoom.model.User;
import com.thecommonroom.TheCommonRoom.model.UserBan;
import com.thecommonroom.TheCommonRoom.repository.UserBanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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
    @Transactional
    public UserBanResponseDTO unbanUser(String username){
        // Conseguir admin actual y usuario a banear
        User targetUser = userService.findUserByUsername(username);
        User currentAdmin = userService.getCurrentUser();

        // Comprobar que el usuario a desbanear esté baneado
        if(!targetUser.isBanned()){
            throw new IllegalOperationException("This user is not banned");
        }

        // Cambiar estado del usuario
        targetUser.setBanned(false); // Cambiar estado del usuario
        // Recuperar la info del ban y modificar valores
        UserBan banInfo = userBanRepository.findFirstByBannedUserIdOrderByBannedAtDesc(targetUser.getId())
                .orElseThrow(() -> new UserBanNotFoundException("Ban record not found for user: " + username));
        banInfo.setUnbannedByUser(currentAdmin); // Guardar al admin que realizo la operacion
        banInfo.setUnbannedAt(LocalDateTime.now()); // Guardar la fecha y hora de desbaneo

        return UserBanMapper.entityToResponseDto(banInfo);
    }

    // ----- LISTADO DE BANEOS -----

    // Obtener el ultimo ban de un usuario
    @Transactional(readOnly = true)
    public UserBanResponseDTO getUserLastBanInfo(String username){
        User user = userService.findUserByUsername(username); // Chequear que el usuario exista
        // Traer el registro del ban
        UserBan banInfoEntity = userBanRepository.findFirstByBannedUserIdOrderByBannedAtDesc(user.getId())
                .orElseThrow(() -> new UserBanNotFoundException("Ban record not found for user: " + username));
        return UserBanMapper.entityToResponseDto(banInfoEntity);
    }

    @Transactional(readOnly = true)
    public Page<UserBanPreviewDTO> getUserBanHistory(String username, int page){
        // Consguir al usuario
        User user = userService.findUserByUsername(username);

        // Traer los registros de ban
        int pageNumber = Math.max(0, page-1);
        Pageable pageable = PageRequest.of(pageNumber, 4);
        Page<UserBan> bans = userBanRepository.findByBannedUserId(user.getId(), pageable);

        return bans.map(UserBanMapper::entityToPreviewDTO); // Retornar previews de ban
    }

    @Transactional(readOnly = true)
    public UserBanResponseDTO getBanById(Long banId){
        UserBan ban = userBanRepository.findByIdWithDetails(banId)
                .orElseThrow(() -> new UserBanNotFoundException("Ban record not found"));
        return UserBanMapper.entityToResponseDto(ban);
    }

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
