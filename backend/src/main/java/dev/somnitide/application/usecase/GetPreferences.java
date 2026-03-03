package dev.somnitide.application.usecase;

import dev.somnitide.application.port.UserPreferencesRepository;
import dev.somnitide.domain.model.UserPreferences;
import org.springframework.stereotype.Service;

@Service
public class GetPreferences {

    private final UserPreferencesRepository repository;

    public GetPreferences(UserPreferencesRepository repository) {
        this.repository = repository;
    }

    /**
     * Executes the use case.
     * Returns existing preferences or defaults if the user has none yet.
     */
    public UserPreferences execute(String userId) {
        return repository.findByUserId(userId)
                .orElseGet(() -> UserPreferences.defaults(userId));
    }
}
