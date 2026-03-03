package dev.somnitide.domain.model;

import java.time.Instant;

/**
 * Domain DTO representing a single wake-up suggestion.
 * Pure Java — no Spring dependency.
 */
public record WakeSuggestion(
        Instant wakeTimeUtc,
        int cycles,
        boolean isRecommended) {
}
