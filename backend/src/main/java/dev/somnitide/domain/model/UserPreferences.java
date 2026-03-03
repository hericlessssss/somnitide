package dev.somnitide.domain.model;

import java.time.Instant;

/**
 * Immutable value object representing a user's sleep preferences.
 * Pure Java — no Spring, no JPA annotations.
 * JPA mapping lives in the infrastructure layer.
 */
public record UserPreferences(
        String userId,
        int sleepLatencyMinutes,
        int cycleLengthMinutes,
        int minCycles,
        int maxCycles,
        int bufferMinutes,
        Instant updatedAtUtc
) {
    /** Factory that returns the recommended defaults for a given user. */
    public static UserPreferences defaults(String userId) {
        return new UserPreferences(
                userId,
                14,   // sleepLatencyMinutes
                90,   // cycleLengthMinutes
                4,    // minCycles
                6,    // maxCycles
                5,    // bufferMinutes
                Instant.now()
        );
    }
}
