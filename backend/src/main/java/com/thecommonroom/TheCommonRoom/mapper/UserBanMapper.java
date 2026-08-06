package com.thecommonroom.TheCommonRoom.mapper;

import com.thecommonroom.TheCommonRoom.dto.UserBanPreviewDTO;
import com.thecommonroom.TheCommonRoom.dto.UserBanResponseDTO;
import com.thecommonroom.TheCommonRoom.model.User;
import com.thecommonroom.TheCommonRoom.model.UserBan;
import org.springframework.data.domain.Page;

import java.util.Optional;

public class UserBanMapper {

    public static UserBan toEntity(User targetUser, User admin, String reason){
        return UserBan.builder()
                .bannedUser(targetUser)
                .bannedByUser(admin)
                .reason(reason)
                .build();
    }

    public static UserBanResponseDTO entityToResponseDto(UserBan userBan){
        return UserBanResponseDTO.builder()
                .id(userBan.getId())
                .bannedUsername(userBan.getBannedUser().getUsername())
                .bannedByUsername(userBan.getBannedByUser().getUsername())
                .bannedAt(userBan.getBannedAt())
                .reason(userBan.getReason())
                .unbannedAt(userBan.getUnbannedAt())
                .unbannedByUsername(Optional.ofNullable(userBan.getUnbannedByUser())
                                .map(User::getUsername)
                                        .orElse(null))
                .build();
    }

    public static UserBanPreviewDTO entityToPreviewDTO(UserBan userBan){
        return UserBanPreviewDTO.builder()
                .id(userBan.getId())
                .bannedByUsername(userBan.getBannedByUser().getUsername())
                .bannedAt(userBan.getBannedAt())
                .reason(userBan.getReason())
                .build();
    }
}
