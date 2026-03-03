package dev.somnitide.application.usecase;

import dev.somnitide.application.port.SleepSessionRepository;
import dev.somnitide.domain.exception.DomainException;
import dev.somnitide.domain.model.SleepSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

class EndSleepSessionTest {

    private SleepSessionRepository repository;
    private EndSleepSession useCase;

    @BeforeEach
    void setUp() {
        repository = mock(SleepSessionRepository.class);
        useCase = new EndSleepSession(repository);
    }

    @Test
    void execute_validOpenSession_endsAndSaves() {
        String userId = "user-end-1";
        SleepSession openSession = new SleepSession(userId, Instant.now().minusSeconds(20000), 14);

        when(repository.findOpenByUserId(userId)).thenReturn(Optional.of(openSession));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EndSleepSession.Request request = new EndSleepSession.Request(5, "Felt great");
        SleepSession result = useCase.execute(userId, request);

        assertThat(result.isOpen()).isFalse();
        assertThat(result.getQualityRating()).isEqualTo(5);
        assertThat(result.getNote()).isEqualTo("Felt great");

        verify(repository).save(openSession); // Ensure mutation was saved
    }

    @Test
    void execute_noOpenSession_throwsDomainException() {
        String userId = "user-none";
        when(repository.findOpenByUserId(userId)).thenReturn(Optional.empty());

        EndSleepSession.Request request = new EndSleepSession.Request(null, null);

        assertThatThrownBy(() -> useCase.execute(userId, request))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("no open");

        verify(repository, never()).save(any());
    }
}
