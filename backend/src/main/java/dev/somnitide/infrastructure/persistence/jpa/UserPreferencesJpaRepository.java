package dev.somnitide.infrastructure.persistence.jpa;

import dev.somnitide.infrastructure.persistence.entity.UserPreferencesEntity;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Spring Data JPA repository for {@link UserPreferencesEntity}.
 * Provides out-of-the-box CRUD via JpaRepository<Entity, PK>.
 */
public interface UserPreferencesJpaRepository
        extends JpaRepository<UserPreferencesEntity, String> {
    // All needed operations are inherited: findById, save, existsById, etc.
}
