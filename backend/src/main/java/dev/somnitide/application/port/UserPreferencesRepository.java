package dev.somnitide.application.port;

import dev.somnitide.domain.model.UserPreferences;

import java.util.Optional;

/**
 * Domain port for user preferences persistence.
 * Implemented by the infrastructure adapter (UserPreferencesRepositoryImpl).
 * Domain and application layers depend only on this interface.
 */
public interface UserPreferencesRepository {

    /**
     * Finds preferences for the given user.
     * Returns empty if no record exists yet.
     */
    Optional<UserPreferences> findByUserId(String userId);

    /**
     * Persists (insert or update) user preferences.
     */
    UserPreferences save(UserPreferences preferences);
}
