package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.exception.DomainException;
import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.domain.model.UserPreferences;
import dev.somnitide.domain.model.WakeSuggestion;
import dev.somnitide.domain.service.SleepCycleCalculator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class StartSleepSession {

    private final SleepSessionRepository sessionRepository;
    private final GetPreferences getPreferences;
    private final SleepCycleCalculator calculator;

    public StartSleepSession(SleepSessionRepository sessionRepository,
            GetPreferences getPreferences,
            SleepCycleCalculator calculator) {
        this.sessionRepository = sessionRepository;
        this.getPreferences = getPreferences;
        this.calculator = calculator;
    }

    public record Response(SleepSession session, List<WakeSuggestion> suggestions) {
    }

    /**
     * Starts a new sleep session and returns the wake-up suggestions based on user
     * prefs.
     */
    @Transactional
    public Response execute(String userId) {
        // Enforce max 1 open session
        if (sessionRepository.findOpenByUserId(userId).isPresent()) {
            throw new DomainException("SESSION_ALREADY_OPEN",
                    "User already has an open sleep session");
        }

        // Get preferences (for latency to start session, and for calculating cycles)
        UserPreferences prefs = getPreferences.execute(userId);
        Instant nowUtc = Instant.now();

        SleepSession session = new SleepSession(
                userId,
                nowUtc,
                prefs.sleepLatencyMinutes());

        session = sessionRepository.save(session);
        List<WakeSuggestion> suggestions = calculator.calculateWakeSuggestions(nowUtc, prefs);

        return new Response(session, suggestions);
    }
}
