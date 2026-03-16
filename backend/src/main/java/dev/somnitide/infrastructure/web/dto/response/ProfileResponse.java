package dev.somnitide.infrastructure.web.dto.response;

import dev.somnitide.domain.model.UserProfile;
import java.time.Instant;

public record ProfileResponse(
    String userId,
    String handle,
    String avatarSeed,
    int totalScore,
    Instant updatedAtUtc,
    Instant createdAtUtc,
    Integer rankPosition,
    Integer lastSleepMinutes,
    Double avgScore,
    Integer streakDays
) {
    public static ProfileResponse fromDomain(UserProfile domain) {
        return fromDomain(domain, null, null, null, null);
    }

    public static ProfileResponse fromDomain(UserProfile domain, Integer rankPosition) {
        return fromDomain(domain, rankPosition, null, null, null);
    }

    public static ProfileResponse fromDomain(UserProfile domain, Integer rankPosition, Integer lastSleepMinutes, Double avgScore, Integer streakDays) {
        return new ProfileResponse(
            domain.getUserId(),
            domain.getHandle(),
            domain.getAvatarSeed(),
            domain.getTotalScore(),
            domain.getUpdatedAtUtc(),
            domain.getCreatedAtUtc(),
            rankPosition,
            lastSleepMinutes,
            avgScore,
            streakDays
        );
    }
}
