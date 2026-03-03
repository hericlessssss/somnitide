package dev.somnitide.application.usecase;

import dev.somnitide.application.port.UserPreferencesRepository;
import dev.somnitide.domain.exception.DomainException;
import dev.somnitide.domain.model.UserPreferences;
import dev.somnitide.domain.service.SleepCycleCalculator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class UpdatePreferencesTest {

    private UserPreferencesRepository repository;
    private SleepCycleCalculator calculator;
    private UpdatePreferences useCase;

    @BeforeEach
    void setUp() {
        repository = mock(UserPreferencesRepository.class);
        calculator = new SleepCycleCalculator(); // Use real calculator for validation
        useCase = new UpdatePreferences(repository, calculator);
    }

    @Test
    void execute_validPreferences_savesAndReturns() {
        // Prepare valid input
        UpdatePreferences.Request request = new UpdatePreferences.Request(
                20, 100, 4, 6, 10);

        // Mock save to return a stamped version
        when(repository.save(any(UserPreferences.class))).thenAnswer(invocation -> {
            UserPreferences arg = invocation.getArgument(0);
            return new UserPreferences(
                    arg.userId(),
                    arg.sleepLatencyMinutes(),
                    arg.cycleLengthMinutes(),
                    arg.minCycles(),
                    arg.maxCycles(),
                    arg.bufferMinutes(),
                    Instant.now() // simulate DB stamp
            );
        });

        UserPreferences result = useCase.execute("user-123", request);

        assertThat(result.userId()).isEqualTo("user-123");
        assertThat(result.sleepLatencyMinutes()).isEqualTo(20);
        assertThat(result.cycleLengthMinutes()).isEqualTo(100);
        assertThat(result.updatedAtUtc()).isNotNull();

        verify(repository).save(any(UserPreferences.class));
    }

    @Test
    void execute_invalidPreferences_throwsDomainException_andDoesNotSave() {
        // Invalid input: latency too high (max is 120 per SleepCycleCalculator rules)
        UpdatePreferences.Request request = new UpdatePreferences.Request(
                150, 90, 4, 6, 5);

        assertThatThrownBy(() -> useCase.execute("user-bad", request))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("sleepLatency");

        verify(repository, never()).save(any());
    }
}
