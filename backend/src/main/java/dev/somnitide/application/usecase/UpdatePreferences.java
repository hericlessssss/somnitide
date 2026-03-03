package dev.somnitide.application.usecase;

import dev.somnitide.application.port.UserPreferencesRepository;
import dev.somnitide.domain.model.UserPreferences;
import dev.somnitide.domain.service.SleepCycleCalculator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class UpdatePreferences {

    private final UserPreferencesRepository repository;
    private final SleepCycleCalculator calculator;

    public UpdatePreferences(UserPreferencesRepository repository, SleepCycleCalculator calculator) {
        this.repository = repository;
        this.calculator = calculator;
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
        UserPreferences newPrefs = new UserPreferences(
                userId,
                request.sleepLatencyMinutes(),
                request.cycleLengthMinutes(),
                request.minCycles(),
                request.maxCycles(),
                request.bufferMinutes(),
                Instant.now() // Will be updated by adapter anyway, but required by constructor
        );

        calculator.validatePreferences(newPrefs);

        return repository.save(newPrefs);
    }
}
