package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.model.SleepSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GetHistoryTest {

    private SleepSessionRepository repository;
    private GetHistory useCase;

    @BeforeEach
    void setUp() {
        repository = mock(SleepSessionRepository.class);
        useCase = new GetHistory(repository);
    }

    @Test
    void execute_returnsOpenAndClosedSessions() {
        String userId = "user-hist";

        SleepSession openSession = new SleepSession(userId, Instant.now(), 14);
        SleepSession closed1 = new SleepSession(userId, Instant.now().minusSeconds(86400), 14);
        closed1.end(Instant.now().minusSeconds(50000), 5, null);

        when(repository.findOpenByUserId(userId)).thenReturn(Optional.of(openSession));
        when(repository.findClosedByUserId(userId, 10)).thenReturn(List.of(closed1));

        GetHistory.Response response = useCase.execute(userId, 10);

        assertThat(response.activeSession()).isPresent().contains(openSession);
        assertThat(response.history()).containsExactly(closed1);
    }

    @Test
    void execute_noOpenSession_returnsEmptyActive() {
        String userId = "user-empty";

        when(repository.findOpenByUserId(userId)).thenReturn(Optional.empty());
        when(repository.findClosedByUserId(userId, 5)).thenReturn(List.of());

        GetHistory.Response response = useCase.execute(userId, 5);

        assertThat(response.activeSession()).isEmpty();
        assertThat(response.history()).isEmpty();
    }
}
