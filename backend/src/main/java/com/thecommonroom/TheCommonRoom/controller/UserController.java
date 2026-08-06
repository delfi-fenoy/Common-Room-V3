package com.thecommonroom.TheCommonRoom.controller;

import com.thecommonroom.TheCommonRoom.auth.dto.TokenResponse;
import com.thecommonroom.TheCommonRoom.dto.*;
import com.thecommonroom.TheCommonRoom.model.User;
import com.thecommonroom.TheCommonRoom.service.UserBanService;
import com.thecommonroom.TheCommonRoom.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserBanService userBanService;

    // ----- BAJA / MODIFICACION USUARIOS -----

    @PreAuthorize("#username == authentication.name or hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DeleteMapping("/{username}")
    public void deleteUser(@PathVariable String username){
        userService.deleteUser(username);
    }

    @PreAuthorize("#username == authentication.name")
    @PutMapping("/{username}")
    public ResponseEntity<?> modifyUser(@PathVariable String username,
                                        @Valid @RequestBody UserUpdateDTO userUpdateDTO){
        TokenResponse tokenResponse = userService.modifyUser(username, userUpdateDTO);

        if(tokenResponse != null){ // Si se modifica el username, se genera nuevo token
            return ResponseEntity.ok(tokenResponse);
        } else {
            return ResponseEntity.noContent().build(); // Caso contrario, no devuelve nada (no content)
        }
    }

    @PreAuthorize("#username == authentication.name")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PutMapping("/{username}/password")
    public void modifyPassword(@PathVariable String username,
                               @Valid @RequestBody PasswordUpdateDTO passwordUpdateDTO){
        userService.modifyPassword(username, passwordUpdateDTO);
    }

    // ----- LISTADO / BUSQUEDA USUARIOS -----

    // Devuelve un usuario por su nombre de usuario
    @GetMapping("/{username}")
    @ResponseStatus(HttpStatus.OK)
    public UserResponseDTO getUserByUsername(@PathVariable String username) {
        return userService.getUserResponse(username);
    }

    // Devuelve el perfil del usuario autenticado (por token JWT)
    @GetMapping("/me")
    public UserResponseDTO getCurrentUser() {
        // Traer el usuario logueado (con token). Valida que no este baneado
        User user = userService.getCurrentUser();

        return UserResponseDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }

    // Listar usuarios paginados, seccion users
    @GetMapping("/all")
    public ResponseEntity<Page<UserPreviewDTO>> getUsersPaged(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") int page)
    {
        return ResponseEntity.ok(userService.getAllUsersPaged(role, page));
    }

    // Buscar usuarios por nombre
    @GetMapping("/search/{query}")
    public ResponseEntity<Page<UserPreviewDTO>> searchUsers(
            @PathVariable String query,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") int page)
    {
        return ResponseEntity.ok(userService.searchUsers(query, role, page));
    }

    // ----- SECCION ADMIN -----

    // Solo los admins pueden buscar usuarios ban
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/banned")
    public ResponseEntity<Page<UserPreviewDTO>> getBannedUsers(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(userService.getBannedUsers(query, page));
    }

    // Baneo de usuarios
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{username}/ban")
    public ResponseEntity<UserBanResponseDTO> banUser(@PathVariable String username,
                                                      @RequestBody @Valid UserBanRequestDTO userBanRequestDTO){
        UserBanResponseDTO userBan = userBanService.banUser(username, userBanRequestDTO);
        return ResponseEntity.ok(userBan);
    }

    // Desbaneo de usuarios
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{username}/ban")
    public ResponseEntity<UserBanResponseDTO> unbanUser(@PathVariable String username){
        UserBanResponseDTO userBan = userBanService.unbanUser(username);
        return ResponseEntity.ok(userBan);
    }

    // Obtener el ultimo ban de un usuario
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{username}/ban")
    public ResponseEntity<UserBanResponseDTO> getUserLastBanInfo(@PathVariable String username){
        UserBanResponseDTO banInfo = userBanService.getUserLastBanInfo(username);
        return ResponseEntity.ok(banInfo);
    }

    // Obtener el historial de ban de un usuario
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{username}/bans")
    public ResponseEntity<Page<UserBanPreviewDTO>> getUserBanHistory(@PathVariable String username,
                                                                     @RequestParam(defaultValue = "1") int page){
        Page<UserBanPreviewDTO> bans = userBanService.getUserBanHistory(username, page);
        return ResponseEntity.ok(bans);
    }
}
