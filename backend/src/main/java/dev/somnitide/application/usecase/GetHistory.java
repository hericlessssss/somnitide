package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.domain.service.SleepCycleCalculator;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GetHistory {

    private final SleepSessionRepository repository;

    private final GetPreferences getPreferences;
    private final SleepCycleCalculator calculator;

    public GetHistory(SleepSessionRepository repository, GetPreferences getPreferences,
            SleepCycleCalculator calculator) {
        this.repository = repository;
        this.getPreferences = getPreferences;
        this.calculator = calculator;
    }

    public record Response(
            dev.somnitide.infrastructure.web.dto.response.SessionResponse activeSession,
            java.util.List<dev.somnitide.infrastructure.web.dto.response.SessionResponse> history) {
    }

    /**
     * Retrieves the user's open session (if any) and recent closed sessions.
     */
    public Response execute(String userId, int limit) {
        Optional<SleepSession> active = repository.findOpenByUserId(userId);
        List<SleepSession> history = repository.findClosedByUserId(userId, limit);

        dev.somnitide.infrastructure.web.dto.response.SessionResponse activeDto = active
                .map(session -> {
                    var prefs = getPreferences.execute(userId);
                    var suggestions = calculator.calculateWakeSuggestions(session.getStartedAtUtc(), prefs);
                    return dev.somnitide.infrastructure.web.dto.response.SessionResponse.fromDomain(session,
                            suggestions);
                })
                .orElse(null);

        List<dev.somnitide.infrastructure.web.dto.response.SessionResponse> historyDtos = history.stream()
                .map(session -> dev.somnitide.infrastructure.web.dto.response.SessionResponse.fromDomain(session,
                        List.of()))
                .toList();

        return new Response(activeDto, historyDtos);
    }
}
