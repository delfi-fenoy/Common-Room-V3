package com.thecommonroom.TheCommonRoom.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "user_bans")
public class UserBan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User bannedUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banned_by_user_id", nullable = false)
    private User bannedByUser;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime bannedAt;

    private String reason;

    private LocalDateTime unbannedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unbanned_by_user_id")
    private User unbannedByUser;
}
