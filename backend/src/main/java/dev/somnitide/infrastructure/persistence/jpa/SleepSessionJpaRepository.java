package dev.somnitide.infrastructure.persistence.jpa;

import dev.somnitide.infrastructure.persistence.entity.SleepSessionEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link SleepSessionEntity}.
 */
public interface SleepSessionJpaRepository
        extends JpaRepository<SleepSessionEntity, UUID> {

    /**
     * Finds the open session (endedAtUtc IS NULL) for the given user.
     * Business rule: at most one open session per user.
     */
    Optional<SleepSessionEntity> findFirstByUserIdAndEndedAtUtcIsNull(String userId);

    /**
     * Returns closed sessions (endedAtUtc IS NOT NULL) for the user,
     * ordered by startedAtUtc descending. Pageable controls the limit.
     */
    List<SleepSessionEntity> findByUserIdAndEndedAtUtcIsNotNullOrderByStartedAtUtcDesc(
            String userId, Pageable pageable);
}
