package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.model.SleepSession;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GetHistory {

    private final SleepSessionRepository repository;

    public GetHistory(SleepSessionRepository repository) {
        this.repository = repository;
    }

    public record Response(
            Optional<SleepSession> activeSession,
            List<SleepSession> history) {
    }

    /**
     * Retrieves the user's open session (if any) and recent closed sessions.
     */
    public Response execute(String userId, int limit) {
        Optional<SleepSession> active = repository.findOpenByUserId(userId);
        List<SleepSession> history = repository.findClosedByUserId(userId, limit);

        return new Response(active, history);
    }
}
