package dev.somnitide.application.usecase;

import dev.somnitide.domain.model.UserPreferences;
import org.springframework.stereotype.Service;

@Service
public class GetPreferences {

    public GetPreferences() {
    }

    /**
     * Executes the use case.
     * Returns existing preferences or defaults if the user has none yet.
     */
    public UserPreferences execute(String userId) {
        // Strictly return defaults to enforce scientific parameters across the study.
        return UserPreferences.defaults(userId);
    }
}
