package com.thecommonroom.TheCommonRoom.controller;

import com.thecommonroom.TheCommonRoom.dto.UserBanPreviewDTO;
import com.thecommonroom.TheCommonRoom.dto.UserBanRequestDTO;
import com.thecommonroom.TheCommonRoom.dto.UserBanResponseDTO;
import com.thecommonroom.TheCommonRoom.service.UserBanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserBanController {

    private final UserBanService userBanService;

    // ----- ABM BANEO -----

    // Baneo de usuarios
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/users/{username}/ban")
    public ResponseEntity<UserBanResponseDTO> banUser(@PathVariable String username,
                                                      @RequestBody @Valid UserBanRequestDTO userBanRequestDTO){
        UserBanResponseDTO userBan = userBanService.banUser(username, userBanRequestDTO);
        return ResponseEntity.ok(userBan);
    }

    // Desbaneo de usuarios
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{username}/ban")
    public ResponseEntity<UserBanResponseDTO> unbanUser(@PathVariable String username){
        UserBanResponseDTO userBan = userBanService.unbanUser(username);
        return ResponseEntity.ok(userBan);
    }

    // ----- LISTADO DE BANEOS -----

    // Obtener el ultimo ban de un usuario
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{username}/ban")
    public ResponseEntity<UserBanResponseDTO> getUserLastBanInfo(@PathVariable String username){
        UserBanResponseDTO banInfo = userBanService.getUserLastBanInfo(username);
        return ResponseEntity.ok(banInfo);
    }

    // Obtener el historial de ban de un usuario
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/{username}/bans")
    public ResponseEntity<Page<UserBanPreviewDTO>> getUserBanHistory(@PathVariable String username,
                                                                     @RequestParam(defaultValue = "1") int page){
        Page<UserBanPreviewDTO> bans = userBanService.getUserBanHistory(username, page);
        return ResponseEntity.ok(bans);
    }

    // Obtener ban por id
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/bans/{banId}")
    public ResponseEntity<UserBanResponseDTO> getBanById(@PathVariable Long banId){
        UserBanResponseDTO ban = userBanService.getBanById(banId);
        return ResponseEntity.ok(ban);
    }
}
