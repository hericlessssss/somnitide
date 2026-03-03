package dev.somnitide.infrastructure.persistence.adapter;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.infrastructure.persistence.entity.SleepSessionEntity;
import dev.somnitide.infrastructure.persistence.jpa.SleepSessionJpaRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Adapter: implements the domain port using JPA.
 */
@Repository
public class SleepSessionRepositoryImpl implements SleepSessionRepository {

    private final SleepSessionJpaRepository jpaRepository;

    public SleepSessionRepositoryImpl(SleepSessionJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public SleepSession save(SleepSession session) {
        SleepSessionEntity saved = jpaRepository.save(
                SleepSessionEntity.fromDomain(session));
        return saved.toDomain();
    }

    @Override
    public Optional<SleepSession> findOpenByUserId(String userId) {
        return jpaRepository.findFirstByUserIdAndEndedAtUtcIsNull(userId)
                .map(SleepSessionEntity::toDomain);
    }

    @Override
    public List<SleepSession> findClosedByUserId(String userId, int limit) {
        return jpaRepository
                .findByUserIdAndEndedAtUtcIsNotNullOrderByStartedAtUtcDesc(
                        userId, PageRequest.of(0, limit))
                .stream()
                .map(SleepSessionEntity::toDomain)
                .toList();
    }
}
