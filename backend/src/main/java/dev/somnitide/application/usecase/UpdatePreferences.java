package dev.somnitide.application.usecase;

import dev.somnitide.domain.model.UserPreferences;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UpdatePreferences {

    public UpdatePreferences() {
    }

    /**
     * Request DTO for updating preferences.
     * The Use Case defines its own input model to decouple from the Web layer.
     */
    public record Request(
            int sleepLatencyMinutes,
            int cycleLengthMinutes,
            int minCycles,
            int maxCycles,
            int bufferMinutes) {
    }

    /**
     * Validates and saves new user preferences.
     * Throws DomainException if validation fails.
     */
    @Transactional
    public UserPreferences execute(String userId, Request request) {
        throw new dev.somnitide.domain.exception.DomainException(
                "LOCKED",
                "Individual preferences are disabled. Current parameters are strictly locked to scientific defaults.");
    }
}
