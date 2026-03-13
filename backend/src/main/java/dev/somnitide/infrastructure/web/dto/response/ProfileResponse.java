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
    Integer rankPosition
) {
    public static ProfileResponse fromDomain(UserProfile domain) {
        return fromDomain(domain, null);
    }

    public static ProfileResponse fromDomain(UserProfile domain, Integer rankPosition) {
        return new ProfileResponse(
            domain.getUserId(),
            domain.getHandle(),
            domain.getAvatarSeed(),
            domain.getTotalScore(),
            domain.getUpdatedAtUtc(),
            domain.getCreatedAtUtc(),
            rankPosition
        );
    }
}
