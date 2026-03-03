package dev.somnitide.application.port;

import dev.somnitide.domain.model.SleepSession;

import java.util.List;
import java.util.Optional;

/**
 * Domain port for sleep session persistence.
 * Implemented by the infrastructure adapter (SleepSessionRepositoryImpl).
 */
public interface SleepSessionRepository {

    /** Persists a new or updated session. */
    SleepSession save(SleepSession session);

    /**
     * Returns the open (not ended) session for the given user, if any.
     * At most one open session per user is allowed.
     */
    Optional<SleepSession> findOpenByUserId(String userId);

    /**
     * Returns the most recent {@code limit} closed (ended) sessions for the user,
     * ordered by startedAtUtc descending.
     */
    List<SleepSession> findClosedByUserId(String userId, int limit);
}
