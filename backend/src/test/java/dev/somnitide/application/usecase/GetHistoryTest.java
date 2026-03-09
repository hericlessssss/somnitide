package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.model.SleepSession;
import dev.somnitide.domain.model.UserPreferences;
import dev.somnitide.domain.service.SleepCycleCalculator;
import dev.somnitide.infrastructure.web.dto.response.SessionResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class GetHistoryTest {

    private SleepSessionRepository repository;
    private GetPreferences getPreferences;
    private SleepCycleCalculator calculator;
    private GetHistory useCase;

    @BeforeEach
    void setUp() {
        repository = mock(SleepSessionRepository.class);
        getPreferences = mock(GetPreferences.class);
        calculator = new SleepCycleCalculator();
        useCase = new GetHistory(repository, getPreferences, calculator);
    }

    @Test
    void execute_hasActiveAndHistory_returnsDtos() {
        String userId = "user-1";
        Instant now = Instant.now();
        SleepSession active = new SleepSession(userId, now, 15);
        SleepSession closed = new SleepSession(userId, now.minusSeconds(3600), 15);
        closed.end(now, 5, "Good");

        when(repository.findOpenByUserId(userId)).thenReturn(Optional.of(active));
        when(repository.findClosedByUserId(userId, 10)).thenReturn(List.of(closed));
        when(getPreferences.execute(userId)).thenReturn(UserPreferences.defaults(userId));

        GetHistory.Response result = useCase.execute(userId, 10);

        assertThat(result.activeSession()).isNotNull();
        assertThat(result.activeSession().suggestions()).isNotEmpty();
        assertThat(result.history()).hasSize(1);
        assertThat(result.history().get(0).qualityRating()).isEqualTo(5);
    }

    @Test
    void execute_noActive_returnsNullActive() {
        String userId = "user-2";
        when(repository.findOpenByUserId(userId)).thenReturn(Optional.empty());
        when(repository.findClosedByUserId(userId, 10)).thenReturn(List.of());

        GetHistory.Response result = useCase.execute(userId, 10);

        assertThat(result.activeSession()).isNull();
        assertThat(result.history()).isEmpty();
    }
}
