package com.thecommonroom.TheCommonRoom.controller;

import com.thecommonroom.TheCommonRoom.auth.dto.TokenResponse;
import com.thecommonroom.TheCommonRoom.dto.PasswordUpdateDTO;
import com.thecommonroom.TheCommonRoom.dto.UserPreviewDTO;
import com.thecommonroom.TheCommonRoom.dto.UserResponseDTO;
import com.thecommonroom.TheCommonRoom.dto.UserUpdateDTO;
import com.thecommonroom.TheCommonRoom.model.User;
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

    // =========== Atributos =========== \\
    private final UserService userService;


    // =========== Devuelve un usuario por su nombre de usuario =========== \\
    @GetMapping("/{username}")
    @ResponseStatus(HttpStatus.OK)
    public UserResponseDTO getUserByUsername(@PathVariable String username) {
        return userService.getUserResponse(username);
    }

    // =========== Elimina un usuario por su username =========== \\
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

    // =========== Devuelve el perfil del usuario autenticado (por token JWT) =========== \\
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

    // Seccion admin
    // Solo los admins pueden buscar usuarios ban
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/banned")
    public ResponseEntity<Page<UserPreviewDTO>> getBannedUsers(
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "1") int page) {
        return ResponseEntity.ok(userService.getBannedUsers(query, page));
    }
}
