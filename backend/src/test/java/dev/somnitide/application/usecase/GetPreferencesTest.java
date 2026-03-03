package dev.somnitide.application.usecase;

import dev.somnitide.application.port.UserPreferencesRepository;
import dev.somnitide.domain.model.UserPreferences;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class GetPreferencesTest {

    private UserPreferencesRepository repository;
    private GetPreferences useCase;

    @BeforeEach
    void setUp() {
        repository = mock(UserPreferencesRepository.class);
        useCase = new GetPreferences(repository);
    }

    @Test
    void execute_userExists_returnsPreferences() {
        UserPreferences existing = new UserPreferences(
                "user-1", 20, 100, 3, 5, 10, Instant.now());
        when(repository.findByUserId("user-1")).thenReturn(Optional.of(existing));

        UserPreferences result = useCase.execute("user-1");

        assertThat(result).isSameAs(existing);
        verify(repository).findByUserId("user-1");
    }

    @Test
    void execute_userNotExists_returnsDefaults() {
        when(repository.findByUserId("user-2")).thenReturn(Optional.empty());

        UserPreferences result = useCase.execute("user-2");

        assertThat(result.userId()).isEqualTo("user-2");
        assertThat(result.sleepLatencyMinutes()).isEqualTo(14); // default
        verify(repository).findByUserId("user-2");
    }
}
