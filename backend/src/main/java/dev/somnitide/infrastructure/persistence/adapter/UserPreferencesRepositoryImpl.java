package dev.somnitide.infrastructure.persistence.adapter;

import dev.somnitide.application.port.UserPreferencesRepository;
import dev.somnitide.domain.model.UserPreferences;
import dev.somnitide.infrastructure.persistence.entity.UserPreferencesEntity;
import dev.somnitide.infrastructure.persistence.jpa.UserPreferencesJpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

/**
 * Adapter: implements the domain port using JPA.
 * Translates between {@link UserPreferences} (domain) and
 * {@link UserPreferencesEntity} (JPA).
 */
@Repository
public class UserPreferencesRepositoryImpl implements UserPreferencesRepository {

    private final UserPreferencesJpaRepository jpaRepository;

    public UserPreferencesRepositoryImpl(UserPreferencesJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Optional<UserPreferences> findByUserId(String userId) {
        return jpaRepository.findById(userId)
                .map(UserPreferencesEntity::toDomain);
    }

    @Override
    public UserPreferences save(UserPreferences preferences) {
        // Stamp updatedAtUtc on every save
        UserPreferences stamped = new UserPreferences(
                preferences.userId(),
                preferences.sleepLatencyMinutes(),
                preferences.cycleLengthMinutes(),
                preferences.minCycles(),
                preferences.maxCycles(),
                preferences.bufferMinutes(),
                Instant.now());
        UserPreferencesEntity saved = jpaRepository.save(
                UserPreferencesEntity.fromDomain(stamped));
        return saved.toDomain();
    }
}
