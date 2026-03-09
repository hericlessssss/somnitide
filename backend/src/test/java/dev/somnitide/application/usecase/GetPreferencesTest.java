package dev.somnitide.application.usecase;

import dev.somnitide.domain.model.UserPreferences;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class GetPreferencesTest {

    private GetPreferences useCase;

    @BeforeEach
    void setUp() {
        useCase = new GetPreferences();
    }

    @Test
    void execute_always_returnsDefaults() {
        // Even if we provide a specific user, it should return the scientific defaults
        UserPreferences result = useCase.execute("any-user");

        assertThat(result.userId()).isEqualTo("any-user");
        assertThat(result.sleepLatencyMinutes()).isEqualTo(14); // Scientific default
        assertThat(result.cycleLengthMinutes()).isEqualTo(90); // Scientific default
        assertThat(result.minCycles()).isEqualTo(2); // Scientific default expanded
    }
}
