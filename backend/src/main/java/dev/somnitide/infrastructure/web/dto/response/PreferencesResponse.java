package dev.somnitide.infrastructure.web.dto.response;

import dev.somnitide.domain.model.UserPreferences;
import java.time.Instant;

public record PreferencesResponse(
        int sleepLatencyMinutes,
        int cycleLengthMinutes,
        int minCycles,
        int maxCycles,
        int bufferMinutes,
        Instant updatedAtUtc) {
    public static PreferencesResponse fromDomain(UserPreferences prefs) {
        return new PreferencesResponse(
                prefs.sleepLatencyMinutes(),
                prefs.cycleLengthMinutes(),
                prefs.minCycles(),
                prefs.maxCycles(),
                prefs.bufferMinutes(),
                prefs.updatedAtUtc());
    }
}
