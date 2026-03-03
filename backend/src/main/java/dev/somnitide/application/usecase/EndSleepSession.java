package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.exception.DomainException;
import dev.somnitide.domain.model.SleepSession;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class EndSleepSession {

    private final SleepSessionRepository repository;

    public EndSleepSession(SleepSessionRepository repository) {
        this.repository = repository;
    }

    public record Request(Integer qualityRating, String note) {
    }

    /**
     * Ends the user's currently open session.
     * Throws if no session is open.
     */
    @Transactional
    public SleepSession execute(String userId, Request request) {
        SleepSession session = repository.findOpenByUserId(userId)
                .orElseThrow(() -> new DomainException("NO_OPEN_SESSION",
                        "User has no open sleep session to end"));

        session.end(Instant.now(), request.qualityRating(), request.note());

        return repository.save(session);
    }
}
